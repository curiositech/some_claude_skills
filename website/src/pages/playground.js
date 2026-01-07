"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlaygroundPage;
var react_1 = require("react");
var Layout_1 = require("@theme/Layout");
var playground_module_css_1 = require("./playground.module.css");
var examplePrompts = {
    'Web Design Expert': [
        'Create a brand identity for a meditation app called "Zenith" for busy professionals.',
        'Design a unique visual style for a sustainable fashion e-commerce platform.',
        'Develop a color palette and typography system for a fintech startup.',
    ],
    'Design System Creator': [
        'Build a comprehensive design system with design tokens and component library.',
        'Create production-ready CSS architecture using BEM methodology.',
        'Document spacing, typography, and color systems for a design team.',
    ],
    'Research Analyst': [
        'Research current trends in AI-powered productivity tools.',
        'Analyze competitive landscape for meditation apps.',
        'Investigate best practices for onboarding flows in SaaS products.',
    ],
    'Orchestrator': [
        'I\'m building a meditation app called "Zenith" for busy professionals. I want a unique design (not cliché), complete design system, and a team plan to build it.',
        'Create a comprehensive strategy for launching a sustainable fashion marketplace.',
        'Design and plan development for an ADHD-friendly productivity app.',
    ],
};
var skills = [
    'Web Design Expert',
    'Design System Creator',
    'Native App Designer',
    'Research Analyst',
    'Team Builder',
    'ADHD Design Expert',
    'Orchestrator',
];
function PlaygroundPage() {
    var _a = (0, react_1.useState)('Orchestrator'), selectedSkill = _a[0], setSelectedSkill = _a[1];
    var _b = (0, react_1.useState)(examplePrompts['Orchestrator'][0]), prompt = _b[0], setPrompt = _b[1];
    var handleSkillChange = function (skill) {
        setSelectedSkill(skill);
        if (examplePrompts[skill] && examplePrompts[skill].length > 0) {
            setPrompt(examplePrompts[skill][0]);
        }
        else {
            setPrompt('');
        }
    };
    var loadExamplePrompt = function (example) {
        setPrompt(example);
    };
    return (<Layout_1.default title="Interactive Playground" description="Test Claude Skills with example prompts and see how they work">
      <div className={playground_module_css_1.default.playgroundPage}>
        <div className={playground_module_css_1.default.hero}>
          <div className="container">
            <h1 className={playground_module_css_1.default.heroTitle}>Interactive Playground</h1>
            <p className={playground_module_css_1.default.heroSubtitle}>
              Test Claude Skills with example prompts and learn how to use them effectively
            </p>
          </div>
        </div>

        <div className="container">
          <div className={playground_module_css_1.default.playgroundContainer}>
            <div className={playground_module_css_1.default.sidebar}>
              <h3 className={playground_module_css_1.default.sidebarTitle}>Select a Skill</h3>
              <div className={playground_module_css_1.default.skillList}>
                {skills.map(function (skill) { return (<button key={skill} className={"".concat(playground_module_css_1.default.skillButton, " ").concat(selectedSkill === skill ? playground_module_css_1.default.skillButtonActive : '')} onClick={function () { return handleSkillChange(skill); }}>
                    {skill}
                  </button>); })}
              </div>

              {examplePrompts[selectedSkill] && (<div className={playground_module_css_1.default.examplesSection}>
                  <h3 className={playground_module_css_1.default.sidebarTitle}>Example Prompts</h3>
                  <div className={playground_module_css_1.default.exampleList}>
                    {examplePrompts[selectedSkill].map(function (example, index) { return (<button key={index} className={playground_module_css_1.default.exampleButton} onClick={function () { return loadExamplePrompt(example); }}>
                        Example {index + 1}
                      </button>); })}
                  </div>
                </div>)}
            </div>

            <div className={playground_module_css_1.default.mainContent}>
              <div className={playground_module_css_1.default.promptSection}>
                <label htmlFor="prompt" className={playground_module_css_1.default.label}>
                  Your Prompt
                </label>
                <textarea id="prompt" className={playground_module_css_1.default.promptInput} value={prompt} onChange={function (e) { return setPrompt(e.target.value); }} placeholder={"Enter your prompt for ".concat(selectedSkill, "...")} rows={8}/>
              </div>

              <div className={playground_module_css_1.default.infoBox}>
                <h3 className={playground_module_css_1.default.infoTitle}>💡 How to Use</h3>
                <ol className={playground_module_css_1.default.infoList}>
                  <li>Select a skill from the sidebar</li>
                  <li>Choose an example prompt or write your own</li>
                  <li>Copy the prompt below</li>
                  <li>
                    Use it in your Claude conversation by referencing the skill file from{' '}
                    <code>.github/agents/</code>
                  </li>
                </ol>
              </div>

              <div className={playground_module_css_1.default.outputSection}>
                <label className={playground_module_css_1.default.label}>Formatted Prompt for Claude</label>
                <div className={playground_module_css_1.default.output}>
                  <div className={playground_module_css_1.default.outputHeader}>
                    <span className={playground_module_css_1.default.outputTitle}>📋 Copy this to Claude:</span>
                    <button className={playground_module_css_1.default.copyButton} onClick={function () {
            var text = "[Using ".concat(selectedSkill, "]\n\n").concat(prompt);
            navigator.clipboard.writeText(text);
        }}>
                      Copy
                    </button>
                  </div>
                  <pre className={playground_module_css_1.default.outputContent}>
                    {"[Using ".concat(selectedSkill, "]\n\n").concat(prompt)}
                  </pre>
                </div>
              </div>

              <div className={playground_module_css_1.default.tipsSection}>
                <h3 className={playground_module_css_1.default.tipsTitle}>✨ Tips for Best Results</h3>
                <ul className={playground_module_css_1.default.tipsList}>
                  <li>Be specific about your goals and requirements</li>
                  <li>Provide context about your project or use case</li>
                  <li>Use the Orchestrator for complex, multi-domain problems</li>
                  <li>Combine multiple skills for comprehensive solutions</li>
                  <li>Reference existing work or examples when relevant</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout_1.default>);
}
