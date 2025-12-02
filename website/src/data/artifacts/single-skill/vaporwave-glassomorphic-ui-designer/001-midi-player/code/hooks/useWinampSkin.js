"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWinampSkin = useWinampSkin;
var react_1 = require("react");
var skins_1 = require("../types/skins");
var SKIN_STORAGE_KEY = 'winamp-skin-preference';
function useWinampSkin() {
    var _a = (0, react_1.useState)(skins_1.DEFAULT_SKIN), currentSkinId = _a[0], setCurrentSkinId = _a[1];
    var _b = (0, react_1.useState)(false), isLoaded = _b[0], setIsLoaded = _b[1];
    // Load skin preference from localStorage on mount
    (0, react_1.useEffect)(function () {
        var savedSkin = localStorage.getItem(SKIN_STORAGE_KEY);
        if (savedSkin && skins_1.WINAMP_SKINS[savedSkin]) {
            setCurrentSkinId(savedSkin);
        }
        setIsLoaded(true);
    }, []);
    // Apply CSS variables when skin changes
    (0, react_1.useEffect)(function () {
        if (!isLoaded)
            return;
        var skin = skins_1.WINAMP_SKINS[currentSkinId];
        if (!skin)
            return;
        // Apply all skin colors as CSS variables
        var root = document.documentElement;
        Object.entries(skin.colors).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            root.style.setProperty("--winamp-".concat(key), value);
        });
        // Save preference
        localStorage.setItem(SKIN_STORAGE_KEY, currentSkinId);
    }, [currentSkinId, isLoaded]);
    var setSkin = function (skinId) {
        if (skins_1.WINAMP_SKINS[skinId]) {
            setCurrentSkinId(skinId);
        }
    };
    var currentSkin = skins_1.WINAMP_SKINS[currentSkinId];
    return {
        currentSkin: currentSkin,
        currentSkinId: currentSkinId,
        setSkin: setSkin,
        allSkins: Object.values(skins_1.WINAMP_SKINS),
        isLoaded: isLoaded,
    };
}
