"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PhaseTimeline;
var react_1 = require("react");
var Link_1 = require("@docusaurus/Link");
var styles_module_css_1 = require("./styles.module.css");
function PhaseTimeline(_a) {
    var phases = _a.phases;
    return (<div className={styles_module_css_1.default.timeline}>
      {phases.map(function (phase, index) { return (<div key={index} className={styles_module_css_1.default.phaseContainer}>
          <div className={styles_module_css_1.default.phase}>
            <div className={styles_module_css_1.default.phaseHeader}>
              <div className={styles_module_css_1.default.phaseNumber}>
                <span className={styles_module_css_1.default.number}>{index + 1}</span>
              </div>
              <div className={styles_module_css_1.default.phaseInfo}>
                <h3 className={styles_module_css_1.default.phaseName}>{phase.name}</h3>
                {phase.duration && (<span className={styles_module_css_1.default.phaseDuration}>{phase.duration}</span>)}
              </div>
            </div>

            <div className={styles_module_css_1.default.phaseContent}>
              {phase.skills && phase.skills.length > 0 && (<div className={styles_module_css_1.default.skillsInvolved}>
                  <div className={styles_module_css_1.default.skillsLabel}>Skills Involved:</div>
                  <div className={styles_module_css_1.default.skillsList}>
                    {phase.skills.map(function (skillName, skillIndex) {
                    // All skill doc files use underscores in the path
                    var skillPath = skillName.replace(/-/g, '_');
                    return (<Link_1.default key={skillIndex} to={"/docs/skills/".concat(skillPath)} className={styles_module_css_1.default.skillBadge}>
                          {skillName}
                        </Link_1.default>);
                })}
                  </div>
                </div>)}

              <div className={styles_module_css_1.default.phaseOutcome}>
                <div className={styles_module_css_1.default.outcomeLabel}>Outcome:</div>
                <p className={styles_module_css_1.default.outcomeText}>{phase.outcome}</p>
              </div>
            </div>
          </div>

          {index < phases.length - 1 && (<div className={styles_module_css_1.default.connector}>
              <div className={styles_module_css_1.default.connectorLine}/>
              <div className={styles_module_css_1.default.connectorArrow}>↓</div>
            </div>)}
        </div>); })}
    </div>);
}
