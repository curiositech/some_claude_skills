"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LayoutWrapper;
var react_1 = require("react");
var Layout_1 = require("@theme-original/DocPage/Layout");
var DraggableWin31Window_1 = require("../../../components/DraggableWin31Window");
var Win31Taskbar_1 = require("../../../components/Win31Taskbar");
require("../../../css/win31.css");
function LayoutWrapper(props) {
    var _a = (0, react_1.useState)([
        {
            id: 'doc',
            title: 'Documentation - Claude Skills',
            isMinimized: false,
            isMaximized: false,
            zIndex: 1,
        },
    ]), windows = _a[0], setWindows = _a[1];
    var _b = (0, react_1.useState)(1), highestZIndex = _b[0], setHighestZIndex = _b[1];
    var bringToFront = function (id) {
        var newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);
        setWindows(function (prev) {
            return prev.map(function (win) { return (win.id === id ? __assign(__assign({}, win), { zIndex: newZIndex }) : win); });
        });
    };
    var minimizeWindow = function (id) {
        setWindows(function (prev) {
            return prev.map(function (win) { return (win.id === id ? __assign(__assign({}, win), { isMinimized: true }) : win); });
        });
    };
    var restoreWindow = function (id) {
        setWindows(function (prev) {
            return prev.map(function (win) {
                return win.id === id
                    ? __assign(__assign({}, win), { isMinimized: false, isMaximized: false }) : win;
            });
        });
        bringToFront(id);
    };
    var maximizeWindow = function (id) {
        setWindows(function (prev) {
            return prev.map(function (win) {
                return win.id === id ? __assign(__assign({}, win), { isMaximized: !win.isMaximized }) : win;
            });
        });
    };
    var docWindow = windows.find(function (w) { return w.id === 'doc'; });
    return (<div className="win31-desktop" style={{ minHeight: '100vh', paddingBottom: '50px' }}>
      {docWindow && !docWindow.isMinimized && (<DraggableWin31Window_1.default title={docWindow.title} initialPosition={{ x: 50, y: 50 }} initialSize={{ width: Math.min(900, window.innerWidth - 100), height: Math.min(700, window.innerHeight - 150) }} onMinimize={function () { return minimizeWindow('doc'); }} onMaximize={function () { return maximizeWindow('doc'); }} isMaximized={docWindow.isMaximized} zIndex={docWindow.zIndex} onBringToFront={function () { return bringToFront('doc'); }}>
          <div style={{ background: '#F5F5DC', height: '100%', overflow: 'auto' }}>
            <Layout_1.default {...props}/>
          </div>
        </DraggableWin31Window_1.default>)}

      <Win31Taskbar_1.default windows={windows} onWindowClick={restoreWindow}/>
    </div>);
}
