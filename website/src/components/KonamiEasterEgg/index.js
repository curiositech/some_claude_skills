"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KonamiEasterEgg;
var react_1 = require("react");
require("./styles.css");
function KonamiEasterEgg(_a) {
    var type = _a.type, visible = _a.visible;
    if (!visible)
        return null;
    return (<div className={"konami-egg konami-egg--".concat(type)}>
      {type === 'hadouken' && (<>
          <div className="konami-content">
            <div className="hadouken-hands">👊</div>
            <div className="konami-text">HADOUKEN!</div>
          </div>
          <div className="hadouken-projectile">💥</div>
        </>)}
      {type === 'moon-tiara' && (<>
          <div className="konami-content">
            <div className="konami-text">MOON TIARA ACTION!</div>
          </div>
          <div className="flying-tiara">👑</div>
        </>)}
      {type === 'energize' && (<>
          <div className="konami-content">
            <div className="energize-hand">🖖</div>
            <div className="konami-text">ENERGIZE!</div>
          </div>
          <div className="energize-beam"></div>
          <div className="energize-sparkles">
            <span>✨</span>
            <span>✨</span>
            <span>✨</span>
            <span>✨</span>
            <span>✨</span>
          </div>
        </>)}
    </div>);
}
