"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLOR_SCHEMES = void 0;
exports.useWin31Theme = useWin31Theme;
var react_1 = require("react");
// Windows 3.1 Color Schemes
exports.COLOR_SCHEMES = {
    'Windows Default': {
        desktop: '#008080',
        gray: '#c0c0c0',
        navy: '#000080',
        highlight: '#000080',
    },
    'Hot Dog Stand': {
        desktop: '#FF0000',
        gray: '#FFFF00',
        navy: '#FF0000',
        highlight: '#FF0000',
    },
    'Fluorescent': {
        desktop: '#FF00FF',
        gray: '#00FFFF',
        navy: '#FF00FF',
        highlight: '#00FF00',
    },
    'Ocean': {
        desktop: '#000080',
        gray: '#c0c0c0',
        navy: '#000040',
        highlight: '#0000FF',
    },
    'Plasma Power Saver': {
        desktop: '#000000',
        gray: '#404040',
        navy: '#800080',
        highlight: '#FF00FF',
    },
    'Pumpkin (Large)': {
        desktop: '#804000',
        gray: '#FF8000',
        navy: '#804000',
        highlight: '#FFFF00',
    },
    'Rugby': {
        desktop: '#004000',
        gray: '#c0c0c0',
        navy: '#004000',
        highlight: '#008000',
    },
};
var STORAGE_KEY = 'win31-theme';
function useWin31Theme() {
    var _a = (0, react_1.useState)('Windows Default'), colorScheme = _a[0], setColorScheme = _a[1];
    var _b = (0, react_1.useState)(false), isLoaded = _b[0], setIsLoaded = _b[1];
    // Load from localStorage on mount
    (0, react_1.useEffect)(function () {
        if (typeof window !== 'undefined') {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved && saved in exports.COLOR_SCHEMES) {
                setColorScheme(saved);
            }
            setIsLoaded(true);
        }
    }, []);
    // Apply theme to CSS variables
    (0, react_1.useEffect)(function () {
        if (!isLoaded)
            return;
        var scheme = exports.COLOR_SCHEMES[colorScheme];
        if (scheme) {
            document.documentElement.style.setProperty('--win31-desktop', scheme.desktop);
            document.documentElement.style.setProperty('--win31-gray', scheme.gray);
            document.documentElement.style.setProperty('--win31-navy', scheme.navy);
            document.documentElement.style.setProperty('--win31-active-title', scheme.highlight);
            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, colorScheme);
        }
    }, [colorScheme, isLoaded]);
    var setTheme = (0, react_1.useCallback)(function (theme) {
        setColorScheme(theme);
    }, []);
    return {
        colorScheme: colorScheme,
        setTheme: setTheme,
        themes: Object.keys(exports.COLOR_SCHEMES),
        isLoaded: isLoaded,
    };
}
