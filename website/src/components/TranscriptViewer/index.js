"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TranscriptViewer;
var react_1 = require("react");
var react_markdown_1 = require("react-markdown");
var react_syntax_highlighter_1 = require("react-syntax-highlighter");
var prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
var styles_module_css_1 = require("./styles.module.css");
function TranscriptViewer(_a) {
    var transcriptContent = _a.transcriptContent, _b = _a.title, title = _b === void 0 ? 'Conversation Transcript' : _b;
    var _c = (0, react_1.useState)(false), isExpanded = _c[0], setIsExpanded = _c[1];
    return (<div className={styles_module_css_1.default.transcriptViewer}>
      <div className={styles_module_css_1.default.header}>
        <div className={styles_module_css_1.default.headerLeft}>
          <h2 className={styles_module_css_1.default.title}>{title}</h2>
          <span className={styles_module_css_1.default.badge}>📝 Full Transcript</span>
        </div>
        <button className={styles_module_css_1.default.toggleButton} onClick={function () { return setIsExpanded(!isExpanded); }} aria-label={isExpanded ? 'Collapse transcript' : 'Expand transcript'}>
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className={"".concat(styles_module_css_1.default.content, " ").concat(isExpanded ? styles_module_css_1.default.expanded : styles_module_css_1.default.collapsed)}>
        <div className={styles_module_css_1.default.markdown}>
          <react_markdown_1.default components={{
            code: function (_a) {
                var node = _a.node, inline = _a.inline, className = _a.className, children = _a.children, props = __rest(_a, ["node", "inline", "className", "children"]);
                var match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (<react_syntax_highlighter_1.Prism style={prism_1.vs} language={match[1]} PreTag="div" className={styles_module_css_1.default.codeBlock} {...props}>
                  {String(children).replace(/\n$/, '')}
                </react_syntax_highlighter_1.Prism>) : (<code className={styles_module_css_1.default.inlineCode} {...props}>
                  {children}
                </code>);
            },
            h1: function (_a) {
                var children = _a.children;
                return <h1 className={styles_module_css_1.default.h1}>{children}</h1>;
            },
            h2: function (_a) {
                var children = _a.children;
                return <h2 className={styles_module_css_1.default.h2}>{children}</h2>;
            },
            h3: function (_a) {
                var children = _a.children;
                return <h3 className={styles_module_css_1.default.h3}>{children}</h3>;
            },
            h4: function (_a) {
                var children = _a.children;
                return <h4 className={styles_module_css_1.default.h4}>{children}</h4>;
            },
            p: function (_a) {
                var children = _a.children;
                return <p className={styles_module_css_1.default.paragraph}>{children}</p>;
            },
            ul: function (_a) {
                var children = _a.children;
                return <ul className={styles_module_css_1.default.list}>{children}</ul>;
            },
            ol: function (_a) {
                var children = _a.children;
                return <ol className={styles_module_css_1.default.orderedList}>{children}</ol>;
            },
            blockquote: function (_a) {
                var children = _a.children;
                return (<blockquote className={styles_module_css_1.default.blockquote}>{children}</blockquote>);
            },
            strong: function (_a) {
                var children = _a.children;
                return <strong className={styles_module_css_1.default.strong}>{children}</strong>;
            },
            em: function (_a) {
                var children = _a.children;
                return <em className={styles_module_css_1.default.emphasis}>{children}</em>;
            },
        }}>
            {transcriptContent}
          </react_markdown_1.default>
        </div>
      </div>

      {!isExpanded && (<div className={styles_module_css_1.default.expandPrompt}>
          <button className={styles_module_css_1.default.expandButton} onClick={function () { return setIsExpanded(true); }}>
            Read Full Transcript →
          </button>
        </div>)}
    </div>);
}
