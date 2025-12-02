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
    var _d = (0, react_1.useState)(8), currentTrackIndex = _d[0], setCurrentTrackIndex = _d[1]; // Default to SPAWN by Blank Banshee
    var _e = (0, react_1.useState)(0.7), volume = _e[0], setVolumeState = _e[1];
    var _f = (0, react_1.useState)(0), progress = _f[0], setProgress = _f[1];
    var _g = (0, react_1.useState)(true), isMinimized = _g[0], setIsMinimized = _g[1];
    var _h = (0, react_1.useState)(DEFAULT_EQ), eqSettings = _h[0], setEqSettings = _h[1];
    // Core audio refs
    var playerRef = (0, react_1.useRef)(null);
    var instrumentsRef = (0, react_1.useRef)(new Map());
    var audioContextRef = (0, react_1.useRef)(null);
    var progressAnimationRef = (0, react_1.useRef)(null);
    // NEW: Audio processing chain refs
    var gainNodeRef = (0, react_1.useRef)(null);
    var analyserNodeRef = (0, react_1.useRef)(null);
    var compressorNodeRef = (0, react_1.useRef)(null);
    // NEW: EQ filter refs
    var eqNodesRef = (0, react_1.useRef)({ bass: null, mid: null, treble: null });
    var currentTrack = musicMetadata_1.MUSIC_LIBRARY[currentTrackIndex] || null;
    // Initialize player on mount
    (0, react_1.useEffect)(function () {
        var initPlayer = function () { return __awaiter(_this, void 0, void 0, function () {
            var audioCtx, gainNode, scaledVolume, bassFilter, midFilter, trebleFilter, compressor, analyser, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        audioContextRef.current = audioCtx;
                        gainNode = audioCtx.createGain();
                        scaledVolume = Math.pow(volume, 2);
                        gainNode.gain.setValueAtTime(scaledVolume, audioCtx.currentTime);
                        gainNodeRef.current = gainNode;
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
                        analyser.fftSize = 64; // 32 frequency bins for 24-bar display
                        analyser.smoothingTimeConstant = 0.8; // Smooth transitions
                        analyserNodeRef.current = analyser;
                        // 5. Connect the audio chain
                        // GainNode → Bass → Mid → Treble → Compressor → Analyser → Destination
                        gainNode.connect(bassFilter);
                        bassFilter.connect(midFilter);
                        midFilter.connect(trebleFilter);
                        trebleFilter.connect(compressor);
                        compressor.connect(analyser);
                        analyser.connect(audioCtx.destination);
                        console.log('[MusicPlayer] Audio chain initialized: Gain → EQ → Compressor → Analyser → Output');
                        // Create MIDI player
                        playerRef.current = new midi_player_js_1.default.Player(function (event) {
                            if (event.name === 'Note on' && event.velocity > 0) {
                                playNote(event.noteNumber, event.velocity, event.track);
                            }
                        });
                        playerRef.current.on('endOfFile', function () {
                            setIsPlaying(false);
                            setProgress(0);
                            // Auto-advance to next track
                            setCurrentTrackIndex(function (prev) { return (prev + 1) % musicMetadata_1.MUSIC_LIBRARY.length; });
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
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (progressAnimationRef.current) {
                cancelAnimationFrame(progressAnimationRef.current);
            }
        };
    }, []);
    var loadTrack = function (trackIndex) { return __awaiter(_this, void 0, void 0, function () {
        var track, response, arrayBuffer, midiData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!playerRef.current || !audioContextRef.current)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    track = musicMetadata_1.MUSIC_LIBRARY[trackIndex];
                    return [4 /*yield*/, fetch(track.file)];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.arrayBuffer()];
                case 3:
                    arrayBuffer = _a.sent();
                    midiData = new Uint8Array(arrayBuffer);
                    playerRef.current.loadArrayBuffer(midiData);
                    setProgress(0);
                    // Preload acoustic piano (most common instrument)
                    return [4 /*yield*/, loadInstrument(0)];
                case 4:
                    // Preload acoustic piano (most common instrument)
                    _a.sent(); // Acoustic grand piano
                    return [4 /*yield*/, loadInstrument(33)];
                case 5:
                    _a.sent(); // Acoustic bass
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error('Failed to load track:', error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
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
                    return [4 /*yield*/, soundfont_player_1.default.instrument(audioContextRef.current, instrumentName, { gain: volume })];
                case 2:
                    instrument = _a.sent();
                    instrumentsRef.current.set(program, instrument);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error("Failed to load instrument ".concat(program, ":"), error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var playNote = function (note, velocity, track) { return __awaiter(_this, void 0, void 0, function () {
        var programMap, program, instrument, noteNames, octave, noteName, fullNoteName, node;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!audioContextRef.current || !gainNodeRef.current)
                        return [2 /*return*/];
                    programMap = {
                        0: 0, // Acoustic piano
                        1: 0, // Acoustic piano
                        2: 33, // Acoustic bass
                        3: 0, // Acoustic piano
                    };
                    program = programMap[track] || 0;
                    if (!!instrumentsRef.current.has(program)) return [3 /*break*/, 2];
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
                            node = instrument.play(fullNoteName, audioContextRef.current.currentTime, {
                                gain: velocity / 127, // Just use velocity, volume handled by GainNode
                                duration: 0.5,
                                destination: gainNodeRef.current, // Route through our audio chain!
                            });
                        }
                        catch (error) {
                            console.error('Error playing note:', error);
                        }
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var play = function () {
        if (!playerRef.current || !audioContextRef.current)
            return;
        // Resume audio context if suspended
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        playerRef.current.play();
        setIsPlaying(true);
        // Update progress
        var updateProgress = function () {
            if (playerRef.current && isPlaying) {
                var remaining = playerRef.current.getSongPercentRemaining() || 0;
                setProgress(100 - remaining);
                if (isPlaying) {
                    progressAnimationRef.current = requestAnimationFrame(updateProgress);
                }
            }
        };
        progressAnimationRef.current = requestAnimationFrame(updateProgress);
    };
    var pause = function () {
        if (!playerRef.current)
            return;
        playerRef.current.pause();
        setIsPlaying(false);
        if (progressAnimationRef.current) {
            cancelAnimationFrame(progressAnimationRef.current);
        }
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
        // Clamp to valid range
        var clamped = Math.max(0, Math.min(1, linearVolume));
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
    var nextTrack = function () {
        switchTrack((currentTrackIndex + 1) % musicMetadata_1.MUSIC_LIBRARY.length);
    };
    var previousTrack = function () {
        switchTrack((currentTrackIndex - 1 + musicMetadata_1.MUSIC_LIBRARY.length) % musicMetadata_1.MUSIC_LIBRARY.length);
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
        // Audio Analysis (NEW)
        analyserNode: analyserNodeRef.current,
        // EQ State (NEW)
        eqSettings: eqSettings,
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
        // EQ Actions (NEW)
        setEQ: setEQ,
        resetEQ: resetEQ,
    };
    return (<MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>);
}
