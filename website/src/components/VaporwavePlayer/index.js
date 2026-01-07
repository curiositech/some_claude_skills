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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VaporwavePlayer;
var react_1 = require("react");
var midi_player_js_1 = require("midi-player-js");
var soundfont_player_1 = require("soundfont-player");
var styles_module_css_1 = require("./styles.module.css");
var TRACKS = [
    { name: 'Blank Banshee Flow', file: '/audio/blank-banshee-flow.mid' },
    { name: 'Neon Dreams', file: '/audio/neon-dreams.mid' },
    { name: 'Outrun Nights', file: '/audio/outrun-nights.mid' },
    { name: 'Dark Ritual', file: '/audio/dark-ritual.mid' },
    { name: 'Vapor Trap', file: '/audio/vapor-trap.mid' },
    { name: 'Chip Dreams', file: '/audio/chip-dreams.mid' },
    { name: 'Mall Soft', file: '/audio/mall-soft.mid' },
];
function VaporwavePlayer(_a) {
    var _this = this;
    var _b;
    var _c = _a.autoplay, autoplay = _c === void 0 ? false : _c, className = _a.className;
    var _d = (0, react_1.useState)(false), isPlaying = _d[0], setIsPlaying = _d[1];
    var _e = (0, react_1.useState)(true), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(0), currentTrack = _f[0], setCurrentTrack = _f[1];
    var _g = (0, react_1.useState)(0.7), volume = _g[0], setVolume = _g[1];
    var _h = (0, react_1.useState)(0), progress = _h[0], setProgress = _h[1];
    var playerRef = (0, react_1.useRef)(null);
    var instrumentsRef = (0, react_1.useRef)(new Map());
    var audioContextRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        // Initialize audio context and MIDI player
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
                        });
                        // Load first track
                        return [4 /*yield*/, loadTrack(0)];
                    case 2:
                        // Load first track
                        _a.sent();
                        setIsLoading(false);
                        if (autoplay) {
                            play();
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to initialize vaporwave player:', error_1);
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
        };
    }, []);
    var loadTrack = function (trackIndex) { return __awaiter(_this, void 0, void 0, function () {
        var response, arrayBuffer, midiData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!playerRef.current || !audioContextRef.current)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, fetch(TRACKS[trackIndex].file)];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.arrayBuffer()];
                case 3:
                    arrayBuffer = _a.sent();
                    midiData = new Uint8Array(arrayBuffer);
                    playerRef.current.loadArrayBuffer(midiData);
                    setCurrentTrack(trackIndex);
                    setProgress(0);
                    // Preload common instruments
                    return [4 /*yield*/, loadInstrument(81)];
                case 4:
                    // Preload common instruments
                    _a.sent(); // Synth lead
                    return [4 /*yield*/, loadInstrument(89)];
                case 5:
                    _a.sent(); // Pad
                    return [4 /*yield*/, loadInstrument(39)];
                case 6:
                    _a.sent(); // Synth bass
                    return [4 /*yield*/, loadInstrument(5)];
                case 7:
                    _a.sent(); // Electric piano
                    return [4 /*yield*/, loadInstrument(12)];
                case 8:
                    _a.sent(); // Vibraphone
                    return [3 /*break*/, 10];
                case 9:
                    error_2 = _a.sent();
                    console.error('Failed to load track:', error_2);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
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
                    programMap = {
                        0: 89, // Pad
                        1: 5, // Electric piano
                        2: 39, // Bass
                        3: 12, // Vibraphone
                    };
                    program = programMap[track] || 0;
                    return [4 /*yield*/, loadInstrument(program)];
                case 1:
                    _a.sent();
                    instrument = instrumentsRef.current.get(program);
                    if (instrument && audioContextRef.current) {
                        try {
                            noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                            octave = Math.floor(note / 12) - 1;
                            noteName = noteNames[note % 12];
                            fullNoteName = "".concat(noteName).concat(octave);
                            instrument.play(fullNoteName, audioContextRef.current.currentTime, {
                                gain: (velocity / 127) * volume,
                            });
                        }
                        catch (error) {
                            // Silently handle note play errors
                        }
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var play = function () {
        if (!playerRef.current || !audioContextRef.current)
            return;
        // Resume audio context if suspended (browser autoplay policy)
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        playerRef.current.play();
        setIsPlaying(true);
        // Update progress
        var updateProgress = function () {
            if (playerRef.current && isPlaying) {
                var progress_1 = (playerRef.current.getSongPercentRemaining() || 0);
                setProgress(100 - progress_1);
                if (isPlaying) {
                    requestAnimationFrame(updateProgress);
                }
            }
        };
        requestAnimationFrame(updateProgress);
    };
    var pause = function () {
        if (!playerRef.current)
            return;
        playerRef.current.pause();
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
    var handleVolumeChange = function (e) {
        var newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        // Update all loaded instruments
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
    if (isLoading) {
        return (<div className={"".concat(styles_module_css_1.default.player, " ").concat(className || '')}>
        <div className={styles_module_css_1.default.loading}>
          <div className={styles_module_css_1.default.loadingBar}>
            <div className={styles_module_css_1.default.loadingBarFill}></div>
          </div>
          <div className={styles_module_css_1.default.loadingText}>Loading vaporwave vibes...</div>
        </div>
      </div>);
    }
    return (<div className={"".concat(styles_module_css_1.default.player, " ").concat(className || '')}>
      <div className={styles_module_css_1.default.playerHeader}>
        <div className={styles_module_css_1.default.trackInfo}>
          <div className={styles_module_css_1.default.trackTitle}>
            {((_b = TRACKS[currentTrack]) === null || _b === void 0 ? void 0 : _b.name) || 'Vaporwave Track'}
          </div>
          <div className={styles_module_css_1.default.trackSubtitle}>
            {isPlaying ? '▶ NOW PLAYING' : '⏸ PAUSED'}
          </div>
        </div>
      </div>

      <div className={styles_module_css_1.default.progressBar}>
        <div className={styles_module_css_1.default.progressFill} style={{ width: "".concat(progress, "%") }}/>
      </div>

      <div className={styles_module_css_1.default.controls}>
        <button className={styles_module_css_1.default.playButton} onClick={togglePlayPause} disabled={isLoading} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className={styles_module_css_1.default.trackSelector}>
          {TRACKS.map(function (track, idx) { return (<button key={idx} className={"".concat(styles_module_css_1.default.trackButton, " ").concat(idx === currentTrack ? styles_module_css_1.default.trackButtonActive : '')} onClick={function () { return switchTrack(idx); }} disabled={isLoading}>
              {idx + 1}
            </button>); })}
        </div>

        <div className={styles_module_css_1.default.volumeControl}>
          <span className={styles_module_css_1.default.volumeIcon}>🔊</span>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className={styles_module_css_1.default.volumeSlider} aria-label="Volume"/>
        </div>
      </div>

      <div className={styles_module_css_1.default.visualizer}>
        <div className={styles_module_css_1.default.waveform}>
          {__spreadArray([], Array(20), true).map(function (_, i) { return (<div key={i} className={"".concat(styles_module_css_1.default.bar, " ").concat(isPlaying ? styles_module_css_1.default.barAnimated : '')} style={{ animationDelay: "".concat(i * 0.1, "s") }}/>); })}
        </div>
      </div>
    </div>);
}
