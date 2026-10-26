import { getLocalPreference, setLocalPreference } from '../utils/browserPreferences';
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import MidiPlayer from 'midi-player-js';
import Soundfont from 'soundfont-player';
import { MUSIC_LIBRARY, TrackMetadata } from '../data/musicMetadata';

// EQ settings interface
interface EQSettings {
  bass: number;    // -12 to +12 dB
  mid: number;     // -12 to +12 dB
  treble: number;  // -12 to +12 dB
}

interface MusicPlayerContextType {
  // State
  isPlaying: boolean;
  isLoading: boolean;
  currentTrack: TrackMetadata | null;
  currentTrackIndex: number;
  volume: number;
  progress: number;
  isMinimized: boolean;
  isVisualizerFullScreen: boolean;

  // Shuffle/Repeat state
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';

  // Audio Analysis (NEW)
  analyserNode: AnalyserNode | null;
  audioContext: AudioContext | null;
  gainNode: GainNode | null;

  // EQ State (NEW)
  eqSettings: EQSettings;

  // Track info
  totalTracks: number;

  // Actions
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  switchTrack: (index: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleMinimized: () => void;
  setMinimized: (minimized: boolean) => void;

  // Shuffle/Repeat actions
  toggleShuffle: () => void;
  toggleRepeat: () => void;

  // EQ Actions (NEW)
  setEQ: (band: 'bass' | 'mid' | 'treble', value: number) => void;
  resetEQ: () => void;

  // Seeking
  seekToPercent: (percent: number) => void;

  // Full-screen visualizer
  setVisualizerFullScreen: (fullScreen: boolean) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
}

interface MusicPlayerProviderProps {
  children: ReactNode;
}

// Default EQ settings
const DEFAULT_EQ: EQSettings = { bass: 0, mid: 0, treble: 0 };

export function MusicPlayerProvider({ children }: MusicPlayerProviderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // Start with first track
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisualizerFullScreen, setVisualizerFullScreen] = useState(false);
  const [eqSettings, setEqSettings] = useState<EQSettings>(DEFAULT_EQ);

  // Shuffle/Repeat state
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const shuffleHistoryRef = useRef<number[]>([]);

