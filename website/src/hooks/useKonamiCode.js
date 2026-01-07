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
exports.useKonamiCode = useKonamiCode;
var react_1 = require("react");
var KONAMI_CODE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
];
function useKonamiCode() {
    var _a = (0, react_1.useState)([]), sequence = _a[0], setSequence = _a[1];
    var _b = (0, react_1.useState)('hadouken'), currentEasterEgg = _b[0], setCurrentEasterEgg = _b[1];
    var _c = (0, react_1.useState)(false), triggered = _c[0], setTriggered = _c[1];
    var easterEggs = ['hadouken', 'moon-tiara', 'energize'];
    (0, react_1.useEffect)(function () {
        var handleKeyDown = function (event) {
            setSequence(function (prev) {
                var newSequence = __spreadArray(__spreadArray([], prev, true), [event.code], false).slice(-10);
                // Check if the Konami code is complete
                if (newSequence.join(',') === KONAMI_CODE.join(',')) {
                    setTriggered(true);
                    // Cycle to next easter egg
                    setCurrentEasterEgg(function (current) {
                        var currentIndex = easterEggs.indexOf(current);
                        var nextIndex = (currentIndex + 1) % easterEggs.length;
                        return easterEggs[nextIndex];
                    });
                    // Reset after animation
                    setTimeout(function () { return setTriggered(false); }, 3000);
                    return [];
                }
                return newSequence;
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return function () { return window.removeEventListener('keydown', handleKeyDown); };
    }, []);
    return { triggered: triggered, easterEgg: currentEasterEgg };
}
