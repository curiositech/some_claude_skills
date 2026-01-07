"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SkillGalleryCard;
var react_1 = require("react");
var useHoverLift_1 = require("../../hooks/useHoverLift");
var useStarredSkills_1 = require("../../hooks/useStarredSkills");
var TagBadge_1 = require("../TagBadge");
require("../../css/skills-gallery.css");
/**
 * Reusable skill card component for gallery displays
 * Replaces duplicate card implementations in index.tsx and skills.tsx
 */
function SkillGalleryCard(_a) {
    var _this = this;
    var skill = _a.skill, onClick = _a.onClick, _b = _a.variant, variant = _b === void 0 ? 'default' : _b, _c = _a.basePath, basePath = _c === void 0 ? '' : _c, _d = _a.isStarred, isStarred = _d === void 0 ? false : _d, onToggleStar = _a.onToggleStar;
    var _e = (0, react_1.useState)(false), shareToast = _e[0], setShareToast = _e[1];
    var hoverConfig = variant === 'featured' ? useHoverLift_1.HOVER_CONFIGS.featuredCard : useHoverLift_1.HOVER_CONFIGS.card;
    var hoverHandlers = (0, useHoverLift_1.useHoverLift)(hoverConfig);
    var handleStar = function (e) {
        e.stopPropagation();
        onToggleStar === null || onToggleStar === void 0 ? void 0 : onToggleStar(skill.id);
    };
    var handleShare = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.stopPropagation();
                    return [4 /*yield*/, (0, useStarredSkills_1.shareSkill)(skill.id, skill.title)];
                case 1:
                    _a.sent();
                    setShareToast(true);
                    setTimeout(function () { return setShareToast(false); }, 2000);
                    return [2 /*return*/];
            }
        });
    }); };
    var cardClass = variant === 'featured'
        ? 'skill-gallery-card skill-gallery-card--featured'
        : 'skill-gallery-card';
    var imageContainerClass = variant === 'featured'
        ? 'skill-card__image-container skill-card__image-container--compact'
        : 'skill-card__image-container';
    var contentClass = variant === 'featured'
        ? 'skill-card__content skill-card__content--compact'
        : 'skill-card__content';
    var titleClass = variant === 'featured'
        ? 'win31-font skill-card__title skill-card__title--compact'
        : 'win31-font skill-card__title';
    var descriptionClass = variant === 'featured'
        ? 'win31-font skill-card__description skill-card__description--compact'
        : 'win31-font skill-card__description';
    return (<div className={cardClass} onClick={function () { return onClick === null || onClick === void 0 ? void 0 : onClick(skill); }} {...hoverHandlers}>
      <div className={imageContainerClass}>
        <img src={"".concat(basePath, "/img/skills/").concat(skill.id, "-hero.png")} alt={skill.title} className="skill-card__image"/>
        {/* Badge indicator */}
        {skill.badge === 'NEW' && (<span className="new-skill-badge">NEW!</span>)}
        {skill.badge === 'UPDATED' && (<span className="updated-skill-badge">UPDATED</span>)}
        <div className="skill-card__install-hint">
          Click for quick install
        </div>
        {/* Star/Share Actions */}
        <div className="skill-card__actions">
          <button className={"skill-card__action-btn ".concat(isStarred ? 'skill-card__action-btn--starred' : '')} onClick={handleStar} title={isStarred ? 'Remove from favorites' : 'Add to favorites'}>
            {isStarred ? '★' : '☆'}
          </button>
          <button className="skill-card__action-btn" onClick={handleShare} title="Share skill">
            ⤴
          </button>
        </div>
        {shareToast && (<div className="skill-card__toast">Link copied!</div>)}
      </div>
      <div className={contentClass}>
        <h3 className={titleClass}>{skill.title}</h3>
        <p className={descriptionClass}>{skill.description}</p>
        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (<div className="skill-card__tags">
            <TagBadge_1.TagList tags={skill.tags} maxTags={4} size="sm"/>
          </div>)}
        {variant === 'default' && (<div className="win31-font skill-card__category">
            {skill.category}
          </div>)}
      </div>
    </div>);
}
