"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UISoundsProvider = UISoundsProvider;
exports.useUISounds = useUISounds;
var react_1 = require("react");
var UISoundsContext = (0, react_1.createContext)(undefined);
// Sound file paths
var SOUNDS = {
    click: '/audio/ui-sounds/click.mp3',
    success: '/audio/ui-sounds/success.mp3',
    whoosh: '/audio/ui-sounds/whoosh.mp3',
    hover: '/audio/ui-sounds/hover.mp3',
    error: '/audio/ui-sounds/error.mp3',
};
function UISoundsProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(function () {
        // Load mute state from localStorage
        if (typeof window !== 'undefined') {
            var stored = localStorage.getItem('ui-sounds-muted');
            return stored === 'true';
        }
        return false;
    }), isMuted = _b[0], setIsMuted = _b[1];
    var _c = (0, react_1.useState)(function () {
        // Load volume from localStorage (default 0.3)
        if (typeof window !== 'undefined') {
            var stored = localStorage.getItem('ui-sounds-volume');
            return stored ? parseFloat(stored) : 0.3;
        }
        return 0.3;
    }), volume = _c[0], setVolumeState = _c[1];
    var _d = (0, react_1.useState)({}), audioElements = _d[0], setAudioElements = _d[1];
    // Preload all sounds on mount
    (0, react_1.useEffect)(function () {
        var elements = {};
        Object.entries(SOUNDS).forEach(function (_a) {
            var key = _a[0], path = _a[1];
            var audio = new Audio(path);
            audio.preload = 'auto';
            audio.volume = volume; // Set volume from state
            elements[key] = audio;
        });
        setAudioElements(elements);
        // Cleanup
        return function () {
            Object.values(elements).forEach(function (audio) {
                audio.pause();
                audio.src = '';
            });
        };
    }, [volume]);
    // Persist mute state
    (0, react_1.useEffect)(function () {
        if (typeof window !== 'undefined') {
            localStorage.setItem('ui-sounds-muted', String(isMuted));
        }
    }, [isMuted]);
    // Persist volume
    (0, react_1.useEffect)(function () {
        if (typeof window !== 'undefined') {
            localStorage.setItem('ui-sounds-volume', String(volume));
        }
    }, [volume]);
    // Update audio element volumes when volume changes
    (0, react_1.useEffect)(function () {
        Object.values(audioElements).forEach(function (audio) {
            audio.volume = volume;
        });
    }, [volume, audioElements]);
    var toggleMute = function () {
        setIsMuted(function (prev) { return !prev; });
    };
    var setVolume = function (newVolume) {
        // Clamp volume between 0 and 1
        var clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);
    };
    var playSound = function (soundKey) {
        if (isMuted || !audioElements[soundKey])
            return;
        var audio = audioElements[soundKey];
        audio.currentTime = 0; // Reset to start
        audio.play().catch(function (err) {
            // Silently fail if autoplay is blocked
            console.debug('Sound play blocked:', err);
        });
    };
    var contextValue = {
        isMuted: isMuted,
        volume: volume,
        toggleMute: toggleMute,
        setVolume: setVolume,
        playClick: function () { return playSound('click'); },
        playSuccess: function () { return playSound('success'); },
        playWhoosh: function () { return playSound('whoosh'); },
        playHover: function () { return playSound('hover'); },
        playError: function () { return playSound('error'); },
    };
    return (<UISoundsContext.Provider value={contextValue}>
      {children}
    </UISoundsContext.Provider>);
}
function useUISounds() {
    var context = (0, react_1.useContext)(UISoundsContext);
    if (!context) {
        throw new Error('useUISounds must be used within UISoundsProvider');
    }
    return context;
}
