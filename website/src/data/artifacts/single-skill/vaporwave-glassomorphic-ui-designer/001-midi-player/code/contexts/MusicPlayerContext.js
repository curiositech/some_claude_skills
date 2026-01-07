"use strict";
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
function MusicPlayerProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = (0, react_1.useState)(false), isPlaying = _b[0], setIsPlaying = _b[1];
    var _c = (0, react_1.useState)(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = (0, react_1.useState)(8), currentTrackIndex = _d[0], setCurrentTrackIndex = _d[1]; // Default to SPAWN by Blank Banshee
    var _e = (0, react_1.useState)(0.7), volume = _e[0], setVolumeState = _e[1];
    var _f = (0, react_1.useState)(0), progress = _f[0], setProgress = _f[1];
    var _g = (0, react_1.useState)(true), isMinimized = _g[0], setIsMinimized = _g[1];
    var playerRef = (0, react_1.useRef)(null);
    var instrumentsRef = (0, react_1.useRef)(new Map());
    var audioContextRef = (0, react_1.useRef)(null);
    var progressAnimationRef = (0, react_1.useRef)(null);
    var currentTrack = musicMetadata_1.MUSIC_LIBRARY[currentTrackIndex] || null;
    // Initialize player on mount
    (0, react_1.useEffect)(function () {
        var initPlayer = function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Create audio context
                        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
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
        var programMap, program, instrument, noteNames, octave, noteName, fullNoteName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!audioContextRef.current)
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
                            // Play the note with proper timing
                            instrument.play(fullNoteName, audioContextRef.current.currentTime, {
                                gain: (velocity / 127) * volume,
                                duration: 0.5, // Add note duration
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
    var setVolume = function (newVolume) {
        setVolumeState(newVolume);
        instrumentsRef.current.forEach(function (instrument) {
            var _a, _b;
            if (instrument && instrument.context) {
                (_b = (_a = instrument.context.destination.gain) === null || _a === void 0 ? void 0 : _a.setValueAtTime) === null || _b === void 0 ? void 0 : _b.call(_a, newVolume, 0);
            }
        });
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
        isPlaying: isPlaying,
        isLoading: isLoading,
        currentTrack: currentTrack,
        currentTrackIndex: currentTrackIndex,
        volume: volume,
        progress: progress,
        isMinimized: isMinimized,
        play: play,
        pause: pause,
        togglePlayPause: togglePlayPause,
        setVolume: setVolume,
        switchTrack: switchTrack,
        nextTrack: nextTrack,
        previousTrack: previousTrack,
        toggleMinimized: toggleMinimized,
        setMinimized: setIsMinimized,
    };
    return (<MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>);
}
