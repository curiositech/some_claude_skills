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
exports.default = FullScreenVisualizer;
var react_1 = require("react");
var MusicPlayerContext_1 = require("../../contexts/MusicPlayerContext");
var styles_module_css_1 = require("./styles.module.css");
// Import Butterchurn from npm (it's a UMD module so we need dynamic import for SSR safety)
var butterchurnModule = null;
var butterchurnPresetsModule = null;
// Curated preset categories
var PRESET_CATEGORIES = {
    psychedelic: [
        'Flexi, martin + geiss - dedicated to the sherwin maxawow',
        'Rovastar - Fractopia',
        'Unchained - Unified Drag',
        'martin - castle in the air',
        'Geiss - Spiral Artifact',
    ],
    smooth: [
        'Flexi - predator-prey-spirals',
        'Geiss - Cosmic Strings 2',
        'Martin - liquid science',
        'Rovastar - Inner Thoughts (Frantic Dream Mix)',
        'Flexi - infused with the spiral',
    ],
    energetic: [
        'Flexi + Martin - disconnected',
        'shifter - tumbling cubes',
        'Zylot - Clouds (Tunnel Mix)',
        'Rovastar - Explosive Stained Glass',
        'Geiss - Reaction Diffusion',
    ],
    abstract: [
        'yin - 257 - Smoke on the Water Fisheye Kaleidoscope',
        'Rovastar & Idiot24-7 - Balk Acid',
        'Flexi - smouldering',
        'martin - ripples in a new dimension',
        'Geiss - Swirlie 3',
    ],
};
function FullScreenVisualizer() {
    var _this = this;
    var _a = (0, MusicPlayerContext_1.useMusicPlayer)(), isPlaying = _a.isPlaying, currentTrack = _a.currentTrack, audioContext = _a.audioContext, gainNode = _a.gainNode, isVisualizerFullScreen = _a.isVisualizerFullScreen, setVisualizerFullScreen = _a.setVisualizerFullScreen, togglePlayPause = _a.togglePlayPause, nextTrack = _a.nextTrack, previousTrack = _a.previousTrack;
    var canvasRef = (0, react_1.useRef)(null);
    var containerRef = (0, react_1.useRef)(null);
    var visualizerRef = (0, react_1.useRef)(null);
    var animationFrameRef = (0, react_1.useRef)(null);
    var _b = (0, react_1.useState)(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, react_1.useState)(null), loadError = _c[0], setLoadError = _c[1];
    var _d = (0, react_1.useState)(''), currentPresetName = _d[0], setCurrentPresetName = _d[1];
    var _e = (0, react_1.useState)({}), presets = _e[0], setPresets = _e[1];
    var _f = (0, react_1.useState)([]), presetKeys = _f[0], setPresetKeys = _f[1];
    var _g = (0, react_1.useState)(true), showControls = _g[0], setShowControls = _g[1];
    var _h = (0, react_1.useState)(true), showTrackInfo = _h[0], setShowTrackInfo = _h[1];
    var cursorTimeoutRef = (0, react_1.useRef)(null);
    // Initialize Butterchurn
    (0, react_1.useEffect)(function () {
        if (!isVisualizerFullScreen)
            return;
        var init = function () { return __awaiter(_this, void 0, void 0, function () {
            var canvas, width, height, dpr, butterchurn, butterchurnPresets, visualizer, getPresets, loadedPresets, keys_1, psychedelicPresets, startPreset, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        setLoadError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        if (!!butterchurnModule) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('butterchurn'); })];
                    case 2:
                        butterchurnModule = _a.sent();
                        console.log('[FullScreenVisualizer] Butterchurn module:', butterchurnModule);
                        _a.label = 3;
                    case 3:
                        if (!!butterchurnPresetsModule) return [3 /*break*/, 5];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('butterchurn-presets'); })];
                    case 4:
                        butterchurnPresetsModule = _a.sent();
                        console.log('[FullScreenVisualizer] Presets module:', butterchurnPresetsModule);
                        _a.label = 5;
                    case 5:
                        if (!canvasRef.current || !audioContext || !gainNode) {
                            throw new Error('Canvas or audio context not available');
                        }
                        if (!(audioContext.state === 'suspended')) return [3 /*break*/, 7];
                        return [4 /*yield*/, audioContext.resume()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        canvas = canvasRef.current;
                        width = window.screen.width;
                        height = window.screen.height;
                        dpr = window.devicePixelRatio || 1;
                        // Set canvas internal resolution
                        canvas.width = width * dpr;
                        canvas.height = height * dpr;
                        // CSS will handle the display size via 100vw/100vh
                        console.log('[FullScreenVisualizer] Canvas setup:', { width: width, height: height, dpr: dpr, canvasWidth: canvas.width, canvasHeight: canvas.height });
                        butterchurn = butterchurnModule.default || butterchurnModule;
                        butterchurnPresets = butterchurnPresetsModule.default || butterchurnPresetsModule;
                        console.log('[FullScreenVisualizer] butterchurn:', butterchurn);
                        console.log('[FullScreenVisualizer] butterchurnPresets:', butterchurnPresets);
                        if (!butterchurn || typeof butterchurn.createVisualizer !== 'function') {
                            throw new Error("Butterchurn createVisualizer not available. Got: ".concat(typeof butterchurn));
                        }
                        visualizer = butterchurn.createVisualizer(audioContext, canvas, {
                            width: width * dpr,
                            height: height * dpr,
                            pixelRatio: 1, // We've already accounted for DPR in canvas size
                            textureRatio: 1,
                        });
                        // Connect to our gain node (audio chain)
                        visualizer.connectAudio(gainNode);
                        getPresets = butterchurnPresets.getPresets || butterchurnPresets;
                        loadedPresets = typeof getPresets === 'function' ? getPresets() : getPresets;
                        console.log('[FullScreenVisualizer] Loaded presets count:', Object.keys(loadedPresets).length);
                        keys_1 = Object.keys(loadedPresets);
                        setPresets(loadedPresets);
                        setPresetKeys(keys_1);
                        psychedelicPresets = PRESET_CATEGORIES.psychedelic.filter(function (p) { return keys_1.includes(p); });
                        startPreset = psychedelicPresets.length > 0
                            ? psychedelicPresets[Math.floor(Math.random() * psychedelicPresets.length)]
                            : keys_1[Math.floor(Math.random() * keys_1.length)];
                        visualizer.loadPreset(loadedPresets[startPreset], 0);
                        setCurrentPresetName(startPreset);
                        visualizerRef.current = visualizer;
                        setIsLoading(false);
                        console.log('[FullScreenVisualizer] Butterchurn initialized with preset:', startPreset);
                        return [3 /*break*/, 9];
                    case 8:
                        error_1 = _a.sent();
                        console.error('[FullScreenVisualizer] Failed to initialize:', error_1);
                        setLoadError(error_1 instanceof Error ? error_1.message : 'Failed to load visualizer');
                        setIsLoading(false);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        init();
        return function () {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isVisualizerFullScreen, audioContext, gainNode]);
    // Render loop
    (0, react_1.useEffect)(function () {
        if (!isVisualizerFullScreen || !visualizerRef.current || isLoading)
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
            }
        };
    }, [isVisualizerFullScreen, isLoading]);
    // Handle resize
    (0, react_1.useEffect)(function () {
        if (!isVisualizerFullScreen)
            return;
        var handleResize = function () {
            if (!canvasRef.current || !visualizerRef.current)
                return;
            var width = window.screen.width;
            var height = window.screen.height;
            var dpr = window.devicePixelRatio || 1;
            var canvas = canvasRef.current;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            // CSS handles display size
            visualizerRef.current.setRendererSize(width * dpr, height * dpr);
        };
        window.addEventListener('resize', handleResize);
        return function () { return window.removeEventListener('resize', handleResize); };
    }, [isVisualizerFullScreen]);
    // Load random preset
    var loadRandomPreset = (0, react_1.useCallback)(function () {
        if (!visualizerRef.current || presetKeys.length === 0)
            return;
        var randomIndex = Math.floor(Math.random() * presetKeys.length);
        var presetName = presetKeys[randomIndex];
        visualizerRef.current.loadPreset(presets[presetName], 2.0); // 2 second blend
        setCurrentPresetName(presetName);
    }, [presets, presetKeys]);
    // Handle keyboard shortcuts
    (0, react_1.useEffect)(function () {
        if (!isVisualizerFullScreen)
            return;
        var handleKeyDown = function (e) {
            switch (e.key) {
                case 'Escape':
                    setVisualizerFullScreen(false);
                    break;
                case ' ':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowRight':
                    nextTrack();
                    break;
                case 'ArrowLeft':
                    previousTrack();
                    break;
                case 'n':
                case 'N':
                    loadRandomPreset();
                    break;
                case 'h':
                case 'H':
                    setShowControls(function (prev) { return !prev; });
                    break;
                case 't':
                case 'T':
                    setShowTrackInfo(function (prev) { return !prev; });
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return function () { return window.removeEventListener('keydown', handleKeyDown); };
    }, [isVisualizerFullScreen, togglePlayPause, nextTrack, previousTrack, setVisualizerFullScreen, loadRandomPreset]);
    // Cursor hiding
    (0, react_1.useEffect)(function () {
        if (!isVisualizerFullScreen)
            return;
        var handleMouseMove = function () {
            setShowControls(true);
            document.body.style.cursor = 'default';
            if (cursorTimeoutRef.current) {
                clearTimeout(cursorTimeoutRef.current);
            }
            cursorTimeoutRef.current = window.setTimeout(function () {
                document.body.style.cursor = 'none';
                setShowControls(false);
            }, 3000);
        };
        window.addEventListener('mousemove', handleMouseMove);
        handleMouseMove(); // Start the timer
        return function () {
            window.removeEventListener('mousemove', handleMouseMove);
            if (cursorTimeoutRef.current) {
                clearTimeout(cursorTimeoutRef.current);
            }
            document.body.style.cursor = 'default';
        };
    }, [isVisualizerFullScreen]);
    // Auto-cycle presets every 30 seconds when playing
    (0, react_1.useEffect)(function () {
        if (!isVisualizerFullScreen || !isPlaying)
            return;
        var interval = setInterval(function () {
            loadRandomPreset();
        }, 30000);
        return function () { return clearInterval(interval); };
    }, [isVisualizerFullScreen, isPlaying, loadRandomPreset]);
    // Request fullscreen when opening
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (isVisualizerFullScreen && containerRef.current) {
            (_b = (_a = containerRef.current).requestFullscreen) === null || _b === void 0 ? void 0 : _b.call(_a).catch(console.warn);
        }
    }, [isVisualizerFullScreen]);
    // Handle fullscreen exit
    (0, react_1.useEffect)(function () {
        var handleFullscreenChange = function () {
            if (!document.fullscreenElement && isVisualizerFullScreen) {
                setVisualizerFullScreen(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return function () { return document.removeEventListener('fullscreenchange', handleFullscreenChange); };
    }, [isVisualizerFullScreen, setVisualizerFullScreen]);
    if (!isVisualizerFullScreen) {
        return null;
    }
    return (<div ref={containerRef} className={styles_module_css_1.default.container}>
      <canvas ref={canvasRef} className={styles_module_css_1.default.canvas}/>

      {/* Loading state */}
      {isLoading && (<div className={styles_module_css_1.default.loading}>
          <div className={styles_module_css_1.default.loadingSpinner}/>
          <div className={styles_module_css_1.default.loadingText}>Loading Milkdrop Visualizer...</div>
        </div>)}

      {/* Error state */}
      {loadError && (<div className={styles_module_css_1.default.error}>
          <div className={styles_module_css_1.default.errorIcon}>[!]</div>
          <div className={styles_module_css_1.default.errorText}>{loadError}</div>
          <button className={styles_module_css_1.default.errorButton} onClick={function () { return setVisualizerFullScreen(false); }}>
            CLOSE
          </button>
        </div>)}

      {/* Track info overlay */}
      {showTrackInfo && currentTrack && !isLoading && !loadError && (<div className={styles_module_css_1.default.trackInfo}>
          <div className={styles_module_css_1.default.trackAlbumArt}>
            <img src={currentTrack.coverArt} alt={currentTrack.album}/>
          </div>
          <div className={styles_module_css_1.default.trackDetails}>
            <div className={styles_module_css_1.default.trackTitle}>{currentTrack.title}</div>
            <div className={styles_module_css_1.default.trackArtist}>{currentTrack.artist}</div>
            <div className={styles_module_css_1.default.trackAlbum}>{currentTrack.album}</div>
          </div>
          <div className={styles_module_css_1.default.playState}>
            {isPlaying ? '► NOW PLAYING' : '|| PAUSED'}
          </div>
        </div>)}

      {/* Current preset name */}
      {showControls && !isLoading && !loadError && (<div className={styles_module_css_1.default.presetInfo}>
          <div className={styles_module_css_1.default.presetLabel}>PRESET:</div>
          <div className={styles_module_css_1.default.presetName}>{currentPresetName}</div>
        </div>)}

      {/* Controls overlay */}
      {showControls && !isLoading && !loadError && (<div className={styles_module_css_1.default.controls}>
          <div className={styles_module_css_1.default.controlsGroup}>
            <button className={"".concat(styles_module_css_1.default.controlButton, " ").concat(styles_module_css_1.default.prevButton)} onClick={previousTrack} title="Previous track"/>
            <button className={"".concat(styles_module_css_1.default.controlButton, " ").concat(isPlaying ? styles_module_css_1.default.pauseButton : styles_module_css_1.default.playButton)} onClick={togglePlayPause} title={isPlaying ? 'Pause' : 'Play'}/>
            <button className={"".concat(styles_module_css_1.default.controlButton, " ").concat(styles_module_css_1.default.nextButton)} onClick={nextTrack} title="Next track"/>
          </div>

          <div className={styles_module_css_1.default.controlsGroup}>
            <button className={"".concat(styles_module_css_1.default.controlButton, " ").concat(styles_module_css_1.default.presetButton)} onClick={loadRandomPreset} title="Next preset (N)"/>
            <button className={"".concat(styles_module_css_1.default.controlButton, " ").concat(styles_module_css_1.default.infoButton)} onClick={function () { return setShowTrackInfo(function (prev) { return !prev; }); }} title="Toggle track info (T)"/>
            <button className={"".concat(styles_module_css_1.default.controlButton, " ").concat(styles_module_css_1.default.closeButton)} onClick={function () { return setVisualizerFullScreen(false); }} title="Exit fullscreen (ESC)"/>
          </div>
        </div>)}

      {/* Keyboard hints */}
      {showControls && !isLoading && !loadError && (<div className={styles_module_css_1.default.hints}>
          <span>ESC: Exit</span>
          <span>SPACE: Play/Pause</span>
          <span>←/→: Tracks</span>
          <span>N: Next Preset</span>
          <span>T: Toggle Info</span>
          <span>H: Hide Controls</span>
        </div>)}
    </div>);
}
