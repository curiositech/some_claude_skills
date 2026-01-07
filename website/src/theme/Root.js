"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Root;
var react_1 = require("react");
var useWin31Theme_1 = require("../hooks/useWin31Theme");
var MusicPlayerContext_1 = require("../contexts/MusicPlayerContext");
var UISoundsContext_1 = require("../contexts/UISoundsContext");
var WinampModal_1 = require("../components/WinampModal");
var FullScreenVisualizer_1 = require("../components/FullScreenVisualizer");
// Root component to apply Win31 theme globally across all pages
function ThemeApplicator(_a) {
    var children = _a.children;
    // This hook applies the theme CSS variables on mount
    (0, useWin31Theme_1.useWin31Theme)();
    return <>{children}</>;
}
function Root(_a) {
    var children = _a.children;
    return (<UISoundsContext_1.UISoundsProvider>
      <MusicPlayerContext_1.MusicPlayerProvider>
        <ThemeApplicator>{children}</ThemeApplicator>
        <WinampModal_1.default />
        <FullScreenVisualizer_1.default />
      </MusicPlayerContext_1.MusicPlayerProvider>
    </UISoundsContext_1.UISoundsProvider>);
}
