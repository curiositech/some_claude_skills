"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MinifiedMusicPlayer;
var react_1 = require("react");
var MusicPlayerContext_1 = require("../../contexts/MusicPlayerContext");
var useFFTData_1 = require("../../hooks/useFFTData");
var styles_module_css_1 = require("./styles.module.css");
// Parse duration string (e.g., "03:45") to seconds
var parseDuration = function (duration) {
    var parts = duration.split(':');
    if (parts.length === 2) {
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 180; // Default 3 min if parsing fails
};
function MinifiedMusicPlayer() {
    var _a = (0, MusicPlayerContext_1.useMusicPlayer)(), isPlaying = _a.isPlaying, currentTrack = _a.currentTrack, currentTrackIndex = _a.currentTrackIndex, progress = _a.progress, volume = _a.volume, analyserNode = _a.analyserNode, isShuffle = _a.isShuffle, repeatMode = _a.repeatMode, totalTracks = _a.totalTracks, togglePlayPause = _a.togglePlayPause, nextTrack = _a.nextTrack, previousTrack = _a.previousTrack, seekToPercent = _a.seekToPercent, setVolume = _a.setVolume, toggleShuffle = _a.toggleShuffle, toggleRepeat = _a.toggleRepeat, setMinimized = _a.setMinimized;
    var seekBarRef = (0, react_1.useRef)(null);
    var volumeBarRef = (0, react_1.useRef)(null);
    var playerRef = (0, react_1.useRef)(null);
    var _b = (0, react_1.useState)(false), isDraggingSeek = _b[0], setIsDraggingSeek = _b[1];
    var _c = (0, react_1.useState)(false), isDraggingVolume = _c[0], setIsDraggingVolume = _c[1];
    var _d = (0, react_1.useState)(false), showNullsoft = _d[0], setShowNullsoft = _d[1];
    var _e = (0, react_1.useState)(false), hasInteracted = _e[0], setHasInteracted = _e[1];
    // Draggable positioning state
    var _f = (0, react_1.useState)(false), isDragging = _f[0], setIsDragging = _f[1];
    var _g = (0, react_1.useState)({ x: 0, y: 0 }), position = _g[0], setPosition = _g[1];
    var _h = (0, react_1.useState)({ x: 0, y: 0 }), dragOffset = _h[0], setDragOffset = _h[1];
    var _j = (0, react_1.useState)('classic'), currentSkin = _j[0], setCurrentSkin = _j[1];
    var _k = (0, react_1.useState)(false), showSkinMenu = _k[0], setShowSkinMenu = _k[1];
    var skins = [
        { id: 'classic', name: 'Classic', colors: { bg: '#c0c0c0', accent: '#00ff00' } },
        { id: 'matrix', name: 'Matrix', colors: { bg: '#0d1117', accent: '#00ff41' } },
        { id: 'synthwave', name: 'Synthwave', colors: { bg: '#1a1a2e', accent: '#ff00ff' } },
        { id: 'ice', name: 'Ice', colors: { bg: '#e0f7fa', accent: '#00bcd4' } },
        { id: 'amber', name: 'Amber', colors: { bg: '#2d2d2d', accent: '#ff9800' } },
    ];
    // Mark as interacted after any user action
    var markInteracted = function () {
        if (!hasInteracted)
            setHasInteracted(true);
    };
    // Smooth progress interpolation
    var _l = (0, react_1.useState)(progress), displayProgress = _l[0], setDisplayProgress = _l[1];
    var lastProgressRef = (0, react_1.useRef)(progress);
    var lastUpdateTimeRef = (0, react_1.useRef)(Date.now());
    var interpolationFrameRef = (0, react_1.useRef)(null);
    // Interpolate progress smoothly between updates
    (0, react_1.useEffect)(function () {
        if (isDraggingSeek) {
            // User is dragging - snap to actual progress
            setDisplayProgress(progress);
            return;
        }
        if (!isPlaying) {
            // Not playing - snap to actual progress
            setDisplayProgress(progress);
            lastProgressRef.current = progress;
            return;
        }
        // Calculate expected progress rate based on track duration
        var trackDurationSec = (currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.duration)
            ? parseDuration(currentTrack.duration)
            : 180;
        var progressPerSecond = 100 / trackDurationSec;
        // Animate between updates
        var animate = function () {
            var now = Date.now();
            var elapsed = (now - lastUpdateTimeRef.current) / 1000;
            var interpolated = Math.min(100, lastProgressRef.current + (elapsed * progressPerSecond));
            setDisplayProgress(interpolated);
            if (isPlaying && !isDraggingSeek) {
                interpolationFrameRef.current = requestAnimationFrame(animate);
            }
        };
        // Reset when progress jumps significantly (track change or seek)
        var progressDiff = Math.abs(progress - lastProgressRef.current);
        if (progressDiff > 2) {
            // Big jump - snap
            setDisplayProgress(progress);
            lastProgressRef.current = progress;
            lastUpdateTimeRef.current = Date.now();
        }
        else {
            // Small update - blend
            lastProgressRef.current = progress;
            lastUpdateTimeRef.current = Date.now();
        }
        interpolationFrameRef.current = requestAnimationFrame(animate);
        return function () {
            if (interpolationFrameRef.current) {
                cancelAnimationFrame(interpolationFrameRef.current);
            }
        };
    }, [progress, isPlaying, isDraggingSeek, currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.duration]);
    // NULLSOFT easter egg - double-click title grip
    var handleGripDoubleClick = function () {
        setShowNullsoft(true);
        setTimeout(function () { return setShowNullsoft(false); }, 3000);
    };
    // Drag handlers for repositioning
    var handleDragStart = function (e) {
        if (playerRef.current) {
            var rect = playerRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left - position.x,
                y: e.clientY - rect.top - position.y
            });
            setIsDragging(true);
            markInteracted();
        }
    };
    // Close skin menu when clicking outside
    (0, react_1.useEffect)(function () {
        if (!showSkinMenu)
            return;
        var handleClickOutside = function (e) {
            setShowSkinMenu(false);
        };
        // Delay to prevent immediate close
        var timer = setTimeout(function () {
            document.addEventListener('click', handleClickOutside);
        }, 100);
        return function () {
            clearTimeout(timer);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showSkinMenu]);
    // Handle drag move and release
    (0, react_1.useEffect)(function () {
        if (!isDragging)
            return;
        var handleMouseMove = function (e) {
            var _a;
            if (playerRef.current) {
                var parentRect = (_a = playerRef.current.parentElement) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
                if (parentRect) {
                    // Calculate new position relative to parent
                    var newX = e.clientX - parentRect.left - dragOffset.x;
                    var newY = e.clientY - parentRect.top - dragOffset.y;
                    // Constrain to viewport bounds
                    var maxX = window.innerWidth - playerRef.current.offsetWidth - parentRect.left;
                    var maxY = window.innerHeight - playerRef.current.offsetHeight - parentRect.top;
                    setPosition({
                        x: Math.max(-parentRect.left, Math.min(maxX, newX)),
                        y: Math.max(-parentRect.top + 60, Math.min(maxY, newY)) // Keep below navbar
                    });
                }
            }
        };
        var handleMouseUp = function () {
            setIsDragging(false);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return function () {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);
    // Real FFT data for mini visualizer (5 bars for compact display)
    var frequencyData = (0, useFFTData_1.useFFTData)({
        analyserNode: analyserNode,
        binCount: 5,
        smoothing: 0.7,
        isPlaying: isPlaying,
    });
    // Handle seek bar click/drag
    var handleSeek = function (e) {
        if (!seekBarRef.current)
            return;
        var rect = seekBarRef.current.getBoundingClientRect();
        var percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        seekToPercent(percent);
    };
    // Handle volume bar click/drag
    var handleVolumeChange = function (e) {
        if (!volumeBarRef.current)
            return;
        var rect = volumeBarRef.current.getBoundingClientRect();
        var percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        setVolume(percent / 100);
    };
    var handleSeekMouseDown = function (e) {
        setIsDraggingSeek(true);
        handleSeek(e);
    };
    var handleVolumeMouseDown = function (e) {
        setIsDraggingVolume(true);
        handleVolumeChange(e);
    };
    (0, react_1.useEffect)(function () {
        if (!isDraggingSeek && !isDraggingVolume)
            return;
        var handleMouseMove = function (e) {
            if (isDraggingSeek)
                handleSeek(e);
            if (isDraggingVolume)
                handleVolumeChange(e);
        };
        var handleMouseUp = function () {
            setIsDraggingSeek(false);
            setIsDraggingVolume(false);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return function () {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingSeek, isDraggingVolume]);
    if (!currentTrack) {
        return null;
    }
    // Format time from progress percentage using actual track duration
    var formatTime = function (percent) {
        var totalSeconds = (currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.duration)
            ? parseDuration(currentTrack.duration)
            : 180;
        var currentSeconds = Math.floor((percent / 100) * totalSeconds);
        var mins = Math.floor(currentSeconds / 60);
        var secs = currentSeconds % 60;
        return "".concat(mins, ":").concat(secs.toString().padStart(2, '0'));
    };
    // Format track counter (01/29 style)
    var trackCounter = "".concat((currentTrackIndex + 1).toString().padStart(2, '0'), "/").concat(totalTracks.toString().padStart(2, '0'));
    // Get repeat mode icon
    var getRepeatIcon = function () {
        switch (repeatMode) {
            case 'one': return '🔂';
            case 'all': return '🔁';
            default: return '↻';
        }
    };
    // Show CTA glow on play button when not playing and user hasn't interacted
    var showPlayCta = !isPlaying && !hasInteracted;
    // Calculate transform style for dragged position
    var positionStyle = position.x !== 0 || position.y !== 0
        ? { transform: "translate(".concat(position.x, "px, ").concat(position.y, "px)") }
        : {};
    return (<div ref={playerRef} className={"".concat(styles_module_css_1.default.winampShade, " ").concat(hasInteracted ? styles_module_css_1.default.interacted : '', " ").concat(isDragging ? styles_module_css_1.default.dragging : '', " ").concat(styles_module_css_1.default["skin_".concat(currentSkin)] || '')} style={positionStyle}>
      {/* NULLSOFT Easter Egg Overlay */}
      {showNullsoft && (<div className={styles_module_css_1.default.nullsoftOverlay}>
          <span className={styles_module_css_1.default.nullsoftText}>NULLSOFT</span>
          <span className={styles_module_css_1.default.nullsoftSubtext}>Winamp Classic</span>
        </div>)}

      {/* Title bar grip (left) - Drag handle + Double-click for easter egg */}
      <div className={styles_module_css_1.default.titleGrip} onMouseDown={handleDragStart} onDoubleClick={handleGripDoubleClick} title="Drag to move • Double-click for surprise">
        <div className={styles_module_css_1.default.gripLines}>
          <span></span><span></span><span></span>
        </div>
      </div>

      {/* Mini Album Art */}
      {currentTrack.coverArt && (<div className={styles_module_css_1.default.miniArt}>
          <img src={currentTrack.coverArt} alt=""/>
        </div>)}

      {/* Mini Visualizer */}
      <div className={styles_module_css_1.default.miniVis}>
        {frequencyData.map(function (magnitude, i) {
            var heightPx = Math.max(2, (magnitude / 255) * 14);
            return (<div key={i} className={styles_module_css_1.default.visBar} style={{ height: "".concat(heightPx, "px") }}/>);
        })}
      </div>

      {/* Track Counter */}
      <div className={styles_module_css_1.default.trackCounter}>
        {trackCounter}
      </div>

      {/* Track Info - Scrolling Marquee */}
      <div className={"".concat(styles_module_css_1.default.trackDisplay, " ").concat(!hasInteracted ? styles_module_css_1.default.clickable : '')} onClick={function () { markInteracted(); setMinimized(false); }} title="Click to open full player">
        <div className={styles_module_css_1.default.marqueeContainer}>
          <span className={"".concat(styles_module_css_1.default.marqueeText, " ").concat(isPlaying ? styles_module_css_1.default.scrolling : '')}>
            {currentTrack.artist} - {currentTrack.title} ***
          </span>
        </div>
      </div>

      {/* Time Display */}
      <div className={styles_module_css_1.default.timeDisplay}>
        {formatTime(displayProgress)}
      </div>

      {/* Shuffle/Repeat Buttons */}
      <div className={styles_module_css_1.default.modeButtons}>
        <button className={"".concat(styles_module_css_1.default.modeBtn, " ").concat(isShuffle ? styles_module_css_1.default.active : '')} onClick={function (e) { e.stopPropagation(); toggleShuffle(); }} title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}>
          <span className={styles_module_css_1.default.btnIcon}>🔀</span>
        </button>
        <button className={"".concat(styles_module_css_1.default.modeBtn, " ").concat(repeatMode !== 'off' ? styles_module_css_1.default.active : '')} onClick={function (e) { e.stopPropagation(); toggleRepeat(); }} title={"Repeat: ".concat(repeatMode)}>
          <span className={styles_module_css_1.default.btnIcon}>{getRepeatIcon()}</span>
        </button>
      </div>

      {/* Skin Switcher */}
      <div className={styles_module_css_1.default.skinSwitcher}>
        <button className={styles_module_css_1.default.skinBtn} onClick={function (e) { e.stopPropagation(); setShowSkinMenu(!showSkinMenu); }} title="Change skin">
          <span className={styles_module_css_1.default.btnIcon}>🎨</span>
        </button>
        {showSkinMenu && (<div className={styles_module_css_1.default.skinMenu}>
            {skins.map(function (skin) { return (<button key={skin.id} className={"".concat(styles_module_css_1.default.skinOption, " ").concat(currentSkin === skin.id ? styles_module_css_1.default.activeSkin : '')} onClick={function (e) {
                    e.stopPropagation();
                    setCurrentSkin(skin.id);
                    setShowSkinMenu(false);
                    markInteracted();
                }}>
                <span className={styles_module_css_1.default.skinSwatch} style={{ background: skin.colors.bg, borderColor: skin.colors.accent }}/>
                <span className={styles_module_css_1.default.skinName}>{skin.name}</span>
              </button>); })}
          </div>)}
      </div>

      {/* Transport Controls */}
      <div className={styles_module_css_1.default.transportButtons}>
        <button className={styles_module_css_1.default.transportBtn} onClick={function (e) { e.stopPropagation(); previousTrack(); }} title="Previous">
          <span className={styles_module_css_1.default.btnIcon}>⏮</span>
        </button>
        <button className={"".concat(styles_module_css_1.default.transportBtn, " ").concat(showPlayCta ? styles_module_css_1.default.ctaGlow : '')} onClick={function (e) { e.stopPropagation(); markInteracted(); togglePlayPause(); }} title={isPlaying ? 'Pause' : 'Play'}>
          <span className={styles_module_css_1.default.btnIcon}>{isPlaying ? '⏸' : '▶'}</span>
          {showPlayCta && <span className={styles_module_css_1.default.ctaHint}>Hit Play!</span>}
        </button>
        <button className={styles_module_css_1.default.transportBtn} onClick={function (e) { e.stopPropagation(); /* stop would go here */ }} title="Stop">
          <span className={styles_module_css_1.default.btnIcon}>⏹</span>
        </button>
        <button className={styles_module_css_1.default.transportBtn} onClick={function (e) { e.stopPropagation(); nextTrack(); }} title="Next">
          <span className={styles_module_css_1.default.btnIcon}>⏭</span>
        </button>
      </div>

      {/* Mini Seek Bar */}
      <div className={styles_module_css_1.default.seekBar} ref={seekBarRef} onMouseDown={handleSeekMouseDown}>
        <div className={styles_module_css_1.default.seekFill} style={{ width: "".concat(displayProgress, "%") }}/>
        <div className={styles_module_css_1.default.seekThumb} style={{ left: "".concat(displayProgress, "%") }}/>
      </div>

      {/* Volume Bar */}
      <div className={styles_module_css_1.default.volumeBar} ref={volumeBarRef} onMouseDown={handleVolumeMouseDown} title={"Volume: ".concat(Math.round(volume * 100), "%")}>
        <div className={styles_module_css_1.default.volumeFill} style={{ width: "".concat(volume * 100, "%") }}/>
        <div className={styles_module_css_1.default.volumeThumb} style={{ left: "".concat(volume * 100, "%") }}/>
      </div>

      {/* Expand Button */}
      <button className={"".concat(styles_module_css_1.default.expandBtn, " ").concat(!hasInteracted ? styles_module_css_1.default.expandCta : '')} onClick={function () { markInteracted(); setMinimized(false); }} title="Expand Player">
        <span>▼</span>
      </button>
    </div>);
}
