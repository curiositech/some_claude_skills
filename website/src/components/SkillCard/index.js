"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SkillCard;
var react_1 = require("react");
var Link_1 = require("@docusaurus/Link");
var styles_module_css_1 = require("./styles.module.css");
function SkillCard(_a) {
    var skill = _a.skill;
    return (<div className={styles_module_css_1.default.skillCard}>
      <div className={styles_module_css_1.default.skillHeader}>
        {skill.icon && <div className={styles_module_css_1.default.skillIcon}>{skill.icon}</div>}
        <h3 className={styles_module_css_1.default.skillTitle}>
          <Link_1.default to={skill.path} className={styles_module_css_1.default.skillLink}>
            {skill.title}
          </Link_1.default>
        </h3>
      </div>

      <div className={styles_module_css_1.default.skillCategory}>{skill.category}</div>

      <p className={styles_module_css_1.default.skillDescription}>{skill.description}</p>

      {skill.tags && skill.tags.length > 0 && (<div className={styles_module_css_1.default.skillTags}>
          {skill.tags.map(function (tag, index) { return (<span key={index} className={styles_module_css_1.default.skillTag}>
              {tag}
            </span>); })}
        </div>)}

      <Link_1.default to={skill.path} className={styles_module_css_1.default.skillButton}>
        Learn More →
      </Link_1.default>
    </div>);
}
