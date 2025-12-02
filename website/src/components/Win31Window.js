"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Win31Window;
var react_1 = require("react");
require("../css/win31.css");
function Win31Window(_a) {
    var title = _a.title, children = _a.children, _b = _a.width, width = _b === void 0 ? '600px' : _b, _c = _a.height, height = _c === void 0 ? 'auto' : _c, onClose = _a.onClose, onMinimize = _a.onMinimize, onMaximize = _a.onMaximize, _d = _a.active, active = _d === void 0 ? true : _d, _e = _a.className, className = _e === void 0 ? '' : _e;
    return (<div className={"win31-window ".concat(className)} style={{
            width: typeof width === 'number' ? "".concat(width, "px") : width,
            height: typeof height === 'number' ? "".concat(height, "px") : height,
        }}>
      <div className={"win31-titlebar ".concat(active ? '' : 'win31-titlebar-inactive')}>
        <span className="win31-title-text">{title}</span>
        <div style={{ display: 'flex' }}>
          {onMinimize && (<button className="win31-button" onClick={onMinimize} aria-label="Minimize">
              <span className="win31-minimize-icon"/>
            </button>)}
          {onMaximize && (<button className="win31-button" onClick={onMaximize} aria-label="Maximize">
              <span className="win31-maximize-icon"/>
            </button>)}
          {onClose && (<button className="win31-button" onClick={onClose} aria-label="Close">
              <span className="win31-close-icon"/>
            </button>)}
        </div>
      </div>
      <div className="win31-window-inner" style={{ padding: '8px' }}>
        {children}
      </div>
    </div>);
}
