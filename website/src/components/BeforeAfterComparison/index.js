"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BeforeAfterComparison;
var react_1 = require("react");
var diff_1 = require("diff");
var styles_module_css_1 = require("./styles.module.css");
function BeforeAfterComparison(_a) {
    var beforeContent = _a.beforeContent, afterContent = _a.afterContent, _b = _a.beforeLabel, beforeLabel = _b === void 0 ? 'Before' : _b, _c = _a.afterLabel, afterLabel = _c === void 0 ? 'After' : _c, _d = _a.language, language = _d === void 0 ? 'markdown' : _d, fileName = _a.fileName;
    var _e = (0, react_1.useState)('diff'), viewMode = _e[0], setViewMode = _e[1];
    // Compute diff with context
    var diffResult = (0, react_1.useMemo)(function () {
        return (0, diff_1.diffLines)(beforeContent, afterContent);
    }, [beforeContent, afterContent]);
    // Count additions and deletions
    var stats = (0, react_1.useMemo)(function () {
        var additions = 0;
        var deletions = 0;
        diffResult.forEach(function (part) {
            var lines = part.value.split('\n').filter(function (line) { return line !== ''; });
            if (part.added)
                additions += lines.length;
            if (part.removed)
                deletions += lines.length;
        });
        return { additions: additions, deletions: deletions };
    }, [diffResult]);
    return (<div className={styles_module_css_1.default.comparison}>
      <div className={styles_module_css_1.default.header}>
        <div className={styles_module_css_1.default.headerLeft}>
          <span className={styles_module_css_1.default.badge}>
            <span className={styles_module_css_1.default.addIcon}>+{stats.additions}</span>
            <span className={styles_module_css_1.default.removeIcon}>−{stats.deletions}</span>
          </span>
        </div>
        <div className={styles_module_css_1.default.viewModeToggle}>
          <button className={"".concat(styles_module_css_1.default.viewModeButton, " ").concat(viewMode === 'diff' ? styles_module_css_1.default.active : '')} onClick={function () { return setViewMode('diff'); }}>
            Diff View
          </button>
          <button className={"".concat(styles_module_css_1.default.viewModeButton, " ").concat(viewMode === 'split' ? styles_module_css_1.default.active : '')} onClick={function () { return setViewMode('split'); }}>
            Full Files
          </button>
        </div>
      </div>

      {viewMode === 'diff' ? (<div className={styles_module_css_1.default.diffView}>
          {diffResult.map(function (part, index) {
                var lines = part.value.split('\n').filter(function (line) { return line !== ''; });
                if (lines.length === 0)
                    return null;
                return (<div key={index}>
                {lines.map(function (line, lineIndex) {
                        var className = styles_module_css_1.default.contextLine;
                        var prefix = ' ';
                        if (part.added) {
                            className = styles_module_css_1.default.addedLine;
                            prefix = '+';
                        }
                        else if (part.removed) {
                            className = styles_module_css_1.default.removedLine;
                            prefix = '−';
                        }
                        return (<div key={"".concat(index, "-").concat(lineIndex)} className={className}>
                      <span className={styles_module_css_1.default.linePrefix}>{prefix}</span>
                      <span className={styles_module_css_1.default.lineContent}>{line}</span>
                    </div>);
                    })}
              </div>);
            })}
        </div>) : (<div className={styles_module_css_1.default.splitView}>
          <div className={styles_module_css_1.default.pane}>
            <div className={styles_module_css_1.default.paneHeader}>
              <span className={styles_module_css_1.default.paneLabel}>
                <span className={styles_module_css_1.default.beforeIcon}>−</span>
                {beforeLabel}
              </span>
              <span className={styles_module_css_1.default.lineCount}>
                {beforeContent.split('\n').length} lines
              </span>
            </div>
            <div className={styles_module_css_1.default.codeContainer}>
              <pre className={styles_module_css_1.default.codeBlock}>
                {beforeContent.split('\n').map(function (line, i) { return (<div key={i} className={styles_module_css_1.default.codeLine}>
                    <span className={styles_module_css_1.default.lineNumber}>{i + 1}</span>
                    <span className={styles_module_css_1.default.lineText}>{line}</span>
                  </div>); })}
              </pre>
            </div>
          </div>

          <div className={styles_module_css_1.default.pane}>
            <div className={styles_module_css_1.default.paneHeader}>
              <span className={styles_module_css_1.default.paneLabel}>
                <span className={styles_module_css_1.default.afterIcon}>+</span>
                {afterLabel}
              </span>
              <span className={styles_module_css_1.default.lineCount}>
                {afterContent.split('\n').length} lines
              </span>
            </div>
            <div className={styles_module_css_1.default.codeContainer}>
              <pre className={styles_module_css_1.default.codeBlock}>
                {afterContent.split('\n').map(function (line, i) { return (<div key={i} className={styles_module_css_1.default.codeLine}>
                    <span className={styles_module_css_1.default.lineNumber}>{i + 1}</span>
                    <span className={styles_module_css_1.default.lineText}>{line}</span>
                  </div>); })}
              </pre>
            </div>
          </div>
        </div>)}
    </div>);
}
