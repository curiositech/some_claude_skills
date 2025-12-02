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
exports.HOVER_CONFIGS = void 0;
exports.useHoverLift = useHoverLift;
var react_1 = require("react");
var DEFAULT_CONFIG = {
    translateY: 4,
    boxShadow: '10px 10px 0 rgba(0,0,0,0.5)',
    defaultBoxShadow: '6px 6px 0 rgba(0,0,0,0.4)',
};
/**
 * Reusable hook for hover lift effects
 * Eliminates duplicate onMouseEnter/onMouseLeave handlers
 */
function useHoverLift(config) {
    if (config === void 0) { config = {}; }
    var _a = __assign(__assign({}, DEFAULT_CONFIG), config), translateY = _a.translateY, boxShadow = _a.boxShadow, defaultBoxShadow = _a.defaultBoxShadow;
    var onMouseEnter = (0, react_1.useCallback)(function (e) {
        e.currentTarget.style.transform = "translateY(-".concat(translateY, "px)");
        e.currentTarget.style.boxShadow = boxShadow;
    }, [translateY, boxShadow]);
    var onMouseLeave = (0, react_1.useCallback)(function (e) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = defaultBoxShadow;
    }, [defaultBoxShadow]);
    return { onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave };
}
/**
 * Pre-configured hover configs for common use cases
 */
exports.HOVER_CONFIGS = {
    card: {
        translateY: 4,
        boxShadow: '10px 10px 0 rgba(0,0,0,0.5)',
        defaultBoxShadow: '6px 6px 0 rgba(0,0,0,0.4)',
    },
    button: {
        translateY: 4,
        boxShadow: '8px 8px 0 var(--win31-lime)',
        defaultBoxShadow: 'none',
    },
    featuredCard: {
        translateY: 4,
        boxShadow: '6px 6px 0 rgba(0,0,0,0.3)',
        defaultBoxShadow: 'none',
    },
};
