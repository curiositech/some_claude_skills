import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { Artifact } from '@site/src/types/artifact';
import PhaseTimeline from '@site/src/components/PhaseTimeline';
import TranscriptViewer from '@site/src/components/TranscriptViewer';
import BeforeAfterComparison from '@site/src/components/BeforeAfterComparison';
import WinampModal from '@site/src/components/WinampModal';
import { useMusicPlayer } from '@site/src/contexts/MusicPlayerContext';
import styles from './artifact.module.css';

// Import artifacts
import skillCoachArtifact from '@site/src/data/artifacts/single-skill/skill-coach/001-self-improvement/artifact.json';
import vaporwaveMidiPlayerArtifact from '@site/src/data/artifacts/single-skill/vaporwave-glassomorphic-ui-designer/001-midi-player/artifact.json';
import siteReliabilityEngineerArtifact from '@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/artifact.json';
// New lifestyle and recovery artifacts
import recoveryCommunicationStackArtifact from '@site/src/data/artifacts/multi-skill/recovery-communication-stack/artifact.json';
import homeTransformationSuiteArtifact from '@site/src/data/artifacts/multi-skill/home-transformation-suite/artifact.json';
import hiddenSpaceDetectiveArtifact from '@site/src/data/artifacts/single-skill/panic-room-finder/001-hidden-space-detective/artifact.json';
import weddingTimeCapsuleArtifact from '@site/src/data/artifacts/single-skill/wedding-immortalist/001-wedding-time-capsule/artifact.json';
import relationshipLabArtifact from '@site/src/data/artifacts/single-skill/partner-text-coach/001-relationship-lab/artifact.json';
import yardTransformationArtifact from '@site/src/data/artifacts/single-skill/fancy-yard-landscaper/001-yard-transformation/artifact.json';
import colorConfidenceArtifact from '@site/src/data/artifacts/single-skill/maximalist-wall-decorator/001-color-confidence/artifact.json';

const ARTIFACTS_MAP: Record<string, Artifact> = {
  'skill-coach-001-self-improvement': skillCoachArtifact as Artifact,
  'vaporwave-glassomorphic-ui-designer-001-midi-player': vaporwaveMidiPlayerArtifact as Artifact,
  'multi-skill-site-reliability-engineer-integration': siteReliabilityEngineerArtifact as Artifact,
  // New artifacts
  'recovery-communication-stack': recoveryCommunicationStackArtifact as Artifact,
  'home-transformation-suite': homeTransformationSuiteArtifact as Artifact,
  'panic-room-finder-001-hidden-space-detective': hiddenSpaceDetectiveArtifact as Artifact,
  'wedding-immortalist-001-time-capsule': weddingTimeCapsuleArtifact as Artifact,
  'partner-text-coach-001-relationship-lab': relationshipLabArtifact as Artifact,
  'fancy-yard-landscaper-001-yard-transformation': yardTransformationArtifact as Artifact,
  'maximalist-wall-decorator-001-color-confidence': colorConfidenceArtifact as Artifact,
};

const CATEGORY_CONFIG = {
  design: { icon: '🎨', label: 'Design' },
  development: { icon: '💻', label: 'Development' },
  'ai-ml': { icon: '🤖', label: 'AI/ML' },
  lifestyle: { icon: '🏡', label: 'Lifestyle' },
  relationships: { icon: '💕', label: 'Relationships' },
  recovery: { icon: '🌅', label: 'Recovery' },
  research: { icon: '🔬', label: 'Research' },
  writing: { icon: '✍️', label: 'Writing' },
  meta: { icon: '🔄', label: 'Meta' }
};

const TYPE_CONFIG = {
  'single-skill': { icon: '🎯', label: 'Solo Skill' },
  'multi-skill': { icon: '🎼', label: 'Orchestration' },
  'comparison': { icon: '⚖️', label: 'Comparison' }
};

