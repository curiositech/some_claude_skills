"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ValidationDemo;
var react_1 = require("react");
var ValidationDemo_module_css_1 = require("./ValidationDemo.module.css");
var examples = {
    liquid: "# Native App Designer\n\nCreate beautiful mobile experiences with Vue syntax:\n\n<template>\n  <li>{{ item.title }}</li>\n</template>\n\nThis will break MDX parsing!",
    brackets: "# Artifact Contribution Guide\n\n## Best Practices\n\n\u274C Include massive binary files (>10MB)\n\u274C Submit without testing (success rate <60%)\n\u2705 Keep images optimized (<500KB)\n\nQuick wins take <70 characters!",
    props: "---\ntitle: CV Creator\n---\n\n<SkillHeader\n  skillName=\"CV Creator\"\n  skillId=\"cv-creator\"\n  description=\"Professional resume builder\"\n/>\n\nThis component expects `fileName` not `skillId`!"
};
function ValidationDemo() {
    var _a = (0, react_1.useState)('liquid'), validationType = _a[0], setValidationType = _a[1];
    var _b = (0, react_1.useState)(examples.liquid), code = _b[0], setCode = _b[1];
    var _c = (0, react_1.useState)([]), errors = _c[0], setErrors = _c[1];
    var _d = (0, react_1.useState)(false), isValidating = _d[0], setIsValidating = _d[1];
    // Validation functions
    var validateLiquid = function (text) {
        var errors = [];
        var lines = text.split('\n');
        lines.forEach(function (line, idx) {
            var match = line.match(/\{\{[^`].*?\}\}/);
            if (match && !line.includes('{`{{')) {
                errors.push({
                    line: idx + 1,
                    message: "Unescaped Liquid syntax: \"".concat(match[0], "\""),
                    fix: "Wrap in MDX expression: {`".concat(match[0], "`}")
                });
            }
        });
        return errors;
    };
    var validateBrackets = function (text) {
        var errors = [];
        var lines = text.split('\n');
        lines.forEach(function (line, idx) {
            var lessThanMatch = line.match(/<(\d+)/);
            var greaterThanMatch = line.match(/>(\d+)/);
            if (lessThanMatch && !line.includes('&lt;')) {
                errors.push({
                    line: idx + 1,
                    message: "Unescaped angle bracket: \"".concat(lessThanMatch[0], "\""),
                    fix: lessThanMatch[0].replace('<', '&lt;')
                });
            }
            if (greaterThanMatch && !line.includes('&gt;')) {
                errors.push({
                    line: idx + 1,
                    message: "Unescaped angle bracket: \"".concat(greaterThanMatch[0], "\""),
                    fix: greaterThanMatch[0].replace('>', '&gt;')
                });
            }
        });
        return errors;
    };
    var validateProps = function (text) {
        var errors = [];
        var headerMatch = text.match(/<SkillHeader[\s\S]*?\/>/);
        if (headerMatch) {
            var headerText = headerMatch[0];
            var lines = text.split('\n');
            var lineNum = lines.findIndex(function (l) { return l.includes('<SkillHeader'); }) + 1;
            if (headerText.includes('skillId=')) {
                errors.push({
                    line: lineNum,
                    message: 'Uses "skillId" prop instead of "fileName"',
                    fix: 'Change skillId="..." to fileName="..."'
                });
            }
        }
        return errors;
    };
    // Run validation on code change
    (0, react_1.useEffect)(function () {
        setIsValidating(true);
        var timer = setTimeout(function () {
            var newErrors = [];
            switch (validationType) {
                case 'liquid':
                    newErrors = validateLiquid(code);
                    break;
                case 'brackets':
                    newErrors = validateBrackets(code);
                    break;
                case 'props':
                    newErrors = validateProps(code);
                    break;
            }
            setErrors(newErrors);
            setIsValidating(false);
        }, 500);
        return function () { return clearTimeout(timer); };
    }, [code, validationType]);
    var changeValidationType = function (type) {
        setValidationType(type);
        setCode(examples[type]);
    };
    return (<div className={ValidationDemo_module_css_1.default.container}>
      <div className={ValidationDemo_module_css_1.default.header}>
        <h2 className={ValidationDemo_module_css_1.default.title}>
          <span className={ValidationDemo_module_css_1.default.titleGradient}>Live Validation Demo</span>
        </h2>
        <p className={ValidationDemo_module_css_1.default.subtitle}>
          Edit the code below and see real-time validation feedback
        </p>
      </div>

      {/* Validation Type Selector */}
      <div className={ValidationDemo_module_css_1.default.validationTypes}>
        <button className={"".concat(ValidationDemo_module_css_1.default.typeButton, " ").concat(validationType === 'liquid' ? ValidationDemo_module_css_1.default.active : '')} onClick={function () { return changeValidationType('liquid'); }}>
          <span className={ValidationDemo_module_css_1.default.typeIcon}>💧</span>
          Liquid Syntax
        </button>
        <button className={"".concat(ValidationDemo_module_css_1.default.typeButton, " ").concat(validationType === 'brackets' ? ValidationDemo_module_css_1.default.active : '')} onClick={function () { return changeValidationType('brackets'); }}>
          <span className={ValidationDemo_module_css_1.default.typeIcon}>⟨⟩</span>
          Angle Brackets
        </button>
        <button className={"".concat(ValidationDemo_module_css_1.default.typeButton, " ").concat(validationType === 'props' ? ValidationDemo_module_css_1.default.active : '')} onClick={function () { return changeValidationType('props'); }}>
          <span className={ValidationDemo_module_css_1.default.typeIcon}>⚙️</span>
          Component Props
        </button>
      </div>

      {/* Editor and Output */}
      <div className={ValidationDemo_module_css_1.default.editorContainer}>
        {/* Code Editor */}
        <div className={ValidationDemo_module_css_1.default.editorPanel}>
          <div className={ValidationDemo_module_css_1.default.panelHeader}>
            <span className={ValidationDemo_module_css_1.default.panelTitle}>Editor</span>
            <span className={ValidationDemo_module_css_1.default.statusBadge}>
              {isValidating ? '⏳ Validating...' : errors.length === 0 ? '✅ Valid' : "\u274C ".concat(errors.length, " Error").concat(errors.length > 1 ? 's' : '')}
            </span>
          </div>
          <textarea className={ValidationDemo_module_css_1.default.codeEditor} value={code} onChange={function (e) { return setCode(e.target.value); }} spellCheck={false}/>
        </div>

        {/* Validation Output */}
        <div className={ValidationDemo_module_css_1.default.outputPanel}>
          <div className={ValidationDemo_module_css_1.default.panelHeader}>
            <span className={ValidationDemo_module_css_1.default.panelTitle}>Validation Output</span>
          </div>
          <div className={ValidationDemo_module_css_1.default.outputConsole}>
            {errors.length === 0 ? (<div className={ValidationDemo_module_css_1.default.successMessage}>
                <span className={ValidationDemo_module_css_1.default.successIcon}>✅</span>
                <span>No errors found! Code is valid.</span>
              </div>) : (<div className={ValidationDemo_module_css_1.default.errorsList}>
                {errors.map(function (error, idx) { return (<div key={idx} className={ValidationDemo_module_css_1.default.error}>
                    <div className={ValidationDemo_module_css_1.default.errorHeader}>
                      <span className={ValidationDemo_module_css_1.default.errorIcon}>❌</span>
                      <span className={ValidationDemo_module_css_1.default.errorLine}>Line {error.line}</span>
                    </div>
                    <div className={ValidationDemo_module_css_1.default.errorMessage}>{error.message}</div>
                    {error.fix && (<div className={ValidationDemo_module_css_1.default.errorFix}>
                        <span className={ValidationDemo_module_css_1.default.fixLabel}>Fix:</span> {error.fix}
                      </div>)}
                  </div>); })}
              </div>)}
          </div>
        </div>
      </div>

      {/* Installation CTA */}
      <div className={ValidationDemo_module_css_1.default.installSection}>
        <h3 className={ValidationDemo_module_css_1.default.installTitle}>Try It in Your Project</h3>
        <p className={ValidationDemo_module_css_1.default.installText}>
          Install the pre-commit hook to get this validation automatically:
        </p>
        <div className={ValidationDemo_module_css_1.default.codeBlock}>
          <code>cd website && npm run install-hooks</code>
        </div>
        <p className={ValidationDemo_module_css_1.default.installNote}>
          Now these errors will be caught before you even commit! 🎉
        </p>
      </div>
    </div>);
}
