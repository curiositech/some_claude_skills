"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ThemePicker;
var react_1 = require("react");
var useWin31Theme_1 = require("../../hooks/useWin31Theme");
var usePlausibleTracking_1 = require("../../hooks/usePlausibleTracking");
require("./styles.css");
function ThemePicker(_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = (0, useWin31Theme_1.useWin31Theme)(), colorScheme = _c.colorScheme, setTheme = _c.setTheme, themes = _c.themes;
    var track = (0, usePlausibleTracking_1.usePlausibleTracking)().track;
    var _d = (0, react_1.useState)(false), showDropdown = _d[0], setShowDropdown = _d[1];
    var _e = (0, react_1.useState)(true), showHotDog = _e[0], setShowHotDog = _e[1];
    var handleToggleDropdown = function () {
        setShowDropdown(!showDropdown);
    };
    var handleThemeSelect = function (name) {
        setTheme(name);
        setShowDropdown(false);
        setShowHotDog(false); // Hide hot dog after theme selection
        track('Theme Changed', { theme: name });
    };
    return (<div className={"theme-picker ".concat(className)}>
      {/* 16-bit hot dog floating below theme picker */}
      {showHotDog && (<div className="theme-picker__hotdog">
          🌭
        </div>)}
      <button className="theme-picker__btn" onClick={handleToggleDropdown}>
        <span className="theme-picker__icon">🎨</span>
        <span className="theme-picker__label">Theme</span>
        <span className="theme-picker__arrow">▼</span>
      </button>
      {showDropdown && (<>
          <div className="theme-picker__backdrop" onClick={function () { return setShowDropdown(false); }}/>
          <div className="theme-picker__dropdown">
            <div className="theme-picker__dropdown-titlebar">
              <span>Select Color Scheme</span>
            </div>
            <div className="theme-picker__dropdown-content">
              {themes.map(function (name) { return (<button key={name} className={"theme-picker__item ".concat(colorScheme === name ? 'theme-picker__item--active' : '')} onClick={function () { return handleThemeSelect(name); }}>
                  <span className="theme-picker__item-check">
                    {colorScheme === name ? '●' : '○'}
                  </span>
                  {name}
                </button>); })}
            </div>
          </div>
        </>)}
    </div>);
}
