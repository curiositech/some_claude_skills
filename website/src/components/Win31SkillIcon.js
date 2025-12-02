"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Win31SkillIcon;
var react_1 = require("react");
var Link_1 = require("@docusaurus/Link");
require("../css/win31.css");
function Win31SkillIcon(_a) {
    var id = _a.id, title = _a.title, icon = _a.icon, path = _a.path, _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = (0, react_1.useState)(false), isSelected = _c[0], setIsSelected = _c[1];
    var _d = (0, react_1.useState)(0), clickCount = _d[0], setClickCount = _d[1];
    var _e = (0, react_1.useState)(null), clickTimer = _e[0], setClickTimer = _e[1];
    var handleClick = (0, react_1.useCallback)(function (e) {
        if (clickTimer) {
            // Double click - let the link navigate
            clearTimeout(clickTimer);
            setClickTimer(null);
            setClickCount(0);
            // Don't prevent default - let Link handle navigation
        }
        else {
            // Single click - select only
            e.preventDefault();
            setIsSelected(true);
            setClickCount(1);
            var timer = window.setTimeout(function () {
                setClickCount(0);
                setClickTimer(null);
            }, 300);
            setClickTimer(timer);
        }
    }, [clickTimer]);
    var handleBlur = (0, react_1.useCallback)(function () {
        setIsSelected(false);
    }, []);
    return (<Link_1.default to={path} onClick={handleClick} onBlur={handleBlur} className={"win31-icon ".concat(className)} style={{
            background: isSelected ? 'var(--win31-navy)' : 'transparent',
            border: isSelected ? '1px dotted white' : '1px solid transparent',
            padding: '4px',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }} tabIndex={0} aria-label={"Open ".concat(title)}>
      <div className="win31-icon-image" style={{ fontSize: '48px' }}>
        {icon}
      </div>
      <div className="win31-icon-label">
        {title}
      </div>
    </Link_1.default>);
}
