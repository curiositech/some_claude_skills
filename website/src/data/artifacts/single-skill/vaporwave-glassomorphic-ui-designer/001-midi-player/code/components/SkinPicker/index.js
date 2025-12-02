"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SkinPicker;
var react_1 = require("react");
var useWinampSkin_1 = require("../../hooks/useWinampSkin");
var styles_module_css_1 = require("./styles.module.css");
function SkinPicker(_a) {
    var onClose = _a.onClose;
    var _b = (0, useWinampSkin_1.useWinampSkin)(), currentSkinId = _b.currentSkinId, setSkin = _b.setSkin, allSkins = _b.allSkins;
    var handleSkinSelect = function (skinId) {
        setSkin(skinId);
        // Optional: close the picker after selection
        // if (onClose) onClose();
    };
    return (<div className={styles_module_css_1.default.skinPicker}>
      <div className={styles_module_css_1.default.header}>
        <h3 className={styles_module_css_1.default.title}>Choose Skin</h3>
        {onClose && (<button className={styles_module_css_1.default.closeBtn} onClick={onClose}>
            ×
          </button>)}
      </div>
      <div className={styles_module_css_1.default.skinGrid}>
        {allSkins.map(function (skin) { return (<button key={skin.id} className={"".concat(styles_module_css_1.default.skinCard, " ").concat(currentSkinId === skin.id ? styles_module_css_1.default.active : '')} onClick={function () { return handleSkinSelect(skin.id); }} style={{
                background: "linear-gradient(135deg, ".concat(skin.colors.bgLight, ", ").concat(skin.colors.bgDark, ")"),
                borderColor: currentSkinId === skin.id ? skin.colors.accent : skin.colors.border,
            }}>
            <div className={styles_module_css_1.default.skinPreview}>
              <div className={styles_module_css_1.default.previewTitlebar} style={{ backgroundColor: skin.colors.titlebar }}/>
              <div className={styles_module_css_1.default.previewDisplay} style={{
                backgroundColor: skin.colors.displayBg,
                color: skin.colors.displayText
            }}>
                <div className={styles_module_css_1.default.previewVisualizer} style={{ backgroundColor: skin.colors.visualizer }}/>
              </div>
              <div className={styles_module_css_1.default.previewButtons}>
                {[1, 2, 3, 4].map(function (i) { return (<div key={i} className={styles_module_css_1.default.previewButton} style={{ backgroundColor: skin.colors.buttonBg }}/>); })}
              </div>
            </div>
            <div className={styles_module_css_1.default.skinInfo} style={{ color: skin.colors.text }}>
              <div className={styles_module_css_1.default.skinName}>{skin.name}</div>
              <div className={styles_module_css_1.default.skinDesc} style={{ color: skin.colors.textDim }}>
                {skin.description}
              </div>
            </div>
            {currentSkinId === skin.id && (<div className={styles_module_css_1.default.activeIndicator} style={{ backgroundColor: skin.colors.accent }}>
                ✓
              </div>)}
          </button>); })}
      </div>
    </div>);
}
