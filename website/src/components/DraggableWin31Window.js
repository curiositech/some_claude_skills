"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DraggableWin31Window;
var react_1 = require("react");
require("../css/win31.css");
function DraggableWin31Window(_a) {
    var title = _a.title, children = _a.children, _b = _a.initialPosition, initialPosition = _b === void 0 ? { x: 100, y: 100 } : _b, _c = _a.initialSize, initialSize = _c === void 0 ? { width: 600, height: 400 } : _c, onMinimize = _a.onMinimize, onMaximize = _a.onMaximize, onClose = _a.onClose, _d = _a.isMaximized, isMaximized = _d === void 0 ? false : _d, _e = _a.zIndex, zIndex = _e === void 0 ? 1 : _e, onBringToFront = _a.onBringToFront, _f = _a.className, className = _f === void 0 ? '' : _f;
    var _g = (0, react_1.useState)(initialPosition), position = _g[0], setPosition = _g[1];
    var _h = (0, react_1.useState)(false), isDragging = _h[0], setIsDragging = _h[1];
    var _j = (0, react_1.useState)({ x: 0, y: 0 }), dragStart = _j[0], setDragStart = _j[1];
    var windowRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var handleMouseMove = function (e) {
            if (isDragging && !isMaximized) {
                var dx = e.clientX - dragStart.x;
                var dy = e.clientY - dragStart.y;
                setPosition({ x: position.x + dx, y: position.y + dy });
                setDragStart({ x: e.clientX, y: e.clientY });
            }
        };
        var handleMouseUp = function () {
            setIsDragging(false);
        };
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return function () {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, position, isMaximized]);
    var handleMouseDown = function (e) {
        if (onBringToFront)
            onBringToFront();
        if (!isMaximized && e.target === e.currentTarget) {
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };
    var windowStyle = isMaximized
        ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: '40px',
            width: '100%',
            height: 'calc(100vh - 40px)',
            zIndex: zIndex,
        }
        : {
            position: 'fixed',
            top: "".concat(position.y, "px"),
            left: "".concat(position.x, "px"),
            width: "".concat(initialSize.width, "px"),
            height: "".concat(initialSize.height, "px"),
            zIndex: zIndex,
        };
    return (<div ref={windowRef} className={"win31-window ".concat(className)} style={windowStyle} onMouseDown={function () { return onBringToFront && onBringToFront(); }}>
      <div className="win31-titlebar" onMouseDown={handleMouseDown} style={{ cursor: isMaximized ? 'default' : 'move' }}>
        <span className="win31-title-text">{title}</span>
        <div style={{ display: 'flex' }}>
          {onMinimize && (<button className="win31-button" onClick={function (e) {
                e.stopPropagation();
                onMinimize();
            }} aria-label="Minimize">
              <span className="win31-minimize-icon"/>
            </button>)}
          {onMaximize && (<button className="win31-button" onClick={function (e) {
                e.stopPropagation();
                onMaximize();
            }} aria-label="Maximize">
              <span className="win31-maximize-icon"/>
            </button>)}
          {onClose && (<button className="win31-button" onClick={function (e) {
                e.stopPropagation();
                onClose();
            }} aria-label="Close">
              <span className="win31-close-icon"/>
            </button>)}
        </div>
      </div>
      <div className="win31-window-inner" style={{
            padding: '0',
            height: 'calc(100% - 20px)',
            overflow: 'auto',
        }}>
        {children}
      </div>
    </div>);
}
