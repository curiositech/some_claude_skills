'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import MidiPlayer from 'midi-player-js';
import Soundfont, { InstrumentName } from 'soundfont-player';
import { MUSIC_LIBRARY, TrackMetadata } from './music-metadata';

// EQ settings interface
interface EQSettings {
  bass: number;    // -12 to +12 dB
  mid: number;     // -12 to +12 dB
  treble: number;  // -12 to +12 dB
}

interface MusicPlayerContextType {
  isPlaying: boolean;
  isLoading: boolean;
  currentTrack: TrackMetadata | null;
  currentTrackIndex: number;
  volume: number;
  progress: number;
  isMinimized: boolean;
  isVisualizerFullScreen: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  analyserNode: AnalyserNode | null;
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  eqSettings: EQSettings;
  totalTracks: number;

  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  switchTrack: (index: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleMinimized: () => void;
  setMinimized: (minimized: boolean) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setEQ: (band: 'bass' | 'mid' | 'treble', value: number) => void;
  resetEQ: () => void;
  seekToPercent: (percent: number) => void;
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

const DEFAULT_EQ: EQSettings = { bass: 0, mid: 0, treble: 0 };

export function MusicPlayerProvider({ children }: MusicPlayerProviderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisualizerFullScreen, setVisualizerFullScreen] = useState(false);
  const [eqSettings, setEqSettings] = useState<EQSettings>(DEFAULT_EQ);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const shuffleHistoryRef = useRef<number[]>([]);

  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);
  const currentTrackIndexRef = useRef(currentTrackIndex);

  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { currentTrackIndexRef.current = currentTrackIndex; }, [currentTrackIndex]);

  const [audioContextState, setAudioContextState] = useState<AudioContext | null>(null);
  const [gainNodeState, setGainNodeState] = useState<GainNode | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const playerRef = useRef<MidiPlayer.Player | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instrumentsRef = useRef<Map<number, any>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const progressAnimationRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isMP3Track, setIsMP3Track] = useState(false);
  const gainNodeRef = useRef<GainNode | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const eqNodesRef = useRef<{
    bass: BiquadFilterNode | null;
    mid: BiquadFilterNode | null;
    treble: BiquadFilterNode | null;
  }>({ bass: null, mid: null, treble: null });

  const currentTrack = MUSIC_LIBRARY[currentTrackIndex] || null;

  const advanceToNextTrack = useCallback(() => {
    const currentIdx = currentTrackIndexRef.current;
    let nextIdx: number;

    if (isShuffleRef.current) {
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
  }, []);

  const handleTrackEnd = useCallback(() => {
    if (repeatModeRef.current === 'one') {
      setProgress(0);
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
      const currentIdx = currentTrackIndexRef.current;
      if (!isShuffleRef.current && currentIdx === MUSIC_LIBRARY.length - 1) {
        return;
      }
      advanceToNextTrack();
    } else {
      advanceToNextTrack();
    }
  }, [isMP3Track, advanceToNextTrack]);

  const loadInstrument = useCallback(async (program: number) => {
    if (!audioContextRef.current || instrumentsRef.current.has(program)) return;

    try {
      const instrumentNames = [
        'acoustic_grand_piano', 'bright_acoustic_piano', 'electric_grand_piano',
        'honkytonk_piano', 'electric_piano_1', 'electric_piano_2', 'harpsichord',
        'clavinet', 'celesta', 'glockenspiel', 'music_box', 'vibraphone',
        'marimba', 'xylophone', 'tubular_bells', 'dulcimer', 'drawbar_organ',
      ];

      const instrumentName = (instrumentNames[program % instrumentNames.length] || 'acoustic_grand_piano') as InstrumentName;

      if (!gainNodeRef.current) {
        console.error('[MusicPlayer] gainNodeRef.current is null');
        return;
      }

      const instrument = await Soundfont.instrument(
        audioContextRef.current,
        instrumentName,
        { gain: 1, destination: gainNodeRef.current }
      );

      instrumentsRef.current.set(program, instrument);
    } catch (error) {
      console.error(`[MusicPlayer] Failed to load instrument ${program}:`, error);
    }
  }, []);

  const playNote = useCallback(async (note: number, velocity: number, track: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const programMap: { [key: number]: number } = { 0: 0, 1: 0, 2: 33, 3: 0 };
    const program = programMap[track] || 0;

    if (!instrumentsRef.current.has(program)) {
      await loadInstrument(program);
    }

    const instrument = instrumentsRef.current.get(program);
    if (instrument && audioContextRef.current) {
      try {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(note / 12) - 1;
        const noteName = noteNames[note % 12];
        const fullNoteName = `${noteName}${octave}`;

        instrument.play(fullNoteName, audioContextRef.current.currentTime, {
          gain: velocity / 127,
          duration: 0.5,
        });
      } catch (error) {
        console.error('[MusicPlayer] Error playing note:', error);
      }
    }
  }, [loadInstrument]);

  const loadTrack = useCallback(async (trackIndex: number) => {
    if (!audioContextRef.current) return;

    try {
      const track = MUSIC_LIBRARY[trackIndex];
      const isMP3 = track.file.toLowerCase().endsWith('.mp3') ||
                    track.file.toLowerCase().endsWith('.wav') ||
                    track.file.toLowerCase().endsWith('.ogg');

      setIsMP3Track(isMP3);
      setProgress(0);

      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      if (playerRef.current) {
        playerRef.current.stop();
      }

      if (isMP3) {
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio();
          audioElementRef.current.crossOrigin = 'anonymous';
        }

        audioElementRef.current.src = track.file;
        audioElementRef.current.load();

        if (!audioSourceNodeRef.current && gainNodeRef.current && audioContextRef.current) {
          audioSourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
          audioSourceNodeRef.current.connect(gainNodeRef.current);
        }

        audioElementRef.current.onended = () => {
          setIsPlaying(false);
          setProgress(0);
          handleTrackEnd();
        };
      } else {
        if (!playerRef.current) return;
        const response = await fetch(track.file);
        const arrayBuffer = await response.arrayBuffer();
        playerRef.current.loadArrayBuffer(arrayBuffer);
        await loadInstrument(0);
        await loadInstrument(33);
      }
    } catch (error) {
      console.error('Failed to load track:', error);
    }
  }, [handleTrackEnd, loadInstrument]);

  // Initialize player
  useEffect(() => {
    const initPlayer = async () => {
      setIsLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        setAudioContextState(audioCtx);

        const gainNode = audioCtx.createGain();
        const scaledVolume = Math.pow(volume, 2);
        gainNode.gain.setValueAtTime(scaledVolume, audioCtx.currentTime);
        gainNodeRef.current = gainNode;
        setGainNodeState(gainNode);

        const bassFilter = audioCtx.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.setValueAtTime(200, audioCtx.currentTime);
        bassFilter.gain.setValueAtTime(eqSettings.bass, audioCtx.currentTime);
        eqNodesRef.current.bass = bassFilter;

        const midFilter = audioCtx.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        midFilter.Q.setValueAtTime(1, audioCtx.currentTime);
        midFilter.gain.setValueAtTime(eqSettings.mid, audioCtx.currentTime);
        eqNodesRef.current.mid = midFilter;

        const trebleFilter = audioCtx.createBiquadFilter();
        trebleFilter.type = 'highshelf';
        trebleFilter.frequency.setValueAtTime(3000, audioCtx.currentTime);
        trebleFilter.gain.setValueAtTime(eqSettings.treble, audioCtx.currentTime);
        eqNodesRef.current.treble = trebleFilter;

        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
        compressor.knee.setValueAtTime(30, audioCtx.currentTime);
        compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
        compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
        compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
        compressorNodeRef.current = compressor;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        setAnalyserNode(analyser);

        gainNode.connect(bassFilter);
        bassFilter.connect(midFilter);
        midFilter.connect(trebleFilter);
        trebleFilter.connect(compressor);
        compressor.connect(analyser);
        analyser.connect(audioCtx.destination);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        playerRef.current = new MidiPlayer.Player((event: any) => {
          if (event.name === 'Note on' && event.velocity > 0) {
            playNote(event.noteNumber, event.velocity, event.track);
          }
        });

        playerRef.current.on('endOfFile', () => {
          setIsPlaying(false);
          setProgress(0);
          handleTrackEnd();
        });

        await loadTrack(0);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize music player:', error);
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) playerRef.current.stop();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      if (audioContextRef.current) audioContextRef.current.close();
      if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = async () => {
    if (!audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isMP3Track && audioElementRef.current) {
      try {
        await audioElementRef.current.play();
      } catch (error) {
        console.error('[MusicPlayer] MP3 play error:', error);
        return;
      }
      setIsPlaying(true);

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
      playerRef.current.play();
      setIsPlaying(true);

      const updateMIDIProgress = () => {
        if (playerRef.current) {
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
      audioElementRef.current.pause();
    } else if (playerRef.current) {
      playerRef.current.pause();
    }

    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) pause();
    else play();
  };

  const setVolume = (linearVolume: number) => {
    const clamped = Math.max(0, Math.min(1, linearVolume));
    setVolumeState(clamped);
    const scaledVolume = Math.pow(clamped, 2);

    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        scaledVolume,
        audioContextRef.current.currentTime,
        0.02
      );
    }
  };

  const setEQ = (band: 'bass' | 'mid' | 'treble', dbValue: number) => {
    const clamped = Math.max(-12, Math.min(12, dbValue));
    const node = eqNodesRef.current[band];

    if (node && audioContextRef.current) {
      node.gain.setTargetAtTime(clamped, audioContextRef.current.currentTime, 0.02);
      setEqSettings(prev => ({ ...prev, [band]: clamped }));
    }
  };

  const resetEQ = () => {
    setEQ('bass', 0);
    setEQ('mid', 0);
    setEQ('treble', 0);
  };

  const seekToPercent = (percent: number) => {
    const clamped = Math.max(0, Math.min(100, percent));

    if (isMP3Track && audioElementRef.current) {
      const duration = audioElementRef.current.duration || 0;
      if (duration > 0) {
        audioElementRef.current.currentTime = (clamped / 100) * duration;
      }
    } else if (playerRef.current) {
      playerRef.current.skipToPercent(clamped);
    }

    setProgress(clamped);
  };

  const switchTrack = async (trackIndex: number) => {
    const wasPlaying = isPlaying;
    if (isPlaying) pause();
    setCurrentTrackIndex(trackIndex);
    await loadTrack(trackIndex);
    if (wasPlaying) {
      setTimeout(() => play(), 100);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const newValue = !prev;
      if (newValue) {
        shuffleHistoryRef.current = [currentTrackIndex];
      } else {
        shuffleHistoryRef.current = [];
      }
      return newValue;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(prev);
      return modes[(currentIndex + 1) % modes.length];
    });
  };

  const getNextShuffleTrack = (): number => {
    const history = shuffleHistoryRef.current;
    const availableTracks: number[] = [];
    const historyLimit = Math.max(3, Math.floor(MUSIC_LIBRARY.length * 0.3));
    const recentHistory = history.slice(-historyLimit);

    for (let i = 0; i < MUSIC_LIBRARY.length; i++) {
      if (!recentHistory.includes(i)) availableTracks.push(i);
    }

    if (availableTracks.length === 0) {
      shuffleHistoryRef.current = [currentTrackIndex];
      for (let i = 0; i < MUSIC_LIBRARY.length; i++) {
        if (i !== currentTrackIndex) availableTracks.push(i);
      }
    }

    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const nextIndex = availableTracks[randomIndex];
    shuffleHistoryRef.current.push(nextIndex);
    return nextIndex;
  };

  const nextTrack = () => {
    let nextIndex: number;

    if (repeatMode === 'one') {
      nextIndex = currentTrackIndex;
    } else if (isShuffle) {
      nextIndex = getNextShuffleTrack();
    } else {
      nextIndex = (currentTrackIndex + 1) % MUSIC_LIBRARY.length;
    }

    switchTrack(nextIndex);
  };

  const previousTrack = () => {
    let prevIndex: number;

    if (isShuffle && shuffleHistoryRef.current.length > 1) {
      shuffleHistoryRef.current.pop();
      prevIndex = shuffleHistoryRef.current[shuffleHistoryRef.current.length - 1] || currentTrackIndex;
    } else {
      prevIndex = (currentTrackIndex - 1 + MUSIC_LIBRARY.length) % MUSIC_LIBRARY.length;
    }

    switchTrack(prevIndex);
  };

  const toggleMinimized = () => setIsMinimized(!isMinimized);

  const contextValue: MusicPlayerContextType = {
    isPlaying,
    isLoading,
    currentTrack,
    currentTrackIndex,
    volume,
    progress,
    isMinimized,
    isVisualizerFullScreen,
    isShuffle,
    repeatMode,
    analyserNode,
    audioContext: audioContextState,
    gainNode: gainNodeState,
    eqSettings,
    totalTracks: MUSIC_LIBRARY.length,
    play,
    pause,
    togglePlayPause,
    setVolume,
    switchTrack,
    nextTrack,
    previousTrack,
    toggleMinimized,
    setMinimized: setIsMinimized,
    toggleShuffle,
    toggleRepeat,
    setEQ,
    resetEQ,
    seekToPercent,
    setVisualizerFullScreen,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
}
