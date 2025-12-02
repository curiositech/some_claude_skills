"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Win31Taskbar;
var react_1 = require("react");
require("../css/win31.css");
function Win31Taskbar(_a) {
    var windows = _a.windows, onWindowClick = _a.onWindowClick;
    var _b = react_1.default.useState(new Date()), time = _b[0], setTime = _b[1];
    react_1.default.useEffect(function () {
        var timer = setInterval(function () { return setTime(new Date()); }, 1000);
        return function () { return clearInterval(timer); };
    }, []);
    var formatTime = function () {
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    return (<div className="win31-panel" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            gap: '4px',
            zIndex: 9999,
            background: 'var(--win31-gray)',
        }}>
      <button className="win31-push-button win31-push-button-default" style={{ height: '32px', minWidth: '60px' }}>
        Start
      </button>

      <div className="win31-panel win31-panel-inset" style={{
            flex: 1,
            height: '32px',
            display: 'flex',
            gap: '2px',
            padding: '2px',
            overflow: 'hidden',
        }}>
        {windows.map(function (window) { return (<button key={window.id} onClick={function () { return onWindowClick(window.id); }} className="win31-push-button" style={{
                height: '28px',
                minWidth: '120px',
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                border: window.isMinimized
                    ? '2px outset var(--win31-gray)'
                    : '2px inset var(--win31-gray)',
            }}>
            {window.title}
          </button>); })}
      </div>

      <div className="win31-panel win31-panel-inset" style={{
            height: '32px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            minWidth: '80px',
            justifyContent: 'center',
        }}>
        <span className="win31-font" style={{ fontSize: '11px' }}>
          {formatTime()}
        </span>
      </div>
    </div>);
}
