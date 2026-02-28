import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import changelogData from '../data/changelog.json';
import '../css/win31.css';

type ChangelogItem = {
  date: string;
  hash: string;
  type: string;
  scope: string | null;
  description: string;
  category: string;
  skillCount: number | null;
};

type ChangelogEntry = {
  date: string;
  items: ChangelogItem[];
};

type ChangelogData = {
  generated: string;
  totalEntries: number;
  entries: ChangelogEntry[];
};

const changelog = changelogData as ChangelogData;

const TYPE_ICONS: Record<string, string> = {
  feat: '✨',
  fix: '🔧',
  add: '➕',
  perf: '⚡',
  refactor: '♻️',
  other: '📝',
};

const TYPE_LABELS: Record<string, string> = {
  feat: 'Feature',
  fix: 'Fix',
  add: 'Addition',
  perf: 'Performance',
  refactor: 'Refactor',
  other: 'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  skills: '#00ff00',
  ui: '#00ffff',
  features: '#ffff00',
  fixes: '#ff00ff',
  performance: '#00cc00',
  infra: '#888888',
  other: '#aaaaaa',
};

const CATEGORY_LABELS: Record<string, string> = {
  skills: 'Skills',
  ui: 'UI/UX',
  features: 'Features',
  fixes: 'Bug Fixes',
  performance: 'Performance',
  infra: 'Infrastructure',
  other: 'Other',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default function Changelog(): JSX.Element {
  const [filter, setFilter] = useState<string>('all');
  const categories = ['all', ...Object.keys(CATEGORY_LABELS)];

  // Count items per category
  const categoryCounts: Record<string, number> = { all: 0 };
  for (const entry of changelog.entries) {
    for (const item of entry.items) {
      categoryCounts.all++;
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }
  }

  // Filter entries
  const filteredEntries = changelog.entries
    .map(entry => ({
      ...entry,
      items: filter === 'all'
        ? entry.items
        : entry.items.filter(item => item.category === filter),
    }))
    .filter(entry => entry.items.length > 0);

  return (
    <Layout
      title="Changelog"
      description="See what's new in Some Claude Skills - new skills, features, and improvements"
    >
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="skills-page-bg page-backsplash page-backsplash--changelog page-backsplash--medium">
        <div className="skills-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
          {/* Header */}
          <div className="win31-window" style={{ marginBottom: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">CHANGELOG.TXT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">▲</div>
                <div className="win31-btn-3d win31-btn-3d--small">▼</div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <h1 style={{ margin: 0, fontSize: '28px', marginBottom: '8px' }}>Changelog</h1>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {changelog.totalEntries} updates since November 2025 •
                Last generated: {new Date(changelog.generated).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="win31-window" style={{ marginBottom: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">FILTER</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">□</div>
              </div>
            </div>
            <div style={{ padding: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="win31-btn-3d"
                  style={{
                    background: filter === cat ? (cat === 'all' ? '#333' : CATEGORY_COLORS[cat]) : 'var(--win31-gray)',
                    color: filter === cat ? (cat === 'all' || ['ui', 'features'].includes(cat) ? '#000' : '#fff') : '#333',
                    fontWeight: filter === cat ? 'bold' : 'normal',
                    fontSize: '11px',
                    padding: '6px 12px',
                    fontFamily: 'var(--font-code)',
                  }}
                >
                  {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
                  <span style={{
                    marginLeft: '6px',
                    opacity: 0.7,
                    fontSize: '10px',
                  }}>
                    ({categoryCounts[cat] || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Changelog entries */}
          {filteredEntries.map(entry => (
            <div key={entry.date} className="win31-window" style={{ marginBottom: '16px' }}>
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">{entry.date}</span>
                <div className="win31-titlebar__right">
                  <span style={{ fontSize: '11px', marginRight: '8px', opacity: 0.8 }}>
                    {formatRelativeDate(entry.date)}
                  </span>
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '12px',
                  fontFamily: 'var(--font-code)',
                }}>
                  {formatDate(entry.date)} • {entry.items.length} update{entry.items.length !== 1 ? 's' : ''}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {entry.items.map((item, idx) => (
                    <li
                      key={`${item.hash}-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '10px 0',
                        borderBottom: idx < entry.items.length - 1 ? '1px solid #e0e0e0' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>
                        {TYPE_ICONS[item.type] || TYPE_ICONS.other}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                          flexWrap: 'wrap',
                        }}>
                          <span style={{
                            background: CATEGORY_COLORS[item.category],
                            color: ['skills', 'performance', 'infra', 'other'].includes(item.category) ? '#000' : '#000',
                            padding: '2px 8px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-code)',
                          }}>
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                          <span style={{
                            background: '#f0f0f0',
                            border: '1px solid #ccc',
                            padding: '2px 6px',
                            fontSize: '10px',
                            fontFamily: 'var(--font-code)',
                            color: '#666',
                          }}>
                            {TYPE_LABELS[item.type] || item.type}
                          </span>
                          {item.scope && (
                            <span style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-code)',
                              color: '#888',
                            }}>
                              [{item.scope}]
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '14px', color: '#333', lineHeight: 1.4 }}>
                          {item.description}
                          {item.skillCount && (
                            <span style={{
                              display: 'inline-block',
                              background: 'var(--win31-lime)',
                              color: '#000',
                              padding: '2px 8px',
                              marginLeft: '8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              fontFamily: 'var(--font-code)',
                            }}>
                              +{item.skillCount} skills
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={`https://github.com/curiositech/some_claude_skills/commit/${item.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-code)',
                          color: '#888',
                          textDecoration: 'none',
                          flexShrink: 0,
                        }}
                        title="View commit on GitHub"
                      >
                        {item.hash}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="win31-statusbar" style={{ marginTop: '24px' }}>
            <div className="win31-statusbar-panel">
              {filteredEntries.reduce((sum, e) => sum + e.items.length, 0)} items shown
            </div>
            <div className="win31-statusbar-panel">
              <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
