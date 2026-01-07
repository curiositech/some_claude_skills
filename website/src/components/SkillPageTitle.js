"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SkillPageTitle;
var react_1 = require("react");
function SkillPageTitle(_a) {
    var title = _a.title;
    return (<h1 style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '24px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '24px',
            color: 'var(--win31-black)',
        }}>
      {title}
    </h1>);
}
