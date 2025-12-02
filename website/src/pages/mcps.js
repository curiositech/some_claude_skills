"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = McpsGallery;
var react_1 = require("react");
var Layout_1 = require("@theme/Layout");
var McpGalleryCard_1 = require("../components/McpGalleryCard");
var McpDetailModal_1 = require("../components/McpDetailModal");
var mcp_1 = require("../types/mcp");
var mcps_1 = require("../data/mcps");
require("../css/win31.css");
require("../css/skills-gallery.css");
function McpsGallery() {
    var _a = (0, react_1.useState)('all'), selectedCategory = _a[0], setSelectedCategory = _a[1];
    var _b = (0, react_1.useState)(''), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = (0, react_1.useState)(null), selectedMcp = _c[0], setSelectedMcp = _c[1];
    var filteredMcps = (0, react_1.useMemo)(function () {
        var mcps = mcps_1.ALL_MCPS;
        // Filter by category
        if (selectedCategory !== 'all') {
            mcps = (0, mcps_1.filterMcpsByCategory)(selectedCategory, mcps);
        }
        // Filter by search
        if (searchQuery) {
            mcps = (0, mcps_1.searchMcps)(searchQuery, mcps);
        }
        return mcps;
    }, [selectedCategory, searchQuery]);
    var handleResetFilters = function () {
        setSelectedCategory('all');
        setSearchQuery('');
    };
    return (<Layout_1.default title="MCP Gallery" description="Browse Model Context Protocol servers that extend Claude's capabilities">
      <div className="skills-page-bg">
        <div className="skills-container">
          {/* Header */}
          <div className="win31-panel-box">
            <div className="section-header">
              <h1 className="win31-font hero-title" style={{ fontSize: '32px' }}>
                MCP Gallery
              </h1>
              <p className="win31-font" style={{ fontSize: '16px', textAlign: 'center', color: '#333', marginBottom: '20px' }}>
                Model Context Protocol servers that extend Claude's capabilities with new tools
              </p>

              {/* Search Bar */}
              <div className="search-container">
                <input type="text" placeholder="Search MCPs..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="win31-font search-input"/>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            {mcp_1.MCP_CATEGORIES.map(function (category) { return (<button key={category} onClick={function () { return setSelectedCategory(category); }} className="win31-push-button" style={{
                fontSize: '14px',
                padding: '10px 20px',
                background: selectedCategory === category ? 'var(--win31-blue)' : 'var(--win31-gray)',
                color: selectedCategory === category ? 'white' : 'black',
                fontWeight: selectedCategory === category ? 'bold' : 'normal',
            }}>
                {category === 'all' ? 'All MCPs' : category}
              </button>); })}
          </div>

          {/* MCPs Grid */}
          <div className="skills-grid">
            {filteredMcps.map(function (mcp) { return (<McpGalleryCard_1.default key={mcp.id} mcp={mcp} onClick={function (mcp) { return setSelectedMcp(mcp); }}/>); })}
          </div>

          {/* Detail Modal */}
          {selectedMcp && (<McpDetailModal_1.default mcp={selectedMcp} onClose={function () { return setSelectedMcp(null); }}/>)}

          {/* No Results */}
          {filteredMcps.length === 0 && (<div className="no-results">
              <h3 className="win31-font no-results__title">No MCPs found</h3>
              <p className="win31-font no-results__description">
                Try adjusting your search or category filter
              </p>
              <button className="win31-push-button" onClick={handleResetFilters} style={{ padding: '10px 20px' }}>
                Reset Filters
              </button>
            </div>)}

          {/* Call to Action */}
          <div className="win31-panel-box" style={{ marginTop: '40px', padding: '30px', textAlign: 'center' }}>
            <h2 className="win31-font" style={{ fontSize: '20px', color: 'var(--win31-navy)', marginBottom: '16px' }}>
              Want to contribute an MCP?
            </h2>
            <p className="win31-font" style={{ fontSize: '14px', color: '#333', marginBottom: '20px' }}>
              We're always looking for new MCP servers to feature. If you've built something useful,
              we'd love to showcase it here.
            </p>
            <a href="https://github.com/erichowens/some_claude_skills/issues/new" target="_blank" rel="noopener noreferrer" className="win31-push-button" style={{
            display: 'inline-block',
            padding: '12px 24px',
            fontSize: '14px',
            textDecoration: 'none',
            background: 'var(--win31-navy)',
            color: 'white',
        }}>
              Submit Your MCP
            </a>
          </div>

          {/* Stats Footer */}
          <div className="win31-panel-box win31-panel-box--small-shadow" style={{ marginBottom: 0 }}>
            <div className="win31-statusbar" style={{ justifyContent: 'center', gap: '20px', padding: '20px' }}>
              <div className="win31-statusbar-panel">
                {filteredMcps.length} of {mcps_1.ALL_MCPS.length} MCPs shown
              </div>
              <div className="win31-statusbar-panel">
                {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
              </div>
              <div className="win31-statusbar-panel">
                <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout_1.default>);
}
