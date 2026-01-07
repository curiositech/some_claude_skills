"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MinifiedMusicPlayer;
var react_1 = require("react");
var MusicPlayerContext_1 = require("../../contexts/MusicPlayerContext");
var useWinampSkin_1 = require("../../hooks/useWinampSkin");
var useFFTData_1 = require("../../hooks/useFFTData");
var styles_module_css_1 = require("./styles.module.css");
function MinifiedMusicPlayer() {
    var _a = (0, MusicPlayerContext_1.useMusicPlayer)(), isPlaying = _a.isPlaying, currentTrack = _a.currentTrack, analyserNode = _a.analyserNode, togglePlayPause = _a.togglePlayPause, setMinimized = _a.setMinimized;
    var currentSkin = (0, useWinampSkin_1.useWinampSkin)().currentSkin;
    // Real FFT data for minified visualizer (8 bars)
    var frequencyData = (0, useFFTData_1.useFFTData)({
        analyserNode: analyserNode,
        binCount: 8,
        smoothing: 0.6,
        isPlaying: isPlaying,
    });
    if (!currentTrack) {
        return null;
    }
    return (<div className={styles_module_css_1.default.minifiedPlayer} onClick={function () { return setMinimized(false); }} style={{
            background: "linear-gradient(135deg, ".concat(currentSkin.colors.bg, ", ").concat(currentSkin.colors.bgDark, ")"),
            borderColor: currentSkin.colors.border,
        }}>
      <div className={styles_module_css_1.default.visualizer}>
        {frequencyData.map(function (magnitude, i) {
            // Normalize magnitude (0-255) to percentage height
            var heightPercent = Math.max(10, (magnitude / 255) * 100);
            return (<div key={i} className={styles_module_css_1.default.bar} style={{
                    height: "".concat(heightPercent, "%"),
                    backgroundColor: currentSkin.colors.visualizer,
                    transition: 'height 50ms ease-out',
                }}/>);
        })}
      </div>

      <button className={styles_module_css_1.default.playButton} onClick={function (e) {
            e.stopPropagation();
            togglePlayPause();
        }} aria-label={isPlaying ? 'Pause' : 'Play'} style={{
            backgroundColor: currentSkin.colors.buttonBg,
            borderColor: currentSkin.colors.accent,
            color: currentSkin.colors.accent,
        }}>
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div className={styles_module_css_1.default.trackInfo}>
        <div className={styles_module_css_1.default.trackTitle} style={{ color: currentSkin.colors.text }}>
          {currentTrack.title}
        </div>
        <div className={styles_module_css_1.default.trackArtist} style={{ color: currentSkin.colors.textDim }}>
          {currentTrack.artist}
        </div>
      </div>

      <div className={styles_module_css_1.default.expandIcon} style={{ color: currentSkin.colors.accent }}>
        ⬜
      </div>
    </div>);
}
