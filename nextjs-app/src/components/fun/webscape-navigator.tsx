'use client';

import React, { useState, useCallback } from 'react';
import styles from './webscape-navigator.module.css';

interface WebscapeNavigatorProps {
  onSearch?: (query: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export function WebscapeNavigator({ onSearch, isVisible, onClose }: WebscapeNavigatorProps) {
  const [url, setUrl] = useState('http://www.dagoogle.com/');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEngine, setSearchEngine] = useState<'dagoogle' | 'dageeves'>('dagoogle');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock search results based on query
    const mockResults = [
      `🤖 AI Agent for "${searchQuery}"`,
      `📝 Documentation: How to ${searchQuery}`,
      `🛠️ Tool: ${searchQuery} automation`,
      `🎯 Skill Bundle: ${searchQuery} essentials`,
      `📚 Tutorial: Getting started with ${searchQuery}`,
    ];
    
    setSearchResults(mockResults);
    setIsSearching(false);
    
    if (onSearch) {
      onSearch(searchQuery);
    }
  }, [searchQuery, onSearch]);
  
  if (!isVisible) return null;
  
  return (
    <div className={styles.browserWindow}>
      {/* Title Bar */}
      <div className={styles.titleBar}>
        <span>🌐 Webscape Navigator 3.0</span>
        <div className={styles.windowControls}>
          <button onClick={() => {}}>_</button>
          <button onClick={() => {}}>□</button>
          <button onClick={onClose}>×</button>
        </div>
      </div>
      
      {/* Menu Bar */}
      <div className={styles.menuBar}>
        <button className={styles.menuItem}>
          <span className={styles.underline}>F</span>ile
        </button>
        <button className={styles.menuItem}>
          <span className={styles.underline}>E</span>dit
        </button>
        <button className={styles.menuItem}>
          <span className={styles.underline}>V</span>iew
        </button>
        <button className={styles.menuItem}>
          <span className={styles.underline}>G</span>o
        </button>
        <button className={styles.menuItem}>
          <span className={styles.underline}>B</span>ookmarks
        </button>
        <button className={styles.menuItem}>
          <span className={styles.underline}>H</span>elp
        </button>
      </div>
      
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button className={styles.toolButton} title="Back">◀</button>
        <button className={styles.toolButton} title="Forward">▶</button>
        <button className={styles.toolButton} title="Reload">🔄</button>
        <button className={styles.toolButton} title="Home">🏠</button>
        <button className={styles.toolButton} title="Search">🔍</button>
        <button className={styles.toolButton} title="Print">🖨️</button>
      </div>
      
      {/* Address Bar */}
      <div className={styles.addressBar}>
        <span className={styles.addressLabel}>Location:</span>
        <input 
          type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          className={styles.addressInput}
        />
        <button className={styles.goButton}>Go</button>
      </div>
      
      {/* Content Area */}
      <div className={styles.content}>
        {/* Search Engine Selection */}
        <div className={styles.searchEngineToggle}>
          <button 
            className={`${styles.engineButton} ${searchEngine === 'dagoogle' ? styles.active : ''}`}
            onClick={() => setSearchEngine('dagoogle')}
          >
            <span className={styles.dagoogleLogo}>
              <span style={{ color: '#4285F4' }}>D</span>
              <span style={{ color: '#EA4335' }}>a</span>
              <span style={{ color: '#FBBC05' }}>g</span>
              <span style={{ color: '#4285F4' }}>o</span>
              <span style={{ color: '#34A853' }}>o</span>
              <span style={{ color: '#EA4335' }}>g</span>
              <span style={{ color: '#4285F4' }}>l</span>
              <span style={{ color: '#34A853' }}>e</span>
            </span>
          </button>
          <button 
            className={`${styles.engineButton} ${searchEngine === 'dageeves' ? styles.active : ''}`}
            onClick={() => setSearchEngine('dageeves')}
          >
            <span className={styles.dageevesLogo}>Ask Dageeves!</span>
          </button>
        </div>
        
        {/* Main Search Logo */}
        <div className={styles.searchLogo}>
          {searchEngine === 'dagoogle' ? (
            <div className={styles.dagoogleMain}>
              <span style={{ color: '#4285F4', fontSize: '48px' }}>D</span>
              <span style={{ color: '#EA4335', fontSize: '48px' }}>a</span>
              <span style={{ color: '#FBBC05', fontSize: '48px' }}>g</span>
              <span style={{ color: '#4285F4', fontSize: '48px' }}>o</span>
              <span style={{ color: '#34A853', fontSize: '48px' }}>o</span>
              <span style={{ color: '#EA4335', fontSize: '48px' }}>g</span>
              <span style={{ color: '#4285F4', fontSize: '48px' }}>l</span>
              <span style={{ color: '#34A853', fontSize: '48px' }}>e</span>
            </div>
          ) : (
            <div className={styles.dageevesMain}>
              <div className={styles.dageevesButler}>🎩</div>
              <div className={styles.dageevesTitle}>Ask Dageeves!</div>
              <div className={styles.dageevesTagline}>The Question is the Answer™</div>
            </div>
          )}
        </div>
        
        {/* Search Box */}
        <div className={styles.searchBox}>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={searchEngine === 'dagoogle' ? 'Search for Claude skills...' : 'Ask me anything about AI...'}
            className={styles.searchInput}
          />
          <button 
            onClick={handleSearch}
            className={styles.searchButton}
            disabled={isSearching}
          >
            {isSearching ? '...' : searchEngine === 'dagoogle' ? 'Dagoogle Search' : 'Ask!'}
          </button>
          <button className={styles.luckyButton}>
            {searchEngine === 'dagoogle' ? "I'm Feeling Lucky" : "Just Find It"}
          </button>
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              {searchEngine === 'dagoogle' ? 'Dagoogle Results' : 'Dageeves Found'}:
            </div>
            {searchResults.map((result, i) => (
              <div key={i} className={styles.resultItem}>
                <a href="#" className={styles.resultLink}>{result}</a>
                <div className={styles.resultUrl}>
                  http://someclaudeskills.com/skills/{searchQuery.toLowerCase().replace(/\s+/g, '-')}
                </div>
                <div className={styles.resultSnippet}>
                  Learn how to enhance your Claude AI workflow with {searchQuery} capabilities...
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Scrolling Ad Banner */}
        <div className={styles.adBanner}>
          <div className={styles.marqueeContent}>
            🌟 NEW! Build your own Claude skills at someclaudeskills.com! 
            🎯 Over 170+ skills available! 
            🚀 Join the AI revolution! 
            💡 winDAGs.AI - Orchestrate your AI workflows! 
            ⚡ Claude + MCP = Unlimited Power!
          </div>
        </div>
        
        {/* Status Bar */}
        <div className={styles.statusBar}>
          <span>🔒 Document: Done</span>
          <span>|</span>
          <span>🌐 Zone: Internet</span>
        </div>
      </div>
    </div>
  );
}
