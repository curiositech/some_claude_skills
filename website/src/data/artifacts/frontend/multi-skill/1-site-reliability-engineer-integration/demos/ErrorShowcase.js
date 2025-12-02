"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorShowcase;
var react_1 = require("react");
var react_syntax_highlighter_1 = require("react-syntax-highlighter");
var prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
var ErrorShowcase_module_css_1 = require("./ErrorShowcase.module.css");
var errorExamples = [
    {
        id: 'liquid',
        name: 'Liquid Template Syntax',
        before: "<template>\n  <li>{{ item.title }}</li>\n</template>",
        after: "<template>\n  <li>{`{{ item.title }}`}</li>\n</template>",
        errorLine: 2,
        fixLine: 2,
        validationOutput: "\u274C native_app_designer.md:\n   Line 2: \"{{ item.title }}\"\n   Fix: {`{{ item.title }}`}"
    },
    {
        id: 'brackets',
        name: 'Angle Brackets',
        before: "\u274C Include massive binary files (>10MB)\n\u274C Submit without testing preview locally",
        after: "\u274C Include massive binary files (&gt;10MB)\n\u274C Submit without testing preview locally",
        errorLine: 1,
        fixLine: 1,
        validationOutput: "\u274C artifact-contribution-guide.md:\n   Line 660: \">10\" \u2192 \"&gt;10\"\n\nReplace < with &lt; and > with &gt; in markdown text"
    },
    {
        id: 'props',
        name: 'SkillHeader Props',
        before: "<SkillHeader\n  skillName=\"CV Creator\"\n  skillId=\"cv-creator\"\n  description=\"Professional resume builder...\"\n/>",
        after: "<SkillHeader\n  skillName=\"CV Creator\"\n  fileName=\"cv-creator\"\n  description=\"Professional resume builder...\"\n/>",
        errorLine: 3,
        fixLine: 3,
        validationOutput: "\u274C cv_creator.md:\n   Line 13: Uses \"skillId\" prop instead of \"fileName\"\n   Fix: Change skillId=\"...\" to fileName=\"...\""
    }
];
function ErrorShowcase() {
    var _a = (0, react_1.useState)(errorExamples[0]), selectedExample = _a[0], setSelectedExample = _a[1];
    return (<div className={ErrorShowcase_module_css_1.default.container}>
      <div className={ErrorShowcase_module_css_1.default.header}>
        <h2 className={ErrorShowcase_module_css_1.default.title}>Error Showcase: Before & After</h2>
        <p className={ErrorShowcase_module_css_1.default.subtitle}>Real errors caught by the validation system with fixes applied.</p>
      </div>

      {/* Tab Navigation */}
      <div className={ErrorShowcase_module_css_1.default.tabNavigation}>
        {errorExamples.map(function (example) { return (<button key={example.id} onClick={function () { return setSelectedExample(example); }} className={"".concat(ErrorShowcase_module_css_1.default.tabButton, " ").concat(selectedExample.id === example.id ? ErrorShowcase_module_css_1.default.active : '')}>
            {example.name}
          </button>); })}
      </div>

      {/* Before/After Comparison */}
      <div className={ErrorShowcase_module_css_1.default.comparison}>
        {/* Before */}
        <div className={ErrorShowcase_module_css_1.default.comparePanel}>
          <div className={"".concat(ErrorShowcase_module_css_1.default.panelHeader, " ").concat(ErrorShowcase_module_css_1.default.beforeHeader)}>
            <span className={ErrorShowcase_module_css_1.default.errorIcon}>❌</span>
            Before (Error)
          </div>
          <div className={ErrorShowcase_module_css_1.default.codeContainer}>
            <react_syntax_highlighter_1.Prism language="jsx" style={prism_1.prism} className={ErrorShowcase_module_css_1.default.codeBlock} customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#ffffff',
            borderRadius: 0
        }}>
              {selectedExample.before}
            </react_syntax_highlighter_1.Prism>
            <div className={"".concat(ErrorShowcase_module_css_1.default.lineHighlight, " ").concat(ErrorShowcase_module_css_1.default.errorLine)} style={{
            top: "".concat(selectedExample.errorLine * 24 + 16, "px")
        }}/>
          </div>
        </div>

        {/* After */}
        <div className={ErrorShowcase_module_css_1.default.comparePanel}>
          <div className={"".concat(ErrorShowcase_module_css_1.default.panelHeader, " ").concat(ErrorShowcase_module_css_1.default.afterHeader)}>
            <span className={ErrorShowcase_module_css_1.default.successIcon}>✅</span>
            After (Fixed)
          </div>
          <div className={ErrorShowcase_module_css_1.default.codeContainer}>
            <react_syntax_highlighter_1.Prism language="jsx" style={prism_1.prism} className={ErrorShowcase_module_css_1.default.codeBlock} customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#ffffff',
            borderRadius: 0
        }}>
              {selectedExample.after}
            </react_syntax_highlighter_1.Prism>
            <div className={"".concat(ErrorShowcase_module_css_1.default.lineHighlight, " ").concat(ErrorShowcase_module_css_1.default.fixLine)} style={{
            top: "".concat(selectedExample.fixLine * 24 + 16, "px")
        }}/>
          </div>
        </div>
      </div>

      {/* Validation Output */}
      <div className={ErrorShowcase_module_css_1.default.validationSection}>
        <h3 className={ErrorShowcase_module_css_1.default.sectionTitle}>Validation Output</h3>
        <div className={ErrorShowcase_module_css_1.default.validationOutput}>
          {selectedExample.validationOutput}
        </div>
      </div>

      {/* Try It Section */}
      <div className={ErrorShowcase_module_css_1.default.tryItSection}>
        <h3 className={ErrorShowcase_module_css_1.default.tryItTitle}>Try It Yourself</h3>
        <p className={ErrorShowcase_module_css_1.default.tryItText}>
          Install the pre-commit hook to catch these errors automatically:
        </p>
        <div className={ErrorShowcase_module_css_1.default.commandBlock}>
          cd website<br />
          npm run install-hooks
        </div>
        <p className={ErrorShowcase_module_css_1.default.tryItText}>
          Now when you commit, the validation will run automatically and prevent these errors from breaking your build!
        </p>
      </div>
    </div>);
}
