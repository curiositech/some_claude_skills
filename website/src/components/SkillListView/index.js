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
exports.default = SkillListView;
var react_1 = require("react");
var router_1 = require("@docusaurus/router");
var skillMetadata_json_1 = require("../../data/skillMetadata.json");
var styles_module_css_1 = require("./styles.module.css");
var metadata = skillMetadata_json_1.default.skills;
function formatDate(isoDate) {
    if (!isoDate)
        return '—';
    var date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
    });
}
function formatSize(bytes) {
    if (bytes < 1024)
        return "".concat(bytes, " B");
    var kb = bytes / 1024;
    return "".concat(kb.toFixed(1), " KB");
}
function formatLines(lines) {
    if (lines >= 1000) {
        return "".concat((lines / 1000).toFixed(1), "K");
    }
    return lines.toString();
}
function getRelativeDate(isoDate) {
    if (!isoDate)
        return 'Unknown';
    var date = new Date(isoDate);
    var now = new Date();
    var diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0)
        return 'Today';
    if (diffDays === 1)
        return 'Yesterday';
    if (diffDays < 7)
        return "".concat(diffDays, " days ago");
    if (diffDays < 30)
        return "".concat(Math.floor(diffDays / 7), " weeks ago");
    return formatDate(isoDate);
}
function SkillListView(_a) {
    var skills = _a.skills, _b = _a.basePath, basePath = _b === void 0 ? '' : _b;
    var history = (0, router_1.useHistory)();
    var _c = (0, react_1.useState)('updatedAt'), sortField = _c[0], setSortField = _c[1];
    var _d = (0, react_1.useState)('desc'), sortDirection = _d[0], setSortDirection = _d[1];
    var sortedSkills = (0, react_1.useMemo)(function () {
        var sorted = __spreadArray([], skills, true).sort(function (a, b) {
            var metaA = metadata[a.id];
            var metaB = metadata[b.id];
            var comparison = 0;
            switch (sortField) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'category':
                    comparison = a.category.localeCompare(b.category);
                    break;
                case 'createdAt':
                    var dateA = (metaA === null || metaA === void 0 ? void 0 : metaA.createdAt) ? new Date(metaA.createdAt).getTime() : 0;
                    var dateB = (metaB === null || metaB === void 0 ? void 0 : metaB.createdAt) ? new Date(metaB.createdAt).getTime() : 0;
                    comparison = dateA - dateB;
                    break;
                case 'updatedAt':
                    var updateA = (metaA === null || metaA === void 0 ? void 0 : metaA.updatedAt) ? new Date(metaA.updatedAt).getTime() : 0;
                    var updateB = (metaB === null || metaB === void 0 ? void 0 : metaB.updatedAt) ? new Date(metaB.updatedAt).getTime() : 0;
                    comparison = updateA - updateB;
                    break;
                case 'totalLines':
                    comparison = ((metaA === null || metaA === void 0 ? void 0 : metaA.totalLines) || 0) - ((metaB === null || metaB === void 0 ? void 0 : metaB.totalLines) || 0);
                    break;
                case 'skillMdSize':
                    comparison = ((metaA === null || metaA === void 0 ? void 0 : metaA.skillMdSize) || 0) - ((metaB === null || metaB === void 0 ? void 0 : metaB.skillMdSize) || 0);
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }, [skills, sortField, sortDirection]);
    var handleSort = function (field) {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortField(field);
            setSortDirection('desc');
        }
    };
    var handleRowClick = function (skill) {
        history.push(skill.path);
    };
    var getSortIndicator = function (field) {
        if (sortField !== field)
            return <span className={styles_module_css_1.default.sortIndicatorInactive}>◇</span>;
        return sortDirection === 'asc'
            ? <span className={styles_module_css_1.default.sortIndicator}>▲</span>
            : <span className={styles_module_css_1.default.sortIndicator}>▼</span>;
    };
    var sortLabels = {
        title: 'Name',
        category: 'Category',
        createdAt: 'Created',
        updatedAt: 'Updated',
        totalLines: 'Lines',
        skillMdSize: 'Size',
    };
    return (<div className={styles_module_css_1.default.container}>
      {/* Window Title Bar */}
      <div className={styles_module_css_1.default.titleBar}>
        <span className={styles_module_css_1.default.titleBarIcon}>📋</span>
        <span className={styles_module_css_1.default.titleBarText}>SKILLS.LST - {skills.length} items</span>
        <div className={styles_module_css_1.default.titleBarButtons}>
          <button className={styles_module_css_1.default.titleBarBtn}>─</button>
          <button className={styles_module_css_1.default.titleBarBtn}>□</button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className={styles_module_css_1.default.sortControls}>
        <span className={styles_module_css_1.default.sortLabel}>Sort by:</span>
        {['title', 'updatedAt', 'createdAt', 'totalLines', 'skillMdSize'].map(function (field) { return (<button key={field} className={"".concat(styles_module_css_1.default.sortBtn, " ").concat(sortField === field ? styles_module_css_1.default.sortBtnActive : '')} onClick={function () { return handleSort(field); }}>
            {sortLabels[field]} {sortField === field && (sortDirection === 'asc' ? '▲' : '▼')}
          </button>); })}
      </div>

      {/* Skills List with Hero Images */}
      <div className={styles_module_css_1.default.listContainer}>
        {sortedSkills.map(function (skill) {
            var meta = metadata[skill.id];
            return (<div key={skill.id} className={styles_module_css_1.default.skillRow} onClick={function () { return handleRowClick(skill); }}>
              {/* Hero Image Thumbnail */}
              <div className={styles_module_css_1.default.heroThumb}>
                <img src={"".concat(basePath, "/img/skills/").concat(skill.id, "-hero.png")} alt={skill.title} className={styles_module_css_1.default.heroImg}/>
                {skill.badge === 'NEW' && <span className={styles_module_css_1.default.badgeNew}>NEW!</span>}
                {skill.badge === 'UPDATED' && <span className={styles_module_css_1.default.badgeUpdated}>UPD</span>}
              </div>

              {/* Skill Info */}
              <div className={styles_module_css_1.default.skillInfo}>
                <div className={styles_module_css_1.default.skillHeader}>
                  <h3 className={styles_module_css_1.default.skillTitle}>{skill.title}</h3>
                  <span className={styles_module_css_1.default.skillCategory}>{skill.category}</span>
                </div>
                <p className={styles_module_css_1.default.skillDesc}>{skill.description}</p>
                <div className={styles_module_css_1.default.skillMeta}>
                  <span className={styles_module_css_1.default.metaItem} title="Last updated">
                    🕐 {getRelativeDate(meta === null || meta === void 0 ? void 0 : meta.updatedAt)}
                  </span>
                  <span className={styles_module_css_1.default.metaItem} title="Created">
                    📅 {formatDate(meta === null || meta === void 0 ? void 0 : meta.createdAt)}
                  </span>
                  <span className={styles_module_css_1.default.metaItem} title="Total lines of content">
                    📝 {formatLines((meta === null || meta === void 0 ? void 0 : meta.totalLines) || 0)} lines
                  </span>
                  <span className={styles_module_css_1.default.metaItem} title="SKILL.md size">
                    📦 {formatSize((meta === null || meta === void 0 ? void 0 : meta.skillMdSize) || 0)}
                  </span>
                  {(meta === null || meta === void 0 ? void 0 : meta.totalFiles) > 1 && (<span className={styles_module_css_1.default.metaItem} title="Number of files">
                      📁 {meta.totalFiles} files
                    </span>)}
                  {(meta === null || meta === void 0 ? void 0 : meta.hasReferences) && (<span className={styles_module_css_1.default.metaBadge} title="Has reference materials">
                      📚 refs
                    </span>)}
                </div>
              </div>

              {/* Action Arrow */}
              <div className={styles_module_css_1.default.skillAction}>
                →
              </div>
            </div>);
        })}
      </div>

      {/* Status Bar */}
      <div className={styles_module_css_1.default.statusBar}>
        <div className={styles_module_css_1.default.statusPanel}>
          {sortedSkills.length} skill(s)
        </div>
        <div className={styles_module_css_1.default.statusPanel}>
          Sorted by: {sortLabels[sortField]} ({sortDirection === 'asc' ? 'ascending' : 'descending'})
        </div>
        <div className={styles_module_css_1.default.statusPanel}>
          Click row to view details
        </div>
      </div>
    </div>);
}
