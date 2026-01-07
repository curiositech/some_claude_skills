"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SkillsGallery;
var react_1 = require("react");
var Layout_1 = require("@theme/Layout");
var router_1 = require("@docusaurus/router");
var SkillQuickView_1 = require("../components/SkillQuickView");
var SkillGalleryCard_1 = require("../components/SkillGalleryCard");
var SkillListView_1 = require("../components/SkillListView");
var skills_1 = require("../data/skills");
var skill_1 = require("../types/skill");
var tags_1 = require("../types/tags");
var useStarredSkills_1 = require("../hooks/useStarredSkills");
require("../css/win31.css");
require("../css/skills-gallery.css");
function SkillsGallery() {
    var history = (0, router_1.useHistory)();
    var location = (0, router_1.useLocation)();
    var _a = (0, react_1.useState)('all'), selectedCategory = _a[0], setSelectedCategory = _a[1];
    var _b = (0, react_1.useState)(''), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = (0, react_1.useState)(null), selectedSkill = _c[0], setSelectedSkill = _c[1];
    var _d = (0, react_1.useState)(false), showStarredOnly = _d[0], setShowStarredOnly = _d[1];
    var _e = (0, react_1.useState)([]), selectedTags = _e[0], setSelectedTags = _e[1];
    var _f = (0, react_1.useState)(false), showTagFilter = _f[0], setShowTagFilter = _f[1];
    var _g = (0, react_1.useState)('cards'), viewMode = _g[0], setViewMode = _g[1];
    var _h = (0, useStarredSkills_1.useStarredSkills)(), toggleStar = _h.toggleStar, isStarred = _h.isStarred, getStarredCount = _h.getStarredCount;
    // Read tags from URL on mount
    (0, react_1.useEffect)(function () {
        var params = new URLSearchParams(location.search);
        var tagsParam = params.get('tags');
        if (tagsParam) {
            var tags = tagsParam.split(',').filter(function (t) { return tags_1.ALL_TAGS.some(function (at) { return at.id === t; }); });
            setSelectedTags(tags);
            if (tags.length > 0) {
                setShowTagFilter(true);
            }
        }
    }, [location.search]);
    // Update URL when tags change
    var updateUrlWithTags = function (tags) {
        var params = new URLSearchParams(location.search);
        if (tags.length > 0) {
            params.set('tags', tags.join(','));
        }
        else {
            params.delete('tags');
        }
        var newSearch = params.toString();
        history.replace({
            pathname: location.pathname,
            search: newSearch ? "?".concat(newSearch) : '',
        });
    };
    var handleTagToggle = function (tagId) {
        var newTags = selectedTags.includes(tagId)
            ? selectedTags.filter(function (t) { return t !== tagId; })
            : __spreadArray(__spreadArray([], selectedTags, true), [tagId], false);
        setSelectedTags(newTags);
        updateUrlWithTags(newTags);
    };
    var handleClearTags = function () {
        setSelectedTags([]);
        updateUrlWithTags([]);
    };
    var filteredSkills = (0, react_1.useMemo)(function () {
        var skills = skills_1.ALL_SKILLS;
        // Filter by starred
        if (showStarredOnly) {
            skills = skills.filter(function (skill) { return isStarred(skill.id); });
        }
        // Filter by category
        if (selectedCategory !== 'all') {
            skills = skills.filter(function (skill) { return skill.category === selectedCategory; });
        }
        // Filter by tags (OR logic - skill matches if it has ANY of the selected tags)
        if (selectedTags.length > 0) {
            skills = skills.filter(function (skill) { var _a; return (_a = skill.tags) === null || _a === void 0 ? void 0 : _a.some(function (tag) { return selectedTags.includes(tag); }); });
        }
        // Filter by search (also searches tags)
        if (searchQuery) {
            var lowerQuery_1 = searchQuery.toLowerCase();
            skills = skills.filter(function (skill) {
                var _a;
                return skill.title.toLowerCase().includes(lowerQuery_1) ||
                    skill.description.toLowerCase().includes(lowerQuery_1) ||
                    ((_a = skill.tags) === null || _a === void 0 ? void 0 : _a.some(function (tag) { return tag.toLowerCase().includes(lowerQuery_1); }));
            });
        }
        return skills;
    }, [selectedCategory, searchQuery, showStarredOnly, isStarred, selectedTags]);
    var handleResetFilters = function () {
        setSelectedCategory('all');
        setSearchQuery('');
        setShowStarredOnly(false);
        setSelectedTags([]);
        updateUrlWithTags([]);
    };
    var tagsByType = (0, tags_1.getTagsByType)();
    return (<Layout_1.default title="Skills Gallery" description="Browse all 25 Claude Skills with beautiful hero images">
      <div className="skills-page-bg">
        <div className="skills-container">
          {/* Header */}
          <div className="win31-panel-box">
            <div className="section-header">
              <h1 className="win31-font hero-title" style={{ fontSize: '32px' }}>
                Skills Gallery
              </h1>
              <p className="win31-font" style={{ fontSize: '16px', textAlign: 'center', color: '#333', marginBottom: '20px' }}>
                Modular prompt extensions for Claude Code - Click any card for quick install
              </p>

              {/* Search Bar */}
              <div className="search-container">
                <input type="text" placeholder="Search skills..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="win31-font search-input"/>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', border: '2px solid #808080', marginRight: '8px' }}>
              <button onClick={function () { return setViewMode('cards'); }} className="win31-push-button" style={{
            fontSize: '14px',
            padding: '10px 16px',
            background: viewMode === 'cards' ? 'var(--win31-navy)' : 'var(--win31-gray)',
            color: viewMode === 'cards' ? 'white' : 'black',
            fontWeight: viewMode === 'cards' ? 'bold' : 'normal',
            borderRight: '1px solid #808080',
        }} title="Card View">
                ▦ Cards
              </button>
              <button onClick={function () { return setViewMode('list'); }} className="win31-push-button" style={{
            fontSize: '14px',
            padding: '10px 16px',
            background: viewMode === 'list' ? 'var(--win31-navy)' : 'var(--win31-gray)',
            color: viewMode === 'list' ? 'white' : 'black',
            fontWeight: viewMode === 'list' ? 'bold' : 'normal',
        }} title="List View (Sortable)">
                ☰ List
              </button>
            </div>
            {/* Starred Filter */}
            <button onClick={function () { return setShowStarredOnly(!showStarredOnly); }} className="win31-push-button" style={{
            fontSize: '14px',
            padding: '10px 20px',
            background: showStarredOnly ? 'var(--win31-yellow)' : 'var(--win31-gray)',
            color: 'black',
            fontWeight: showStarredOnly ? 'bold' : 'normal',
        }}>
              ★ Starred ({getStarredCount()})
            </button>
            {/* Tag Filter Toggle */}
            <button onClick={function () { return setShowTagFilter(!showTagFilter); }} className="win31-push-button" style={{
            fontSize: '14px',
            padding: '10px 20px',
            background: selectedTags.length > 0 ? 'var(--win31-lime)' : 'var(--win31-gray)',
            color: 'black',
            fontWeight: selectedTags.length > 0 ? 'bold' : 'normal',
        }}>
              🏷️ Tags {selectedTags.length > 0 && "(".concat(selectedTags.length, ")")}
            </button>
            {skill_1.SKILL_CATEGORIES.map(function (category) { return (<button key={category} onClick={function () { return setSelectedCategory(category); }} className="win31-push-button" style={{
                fontSize: '14px',
                padding: '10px 20px',
                background: selectedCategory === category ? 'var(--win31-blue)' : 'var(--win31-gray)',
                color: selectedCategory === category ? 'white' : 'black',
                fontWeight: selectedCategory === category ? 'bold' : 'normal',
            }}>
                {category === 'all' ? 'All Skills' : category}
              </button>); })}
          </div>

          {/* Tag Filter Panel */}
          {showTagFilter && (<div className="win31-panel-box" style={{ marginBottom: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 className="win31-font" style={{ margin: 0, fontSize: '14px', color: 'var(--win31-navy)' }}>
                    Filter by Tags
                  </h3>
                  <p className="win31-font" style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                    Shows skills matching <strong>any</strong> selected tag
                  </p>
                </div>
                {selectedTags.length > 0 && (<button onClick={handleClearTags} className="win31-push-button" style={{ fontSize: '12px', padding: '4px 12px' }}>
                    Clear All
                  </button>)}
              </div>

              {Object.keys(tagsByType).map(function (type) { return (<div key={type} style={{ marginBottom: '12px' }}>
                  <div className="win31-font" style={{
                    fontSize: '11px',
                    color: '#666',
                    marginBottom: '6px',
                    fontWeight: 'bold'
                }}>
                    {tags_1.TAG_TYPE_LABELS[type]}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {tagsByType[type].map(function (tag) {
                    var isSelected = selectedTags.includes(tag.id);
                    var colors = tags_1.TAG_TYPE_COLORS[type];
                    return (<button key={tag.id} onClick={function () { return handleTagToggle(tag.id); }} title={tag.description} className="win31-font" style={{
                            display: 'inline-block',
                            backgroundColor: isSelected ? colors.text : colors.bg,
                            color: isSelected ? '#fff' : colors.text,
                            border: "1px solid ".concat(colors.border),
                            borderRadius: '12px',
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: isSelected ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}>
                          {tag.label}
                        </button>);
                })}
                  </div>
                </div>); })}
            </div>)}

          {/* Active Tag Pills */}
          {selectedTags.length > 0 && !showTagFilter && (<div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span className="win31-font" style={{ fontSize: '12px', color: '#666' }}>Active tags:</span>
              {selectedTags.map(function (tagId) {
                var tag = tags_1.ALL_TAGS.find(function (t) { return t.id === tagId; });
                if (!tag)
                    return null;
                var colors = tags_1.TAG_TYPE_COLORS[tag.type];
                return (<button key={tagId} onClick={function () { return handleTagToggle(tagId); }} className="win31-font" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: "1px solid ".concat(colors.border),
                        borderRadius: '12px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}>
                    {tag.label} ×
                  </button>);
            })}
              <button onClick={handleClearTags} style={{
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '11px',
                cursor: 'pointer',
                textDecoration: 'underline',
            }}>
                Clear all
              </button>
            </div>)}

          {/* Skills Grid or List */}
          {viewMode === 'cards' ? (<div className="skills-grid">
              {filteredSkills.map(function (skill) { return (<SkillGalleryCard_1.default key={skill.id} skill={skill} onClick={setSelectedSkill} isStarred={isStarred(skill.id)} onToggleStar={toggleStar}/>); })}
            </div>) : (<SkillListView_1.default skills={filteredSkills}/>)}

          {/* No Results */}
          {filteredSkills.length === 0 && (<div className="no-results">
              <h3 className="win31-font no-results__title">No skills found</h3>
              <p className="win31-font no-results__description">
                Try adjusting your search or category filter
              </p>
              <button className="win31-push-button" onClick={handleResetFilters} style={{ padding: '10px 20px' }}>
                Reset Filters
              </button>
            </div>)}

          {/* Stats Footer */}
          <div className="win31-panel-box win31-panel-box--small-shadow" style={{ marginBottom: 0 }}>
            <div className="win31-statusbar" style={{ justifyContent: 'center', gap: '20px', padding: '20px' }}>
              <div className="win31-statusbar-panel">
                {filteredSkills.length} of {skills_1.ALL_SKILLS.length} skills shown
              </div>
              <div className="win31-statusbar-panel">
                {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
              </div>
              {selectedTags.length > 0 && (<div className="win31-statusbar-panel">
                  {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
                </div>)}
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
