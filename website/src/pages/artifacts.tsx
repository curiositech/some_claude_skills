import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import ArtifactCard from '@site/src/components/ArtifactCard';
import { Artifact, ArtifactType, ArtifactCategory } from '@site/src/types/artifact';
import styles from './artifacts.module.css';

// Import all artifacts
// Note: In production, this would dynamically load from the artifacts directory
import promptLearningMcpArtifact from '@site/src/data/artifacts/single-skill/prompt-learning-mcp/001-test-suite-creation/artifact.json';
import skillCoachArtifact from '@site/src/data/artifacts/single-skill/skill-coach/001-self-improvement/artifact.json';
import vaporwaveMidiPlayerArtifact from '@site/src/data/artifacts/single-skill/vaporwave-glassomorphic-ui-designer/001-midi-player/artifact.json';
import siteReliabilityEngineerArtifact from '@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/artifact.json';

const ARTIFACTS: Artifact[] = [
  promptLearningMcpArtifact as Artifact,
  skillCoachArtifact as Artifact,
  vaporwaveMidiPlayerArtifact as Artifact,
  siteReliabilityEngineerArtifact as Artifact,
  // More artifacts will be added here as they're created
];

const CATEGORIES: { value: ArtifactCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '📚' },
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'development', label: 'Development', icon: '💻' },
  { value: 'ai-ml', label: 'AI/ML', icon: '🤖' },
  { value: 'research', label: 'Research', icon: '🔬' },
  { value: 'writing', label: 'Writing', icon: '✍️' },
  { value: 'meta', label: 'Meta', icon: '🔄' },
];

const TYPES: { value: ArtifactType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All Types', icon: '🎯' },
  { value: 'single-skill', label: 'Solo Skills', icon: '🎯' },
  { value: 'multi-skill', label: 'Orchestration', icon: '🎼' },
  { value: 'comparison', label: 'Comparisons', icon: '⚖️' },
];

export default function Artifacts(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<ArtifactCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ArtifactType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArtifacts = useMemo(() => {
    return ARTIFACTS.filter(artifact => {
      const matchesCategory = selectedCategory === 'all' || artifact.category === selectedCategory;
      const matchesType = selectedType === 'all' || artifact.type === selectedType;
      const matchesSearch = searchQuery === '' ||
        artifact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artifact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artifact.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesType && matchesSearch;
    });
  }, [selectedCategory, selectedType, searchQuery]);

  const featuredArtifacts = useMemo(() => {
    return filteredArtifacts.filter(a => a.featured);
  }, [filteredArtifacts]);

  const regularArtifacts = useMemo(() => {
    return filteredArtifacts.filter(a => !a.featured);
  }, [filteredArtifacts]);

  return (
    <Layout
      title="Examples"
      description="Explore real-world demonstrations of Claude Skills in action"
    >
      <div className={styles.artifactsPage}>
        <div className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle} style={{ position: 'relative' }}>
              <span className={styles.heroIcon}>✨</span>
              Examples
              <span className="beta-sticker">BETA</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Real-world demonstrations of Claude Skills in action. See how individual skills
              perform solo, how they orchestrate together, and compare different approaches.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{ARTIFACTS.length}</span>
                <span className={styles.statLabel}>Examples</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {new Set(ARTIFACTS.flatMap(a => a.skills.map(s => s.name))).size}
                </span>
                <span className={styles.statLabel}>Skills Featured</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {ARTIFACTS.filter(a => a.type === 'multi-skill').length}
                </span>
                <span className={styles.statLabel}>Orchestrations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.filters}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search artifacts, skills, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Category:</label>
              <div className={styles.filterButtons}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    className={`${styles.filterButton} ${
                      selectedCategory === cat.value ? styles.active : ''
                    }`}
                    onClick={() => setSelectedCategory(cat.value)}
                  >
                    <span className={styles.filterIcon}>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Type:</label>
              <div className={styles.filterButtons}>
                {TYPES.map(type => (
                  <button
                    key={type.value}
                    className={`${styles.filterButton} ${
                      selectedType === type.value ? styles.active : ''
                    }`}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <span className={styles.filterIcon}>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredArtifacts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>No artifacts found</h3>
              <p className={styles.emptyText}>
                Try adjusting your filters or search query
              </p>
              <button
                className={styles.resetButton}
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {featuredArtifacts.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>⭐</span>
                    Featured Examples
                  </h2>
                  <div className={styles.artifactGrid}>
                    {featuredArtifacts.map(artifact => (
                      <ArtifactCard key={artifact.id} artifact={artifact} />
                    ))}
                  </div>
                </section>
              )}

              {regularArtifacts.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    {featuredArtifacts.length > 0 ? 'All Examples' : 'Examples'}
                  </h2>
                  <div className={styles.artifactGrid}>
                    {regularArtifacts.map(artifact => (
                      <ArtifactCard key={artifact.id} artifact={artifact} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <div className={styles.ctaSection}>
            <h2 className={styles.ctaTitle}>Want to contribute an artifact?</h2>
            <p className={styles.ctaText}>
              Share your own demonstrations of Claude Skills in action. Show the community
              how skills work individually or how they orchestrate together.
            </p>
            <Link to="/docs/guides/artifact-contribution-guide" className={styles.ctaButton}>
              Learn How to Create Artifacts →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
