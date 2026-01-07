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
exports.default = WinampModal;
var react_1 = require("react");
var MusicPlayerContext_1 = require("../../contexts/MusicPlayerContext");
var musicMetadata_1 = require("../../data/musicMetadata");
var useFFTData_1 = require("../../hooks/useFFTData");
var styles_module_css_1 = require("./styles.module.css");
// Butterchurn modules (loaded dynamically for SSR safety)
var butterchurnModule = null;
var butterchurnPresetsModule = null;
function WinampModal() {
    var _this = this;
    var _a = (0, MusicPlayerContext_1.useMusicPlayer)(), isPlaying = _a.isPlaying, isLoading = _a.isLoading, currentTrack = _a.currentTrack, currentTrackIndex = _a.currentTrackIndex, volume = _a.volume, progress = _a.progress, isMinimized = _a.isMinimized, analyserNode = _a.analyserNode, audioContext = _a.audioContext, gainNode = _a.gainNode, eqSettings = _a.eqSettings, togglePlayPause = _a.togglePlayPause, setVolume = _a.setVolume, setEQ = _a.setEQ, resetEQ = _a.resetEQ, switchTrack = _a.switchTrack, nextTrack = _a.nextTrack, previousTrack = _a.previousTrack, setMinimized = _a.setMinimized, seekToPercent = _a.seekToPercent, setVisualizerFullScreen = _a.setVisualizerFullScreen;
    // Real FFT frequency data for visualizer (24 bars)
    var frequencyData = (0, useFFTData_1.useFFTData)({
        analyserNode: analyserNode,
        binCount: 24,
        smoothing: 0.7,
        isPlaying: isPlaying,
    });
    // Mini Milkdrop state
    var _b = (0, react_1.useState)('fft'), visualizerMode = _b[0], setVisualizerMode = _b[1];
    var _c = (0, react_1.useState)(false), milkdropReady = _c[0], setMilkdropReady = _c[1];
    var _d = (0, react_1.useState)(null), milkdropError = _d[0], setMilkdropError = _d[1];
    var _e = (0, react_1.useState)(''), currentPreset = _e[0], setCurrentPreset = _e[1];
    var canvasRef = (0, react_1.useRef)(null);
    var visualizerRef = (0, react_1.useRef)(null);
    var presetsRef = (0, react_1.useRef)({});
    var presetKeysRef = (0, react_1.useRef)([]);
    var animationFrameRef = (0, react_1.useRef)(null);
    // Initialize Butterchurn when switching to milkdrop mode
    (0, react_1.useEffect)(function () {
        if (visualizerMode !== 'milkdrop' || isMinimized || !currentTrack)
            return;
        var init = function () { return __awaiter(_this, void 0, void 0, function () {
            var canvas, container, width, height, dpr, butterchurn, butterchurnPresets, visualizer, getPresets, loadedPresets, keys, startPreset, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        if (!!butterchurnModule) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('butterchurn'); })];
                    case 1:
                        butterchurnModule = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!!butterchurnPresetsModule) return [3 /*break*/, 4];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('butterchurn-presets'); })];
                    case 3:
                        butterchurnPresetsModule = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!canvasRef.current || !audioContext || !gainNode) {
                            throw new Error('Canvas or audio context not available');
                        }
                        if (!(audioContext.state === 'suspended')) return [3 /*break*/, 6];
                        return [4 /*yield*/, audioContext.resume()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        canvas = canvasRef.current;
                        container = canvas.parentElement;
                        width = (container === null || container === void 0 ? void 0 : container.clientWidth) || 400;
                        height = (container === null || container === void 0 ? void 0 : container.clientHeight) || 120;
                        dpr = window.devicePixelRatio || 1;
                        canvas.width = width * dpr;
                        canvas.height = height * dpr;
                        butterchurn = butterchurnModule.default || butterchurnModule;
                        butterchurnPresets = butterchurnPresetsModule.default || butterchurnPresetsModule;
                        if (!butterchurn || typeof butterchurn.createVisualizer !== 'function') {
                            throw new Error('Butterchurn createVisualizer not available');
                        }
                        visualizer = butterchurn.createVisualizer(audioContext, canvas, {
                            width: width * dpr,
                            height: height * dpr,
                            pixelRatio: 1,
                            textureRatio: 1,
                        });
                        visualizer.connectAudio(gainNode);
                        getPresets = butterchurnPresets.getPresets || butterchurnPresets;
                        loadedPresets = typeof getPresets === 'function' ? getPresets() : getPresets;
                        keys = Object.keys(loadedPresets);
                        presetsRef.current = loadedPresets;
                        presetKeysRef.current = keys;
                        startPreset = keys[Math.floor(Math.random() * keys.length)];
                        visualizer.loadPreset(loadedPresets[startPreset], 0);
                        setCurrentPreset(startPreset);
                        visualizerRef.current = visualizer;
                        setMilkdropReady(true);
                        setMilkdropError(null);
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error('[WinampModal] Milkdrop init failed:', error_1);
                        setMilkdropError(error_1 instanceof Error ? error_1.message : 'Failed to load');
                        setMilkdropReady(false);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        init();
        return function () {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [visualizerMode, isMinimized, currentTrack, audioContext, gainNode]);
    // Render loop for milkdrop
    (0, react_1.useEffect)(function () {
        if (visualizerMode !== 'milkdrop' || !milkdropReady || !visualizerRef.current)
            return;
        var render = function () {
            if (visualizerRef.current) {
                visualizerRef.current.render();
            }
            animationFrameRef.current = requestAnimationFrame(render);
        };
        animationFrameRef.current = requestAnimationFrame(render);
        return function () {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [visualizerMode, milkdropReady]);
    // Auto-cycle presets every 15 seconds when milkdrop is active
    (0, react_1.useEffect)(function () {
        if (visualizerMode !== 'milkdrop' || !milkdropReady || !isPlaying)
            return;
        var interval = setInterval(function () {
            loadRandomPreset();
        }, 15000);
        return function () { return clearInterval(interval); };
    }, [visualizerMode, milkdropReady, isPlaying]);
    // Load random preset
    var loadRandomPreset = (0, react_1.useCallback)(function () {
        if (!visualizerRef.current || presetKeysRef.current.length === 0)
            return;
        var keys = presetKeysRef.current;
        var presets = presetsRef.current;
        var randomIndex = Math.floor(Math.random() * keys.length);
        var presetName = keys[randomIndex];
        visualizerRef.current.loadPreset(presets[presetName], 1.5);
        setCurrentPreset(presetName);
    }, []);
    // Toggle visualizer mode
    var toggleVisualizerMode = (0, react_1.useCallback)(function () {
        setVisualizerMode(function (prev) { return prev === 'fft' ? 'milkdrop' : 'fft'; });
    }, []);
    if (isMinimized || !currentTrack) {
        return null;
    }
    return (<div className={styles_module_css_1.default.modalOverlay} onClick={function () { return setMinimized(true); }}>
      <div className={styles_module_css_1.default.winampModal} onClick={function (e) { return e.stopPropagation(); }}>
        {/* Header */}
        <div className={styles_module_css_1.default.header}>
          <div className={styles_module_css_1.default.title}>
            ████ WINAMP 5.X ████
          </div>
          <div className={styles_module_css_1.default.headerButtons}>
            <button className={styles_module_css_1.default.closeButton} onClick={function () { return setMinimized(true); }} aria-label="Minimize">
              _
            </button>
          </div>
        </div>

        <div className={styles_module_css_1.default.content}>
          {/* Left: Album Art & Metadata */}
          <div className={styles_module_css_1.default.leftPanel}>
            <div className={styles_module_css_1.default.albumCover}>
              <img src={currentTrack.coverArt} alt={currentTrack.album}/>
              <div className={styles_module_css_1.default.coverOverlay}></div>
            </div>

            <div className={styles_module_css_1.default.metadata}>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>TITLE:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.title}</span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>ARTIST:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.artist}</span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>ALBUM:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.album}</span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>YEAR:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.year}</span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>GENRE:</span>
                <span className={styles_module_css_1.default.metaValue}>
                  {currentTrack.genre}
                </span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>BPM:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.bpm}</span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>MOOD:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.mood}</span>
              </div>
              <div className={styles_module_css_1.default.description}>
                {currentTrack.description}
              </div>

              {/* AI Generation Credits - shown for AI-generated tracks (index 15+) */}
              {currentTrackIndex >= 15 && (<div className={styles_module_css_1.default.aiCredits}>
                  <span className={styles_module_css_1.default.creditIcon}>[AI]</span>
                  <span className={styles_module_css_1.default.creditText}>
                    MIDI & Album Art: AI-Generated
                  </span>
                </div>)}
            </div>
          </div>

          {/* Right: Player Controls */}
          <div className={styles_module_css_1.default.rightPanel}>
            {/* Visualizer with toggle between FFT and Milkdrop */}
            <div className={styles_module_css_1.default.visualizer}>
              <div className={styles_module_css_1.default.scanlines}></div>

              {/* FFT Bar Graph Mode */}
              {visualizerMode === 'fft' && (<div className={styles_module_css_1.default.waveform}>
                  {frequencyData.map(function (magnitude, i) {
                var heightPx = Math.max(4, (magnitude / 255) * 100);
                return (<div key={i} className={styles_module_css_1.default.bar} style={{
                        height: "".concat(heightPx, "px"),
                        transition: 'height 50ms ease-out',
                    }}/>);
            })}
                </div>)}

              {/* Milkdrop Mode */}
              {visualizerMode === 'milkdrop' && (<>
                  <canvas ref={canvasRef} className={styles_module_css_1.default.milkdropCanvas}/>
                  {!milkdropReady && !milkdropError && (<div className={styles_module_css_1.default.milkdropLoading}>
                      <span className={styles_module_css_1.default.loadingDots}>LOADING</span>
                    </div>)}
                  {milkdropError && (<div className={styles_module_css_1.default.milkdropError}>
                      {milkdropError}
                    </div>)}
                  {milkdropReady && currentPreset && (<div className={styles_module_css_1.default.presetLabel}>
                      {currentPreset.length > 30
                    ? currentPreset.substring(0, 30) + '...'
                    : currentPreset}
                    </div>)}
                </>)}

              {/* Visualizer mode toggle button */}
              <button className={styles_module_css_1.default.modeToggleButton} onClick={toggleVisualizerMode} title={visualizerMode === 'fft' ? 'Switch to Milkdrop' : 'Switch to FFT Bars'} aria-label="Toggle visualizer mode">
                <span className={visualizerMode === 'fft' ? styles_module_css_1.default.milkdropIcon : styles_module_css_1.default.barsIcon}/>
              </button>

              {/* Next preset button (only in milkdrop mode) */}
              {visualizerMode === 'milkdrop' && milkdropReady && (<button className={styles_module_css_1.default.nextPresetButton} onClick={loadRandomPreset} title="Next Preset" aria-label="Next preset">
                  <span className={styles_module_css_1.default.shuffleIcon}/>
                </button>)}

              {/* Full-screen Milkdrop button */}
              <button className={styles_module_css_1.default.fullscreenButton} onClick={function () {
            setMinimized(true);
            setVisualizerFullScreen(true);
        }} title="Launch Milkdrop Visualizer (Full Screen)" aria-label="Fullscreen visualizer">
                <span className={styles_module_css_1.default.expandIcon}/>
              </button>
            </div>

            {/* Progress Bar - Click to seek */}
            <div className={styles_module_css_1.default.progressBar} onClick={function (e) {
            var rect = e.currentTarget.getBoundingClientRect();
            var clickX = e.clientX - rect.left;
            var percent = (clickX / rect.width) * 100;
            seekToPercent(percent);
        }} title="Click to seek">
              <div className={styles_module_css_1.default.progressFill} style={{ width: "".concat(progress, "%") }}/>
            </div>

            {/* Main Controls */}
            <div className={styles_module_css_1.default.controls}>
              <button className={"".concat(styles_module_css_1.default.controlButton, " ").concat(styles_module_css_1.default.prevButton)} onClick={previousTrack} disabled={isLoading} title="Previous"/>
              <button className={"".concat(styles_module_css_1.default.controlButton, " ").concat(isPlaying ? styles_module_css_1.default.pauseButton : styles_module_css_1.default.playButton)} onClick={togglePlayPause} disabled={isLoading} title={isPlaying ? 'Pause' : 'Play'}/>
              <button className={"".concat(styles_module_css_1.default.controlButton, " ").concat(styles_module_css_1.default.nextButton)} onClick={nextTrack} disabled={isLoading} title="Next"/>
            </div>

            {/* Volume Control */}
            <div className={styles_module_css_1.default.volumeSection}>
              <span className={styles_module_css_1.default.volumeLabel}>VOL</span>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={function (e) { return setVolume(parseFloat(e.target.value)); }} className={styles_module_css_1.default.volumeSlider}/>
              <span className={styles_module_css_1.default.volumeValue}>{Math.round(volume * 100)}%</span>
            </div>

            {/* Windows 3.1 Style EQ Panel */}
            <div className={styles_module_css_1.default.eqPanel}>
              <div className={styles_module_css_1.default.eqHeader}>
                <span className={styles_module_css_1.default.eqTitle}>▓ EQUALIZER</span>
                <button className={styles_module_css_1.default.eqResetButton} onClick={resetEQ} title="Reset EQ to flat">
                  RESET
                </button>
              </div>
              <div className={styles_module_css_1.default.eqSliders}>
                {/* Bass */}
                <div className={styles_module_css_1.default.eqSliderGroup}>
                  <div className={styles_module_css_1.default.eqDbLabel}>
                    {eqSettings.bass > 0 ? '+' : ''}{eqSettings.bass}dB
                  </div>
                  <input type="range" min="-12" max="12" step="1" value={eqSettings.bass} onChange={function (e) { return setEQ('bass', parseInt(e.target.value)); }} className={styles_module_css_1.default.eqVerticalSlider} orient="vertical"/>
                  <div className={styles_module_css_1.default.eqBandLabel}>BASS</div>
                  <div className={styles_module_css_1.default.eqFreqLabel}>200Hz</div>
                </div>

                {/* Mid */}
                <div className={styles_module_css_1.default.eqSliderGroup}>
                  <div className={styles_module_css_1.default.eqDbLabel}>
                    {eqSettings.mid > 0 ? '+' : ''}{eqSettings.mid}dB
                  </div>
                  <input type="range" min="-12" max="12" step="1" value={eqSettings.mid} onChange={function (e) { return setEQ('mid', parseInt(e.target.value)); }} className={styles_module_css_1.default.eqVerticalSlider} orient="vertical"/>
                  <div className={styles_module_css_1.default.eqBandLabel}>MID</div>
                  <div className={styles_module_css_1.default.eqFreqLabel}>1kHz</div>
                </div>

                {/* Treble */}
                <div className={styles_module_css_1.default.eqSliderGroup}>
                  <div className={styles_module_css_1.default.eqDbLabel}>
                    {eqSettings.treble > 0 ? '+' : ''}{eqSettings.treble}dB
                  </div>
                  <input type="range" min="-12" max="12" step="1" value={eqSettings.treble} onChange={function (e) { return setEQ('treble', parseInt(e.target.value)); }} className={styles_module_css_1.default.eqVerticalSlider} orient="vertical"/>
                  <div className={styles_module_css_1.default.eqBandLabel}>TREBLE</div>
                  <div className={styles_module_css_1.default.eqFreqLabel}>3kHz</div>
                </div>
              </div>
            </div>

            {/* Track List */}
            <div className={styles_module_css_1.default.playlist}>
              <div className={styles_module_css_1.default.playlistHeader}>PLAYLIST</div>
              <div className={styles_module_css_1.default.trackList}>
                {musicMetadata_1.MUSIC_LIBRARY.map(function (track, idx) { return (<div key={track.id} className={"".concat(styles_module_css_1.default.playlistItem, " ").concat(idx === currentTrackIndex ? styles_module_css_1.default.playlistItemActive : '')} onClick={function () { return switchTrack(idx); }}>
                    <span className={styles_module_css_1.default.trackNumber}>{String(idx + 1).padStart(2, '0')}</span>
                    <span className={styles_module_css_1.default.trackName}>{track.title}</span>
                    <span className={styles_module_css_1.default.trackDuration}>{track.duration}</span>
                  </div>); })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
