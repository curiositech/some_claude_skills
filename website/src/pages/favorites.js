"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FavoritesPage;
var react_1 = require("react");
var Layout_1 = require("@theme/Layout");
var SkillQuickView_1 = require("../components/SkillQuickView");
var SkillGalleryCard_1 = require("../components/SkillGalleryCard");
var skills_1 = require("../data/skills");
var useStarredSkills_1 = require("../hooks/useStarredSkills");
require("../css/win31.css");
require("../css/skills-gallery.css");
function FavoritesPage() {
    var _a = (0, react_1.useState)(null), selectedSkill = _a[0], setSelectedSkill = _a[1];
    var _b = (0, useStarredSkills_1.useStarredSkills)(), toggleStar = _b.toggleStar, isStarred = _b.isStarred, getStarredCount = _b.getStarredCount, getStarredIds = _b.getStarredIds;
    var starredSkills = (0, react_1.useMemo)(function () {
        var starredIds = getStarredIds();
        return skills_1.ALL_SKILLS.filter(function (skill) { return starredIds.includes(skill.id); });
    }, [getStarredIds]);
    return (<Layout_1.default title="Favorites" description="Your starred Claude Skills">
      <div className="skills-page-bg">
        <div className="skills-container">
          {/* Header */}
          <div className="win31-panel-box">
            <div className="section-header">
              <h1 className="win31-font hero-title" style={{ fontSize: '32px' }}>
                Your Favorites
              </h1>
              <p className="win31-font" style={{ fontSize: '16px', textAlign: 'center', color: '#333', marginBottom: '20px' }}>
                {getStarredCount() > 0
            ? "You have ".concat(getStarredCount(), " starred skill").concat(getStarredCount() === 1 ? '' : 's')
            : 'Star skills to save them here for quick access'}
              </p>
            </div>
          </div>

          {/* Starred Skills Grid */}
          {starredSkills.length > 0 ? (<div className="skills-grid">
              {starredSkills.map(function (skill) { return (<SkillGalleryCard_1.default key={skill.id} skill={skill} onClick={setSelectedSkill} isStarred={isStarred(skill.id)} onToggleStar={toggleStar}/>); })}
            </div>) : (
        /* Empty State */
        <div className="no-results">
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>☆</div>
              <h3 className="win31-font no-results__title">No favorites yet</h3>
              <p className="win31-font no-results__description">
                Browse the Skills Gallery and click the star icon on any skill to add it here.
              </p>
              <a href="/skills" style={{ textDecoration: 'none' }}>
                <button className="win31-push-button" style={{ padding: '12px 24px', fontSize: '14px' }}>
                  Browse Skills Gallery
                </button>
              </a>
            </div>)}

          {/* Footer */}
          <div className="win31-panel-box win31-panel-box--small-shadow" style={{ marginBottom: 0 }}>
            <div className="win31-statusbar footer-bar" style={{ justifyContent: 'center', gap: '20px', padding: '20px' }}>
              <div className="win31-statusbar-panel">
                {starredSkills.length} of {skills_1.ALL_SKILLS.length} skills starred
              </div>
              <div className="win31-statusbar-panel">
                <a href="/skills" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Browse All Skills
                </a>
              </div>
              <div className="win31-statusbar-panel">
                <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedSkill && (<SkillQuickView_1.default skill={selectedSkill} onClose={function () { return setSelectedSkill(null); }} isStarred={isStarred(selectedSkill.id)} onToggleStar={toggleStar}/>)}
    </Layout_1.default>);
}
