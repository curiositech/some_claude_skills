"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = McpGalleryCard;
var react_1 = require("react");
var Link_1 = require("@docusaurus/Link");
var mcp_1 = require("../../types/mcp");
var useHoverLift_1 = require("../../hooks/useHoverLift");
var styles_module_css_1 = require("./styles.module.css");
function McpGalleryCard(_a) {
    var mcp = _a.mcp, onClick = _a.onClick;
    var _b = (0, react_1.useState)(false), expanded = _b[0], setExpanded = _b[1];
    var hoverHandlers = (0, useHoverLift_1.useHoverLift)(useHoverLift_1.HOVER_CONFIGS.card);
    var statusConfig = mcp_1.MCP_STATUS_CONFIG[mcp.status];
    var handleCardClick = function () {
        if (onClick) {
            onClick(mcp);
        }
        else {
            setExpanded(!expanded);
        }
    };
    return (<div className={styles_module_css_1.default.mcpCard} onClick={handleCardClick} {...hoverHandlers}>
      {/* Header with icon and badges */}
      <div className={styles_module_css_1.default.header}>
        <span className={styles_module_css_1.default.icon}>{mcp.icon || '🔌'}</span>
        <div className={styles_module_css_1.default.badges}>
          {mcp.badge === 'FEATURED' && (<span className={styles_module_css_1.default.featuredBadge}>★ FEATURED</span>)}
          {mcp.badge === 'NEW' && (<span className={styles_module_css_1.default.newBadge}>NEW!</span>)}
          <span className={styles_module_css_1.default.statusBadge} style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Hero image if available */}
      {mcp.heroImage && (<div className={styles_module_css_1.default.heroContainer}>
          <img src={mcp.heroImage} alt={mcp.name} className={styles_module_css_1.default.heroImage}/>
        </div>)}

      {/* Content */}
      <div className={styles_module_css_1.default.content}>
        <h3 className={"win31-font ".concat(styles_module_css_1.default.title)}>{mcp.name}</h3>
        <p className={"win31-font ".concat(styles_module_css_1.default.description)}>{mcp.description}</p>

        {/* Tools preview */}
        <div className={styles_module_css_1.default.toolsPreview}>
          <span className={"win31-font ".concat(styles_module_css_1.default.toolsLabel)}>Tools:</span>
          <div className={styles_module_css_1.default.toolsList}>
            {mcp.tools.slice(0, 3).map(function (tool, idx) { return (<span key={idx} className={styles_module_css_1.default.toolBadge}>
                {tool.name}
              </span>); })}
            {mcp.tools.length > 3 && (<span className={styles_module_css_1.default.toolBadge}>+{mcp.tools.length - 3} more</span>)}
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (<div className={styles_module_css_1.default.expandedContent}>
            {mcp.longDescription && (<p className={"win31-font ".concat(styles_module_css_1.default.longDescription)}>
                {mcp.longDescription}
              </p>)}

            {/* All tools */}
            <div className={styles_module_css_1.default.allTools}>
              <h4 className="win31-font">All Tools</h4>
              {mcp.tools.map(function (tool, idx) { return (<div key={idx} className={styles_module_css_1.default.toolDetail}>
                  <code>{tool.name}</code>
                  <span>{tool.description}</span>
                </div>); })}
            </div>

            {/* Requirements */}
            {mcp.requirements && mcp.requirements.length > 0 && (<div className={styles_module_css_1.default.requirements}>
                <h4 className="win31-font">Requirements</h4>
                <ul>
                  {mcp.requirements.map(function (req, idx) { return (<li key={idx}>{req}</li>); })}
                </ul>
              </div>)}
          </div>)}

        {/* Footer with links */}
        <div className={styles_module_css_1.default.footer}>
          <div className={styles_module_css_1.default.meta}>
            <span className={styles_module_css_1.default.author}>by {mcp.author}</span>
            {mcp.version && <span className={styles_module_css_1.default.version}>v{mcp.version}</span>}
          </div>
          <div className={styles_module_css_1.default.links} onClick={function (e) { return e.stopPropagation(); }}>
            <a href={mcp.githubUrl} target="_blank" rel="noopener noreferrer" className={styles_module_css_1.default.link} title="View on GitHub">
              GitHub
            </a>
            {mcp.docsUrl && (<Link_1.default to={mcp.docsUrl} className={styles_module_css_1.default.link}>
                Docs
              </Link_1.default>)}
          </div>
        </div>

        {/* Expand hint */}
        <div className={styles_module_css_1.default.expandHint}>
          {expanded ? 'Click to collapse' : 'Click for details'}
        </div>
      </div>
    </div>);
}
