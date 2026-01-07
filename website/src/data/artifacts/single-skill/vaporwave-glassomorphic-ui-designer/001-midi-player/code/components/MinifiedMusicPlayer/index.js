"use strict";
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
exports.default = MinifiedMusicPlayer;
var react_1 = require("react");
var MusicPlayerContext_1 = require("../../contexts/MusicPlayerContext");
var useWinampSkin_1 = require("../../hooks/useWinampSkin");
var styles_module_css_1 = require("./styles.module.css");
function MinifiedMusicPlayer() {
    var _a = (0, MusicPlayerContext_1.useMusicPlayer)(), isPlaying = _a.isPlaying, currentTrack = _a.currentTrack, togglePlayPause = _a.togglePlayPause, setMinimized = _a.setMinimized;
    var currentSkin = (0, useWinampSkin_1.useWinampSkin)().currentSkin;
    if (!currentTrack) {
        return null;
    }
    return (<div className={styles_module_css_1.default.minifiedPlayer} onClick={function () { return setMinimized(false); }} style={{
            background: "linear-gradient(135deg, ".concat(currentSkin.colors.bg, ", ").concat(currentSkin.colors.bgDark, ")"),
            borderColor: currentSkin.colors.border,
        }}>
      <div className={styles_module_css_1.default.visualizer}>
        {__spreadArray([], Array(8), true).map(function (_, i) { return (<div key={i} className={"".concat(styles_module_css_1.default.bar, " ").concat(isPlaying ? styles_module_css_1.default.barAnimated : '')} style={{
                animationDelay: "".concat(i * 0.1, "s"),
                backgroundColor: currentSkin.colors.visualizer,
            }}/>); })}
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
