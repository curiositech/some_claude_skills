"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMusicPlayer = useMusicPlayer;
exports.MusicPlayerProvider = MusicPlayerProvider;
var react_1 = require("react");
var midi_player_js_1 = require("midi-player-js");
var soundfont_player_1 = require("soundfont-player");
var musicMetadata_1 = require("../data/musicMetadata");
var MusicPlayerContext = (0, react_1.createContext)(undefined);
function useMusicPlayer() {
    var context = (0, react_1.useContext)(MusicPlayerContext);
    if (!context) {
        throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
    }
    return context;
}
// Default EQ settings
var DEFAULT_EQ = { bass: 0, mid: 0, treble: 0 };
function MusicPlayerProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = (0, react_1.useState)(false), isPlaying = _b[0], setIsPlaying = _b[1];
    var _c = (0, react_1.useState)(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = (0, react_1.useState)(0), currentTrackIndex = _d[0], setCurrentTrackIndex = _d[1]; // Start with first track
    var _e = (0, react_1.useState)(0.7), volume = _e[0], setVolumeState = _e[1];
    var _f = (0, react_1.useState)(0), progress = _f[0], setProgress = _f[1];
    var _g = (0, react_1.useState)(true), isMinimized = _g[0], setIsMinimized = _g[1];
    var _h = (0, react_1.useState)(false), isVisualizerFullScreen = _h[0], setVisualizerFullScreen = _h[1];
    var _j = (0, react_1.useState)(DEFAULT_EQ), eqSettings = _j[0], setEqSettings = _j[1];
    // Shuffle/Repeat state
    var _k = (0, react_1.useState)(false), isShuffle = _k[0], setIsShuffle = _k[1];
    var _l = (0, react_1.useState)('off'), repeatMode = _l[0], setRepeatMode = _l[1];
    var shuffleHistoryRef = (0, react_1.useRef)([]);
    // Refs to access current values in callbacks (avoids stale closure issues)
    var isShuffleRef = (0, react_1.useRef)(isShuffle);
    var repeatModeRef = (0, react_1.useRef)(repeatMode);
    var currentTrackIndexRef = (0, react_1.useRef)(currentTrackIndex);
    // Keep refs in sync with state
    (0, react_1.useEffect)(function () { isShuffleRef.current = isShuffle; }, [isShuffle]);
    (0, react_1.useEffect)(function () { repeatModeRef.current = repeatMode; }, [repeatMode]);
    (0, react_1.useEffect)(function () { currentTrackIndexRef.current = currentTrackIndex; }, [currentTrackIndex]);
    // NEW: State for audioContext and gainNode for Butterchurn integration
    var _m = (0, react_1.useState)(null), audioContextState = _m[0], setAudioContextState = _m[1];
    var _o = (0, react_1.useState)(null), gainNodeState = _o[0], setGainNodeState = _o[1];
    // NEW: State for analyser node (not ref!) - so context updates when it's set
    var _p = (0, react_1.useState)(null), analyserNode = _p[0], setAnalyserNode = _p[1];
    // Core audio refs
    var playerRef = (0, react_1.useRef)(null);
    var instrumentsRef = (0, react_1.useRef)(new Map());
    var audioContextRef = (0, react_1.useRef)(null);
    var progressAnimationRef = (0, react_1.useRef)(null);
    // MP3 playback refs
    var audioElementRef = (0, react_1.useRef)(null);
    var audioSourceNodeRef = (0, react_1.useRef)(null);
    var _q = (0, react_1.useState)(false), isMP3Track = _q[0], setIsMP3Track = _q[1];
    // NEW: Audio processing chain refs
    var gainNodeRef = (0, react_1.useRef)(null);
    var compressorNodeRef = (0, react_1.useRef)(null);
    // NEW: EQ filter refs
    var eqNodesRef = (0, react_1.useRef)({ bass: null, mid: null, treble: null });
    var currentTrack = musicMetadata_1.MUSIC_LIBRARY[currentTrackIndex] || null;
    // Handle track end - uses refs for current state to avoid stale closures
    var handleTrackEnd = function () {
        console.log('[MusicPlayer] Track ended. Repeat:', repeatModeRef.current, 'Shuffle:', isShuffleRef.current);
        if (repeatModeRef.current === 'one') {
            // Repeat One: restart the same track
            setProgress(0);
            // Trigger play on next tick
            setTimeout(function () {
                if (isMP3Track && audioElementRef.current) {
                    audioElementRef.current.currentTime = 0;
                    audioElementRef.current.play().catch(console.error);
                }
                else if (playerRef.current) {
                    playerRef.current.play();
                }
                setIsPlaying(true);
            }, 50);
        }
        else if (repeatModeRef.current === 'off') {
            // No repeat: check if at end of playlist
            var currentIdx = currentTrackIndexRef.current;
            if (!isShuffleRef.current && currentIdx === musicMetadata_1.MUSIC_LIBRARY.length - 1) {
                // At end of playlist with no repeat - stop
                console.log('[MusicPlayer] End of playlist, stopping');
                return;
            }
            // Otherwise advance
            advanceToNextTrack();
        }
        else {
            // Repeat All: always advance
            advanceToNextTrack();
        }
    };
    // Advance to next track (handles shuffle)
    var advanceToNextTrack = function () {
        var currentIdx = currentTrackIndexRef.current;
        var nextIdx;
        if (isShuffleRef.current) {
            // Shuffle: random track avoiding recent history
            var history_1 = shuffleHistoryRef.current;
            var historyLimit = Math.max(3, Math.floor(musicMetadata_1.MUSIC_LIBRARY.length * 0.3));
            var recentHistory = history_1.slice(-historyLimit);
            var available = [];
            for (var i = 0; i < musicMetadata_1.MUSIC_LIBRARY.length; i++) {
                if (!recentHistory.includes(i))
                    available.push(i);
            }
            if (available.length === 0) {
                shuffleHistoryRef.current = [currentIdx];
                for (var i = 0; i < musicMetadata_1.MUSIC_LIBRARY.length; i++) {
                    if (i !== currentIdx)
                        available.push(i);
                }
            }
            nextIdx = available[Math.floor(Math.random() * available.length)];
            shuffleHistoryRef.current.push(nextIdx);
        }
        else {
            nextIdx = (currentIdx + 1) % musicMetadata_1.MUSIC_LIBRARY.length;
        }
        setCurrentTrackIndex(nextIdx);
    };
    // Initialize player on mount
    (0, react_1.useEffect)(function () {
        var initPlayer = function () { return __awaiter(_this, void 0, void 0, function () {
            var audioCtx, gainNode, scaledVolume, bassFilter, midFilter, trebleFilter, compressor, analyser, noteCount_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        audioContextRef.current = audioCtx;
                        setAudioContextState(audioCtx); // Also store in state for context consumers
                        gainNode = audioCtx.createGain();
                        scaledVolume = Math.pow(volume, 2);
                        gainNode.gain.setValueAtTime(scaledVolume, audioCtx.currentTime);
                        gainNodeRef.current = gainNode;
                        setGainNodeState(gainNode); // Also store in state for context consumers
                        bassFilter = audioCtx.createBiquadFilter();
                        bassFilter.type = 'lowshelf';
                        bassFilter.frequency.setValueAtTime(200, audioCtx.currentTime);
                        bassFilter.gain.setValueAtTime(eqSettings.bass, audioCtx.currentTime);
                        eqNodesRef.current.bass = bassFilter;
                        midFilter = audioCtx.createBiquadFilter();
                        midFilter.type = 'peaking';
                        midFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
                        midFilter.Q.setValueAtTime(1, audioCtx.currentTime);
                        midFilter.gain.setValueAtTime(eqSettings.mid, audioCtx.currentTime);
                        eqNodesRef.current.mid = midFilter;
                        trebleFilter = audioCtx.createBiquadFilter();
                        trebleFilter.type = 'highshelf';
                        trebleFilter.frequency.setValueAtTime(3000, audioCtx.currentTime);
                        trebleFilter.gain.setValueAtTime(eqSettings.treble, audioCtx.currentTime);
                        eqNodesRef.current.treble = trebleFilter;
                        compressor = audioCtx.createDynamicsCompressor();
                        compressor.threshold.setValueAtTime(-24, audioCtx.currentTime); // dB
                        compressor.knee.setValueAtTime(30, audioCtx.currentTime); // dB
                        compressor.ratio.setValueAtTime(12, audioCtx.currentTime); // 12:1 ratio
                        compressor.attack.setValueAtTime(0.003, audioCtx.currentTime); // 3ms
                        compressor.release.setValueAtTime(0.25, audioCtx.currentTime); // 250ms
                        compressorNodeRef.current = compressor;
                        analyser = audioCtx.createAnalyser();
                        analyser.fftSize = 256; // More bins for better resolution
                        analyser.smoothingTimeConstant = 0.8; // Smooth transitions
                        setAnalyserNode(analyser); // Use state setter to trigger re-render!
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
                        noteCount_1 = 0;
                        playerRef.current = new midi_player_js_1.default.Player(function (event) {
                            if (event.name === 'Note on' && event.velocity > 0) {
                                noteCount_1++;
                                if (noteCount_1 <= 5 || noteCount_1 % 100 === 0) {
                                    console.log('[MusicPlayer] MIDI Note', noteCount_1, ':', {
                                        note: event.noteNumber,
                                        velocity: event.velocity,
                                        track: event.track,
                                    });
                                }
                                playNote(event.noteNumber, event.velocity, event.track);
                            }
                        });
                        playerRef.current.on('endOfFile', function () {
                            setIsPlaying(false);
                            setProgress(0);
                            // Auto-advance handled by handleTrackEnd
                            handleTrackEnd();
                        });
                        // Load first track
                        return [4 /*yield*/, loadTrack(0)];
                    case 2:
                        // Load first track
                        _a.sent();
                        setIsLoading(false);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to initialize music player:', error_1);
                        setIsLoading(false);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        initPlayer();
        return function () {
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
    (0, react_1.useEffect)(function () {
        // For MP3, the volume is controlled by the GainNode in the audio chain,
        // so we don't need to set audioElement.volume separately
        // But we do need to make sure the audio element is not muted
        if (audioElementRef.current) {
            audioElementRef.current.volume = 1; // Full volume - GainNode handles actual volume
        }
    }, [isMP3Track]);
    var loadTrack = function (trackIndex) { return __awaiter(_this, void 0, void 0, function () {
        var track_1, isMP3, response, arrayBuffer, midiData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!audioContextRef.current)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    track_1 = musicMetadata_1.MUSIC_LIBRARY[trackIndex];
                    isMP3 = track_1.file.toLowerCase().endsWith('.mp3') ||
                        track_1.file.toLowerCase().endsWith('.wav') ||
                        track_1.file.toLowerCase().endsWith('.ogg');
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
                    if (!isMP3) return [3 /*break*/, 2];
                    console.log('[MusicPlayer] Loading MP3/audio file:', track_1.file);
                    // Create or reuse audio element
                    if (!audioElementRef.current) {
                        audioElementRef.current = new Audio();
                        audioElementRef.current.crossOrigin = 'anonymous';
                    }
                    // Set the source
                    audioElementRef.current.src = track_1.file;
                    audioElementRef.current.load();
                    // Connect to audio chain if not already connected
                    if (!audioSourceNodeRef.current && gainNodeRef.current) {
                        audioSourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
                        audioSourceNodeRef.current.connect(gainNodeRef.current);
                        console.log('[MusicPlayer] MP3 audio connected to gain node');
                    }
                    // Set up event handlers
                    audioElementRef.current.onended = function () {
                        console.log('[MusicPlayer] MP3 track ended');
                        setIsPlaying(false);
                        setProgress(0);
                        // Auto-advance handled by handleTrackEnd
                        handleTrackEnd();
                    };
                    audioElementRef.current.onerror = function (e) {
                        console.error('[MusicPlayer] MP3 load error:', e);
                    };
                    audioElementRef.current.onloadeddata = function () {
                        console.log('[MusicPlayer] MP3 loaded successfully:', track_1.title);
                    };
                    return [3 /*break*/, 7];
                case 2:
                    // MIDI file - use existing logic
                    if (!playerRef.current)
                        return [2 /*return*/];
                    console.log('[MusicPlayer] Loading MIDI file:', track_1.file);
                    return [4 /*yield*/, fetch(track_1.file)];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.arrayBuffer()];
                case 4:
                    arrayBuffer = _a.sent();
                    midiData = new Uint8Array(arrayBuffer);
                    playerRef.current.loadArrayBuffer(midiData);
                    // Preload acoustic piano (most common instrument)
                    return [4 /*yield*/, loadInstrument(0)];
                case 5:
                    // Preload acoustic piano (most common instrument)
                    _a.sent(); // Acoustic grand piano
                    return [4 /*yield*/, loadInstrument(33)];
                case 6:
                    _a.sent(); // Acoustic bass
                    _a.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_2 = _a.sent();
                    console.error('Failed to load track:', error_2);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var loadInstrument = function (program) { return __awaiter(_this, void 0, void 0, function () {
        var instrumentNames, instrumentName, instrument, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!audioContextRef.current || instrumentsRef.current.has(program))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    instrumentNames = [
                        'acoustic_grand_piano', 'bright_acoustic_piano', 'electric_grand_piano',
                        'honkytonk_piano', 'electric_piano_1', 'electric_piano_2', 'harpsichord',
                        'clavinet', 'celesta', 'glockenspiel', 'music_box', 'vibraphone',
                        'marimba', 'xylophone', 'tubular_bells', 'dulcimer', 'drawbar_organ',
                    ];
                    instrumentName = instrumentNames[program % instrumentNames.length] || 'acoustic_grand_piano';
                    // Verify gainNode is available
                    if (!gainNodeRef.current) {
                        console.error('[MusicPlayer] CRITICAL: gainNodeRef.current is null when loading instrument!');
                        return [2 /*return*/];
                    }
                    console.log("[MusicPlayer] Loading instrument ".concat(instrumentName, " with destination:"), gainNodeRef.current);
                    return [4 /*yield*/, soundfont_player_1.default.instrument(audioContextRef.current, instrumentName, {
                            gain: 1, // Use full gain here, volume controlled by our GainNode
                            destination: gainNodeRef.current, // Route to our audio chain!
                        })];
                case 2:
                    instrument = _a.sent();
                    console.log("[MusicPlayer] \u2713 Instrument ".concat(instrumentName, " loaded successfully"));
                    instrumentsRef.current.set(program, instrument);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error("[MusicPlayer] Failed to load instrument ".concat(program, ":"), error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var playNote = function (note, velocity, track) { return __awaiter(_this, void 0, void 0, function () {
        var programMap, program, instrument, noteNames, octave, noteName, fullNoteName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!audioContextRef.current || !gainNodeRef.current) {
                        console.warn('[MusicPlayer] playNote called but audio not ready');
                        return [2 /*return*/];
                    }
                    programMap = {
                        0: 0, // Acoustic piano
                        1: 0, // Acoustic piano
                        2: 33, // Acoustic bass
                        3: 0, // Acoustic piano
                    };
                    program = programMap[track] || 0;
                    if (!!instrumentsRef.current.has(program)) return [3 /*break*/, 2];
                    console.log("[MusicPlayer] Loading instrument ".concat(program, " for track ").concat(track));
                    return [4 /*yield*/, loadInstrument(program)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    instrument = instrumentsRef.current.get(program);
                    if (instrument && audioContextRef.current) {
                        try {
                            noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                            octave = Math.floor(note / 12) - 1;
                            noteName = noteNames[note % 12];
                            fullNoteName = "".concat(noteName).concat(octave);
                            // Play the note - destination is set at instrument load time
                            // Velocity controls note loudness, volume is controlled by GainNode in our chain
                            instrument.play(fullNoteName, audioContextRef.current.currentTime, {
                                gain: velocity / 127,
                                duration: 0.5,
                            });
                        }
                        catch (error) {
                            console.error('[MusicPlayer] Error playing note:', error);
                        }
                    }
                    else {
                        console.warn('[MusicPlayer] No instrument available for program', program);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // DEBUG: Play a test tone through the audio chain to verify it works
    var playTestTone = function () { return __awaiter(_this, void 0, void 0, function () {
        var osc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!audioContextRef.current || !gainNodeRef.current) {
                        console.error('[MusicPlayer] Cannot play test tone - audio context not ready');
                        return [2 /*return*/];
                    }
                    if (!(audioContextRef.current.state === 'suspended')) return [3 /*break*/, 2];
                    return [4 /*yield*/, audioContextRef.current.resume()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    console.log('[MusicPlayer] Playing test tone through audio chain...');
                    osc = audioContextRef.current.createOscillator();
                    osc.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4 note
                    osc.type = 'sine';
                    // Connect to our gain node (which routes through EQ → Compressor → Analyser → Output)
                    osc.connect(gainNodeRef.current);
                    osc.start();
                    osc.stop(audioContextRef.current.currentTime + 0.5); // Play for 0.5 seconds
                    console.log('[MusicPlayer] Test tone should be audible now');
                    return [2 /*return*/];
            }
        });
    }); };
    // Expose test tone function globally for debugging
    if (typeof window !== 'undefined') {
        window.__playTestTone = playTestTone;
    }
    var play = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_4, updateMP3Progress_1, updateMIDIProgress_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!audioContextRef.current)
                        return [2 /*return*/];
                    console.log('[MusicPlayer] Play called, AudioContext state:', audioContextRef.current.state);
                    console.log('[MusicPlayer] GainNode:', gainNodeRef.current);
                    console.log('[MusicPlayer] AnalyserNode (from state):', analyserNode);
                    console.log('[MusicPlayer] isMP3Track:', isMP3Track);
                    if (!(audioContextRef.current.state === 'suspended')) return [3 /*break*/, 2];
                    return [4 /*yield*/, audioContextRef.current.resume()];
                case 1:
                    _a.sent();
                    console.log('[MusicPlayer] AudioContext resumed, new state:', audioContextRef.current.state);
                    _a.label = 2;
                case 2:
                    if (!(isMP3Track && audioElementRef.current)) return [3 /*break*/, 7];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, audioElementRef.current.play()];
                case 4:
                    _a.sent();
                    console.log('[MusicPlayer] MP3 playback started');
                    return [3 /*break*/, 6];
                case 5:
                    error_4 = _a.sent();
                    console.error('[MusicPlayer] MP3 play error:', error_4);
                    return [2 /*return*/];
                case 6:
                    setIsPlaying(true);
                    updateMP3Progress_1 = function () {
                        if (audioElementRef.current && !audioElementRef.current.paused) {
                            var currentTime = audioElementRef.current.currentTime;
                            var duration = audioElementRef.current.duration || 1;
                            var progressPercent = (currentTime / duration) * 100;
                            setProgress(progressPercent);
                            progressAnimationRef.current = requestAnimationFrame(updateMP3Progress_1);
                        }
                    };
                    progressAnimationRef.current = requestAnimationFrame(updateMP3Progress_1);
                    return [3 /*break*/, 8];
                case 7:
                    if (playerRef.current) {
                        // MIDI playback
                        playerRef.current.play();
                        setIsPlaying(true);
                        updateMIDIProgress_1 = function () {
                            if (playerRef.current && isPlaying) {
                                var remaining = playerRef.current.getSongPercentRemaining() || 0;
                                setProgress(100 - remaining);
                                if (isPlaying) {
                                    progressAnimationRef.current = requestAnimationFrame(updateMIDIProgress_1);
                                }
                            }
                        };
                        progressAnimationRef.current = requestAnimationFrame(updateMIDIProgress_1);
                    }
                    _a.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var pause = function () {
        if (progressAnimationRef.current) {
            cancelAnimationFrame(progressAnimationRef.current);
        }
        if (isMP3Track && audioElementRef.current) {
            // MP3 pause
            audioElementRef.current.pause();
            console.log('[MusicPlayer] MP3 paused');
        }
        else if (playerRef.current) {
            // MIDI pause
            playerRef.current.pause();
        }
        setIsPlaying(false);
    };
    var togglePlayPause = function () {
        if (isPlaying) {
            pause();
        }
        else {
            play();
        }
    };
    // FIXED: Volume control using proper GainNode with logarithmic scaling
    var setVolume = function (linearVolume) {
        var _a;
        // Clamp to valid range
        var clamped = Math.max(0, Math.min(1, linearVolume));
        console.log('[MusicPlayer] setVolume called:', {
            input: linearVolume,
            clamped: clamped,
            hasGainNode: !!gainNodeRef.current,
            currentGain: (_a = gainNodeRef.current) === null || _a === void 0 ? void 0 : _a.gain.value,
        });
        // Store linear value for slider display
        setVolumeState(clamped);
        // Apply logarithmic scaling for natural volume perception
        // Human hearing is logarithmic, so square the value
        var scaledVolume = Math.pow(clamped, 2);
        // Apply to GainNode
        if (gainNodeRef.current && audioContextRef.current) {
            // Use setTargetAtTime for smooth transitions (avoids clicks)
            gainNodeRef.current.gain.setTargetAtTime(scaledVolume, audioContextRef.current.currentTime, 0.02 // 20ms time constant for smooth fade
            );
            console.log('[MusicPlayer] Volume set to:', scaledVolume, '(scaled from', clamped, ')');
        }
        else {
            console.warn('[MusicPlayer] Cannot set volume - gainNode not ready');
        }
        // Persist to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('music-player-volume', clamped.toString());
        }
    };
    // NEW: EQ control function
    var setEQ = function (band, dbValue) {
        // Clamp to valid range (-12 to +12 dB)
        var clamped = Math.max(-12, Math.min(12, dbValue));
        var node = eqNodesRef.current[band];
        if (node && audioContextRef.current) {
            // Smooth transition for EQ changes
            node.gain.setTargetAtTime(clamped, audioContextRef.current.currentTime, 0.02);
            // Update state
            setEqSettings(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[band] = clamped, _a)));
            });
            // Persist to localStorage
            if (typeof window !== 'undefined') {
                var currentEQ = JSON.parse(localStorage.getItem('music-player-eq') || '{}');
                currentEQ[band] = clamped;
                localStorage.setItem('music-player-eq', JSON.stringify(currentEQ));
            }
        }
    };
    // NEW: Reset EQ to flat
    var resetEQ = function () {
        setEQ('bass', 0);
        setEQ('mid', 0);
        setEQ('treble', 0);
    };
    // Seek to a specific percentage of the song (0-100)
    var seekToPercent = function (percent) {
        var clamped = Math.max(0, Math.min(100, percent));
        console.log('[MusicPlayer] Seeking to', clamped, '%', 'isMP3:', isMP3Track);
        if (isMP3Track && audioElementRef.current) {
            // MP3 seek
            var duration = audioElementRef.current.duration || 0;
            if (duration > 0) {
                audioElementRef.current.currentTime = (clamped / 100) * duration;
                console.log('[MusicPlayer] MP3 seeked to', audioElementRef.current.currentTime, 'seconds');
            }
        }
        else if (playerRef.current) {
            // MIDI seek using skipToPercent method
            playerRef.current.skipToPercent(clamped);
        }
        setProgress(clamped);
    };
    var switchTrack = function (trackIndex) { return __awaiter(_this, void 0, void 0, function () {
        var wasPlaying;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wasPlaying = isPlaying;
                    if (isPlaying) {
                        pause();
                    }
                    setCurrentTrackIndex(trackIndex);
                    return [4 /*yield*/, loadTrack(trackIndex)];
                case 1:
                    _a.sent();
                    if (wasPlaying) {
                        setTimeout(function () { return play(); }, 100);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // Shuffle/Repeat toggle functions
    var toggleShuffle = function () {
        setIsShuffle(function (prev) {
            var newValue = !prev;
            if (newValue) {
                // Starting shuffle - reset history to current track
                shuffleHistoryRef.current = [currentTrackIndex];
            }
            else {
                // Ending shuffle - clear history
                shuffleHistoryRef.current = [];
            }
            console.log('[MusicPlayer] Shuffle toggled:', newValue);
            return newValue;
        });
    };
    var toggleRepeat = function () {
        setRepeatMode(function (prev) {
            var modes = ['off', 'all', 'one'];
            var currentIndex = modes.indexOf(prev);
            var newMode = modes[(currentIndex + 1) % modes.length];
            console.log('[MusicPlayer] Repeat mode changed:', newMode);
            return newMode;
        });
    };
    // Get next shuffled track (avoiding recently played)
    var getNextShuffleTrack = function () {
        var history = shuffleHistoryRef.current;
        var availableTracks = [];
        // Build list of tracks not in recent history (keep last ~30% of library in history)
        var historyLimit = Math.max(3, Math.floor(musicMetadata_1.MUSIC_LIBRARY.length * 0.3));
        var recentHistory = history.slice(-historyLimit);
        for (var i = 0; i < musicMetadata_1.MUSIC_LIBRARY.length; i++) {
            if (!recentHistory.includes(i)) {
                availableTracks.push(i);
            }
        }
        // If all tracks exhausted, reset and use any track except current
        if (availableTracks.length === 0) {
            shuffleHistoryRef.current = [currentTrackIndex];
            for (var i = 0; i < musicMetadata_1.MUSIC_LIBRARY.length; i++) {
                if (i !== currentTrackIndex) {
                    availableTracks.push(i);
                }
            }
        }
        // Pick random from available
        var randomIndex = Math.floor(Math.random() * availableTracks.length);
        var nextIndex = availableTracks[randomIndex];
        // Add to history
        shuffleHistoryRef.current.push(nextIndex);
        return nextIndex;
    };
    var nextTrack = function () {
        var nextIndex;
        if (repeatMode === 'one') {
            // Repeat One: just restart current track
            nextIndex = currentTrackIndex;
        }
        else if (isShuffle) {
            // Shuffle mode
            nextIndex = getNextShuffleTrack();
        }
        else {
            // Normal sequential
            nextIndex = (currentTrackIndex + 1) % musicMetadata_1.MUSIC_LIBRARY.length;
        }
        switchTrack(nextIndex);
    };
    var previousTrack = function () {
        var prevIndex;
        if (isShuffle && shuffleHistoryRef.current.length > 1) {
            // In shuffle mode, go back through history
            shuffleHistoryRef.current.pop(); // Remove current
            prevIndex = shuffleHistoryRef.current[shuffleHistoryRef.current.length - 1] || currentTrackIndex;
        }
        else {
            // Normal sequential previous
            prevIndex = (currentTrackIndex - 1 + musicMetadata_1.MUSIC_LIBRARY.length) % musicMetadata_1.MUSIC_LIBRARY.length;
        }
        switchTrack(prevIndex);
    };
    var toggleMinimized = function () {
        setIsMinimized(!isMinimized);
    };
    var contextValue = {
        // State
        isPlaying: isPlaying,
        isLoading: isLoading,
        currentTrack: currentTrack,
        currentTrackIndex: currentTrackIndex,
        volume: volume,
        progress: progress,
        isMinimized: isMinimized,
        isVisualizerFullScreen: isVisualizerFullScreen,
        // Shuffle/Repeat state
        isShuffle: isShuffle,
        repeatMode: repeatMode,
        // Audio Analysis (uses state so context updates when set)
        analyserNode: analyserNode,
        audioContext: audioContextState,
        gainNode: gainNodeState,
        // EQ State (NEW)
        eqSettings: eqSettings,
        // Track info
        totalTracks: musicMetadata_1.MUSIC_LIBRARY.length,
        // Actions
        play: play,
        pause: pause,
        togglePlayPause: togglePlayPause,
        setVolume: setVolume,
        switchTrack: switchTrack,
        nextTrack: nextTrack,
        previousTrack: previousTrack,
        toggleMinimized: toggleMinimized,
        setMinimized: setIsMinimized,
        // Shuffle/Repeat actions
        toggleShuffle: toggleShuffle,
        toggleRepeat: toggleRepeat,
        // EQ Actions (NEW)
        setEQ: setEQ,
        resetEQ: resetEQ,
        seekToPercent: seekToPercent,
        // Full-screen visualizer
        setVisualizerFullScreen: setVisualizerFullScreen,
    };
    return (<MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>);
}
