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
exports.default = TagBadge;
exports.TagList = TagList;
var react_1 = require("react");
var router_1 = require("@docusaurus/router");
var tags_1 = require("../types/tags");
/**
 * TagBadge - Clickable tag that links to filtered skills page
 * Colors are determined by tag type (skill-type, domain, output, complexity, integration)
 */
function TagBadge(_a) {
    var tagId = _a.tagId, onClick = _a.onClick, _b = _a.size, size = _b === void 0 ? 'sm' : _b, _c = _a.clickable, clickable = _c === void 0 ? true : _c;
    var history = (0, router_1.useHistory)();
    var tag = (0, tags_1.getTag)(tagId);
    var colors = (0, tags_1.getTagColors)(tagId);
    if (!tag) {
        console.warn("Unknown tag: ".concat(tagId));
        return null;
    }
    var handleClick = function (e) {
        e.stopPropagation(); // Prevent card click
        if (onClick) {
            onClick(tagId);
        }
        else if (clickable) {
            // Navigate to skills page with tag filter
            history.push("/skills?tags=".concat(tagId));
        }
    };
    var sizeStyles = size === 'sm'
        ? { fontSize: '11px', padding: '2px 8px' }
        : { fontSize: '13px', padding: '4px 12px' };
    return (<span onClick={handleClick} title={tag.description} className="win31-font" style={__assign({ display: 'inline-block', backgroundColor: colors.bg, color: colors.text, border: "1px solid ".concat(colors.border), borderRadius: '12px', fontWeight: 500, cursor: clickable || onClick ? 'pointer' : 'default', transition: 'all 0.15s ease', whiteSpace: 'nowrap' }, sizeStyles)} onMouseEnter={function (e) {
            if (clickable || onClick) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }
        }} onMouseLeave={function (e) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
        }}>
      {tag.label}
    </span>);
}
/**
 * TagList - Renders multiple tags with optional limit
 */
function TagList(_a) {
    var tags = _a.tags, onClick = _a.onClick, _b = _a.size, size = _b === void 0 ? 'sm' : _b, maxTags = _a.maxTags, _c = _a.clickable, clickable = _c === void 0 ? true : _c;
    var displayTags = maxTags ? tags.slice(0, maxTags) : tags;
    var hiddenCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;
    return (<div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            alignItems: 'center'
        }}>
      {displayTags.map(function (tagId) { return (<TagBadge key={tagId} tagId={tagId} onClick={onClick} size={size} clickable={clickable}/>); })}
      {hiddenCount > 0 && (<span style={{
                fontSize: size === 'sm' ? '11px' : '13px',
                color: '#666',
                marginLeft: '2px'
            }}>
          +{hiddenCount}
        </span>)}
    </div>);
}
