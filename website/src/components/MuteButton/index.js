"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MuteButton;
var react_1 = require("react");
var UISoundsContext_1 = require("../../contexts/UISoundsContext");
var styles_module_css_1 = require("./styles.module.css");
function MuteButton() {
    var _a = (0, UISoundsContext_1.useUISounds)(), isMuted = _a.isMuted, toggleMute = _a.toggleMute, playClick = _a.playClick;
    var handleToggle = function () {
        toggleMute();
        // Don't play click sound when unmuting, only when muting
        if (!isMuted) {
            playClick();
        }
    };
    return (<button className={styles_module_css_1.default.muteButton} onClick={handleToggle} aria-label={isMuted ? 'Unmute UI sounds' : 'Mute UI sounds'} title={isMuted ? 'Unmute UI sounds' : 'Mute UI sounds'}>
      {isMuted ? '🔇' : '🔊'}
    </button>);
}