export default function ArtifactDetail(): JSX.Element {
  const location = useLocation();
  // Read artifact ID from query parameter: /artifact?id=skill-coach-001-self-improvement
  const params = new URLSearchParams(location.search);
  const artifactId = params.get('id');
  const artifact = artifactId ? ARTIFACTS_MAP[artifactId] : null;

  const [transcriptContent, setTranscriptContent] = useState<string>('');
  const [fileComparisons, setFileComparisons] = useState<Array<{
    beforePath: string;
    afterPath: string;
    beforeContent: string;
    afterContent: string;
    fileName: string;
  }>>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set([0])); // Only first file expanded by default
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const { setIsPlaying } = useMusicPlayer();

  const toggleFile = (index: number) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFiles(newExpanded);
  };

  useEffect(() => {
    if (!artifact) return;

    // Construct base path for artifact files
    const match = artifact.id.match(/^(.+?)-(\d{3}-.+)$/);
    if (!match) {
      console.error('Invalid artifact ID format:', artifact.id);
      return;
    }
    const [, skillName, artifactNumber] = match;
    const basePath = `/data/artifacts/${artifact.type}/${skillName}/${artifactNumber}`;

    // Load transcript
    if (artifact.files.transcript) {
      fetch(`${basePath}/${artifact.files.transcript}`)
        .then(res => res.text())
        .then(text => setTranscriptContent(text))
        .catch(err => console.error('Failed to load transcript:', err));
    }

    // Load ALL before/after file pairs for comparison
    if (artifact.files.before && artifact.files.after) {
      const maxFiles = Math.max(artifact.files.before.length, artifact.files.after.length);
      const comparisons: typeof fileComparisons = [];

      for (let i = 0; i < maxFiles; i++) {
        const beforePath = artifact.files.before[i];
        const afterPath = artifact.files.after[i];

        if (beforePath && afterPath) {
          Promise.all([
            fetch(`${basePath}/${beforePath}`).then(res => res.text()),
            fetch(`${basePath}/${afterPath}`).then(res => res.text())
          ]).then(([beforeContent, afterContent]) => {
            const fileName = afterPath.split('/').pop() || afterPath;
            comparisons.push({
              beforePath,
              afterPath,
              beforeContent,
              afterContent,
              fileName
            });
            setFileComparisons([...comparisons]);
          }).catch(err => console.error('Failed to load comparison files:', err));
        }
      }
    }
  }, [artifact]);

  if (!artifact) {
    return (
      <Layout title="Artifact Not Found">
        <div className={styles.notFound}>
          <div className="container">
            <h1>Artifact Not Found</h1>
            <p>The artifact you're looking for doesn't exist.</p>
            <Link to="/artifacts" className={styles.backButton}>
              ← Back to Artifacts
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const category = CATEGORY_CONFIG[artifact.category];
  const type = TYPE_CONFIG[artifact.type];

  return (
    <Layout
      title={artifact.title}
      description={artifact.description}
    >
      <div className={styles.artifactDetail}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className="container">
            <div className={styles.breadcrumbs}>
              <Link to="/artifacts" className={styles.breadcrumb}>
                Artifacts
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{artifact.title}</span>
            </div>

            <div className={styles.heroHeader}>
              <div className={styles.badges}>
                <span className={styles.categoryBadge}>
                  <span className={styles.badgeIcon}>{category.icon}</span>
                  {category.label}
                </span>
                <span className={styles.typeBadge}>
                  <span className={styles.badgeIcon}>{type.icon}</span>
                  {type.label}
                </span>
                {artifact.featured && (
                  <span className={styles.featuredBadge}>
                    ⭐ Featured
                  </span>
                )}
              </div>

              <h1 className={styles.title}>{artifact.title}</h1>
              <p className={styles.description}>{artifact.description}</p>

              <div className={styles.metadata}>
                <span className={styles.metaItem}>
                  📅 {new Date(artifact.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {artifact.viewCount && (
                  <span className={styles.metaItem}>
                    👁️ {artifact.viewCount.toLocaleString()} views
                  </span>
                )}
              </div>
            </div>

            {artifact.heroImage && (
              <div className={styles.heroImageContainer}>
                <img src={artifact.heroImage} alt={artifact.title} className={styles.heroImage} />
              </div>
            )}
          </div>
        </div>

        <div className="container">
          {/* Skills Involved */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Skills Involved</h2>
            <div className={styles.skillsGrid}>
              {artifact.skills.map((skill, index) => (
                <div key={index} className={styles.skillCard}>
                  <div className={styles.skillHeader}>
                    <Link to={`/docs/skills/${skill.name}`} className={styles.skillName}>
                      {skill.name}
                    </Link>
                    {skill.activatedAt !== undefined && (
                      <span className={styles.activationBadge}>
                        Activated at {skill.activatedAt}s
                      </span>
                    )}
                  </div>
                  <p className={styles.skillRole}>{skill.role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Album Art Gallery */}
          {artifact.albumArt && artifact.albumArt.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🎨 AI-Generated Album Art Gallery</h2>
              <p className={styles.galleryDescription}>
                {artifact.albumArt.length} unique album covers generated using Ideogram AI, each capturing a different facet of vaporwave aesthetics.
              </p>
              <div className={styles.albumArtGrid}>
                {artifact.albumArt.map((cover, index) => (
                  <div key={index} className={styles.albumArtCard}>
                    <img
                      src={cover.src}
                      alt={cover.title}
                      className={styles.albumArtImage}
                    />
                    <div className={styles.albumArtInfo}>
                      <span className={styles.albumArtTitle}>{cover.title}</span>
                      <span className={styles.albumArtArtist}>{cover.artist}</span>
                      <span className={styles.albumArtStyle}>{cover.style}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interactive Demo */}
          {artifact.interactiveDemo === 'vaporwave-midi-player' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🎵 Try It Live</h2>
              <div className={styles.interactiveDemoCard}>
                <p className={styles.interactiveDemoDescription}>
                  Experience the actual Winamp-style vaporwave music player created for this project.
                  Play MIDI tracks, switch between 4 theme skins, and see the animated 24-bar visualizer in action.
                </p>
                <button
                  className={styles.launchDemoButton}
                  onClick={() => setShowMusicPlayer(true)}
                >
                  🎧 Launch Music Player
                </button>
              </div>
            </section>
          )}

          {/* Phases (for multi-skill or phased single-skill) */}
          {artifact.phases && artifact.phases.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Workflow Phases</h2>
              <PhaseTimeline phases={artifact.phases} />
            </section>
          )}

          {/* Narrative Exposition */}
          {artifact.narrative && artifact.narrative.length > 0 && (
            <section className={styles.section}>
              <div className={styles.exposition}>
                <h2 className={styles.expositionTitle}>What Happened Here</h2>
                <div className={styles.expositionContent}>
                  {artifact.narrative.map((paragraph, index) => (
                    <p key={index} className={styles.expositionParagraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Outcome & Metrics */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Outcome</h2>
            <div className={styles.outcomeCard}>
              <p className={styles.outcomeSummary}>{artifact.outcome.summary}</p>

              {artifact.outcome.metrics && artifact.outcome.metrics.length > 0 && (
                <div className={styles.metrics}>
                  {artifact.outcome.metrics.map((metric, index) => (
                    <div key={index} className={styles.metric}>
                      <span className={styles.metricValue}>{metric.value}</span>
                      <span className={styles.metricLabel}>{metric.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {artifact.outcome.learned && artifact.outcome.learned.length > 0 && (
                <div className={styles.learned}>
                  <h3 className={styles.learnedTitle}>Key Learnings</h3>
                  <ul className={styles.learnedList}>
                    {artifact.outcome.learned.map((learning, index) => (
                      <li key={index} className={styles.learnedItem}>
                        💡 {learning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Before/After Comparisons */}
          {fileComparisons.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Before & After Comparison</h2>
              <div className={styles.comparisonNotice}>
                <p>📁 Showing {fileComparisons.length} file{fileComparisons.length > 1 ? 's' : ''} changed across {artifact.phases ? artifact.phases.length : 'multiple'} iterations. Click to expand/collapse.</p>
              </div>
              {fileComparisons.map((comparison, index) => {
                const isExpanded = expandedFiles.has(index);
                const beforeLines = comparison.beforeContent.split('\n').length;
                const afterLines = comparison.afterContent.split('\n').length;
                const linesChanged = Math.abs(beforeLines - afterLines);

                return (
                  <div key={index} className={styles.fileComparison}>
                    <div
                      className={styles.fileComparisonHeader}
                      onClick={() => toggleFile(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.fileComparisonTitleRow}>
                        <h3 className={styles.fileComparisonTitle}>
                          <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
                          📄 {comparison.fileName}
                        </h3>
                        <div className={styles.fileStats}>
                          <span className={styles.fileStat}>
                            {beforeLines} → {afterLines} lines
                          </span>
                          <span className={styles.fileStat}>
                            {linesChanged} changed
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className={styles.fileComparisonContent}>
                        <BeforeAfterComparison
                          beforeContent={comparison.beforeContent}
                          afterContent={comparison.afterContent}
                          beforeLabel="Iteration 0"
                          afterLabel="Final Version"
                          fileName={comparison.fileName}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* Transcript */}
          {transcriptContent && (
            <section className={styles.section}>
              <TranscriptViewer
                transcriptContent={transcriptContent}
                title="Full Conversation Transcript"
              />
            </section>
          )}

          {/* Tags */}
          {artifact.tags && artifact.tags.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Tags</h2>
              <div className={styles.tags}>
                {artifact.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className={styles.navigation}>
            <Link to="/artifacts" className={styles.backButton}>
              ← Back to All Artifacts
            </Link>
          </div>
        </div>
      </div>

      {/* Winamp Modal for Interactive Demo */}
      {showMusicPlayer && (
        <WinampModal onClose={() => setShowMusicPlayer(false)} />
      )}
    </Layout>
  );
}
