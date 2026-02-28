import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import McpGalleryCard from '../components/McpGalleryCard';
import McpDetailModal from '../components/McpDetailModal';
import type { McpServer } from '../types/mcp';
import { MCP_CATEGORIES } from '../types/mcp';
import { ALL_MCPS, searchMcps, filterMcpsByCategory } from '../data/mcps';
import '../css/win31.css';
import '../css/skills-gallery.css';
import '../css/backsplash.css';

export default function McpsGallery(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMcp, setSelectedMcp] = useState<McpServer | null>(null);

  const filteredMcps = useMemo(() => {
    let mcps = ALL_MCPS;

    // Filter by category
    if (selectedCategory !== 'all') {
      mcps = filterMcpsByCategory(selectedCategory, mcps);
    }

    // Filter by search
    if (searchQuery) {
      mcps = searchMcps(searchQuery, mcps);
    }

    return mcps;
  }, [selectedCategory, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <Layout
      title="MCP Gallery"
      description="Browse Model Context Protocol servers that extend Claude's capabilities"
    >
      <div className="skills-page-bg page-backsplash page-backsplash--mcps page-backsplash--medium">
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
                <input
                  type="text"
                  placeholder="Search MCPs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="win31-font search-input"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            {MCP_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="win31-push-button"
                style={{
                  fontSize: '14px',
                  padding: '10px 20px',
                  background: selectedCategory === category ? 'var(--win31-blue)' : 'var(--win31-gray)',
                  color: selectedCategory === category ? 'white' : 'black',
                  fontWeight: selectedCategory === category ? 'bold' : 'normal',
                }}
              >
                {category === 'all' ? 'All MCPs' : category}
              </button>
            ))}
          </div>

          {/* MCPs Grid */}
          <div className="skills-grid">
            {filteredMcps.map((mcp) => (
              <McpGalleryCard
                key={mcp.id}
                mcp={mcp}
                onClick={(mcp) => setSelectedMcp(mcp)}
              />
            ))}
          </div>

          {/* Detail Modal */}
          {selectedMcp && (
            <McpDetailModal
              mcp={selectedMcp}
              onClose={() => setSelectedMcp(null)}
            />
          )}

          {/* No Results */}
          {filteredMcps.length === 0 && (
            <div className="no-results">
              <h3 className="win31-font no-results__title">No MCPs found</h3>
              <p className="win31-font no-results__description">
                Try adjusting your search or category filter
              </p>
              <button
                className="win31-push-button"
                onClick={handleResetFilters}
                style={{ padding: '10px 20px' }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Call to Action */}
          <div className="win31-panel-box" style={{ marginTop: '40px', padding: '30px', textAlign: 'center' }}>
            <h2 className="win31-font" style={{ fontSize: '20px', color: 'var(--win31-navy)', marginBottom: '16px' }}>
              Want to contribute an MCP?
            </h2>
            <p className="win31-font" style={{ fontSize: '14px', color: '#333', marginBottom: '20px' }}>
              We're always looking for new MCP servers to feature. If you've built something useful,
              we'd love to showcase it here.
            </p>
            <a
              href="https://github.com/curiositech/some_claude_skills/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="win31-push-button"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                fontSize: '14px',
                textDecoration: 'none',
                background: 'var(--win31-navy)',
                color: 'white',
              }}
            >
              Submit Your MCP
            </a>
          </div>

          {/* Stats Footer */}
          <div className="win31-panel-box win31-panel-box--small-shadow" style={{ marginBottom: 0 }}>
            <div className="win31-statusbar" style={{ justifyContent: 'center', gap: '20px', padding: '20px' }}>
              <div className="win31-statusbar-panel">
                {filteredMcps.length} of {ALL_MCPS.length} MCPs shown
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
    </Layout>
  );
}