  // Refs to access current values in callbacks (avoids stale closure issues)
  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);
  const currentTrackIndexRef = useRef(currentTrackIndex);

  // Keep refs in sync with state
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { currentTrackIndexRef.current = currentTrackIndex; }, [currentTrackIndex]);

  // NEW: State for audioContext and gainNode for Butterchurn integration
  const [audioContextState, setAudioContextState] = useState<AudioContext | null>(null);
  const [gainNodeState, setGainNodeState] = useState<GainNode | null>(null);

  // NEW: State for analyser node (not ref!) - so context updates when it's set
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // Core audio refs
  const playerRef = useRef<MidiPlayer.Player | null>(null);
  const instrumentsRef = useRef<Map<number, any>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const progressAnimationRef = useRef<number | null>(null);

  // MP3 playback refs
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isMP3Track, setIsMP3Track] = useState(false);

  // NEW: Audio processing chain refs
  const gainNodeRef = useRef<GainNode | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);

  // NEW: EQ filter refs
  const eqNodesRef = useRef<{
    bass: BiquadFilterNode | null;
    mid: BiquadFilterNode | null;
    treble: BiquadFilterNode | null;
  }>({ bass: null, mid: null, treble: null });

  const currentTrack = MUSIC_LIBRARY[currentTrackIndex] || null;

  // Handle track end - uses refs for current state to avoid stale closures
  const handleTrackEnd = () => {
    console.log('[MusicPlayer] Track ended. Repeat:', repeatModeRef.current, 'Shuffle:', isShuffleRef.current);

    if (repeatModeRef.current === 'one') {
      // Repeat One: restart the same track
      setProgress(0);
      // Trigger play on next tick
      setTimeout(() => {
        if (isMP3Track && audioElementRef.current) {
          audioElementRef.current.currentTime = 0;
          audioElementRef.current.play().catch(console.error);
        } else if (playerRef.current) {
          playerRef.current.play();
        }
        setIsPlaying(true);
      }, 50);
    } else if (repeatModeRef.current === 'off') {
      // No repeat: check if at end of playlist
      const currentIdx = currentTrackIndexRef.current;
      if (!isShuffleRef.current && currentIdx === MUSIC_LIBRARY.length - 1) {
        // At end of playlist with no repeat - stop
        console.log('[MusicPlayer] End of playlist, stopping');
        return;
      }
      // Otherwise advance
      advanceToNextTrack();
    } else {
      // Repeat All: always advance
      advanceToNextTrack();
    }
  };

  // Advance to next track (handles shuffle)
  const advanceToNextTrack = () => {
    const currentIdx = currentTrackIndexRef.current;
    let nextIdx: number;

    if (isShuffleRef.current) {
      // Shuffle: random track avoiding recent history
      const history = shuffleHistoryRef.current;
      const historyLimit = Math.max(3, Math.floor(MUSIC_LIBRARY.length * 0.3));
      const recentHistory = history.slice(-historyLimit);
      const available = [];
      for (let i = 0; i < MUSIC_LIBRARY.length; i++) {
        if (!recentHistory.includes(i)) available.push(i);
      }
      if (available.length === 0) {
        shuffleHistoryRef.current = [currentIdx];
        for (let i = 0; i < MUSIC_LIBRARY.length; i++) {
          if (i !== currentIdx) available.push(i);
        }
      }
      nextIdx = available[Math.floor(Math.random() * available.length)];
      shuffleHistoryRef.current.push(nextIdx);
    } else {
      nextIdx = (currentIdx + 1) % MUSIC_LIBRARY.length;
    }

    setCurrentTrackIndex(nextIdx);
  };

  // Initialize player on mount
  useEffect(() => {
    const initPlayer = async () => {
      setIsLoading(true);
      try {
        // Create audio context
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        setAudioContextState(audioCtx);  // Also store in state for context consumers

        // ============================================
        // AUDIO CHAIN: Source → Gain → EQ → Compressor → Analyser → Destination
        // ============================================

        // 1. Create GainNode for volume control
        const gainNode = audioCtx.createGain();
        // Apply logarithmic scaling for natural volume perception
        const scaledVolume = Math.pow(volume, 2);
        gainNode.gain.setValueAtTime(scaledVolume, audioCtx.currentTime);
        gainNodeRef.current = gainNode;
        setGainNodeState(gainNode);  // Also store in state for context consumers

        // 2. Create 3-band EQ filters
        // Bass: Low shelf filter at 200 Hz
        const bassFilter = audioCtx.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.setValueAtTime(200, audioCtx.currentTime);
        bassFilter.gain.setValueAtTime(eqSettings.bass, audioCtx.currentTime);
        eqNodesRef.current.bass = bassFilter;

        // Mid: Peaking filter at 1000 Hz
        const midFilter = audioCtx.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        midFilter.Q.setValueAtTime(1, audioCtx.currentTime);
        midFilter.gain.setValueAtTime(eqSettings.mid, audioCtx.currentTime);
        eqNodesRef.current.mid = midFilter;

        // Treble: High shelf filter at 3000 Hz
        const trebleFilter = audioCtx.createBiquadFilter();
        trebleFilter.type = 'highshelf';
        trebleFilter.frequency.setValueAtTime(3000, audioCtx.currentTime);
        trebleFilter.gain.setValueAtTime(eqSettings.treble, audioCtx.currentTime);
        eqNodesRef.current.treble = trebleFilter;

        // 3. Create DynamicsCompressor to prevent clipping
        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);  // dB
        compressor.knee.setValueAtTime(30, audioCtx.currentTime);        // dB
        compressor.ratio.setValueAtTime(12, audioCtx.currentTime);       // 12:1 ratio
        compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);   // 3ms
        compressor.release.setValueAtTime(0.25, audioCtx.currentTime);   // 250ms
        compressorNodeRef.current = compressor;

        // 4. Create AnalyserNode for FFT visualization
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;  // More bins for better resolution
        analyser.smoothingTimeConstant = 0.8;  // Smooth transitions
        setAnalyserNode(analyser);  // Use state setter to trigger re-render!

        // 5. Connect the audio chain
        // GainNode → Bass → Mid → Treble → Compressor → Analyser → Destination
        gainNode.connect(bassFilter);
        bassFilter.connect(midFilter);
        midFilter.connect(trebleFilter);
        trebleFilter.connect(compressor);
        compressor.connect(analyser);
        analyser.connect(audioCtx.destination);

        console.log('[MusicPlayer] Audio chain initialized: Gain → EQ → Compressor → Analyser → Output');
        console.log('[MusicPlayer] AnalyserNode created:', analyser);
        console.log('[MusicPlayer] GainNode created:', gainNode);
        console.log('[MusicPlayer] AudioContext state:', audioCtx.state);

        // Create MIDI player
        let noteCount = 0;
        playerRef.current = new MidiPlayer.Player((event: any) => {
          if (event.name === 'Note on' && event.velocity > 0) {
            noteCount++;
            if (noteCount <= 5 || noteCount % 100 === 0) {
              console.log('[MusicPlayer] MIDI Note', noteCount, ':', {
                note: event.noteNumber,
                velocity: event.velocity,
                track: event.track,
              });
            }
            playNote(event.noteNumber, event.velocity, event.track);
          }
        });

        playerRef.current.on('endOfFile', () => {
          setIsPlaying(false);
          setProgress(0);
          // Auto-advance handled by handleTrackEnd
          handleTrackEnd();
        });

        // Load first track
        await loadTrack(0);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize music player:', error);
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (progressAnimationRef.current) {
        cancelAnimationFrame(progressAnimationRef.current);
      }
    };
  }, []);

  // Sync volume to MP3 audio element (volume is controlled by GainNode, but we need to set audio element volume too)
  useEffect(() => {
    // For MP3, the volume is controlled by the GainNode in the audio chain,
    // so we don't need to set audioElement.volume separately
    // But we do need to make sure the audio element is not muted
    if (audioElementRef.current) {
      audioElementRef.current.volume = 1; // Full volume - GainNode handles actual volume
    }
  }, [isMP3Track]);

  const loadTrack = async (trackIndex: number) => {
    if (!audioContextRef.current) return;

    try {
      const track = MUSIC_LIBRARY[trackIndex];
      const isMP3 = track.file.toLowerCase().endsWith('.mp3') ||
                    track.file.toLowerCase().endsWith('.wav') ||
                    track.file.toLowerCase().endsWith('.ogg');

      setIsMP3Track(isMP3);
      setProgress(0);

      // Stop any existing playback
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      if (playerRef.current) {
        playerRef.current.stop();
      }

      if (isMP3) {
        console.log('[MusicPlayer] Loading MP3/audio file:', track.file);

        // Create or reuse audio element
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio();
          audioElementRef.current.crossOrigin = 'anonymous';
        }

        // Set the source
        audioElementRef.current.src = track.file;
        audioElementRef.current.load();

        // Connect to audio chain if not already connected
        if (!audioSourceNodeRef.current && gainNodeRef.current) {
          audioSourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
          audioSourceNodeRef.current.connect(gainNodeRef.current);
          console.log('[MusicPlayer] MP3 audio connected to gain node');
        }

        // Set up event handlers
        audioElementRef.current.onended = () => {
          console.log('[MusicPlayer] MP3 track ended');
          setIsPlaying(false);
          setProgress(0);
          // Auto-advance handled by handleTrackEnd
          handleTrackEnd();
        };

        audioElementRef.current.onerror = (e) => {
          console.error('[MusicPlayer] MP3 load error:', e);
        };

        audioElementRef.current.onloadeddata = () => {
          console.log('[MusicPlayer] MP3 loaded successfully:', track.title);
        };

      } else {
        // MIDI file - use existing logic
        if (!playerRef.current) return;

        console.log('[MusicPlayer] Loading MIDI file:', track.file);
        const response = await fetch(track.file);
        const arrayBuffer = await response.arrayBuffer();
        const midiData = new Uint8Array(arrayBuffer);

        playerRef.current.loadArrayBuffer(midiData);

        // Preload acoustic piano (most common instrument)
        await loadInstrument(0);  // Acoustic grand piano
        await loadInstrument(33); // Acoustic bass
      }
    } catch (error) {
      console.error('Failed to load track:', error);
    }
  };

  const loadInstrument = async (program: number) => {
    if (!audioContextRef.current || instrumentsRef.current.has(program)) return;

    try {
      const instrumentNames = [
        'acoustic_grand_piano', 'bright_acoustic_piano', 'electric_grand_piano',
        'honkytonk_piano', 'electric_piano_1', 'electric_piano_2', 'harpsichord',
        'clavinet', 'celesta', 'glockenspiel', 'music_box', 'vibraphone',
        'marimba', 'xylophone', 'tubular_bells', 'dulcimer', 'drawbar_organ',
      ];

      const instrumentName = instrumentNames[program % instrumentNames.length] || 'acoustic_grand_piano';

      // Verify gainNode is available
      if (!gainNodeRef.current) {
        console.error('[MusicPlayer] CRITICAL: gainNodeRef.current is null when loading instrument!');
        return;
      }

      console.log(`[MusicPlayer] Loading instrument ${instrumentName} with destination:`, gainNodeRef.current);

      // Route instrument audio through our gain node (which connects to EQ → Compressor → Analyser → Output)
      const instrument = await Soundfont.instrument(
        audioContextRef.current,
        instrumentName,
        {
          gain: 1,  // Use full gain here, volume controlled by our GainNode
          destination: gainNodeRef.current,  // Route to our audio chain!
        }
      );

      console.log(`[MusicPlayer] ✓ Instrument ${instrumentName} loaded successfully`);
      instrumentsRef.current.set(program, instrument);
    } catch (error) {
      console.error(`[MusicPlayer] Failed to load instrument ${program}:`, error);
    }
  };

  const playNote = async (note: number, velocity: number, track: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      console.warn('[MusicPlayer] playNote called but audio not ready');
      return;
    }

    const programMap: { [key: number]: number } = {
      0: 0,  // Acoustic piano
      1: 0,  // Acoustic piano
      2: 33, // Acoustic bass
      3: 0,  // Acoustic piano
    };

    const program = programMap[track] || 0;

    // Ensure instrument is loaded
    if (!instrumentsRef.current.has(program)) {
      console.log(`[MusicPlayer] Loading instrument ${program} for track ${track}`);
      await loadInstrument(program);
    }

    const instrument = instrumentsRef.current.get(program);
    if (instrument && audioContextRef.current) {
      try {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(note / 12) - 1;
        const noteName = noteNames[note % 12];
        const fullNoteName = `${noteName}${octave}`;

        // Play the note - destination is set at instrument load time
        // Velocity controls note loudness, volume is controlled by GainNode in our chain
        instrument.play(fullNoteName, audioContextRef.current.currentTime, {
          gain: velocity / 127,
          duration: 0.5,
        });
      } catch (error) {
        console.error('[MusicPlayer] Error playing note:', error);
      }
    } else {
      console.warn('[MusicPlayer] No instrument available for program', program);
    }
  };

  // DEBUG: Play a test tone through the audio chain to verify it works
  const playTestTone = async () => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      console.error('[MusicPlayer] Cannot play test tone - audio context not ready');
      return;
    }

    // Resume if needed
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    console.log('[MusicPlayer] Playing test tone through audio chain...');

    const osc = audioContextRef.current.createOscillator();
    osc.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4 note
    osc.type = 'sine';

    // Connect to our gain node (which routes through EQ → Compressor → Analyser → Output)
    osc.connect(gainNodeRef.current!);

    osc.start();
    osc.stop(audioContextRef.current.currentTime + 0.5); // Play for 0.5 seconds

    console.log('[MusicPlayer] Test tone should be audible now');
  };

  // Expose test tone function globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).__playTestTone = playTestTone;
  }

  const play = async () => {
    if (!audioContextRef.current) return;

    console.log('[MusicPlayer] Play called, AudioContext state:', audioContextRef.current.state);
    console.log('[MusicPlayer] GainNode:', gainNodeRef.current);
    console.log('[MusicPlayer] AnalyserNode (from state):', analyserNode);
    console.log('[MusicPlayer] isMP3Track:', isMP3Track);

    // Resume audio context if suspended - MUST await this!
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
      console.log('[MusicPlayer] AudioContext resumed, new state:', audioContextRef.current.state);
    }

    if (isMP3Track && audioElementRef.current) {
      // MP3 playback
      try {
        await audioElementRef.current.play();
        console.log('[MusicPlayer] MP3 playback started');
      } catch (error) {
        console.error('[MusicPlayer] MP3 play error:', error);
        return;
      }
      setIsPlaying(true);

      // Update progress for MP3
      const updateMP3Progress = () => {
        if (audioElementRef.current && !audioElementRef.current.paused) {
          const currentTime = audioElementRef.current.currentTime;
          const duration = audioElementRef.current.duration || 1;
          const progressPercent = (currentTime / duration) * 100;
          setProgress(progressPercent);
          progressAnimationRef.current = requestAnimationFrame(updateMP3Progress);
        }
      };
      progressAnimationRef.current = requestAnimationFrame(updateMP3Progress);

    } else if (playerRef.current) {
      // MIDI playback
      playerRef.current.play();
      setIsPlaying(true);

      // Update progress for MIDI
      const updateMIDIProgress = () => {
        if (playerRef.current && isPlaying) {
          const remaining = playerRef.current.getSongPercentRemaining() || 0;
          setProgress(100 - remaining);

          if (isPlaying) {
            progressAnimationRef.current = requestAnimationFrame(updateMIDIProgress);
          }
        }
      };
      progressAnimationRef.current = requestAnimationFrame(updateMIDIProgress);
    }
  };

  const pause = () => {
    if (progressAnimationRef.current) {
      cancelAnimationFrame(progressAnimationRef.current);
    }

    if (isMP3Track && audioElementRef.current) {
      // MP3 pause
      audioElementRef.current.pause();
      console.log('[MusicPlayer] MP3 paused');
    } else if (playerRef.current) {
      // MIDI pause
      playerRef.current.pause();
    }

    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // FIXED: Volume control using proper GainNode with logarithmic scaling
  const setVolume = (linearVolume: number) => {
    // Clamp to valid range
    const clamped = Math.max(0, Math.min(1, linearVolume));

    console.log('[MusicPlayer] setVolume called:', {
      input: linearVolume,
      clamped,
      hasGainNode: !!gainNodeRef.current,
      currentGain: gainNodeRef.current?.gain.value,
    });

    // Store linear value for slider display
    setVolumeState(clamped);

    // Apply logarithmic scaling for natural volume perception
    // Human hearing is logarithmic, so square the value
    const scaledVolume = Math.pow(clamped, 2);

    // Apply to GainNode
    if (gainNodeRef.current && audioContextRef.current) {
      // Use setTargetAtTime for smooth transitions (avoids clicks)
      gainNodeRef.current.gain.setTargetAtTime(
        scaledVolume,
        audioContextRef.current.currentTime,
        0.02  // 20ms time constant for smooth fade
      );
      console.log('[MusicPlayer] Volume set to:', scaledVolume, '(scaled from', clamped, ')');
    } else {
      console.warn('[MusicPlayer] Cannot set volume - gainNode not ready');
    }

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      setLocalPreference('music-player-volume', clamped.toString());
    }
  };

  // NEW: EQ control function
  const setEQ = (band: 'bass' | 'mid' | 'treble', dbValue: number) => {
    // Clamp to valid range (-12 to +12 dB)
    const clamped = Math.max(-12, Math.min(12, dbValue));
    const node = eqNodesRef.current[band];

    if (node && audioContextRef.current) {
      // Smooth transition for EQ changes
      node.gain.setTargetAtTime(
        clamped,
        audioContextRef.current.currentTime,
        0.02
      );

      // Update state
      setEqSettings(prev => ({ ...prev, [band]: clamped }));

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        const currentEQ = JSON.parse(getLocalPreference('music-player-eq') || '{}');
        currentEQ[band] = clamped;
        setLocalPreference('music-player-eq', JSON.stringify(currentEQ));
      }
    }
  };

  // NEW: Reset EQ to flat
  const resetEQ = () => {
    setEQ('bass', 0);
    setEQ('mid', 0);
    setEQ('treble', 0);
  };

  // Seek to a specific percentage of the song (0-100)
  const seekToPercent = (percent: number) => {
    const clamped = Math.max(0, Math.min(100, percent));
    console.log('[MusicPlayer] Seeking to', clamped, '%', 'isMP3:', isMP3Track);

    if (isMP3Track && audioElementRef.current) {
      // MP3 seek
      const duration = audioElementRef.current.duration || 0;
      if (duration > 0) {
        audioElementRef.current.currentTime = (clamped / 100) * duration;
        console.log('[MusicPlayer] MP3 seeked to', audioElementRef.current.currentTime, 'seconds');
      }
    } else if (playerRef.current) {
      // MIDI seek using skipToPercent method
      playerRef.current.skipToPercent(clamped);
    }

    setProgress(clamped);
  };

  const switchTrack = async (trackIndex: number) => {
    const wasPlaying = isPlaying;
    if (isPlaying) {
      pause();
    }
    setCurrentTrackIndex(trackIndex);
    await loadTrack(trackIndex);
    if (wasPlaying) {
      setTimeout(() => play(), 100);
    }
  };

  // Shuffle/Repeat toggle functions
  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const newValue = !prev;
      if (newValue) {
        // Starting shuffle - reset history to current track
        shuffleHistoryRef.current = [currentTrackIndex];
      } else {
        // Ending shuffle - clear history
        shuffleHistoryRef.current = [];
      }
      console.log('[MusicPlayer] Shuffle toggled:', newValue);
      return newValue;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(prev);
      const newMode = modes[(currentIndex + 1) % modes.length];
      console.log('[MusicPlayer] Repeat mode changed:', newMode);
      return newMode;
    });
  };

  // Get next shuffled track (avoiding recently played)
  const getNextShuffleTrack = (): number => {
    const history = shuffleHistoryRef.current;
    const availableTracks: number[] = [];

    // Build list of tracks not in recent history (keep last ~30% of library in history)
    const historyLimit = Math.max(3, Math.floor(MUSIC_LIBRARY.length * 0.3));
    const recentHistory = history.slice(-historyLimit);

    for (let i = 0; i < MUSIC_LIBRARY.length; i++) {
      if (!recentHistory.includes(i)) {
        availableTracks.push(i);
      }
    }

    // If all tracks exhausted, reset and use any track except current
    if (availableTracks.length === 0) {
      shuffleHistoryRef.current = [currentTrackIndex];
      for (let i = 0; i < MUSIC_LIBRARY.length; i++) {
        if (i !== currentTrackIndex) {
          availableTracks.push(i);
        }
      }
    }

    // Pick random from available
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const nextIndex = availableTracks[randomIndex];

    // Add to history
    shuffleHistoryRef.current.push(nextIndex);

    return nextIndex;
  };

  const nextTrack = () => {
    let nextIndex: number;

    if (repeatMode === 'one') {
      // Repeat One: just restart current track
      nextIndex = currentTrackIndex;
    } else if (isShuffle) {
      // Shuffle mode
      nextIndex = getNextShuffleTrack();
    } else {
      // Normal sequential
      nextIndex = (currentTrackIndex + 1) % MUSIC_LIBRARY.length;
    }

    switchTrack(nextIndex);
  };

  const previousTrack = () => {
    let prevIndex: number;

    if (isShuffle && shuffleHistoryRef.current.length > 1) {
      // In shuffle mode, go back through history
      shuffleHistoryRef.current.pop(); // Remove current
      prevIndex = shuffleHistoryRef.current[shuffleHistoryRef.current.length - 1] || currentTrackIndex;
    } else {
      // Normal sequential previous
      prevIndex = (currentTrackIndex - 1 + MUSIC_LIBRARY.length) % MUSIC_LIBRARY.length;
    }

    switchTrack(prevIndex);
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  const contextValue: MusicPlayerContextType = {
    // State
    isPlaying,
    isLoading,
    currentTrack,
    currentTrackIndex,
    volume,
    progress,
    isMinimized,
    isVisualizerFullScreen,

    // Shuffle/Repeat state
    isShuffle,
    repeatMode,

    // Audio Analysis (uses state so context updates when set)
    analyserNode,
    audioContext: audioContextState,
    gainNode: gainNodeState,

    // EQ State (NEW)
    eqSettings,

    // Track info
    totalTracks: MUSIC_LIBRARY.length,

    // Actions
    play,
    pause,
    togglePlayPause,
    setVolume,
    switchTrack,
    nextTrack,
    previousTrack,
    toggleMinimized,
    setMinimized: setIsMinimized,

    // Shuffle/Repeat actions
    toggleShuffle,
    toggleRepeat,

    // EQ Actions (NEW)
    setEQ,
    resetEQ,
    seekToPercent,

    // Full-screen visualizer
    setVisualizerFullScreen,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
}
