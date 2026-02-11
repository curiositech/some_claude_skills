'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL_EXPLORER.EXE
 * 
 * The ultimate skill browsing experience. Epic splash screen, category
 * browser with generated icons, full-screen skill details, cart + favorites.
 * 
 * NO EMOJIS - Professional pixel art icons only.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { skills, type Skill, type SkillReference } from '@/lib/skills';
import { 
  categoryMeta, 
  type SkillCategory, 
  getSkillCategory 
} from '@/lib/skill-taxonomy';
import styles from './skill-explorer.module.css';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ViewMode = 'splash' | 'categories' | 'skills' | 'detail';

interface SkillExplorerProps {
  isVisible: boolean;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY ICONS (Generated pixel art - no emoji!)
// ═══════════════════════════════════════════════════════════════════════════

// Category icon paths for future use with generated SVGs
// When generating icons, save them to: /public/icons/categories/{category}.svg

// Fallback pixel art icons (inline SVG data URLs)
const CATEGORY_ICON_FALLBACKS: Record<SkillCategory, React.ReactNode> = {
  'ai-agents': (
    <svg viewBox="0 0 32 32" className={styles.categoryIconSvg}>
      <rect x="8" y="4" width="16" height="12" fill="#00CED1" />
      <rect x="10" y="6" width="4" height="4" fill="#000080" />
      <rect x="18" y="6" width="4" height="4" fill="#000080" />
      <rect x="12" y="16" width="8" height="2" fill="#00CED1" />
      <rect x="6" y="20" width="6" height="8" fill="#FF69B4" />
      <rect x="20" y="20" width="6" height="8" fill="#FF69B4" />
      <rect x="12" y="18" width="8" height="10" fill="#00CED1" />
    </svg>
  ),
  'design-ux': (
    <svg viewBox="0 0 32 32" className={styles.categoryIconSvg}>
      <rect x="4" y="4" width="24" height="24" fill="#FFD700" stroke="#000" strokeWidth="2" />
      <circle cx="16" cy="16" r="6" fill="#FF69B4" />
      <rect x="8" y="8" width="4" height="4" fill="#00CED1" />
      <rect x="20" y="8" width="4" height="4" fill="#00CED1" />
      <rect x="8" y="20" width="4" height="4" fill="#00CED1" />
      <rect x="20" y="20" width="4" height="4" fill="#00CED1" />
    </svg>
  ),
  'web-frontend': (
    <svg viewBox="0 0 32 32" className={styles.categoryIconSvg}>
      <rect x="2" y="4" width="28" height="20" fill="#000080" stroke="#C0C0C0" strokeWidth="2" />
      <rect x="4" y="6" width="24" height="16" fill="#008080" />
      <text x="8" y="16" fill="#FFF" fontSize="8" fontFamily="monospace">&lt;/&gt;</text>
      <rect x="6" y="26" width="20" height="4" fill="#C0C0C0" />
    </svg>
  ),
  'backend-infra': (
    <svg viewBox="0 0 32 32" className={styles.categoryIconSvg}>
      <rect x="4" y="2" width="24" height="8" fill="#808080" stroke="#000" strokeWidth="1" />
      <rect x="6" y="4" width="4" height="2" fill="#00FF00" />
      <rect x="12" y="4" width="4" height="2" fill="#00FF00" />
      <rect x="4" y="12" width="24" height="8" fill="#808080" stroke="#000" strokeWidth="1" />
      <rect x="6" y="14" width="4" height="2" fill="#FFFF00" />
      <rect x="12" y="14" width="4" height="2" fill="#00FF00" />
      <rect x="4" y="22" width="24" height="8" fill="#808080" stroke="#000" strokeWidth="1" />
      <rect x="6" y="24" width="4" height="2" fill="#00FF00" />
      <rect x="12" y="24" width="4" height="2" fill="#00FF00" />
    </svg>
  ),
  'audio-media': (
    <svg viewBox="0 0 32 32" className={styles.categoryIconSvg}>
      <rect x="4" y="8" width="8" height="16" fill="#800080" />
      <polygon points="12,8 24,2 24,30 12,24" fill="#FF00FF" />
      <rect x="26" y="6" width="2" height="4" fill="#00FFFF" />
      <rect x="26" y="12" width="2" height="4" fill="#00FFFF" />
      <rect x="26" y="18" width="2" height="4" fill="#00FFFF" />
      <rect x="26" y="24" width="2" height="4" fill="#00FFFF" />
    </svg>
  ),
  'career-personal': (
    <svg viewBox="0 0 32 32" className={styles.categoryIconSvg}>
      <rect x="6" y="12" width="20" height="16" fill="#8B4513" stroke="#000" strokeWidth="1" />
      <rect x="10" y="12" width="12" height="4" fill="#D2691E" />
      <circle cx="16" cy="8" r="6" fill="#FFE4B5" stroke="#000" strokeWidth="1" />
      <rect x="14" y="6" width="1" height="2" fill="#000" />
      <rect x="17" y="6" width="1" height="2" fill="#000" />
    </svg>
  ),
  'health-wellness': (
    <svg viewBox="0 0 32 32" className={styles.categoryIconSvg}>
      <rect x="12" y="2" width="8" height="28" fill="#FF0000" />
      <rect x="2" y="12" width="28" height="8" fill="#FF0000" />
      <rect x="14" y="4" width="4" height="24" fill="#FF6B6B" />
      <rect x="4" y="14" width="24" height="4" fill="#FF6B6B" />
    </svg>
  ),
  'testing-quality': (
    <svg viewBox="0 0 32 32" className={styles.categoryIconSvg}>
      <path d="M8,4 L12,4 L12,12 L20,12 L20,4 L24,4 L24,12 L28,12 L28,28 L4,28 L4,12 L8,12 Z" fill="#00BFFF" stroke="#000" strokeWidth="1" />
      <rect x="10" y="16" width="4" height="8" fill="#90EE90" />
      <rect x="18" y="18" width="4" height="6" fill="#FFD700" />
    </svg>
  ),
  'data-analytics': (
    <svg viewBox="0 0 32 32" className={styles.categoryIconSvg}>
      <rect x="4" y="20" width="6" height="8" fill="#4169E1" />
      <rect x="13" y="14" width="6" height="14" fill="#32CD32" />
      <rect x="22" y="6" width="6" height="22" fill="#FF6347" />
      <line x1="2" y1="28" x2="30" y2="28" stroke="#000" strokeWidth="2" />
      <line x1="2" y1="4" x2="2" y2="28" stroke="#000" strokeWidth="2" />
    </svg>
  ),
  'writing-docs': (
    <svg viewBox="0 0 32 32" className={styles.categoryIconSvg}>
      <rect x="4" y="2" width="20" height="28" fill="#FFFACD" stroke="#000" strokeWidth="1" />
      <polygon points="24,2 28,6 28,30 4,30 4,2" fill="#FFFACD" stroke="#000" strokeWidth="1" />
      <line x1="8" y1="10" x2="20" y2="10" stroke="#000" strokeWidth="1" />
      <line x1="8" y1="14" x2="22" y2="14" stroke="#000" strokeWidth="1" />
      <line x1="8" y1="18" x2="18" y2="18" stroke="#000" strokeWidth="1" />
      <line x1="8" y1="22" x2="20" y2="22" stroke="#000" strokeWidth="1" />
    </svg>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════
// CART & FAVORITES STORE (Simple local state)
// ═══════════════════════════════════════════════════════════════════════════

function useCart() {
  const [cart, setCart] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('skillCart');
      const savedFavorites = localStorage.getItem('skillFavorites');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (e) {
      console.error('Failed to load cart/favorites:', e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('skillCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('skillFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = useCallback((skillId: string) => {
    setCart(prev => prev.includes(skillId) ? prev : [...prev, skillId]);
  }, []);

  const removeFromCart = useCallback((skillId: string) => {
    setCart(prev => prev.filter(id => id !== skillId));
  }, []);

  const toggleFavorite = useCallback((skillId: string) => {
    setFavorites(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getInstallCommand = useCallback(() => {
    if (cart.length === 0) return '';
    if (cart.length === 1) {
      const skill = skills.find(s => s.id === cart[0]);
      return skill?.installCommand || '';
    }
    // Multiple skills - combine commands
    return cart.map(id => {
      const skill = skills.find(s => s.id === id);
      return skill?.installCommand || '';
    }).join(' && ');
  }, [cart]);

  return { 
    cart, 
    favorites, 
    addToCart, 
    removeFromCart, 
    toggleFavorite, 
    clearCart,
    getInstallCommand,
    isInCart: (id: string) => cart.includes(id),
    isFavorite: (id: string) => favorites.includes(id),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HAPTIC FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════

function useHapticSound() {
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    audioRef.current = {
      click: new Audio('/audio/click.mp3'),
      thung: new Audio('/audio/thung.mp3'),
      cart: new Audio('/audio/cart.mp3'),
      favorite: new Audio('/audio/favorite.mp3'),
      copy: new Audio('/audio/copy.mp3'),
    };
    Object.values(audioRef.current).forEach(a => { a.volume = 0.3; });
  }, []);

  return useCallback((sound: 'click' | 'thung' | 'cart' | 'favorite' | 'copy') => {
    const audio = audioRef.current[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, []);
}

// ═══════════════════════════════════════════════════════════════════════════
// SPLASH SCREEN
// ═══════════════════════════════════════════════════════════════════════════

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing neural pathways...');

  useEffect(() => {
    const loadingTexts = [
      'Initializing neural pathways...',
      'Loading skill matrices...',
      'Calibrating AI augmentation...',
      'Syncing knowledge graphs...',
      'Activating superhuman protocols...',
      'READY.',
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
      setLoadProgress(progress);
      setLoadingText(loadingTexts[Math.min(Math.floor(progress / 20), loadingTexts.length - 1)]);
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={styles.splashScreen}>
      {/* Epic background with grid and glow */}
      <div className={styles.splashBackground}>
        <div className={styles.splashGrid} />
        <div className={styles.splashGlow} />
      </div>

      {/* Mountains silhouette */}
      <div className={styles.splashMountains} />

      {/* Sun/Orb */}
      <div className={styles.splashSun} />

      {/* Main figure - Robot transforming */}
      <div className={styles.splashFigure}>
        <div className={styles.robotBody}>
          {/* Robot with skill orbs floating around */}
          <div className={styles.robotHead} />
          <div className={styles.robotTorso} />
          <div className={styles.robotArms} />
          <div className={styles.robotLegs} />
          {/* Floating skill orbs */}
          <div className={`${styles.skillOrb} ${styles.skillOrb1}`} />
          <div className={`${styles.skillOrb} ${styles.skillOrb2}`} />
          <div className={`${styles.skillOrb} ${styles.skillOrb3}`} />
          <div className={`${styles.skillOrb} ${styles.skillOrb4}`} />
          <div className={`${styles.skillOrb} ${styles.skillOrb5}`} />
          <div className={`${styles.skillOrb} ${styles.skillOrb6}`} />
        </div>
      </div>

      {/* Title */}
      <div className={styles.splashTitle}>
        <span className={styles.splashTitleMain}>SKILL_EXPLORER</span>
        <span className={styles.splashTitleExt}>.EXE</span>
      </div>

      {/* Tagline */}
      <div className={styles.splashTagline}>
        SUPERCHARGE YOUR AI WITH INFINITE ABILITIES
      </div>

      {/* Loading bar */}
      <div className={styles.splashLoading}>
        <div className={styles.splashLoadingText}>{loadingText}</div>
        <div className={styles.splashLoadingBar}>
          <div 
            className={styles.splashLoadingProgress} 
            style={{ width: `${loadProgress}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY VIEW
// ═══════════════════════════════════════════════════════════════════════════

function CategoryView({ 
  onSelectCategory, 
  skillsByCategory,
  playSound,
}: { 
  onSelectCategory: (cat: SkillCategory) => void;
  skillsByCategory: Record<SkillCategory, Skill[]>;
  playSound: (sound: 'click' | 'thung' | 'cart' | 'favorite' | 'copy') => void;
}) {
  const handleClick = (cat: SkillCategory) => {
    playSound('thung');
    onSelectCategory(cat);
  };

  return (
    <div className={styles.categoryView}>
      <div className={styles.categoryGrid}>
        {(Object.keys(categoryMeta) as SkillCategory[]).map(cat => {
          const meta = categoryMeta[cat];
          const count = skillsByCategory[cat]?.length || 0;
          if (count === 0) return null;

          return (
            <button
              key={cat}
              className={styles.categoryCard}
              onClick={() => handleClick(cat)}
            >
              <div className={styles.categoryIcon}>
                {CATEGORY_ICON_FALLBACKS[cat]}
              </div>
              <div className={styles.categoryLabel}>{meta.label}</div>
              <div className={styles.categoryCount}>{count} skills</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL LIST VIEW
// ═══════════════════════════════════════════════════════════════════════════

function SkillListView({ 
  category, 
  skills: categorySkills,
  onSelectSkill,
  onBack,
  cart,
  playSound,
}: { 
  category: SkillCategory;
  skills: Skill[];
  onSelectSkill: (skill: Skill) => void;
  onBack: () => void;
  cart: ReturnType<typeof useCart>;
  playSound: (sound: 'click' | 'thung' | 'cart' | 'favorite' | 'copy') => void;
}) {
  const meta = categoryMeta[category];

  return (
    <div className={styles.skillListView}>
      <div className={styles.skillListHeader}>
        <button className={styles.backButton} onClick={() => { playSound('click'); onBack(); }}>
          <BackIcon />
          <span>Back</span>
        </button>
        <div className={styles.skillListTitle}>
          <div className={styles.categoryIconSmall}>
            {CATEGORY_ICON_FALLBACKS[category]}
          </div>
          <span>{meta.label}</span>
        </div>
      </div>

      <div className={styles.skillGrid}>
        {categorySkills.map(skill => (
          <button
            key={skill.id}
            className={styles.skillCard}
            onClick={() => { playSound('click'); onSelectSkill(skill); }}
          >
            <div className={styles.skillCardIcon}>
              {skill.skillIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={skill.skillIcon} alt="" className={styles.skillIconImg} loading="lazy" />
              ) : (
                <div className={styles.skillIconPlaceholder}>
                  <SkillPlaceholderIcon />
                </div>
              )}
            </div>
            <div className={styles.skillCardInfo}>
              <div className={styles.skillCardTitle}>{skill.title}</div>
              <div className={styles.skillCardDesc}>{skill.description.substring(0, 80)}...</div>
            </div>
            <div className={styles.skillCardActions}>
              <button 
                className={`${styles.iconButton} ${cart.isFavorite(skill.id) ? styles.active : ''}`}
                onClick={(e) => { e.stopPropagation(); playSound('favorite'); cart.toggleFavorite(skill.id); }}
                title="Favorite"
              >
                <StarIcon filled={cart.isFavorite(skill.id)} />
              </button>
              <button 
                className={`${styles.iconButton} ${cart.isInCart(skill.id) ? styles.active : ''}`}
                onClick={(e) => { e.stopPropagation(); playSound('cart'); cart.addToCart(skill.id); }}
                title="Add to Cart"
              >
                <CartIcon />
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════

function SkillDetailView({ 
  skill, 
  onBack,
  cart,
  playSound,
}: { 
  skill: Skill;
  onBack: () => void;
  cart: ReturnType<typeof useCart>;
  playSound: (sound: 'click' | 'thung' | 'cart' | 'favorite' | 'copy') => void;
}) {
  const [activeSection, setActiveSection] = useState<string>('overview');
  
  // Parse content into sections
  const sections = useMemo(() => {
    const lines = skill.content.split('\n');
    const parsed: { id: string; title: string; content: string }[] = [];
    let currentSection = { id: 'overview', title: 'Overview', content: '' };

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection.content.trim()) {
          parsed.push(currentSection);
        }
        const title = line.replace('## ', '');
        currentSection = { 
          id: title.toLowerCase().replace(/\s+/g, '-'), 
          title, 
          content: '' 
        };
      } else if (line.startsWith('# ')) {
        // Skip main title
        continue;
      } else {
        currentSection.content += line + '\n';
      }
    }
    if (currentSection.content.trim()) {
      parsed.push(currentSection);
    }
    return parsed;
  }, [skill.content]);

  return (
    <div className={styles.detailView}>
      {/* Hero */}
      <div className={styles.detailHero}>
        {skill.skillHero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={skill.skillHero} alt="" className={styles.detailHeroImg} />
        )}
        <div className={styles.detailHeroOverlay} />
        <button className={styles.backButtonFloating} onClick={() => { playSound('click'); onBack(); }}>
          <BackIcon />
        </button>
        <div className={styles.detailHeroContent}>
          <h1 className={styles.detailTitle}>{skill.title}</h1>
          <p className={styles.detailDesc}>{skill.description}</p>
          <div className={styles.detailActions}>
            <button 
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={() => { playSound('cart'); cart.addToCart(skill.id); }}
            >
              <CartIcon />
              <span>{cart.isInCart(skill.id) ? 'In Cart' : 'Add to Cart'}</span>
            </button>
            <button 
              className={`${styles.actionButton} ${cart.isFavorite(skill.id) ? styles.actionButtonActive : ''}`}
              onClick={() => { playSound('favorite'); cart.toggleFavorite(skill.id); }}
            >
              <StarIcon filled={cart.isFavorite(skill.id)} />
              <span>{cart.isFavorite(skill.id) ? 'Favorited' : 'Favorite'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.detailContent}>
        {/* Section Index */}
        <div className={styles.detailIndex}>
          <div className={styles.detailIndexTitle}>Sections</div>
          {sections.map(section => (
            <button
              key={section.id}
              className={`${styles.detailIndexItem} ${activeSection === section.id ? styles.active : ''}`}
              onClick={() => { playSound('click'); setActiveSection(section.id); }}
            >
              {section.title}
            </button>
          ))}

          {/* References */}
          {skill.references && skill.references.length > 0 && (
            <>
              <div className={styles.detailIndexTitle}>References</div>
              {skill.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.detailIndexRef}
                  onClick={() => playSound('click')}
                >
                  <RefIcon type={ref.type} />
                  <span>{ref.title}</span>
                </a>
              ))}
            </>
          )}
        </div>

        {/* Main content */}
        <div className={styles.detailMain}>
          {sections.filter(s => s.id === activeSection).map(section => (
            <div key={section.id} className={styles.detailSection}>
              <h2>{section.title}</h2>
              <pre className={styles.detailSectionContent}>{section.content}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CART PANEL
// ═══════════════════════════════════════════════════════════════════════════

function CartPanel({ 
  cart, 
  playSound,
  onClose,
}: { 
  cart: ReturnType<typeof useCart>;
  playSound: (sound: 'click' | 'thung' | 'cart' | 'favorite' | 'copy') => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const command = cart.getInstallCommand();

  const handleCopy = async () => {
    if (!command) return;
    await navigator.clipboard.writeText(command);
    playSound('copy');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.cartPanel}>
      <div className={styles.cartHeader}>
        <h3>Install Cart ({cart.cart.length})</h3>
        <button className={styles.cartClose} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      {cart.cart.length === 0 ? (
        <div className={styles.cartEmpty}>
          <CartIcon />
          <p>Your cart is empty</p>
          <p className={styles.cartEmptyHint}>Add skills to generate an install command</p>
        </div>
      ) : (
        <>
          <div className={styles.cartItems}>
            {cart.cart.map(id => {
              const skill = skills.find(s => s.id === id);
              if (!skill) return null;
              return (
                <div key={id} className={styles.cartItem}>
                  <span>{skill.title}</span>
                  <button 
                    className={styles.cartItemRemove}
                    onClick={() => { playSound('click'); cart.removeFromCart(id); }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              );
            })}
          </div>

          <div className={styles.cartCommand}>
            <div className={styles.cartCommandLabel}>Install Command:</div>
            <code className={styles.cartCommandCode}>{command}</code>
          </div>

          <div className={styles.cartActions}>
            <button 
              className={`${styles.cartCopyButton} ${copied ? styles.copied : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button 
              className={styles.cartClearButton}
              onClick={() => { playSound('click'); cart.clearCart(); }}
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ICONS (No emoji! Custom SVG pixel art)
// ═══════════════════════════════════════════════════════════════════════════

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon}>
      <path d="M10 2L4 8L10 14" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon}>
      <path 
        d="M8 1L10 6H15L11 9L13 14L8 11L3 14L5 9L1 6H6L8 1Z" 
        fill={filled ? '#FFD700' : 'none'} 
        stroke="currentColor" 
        strokeWidth="1" 
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon}>
      <path d="M1 1H3L4 3H14L12 9H5L3 3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="11" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon}>
      <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SkillPlaceholderIcon() {
  return (
    <svg viewBox="0 0 32 32" className={styles.skillPlaceholderSvg}>
      <rect x="4" y="4" width="24" height="24" rx="4" fill="#008080" />
      <rect x="8" y="8" width="16" height="4" fill="#00CED1" />
      <rect x="8" y="14" width="12" height="2" fill="#00CED1" />
      <rect x="8" y="18" width="16" height="2" fill="#00CED1" />
      <rect x="8" y="22" width="10" height="2" fill="#00CED1" />
    </svg>
  );
}

function RefIcon({ type }: { type: SkillReference['type'] }) {
  const colors: Record<SkillReference['type'], string> = {
    guide: '#00CED1',
    example: '#FFD700',
    'related-skill': '#FF69B4',
    external: '#90EE90',
  };
  return (
    <svg viewBox="0 0 16 16" className={styles.iconSmall}>
      <rect x="2" y="2" width="12" height="12" rx="2" fill={colors[type]} />
      <rect x="4" y="5" width="8" height="1" fill="#000" />
      <rect x="4" y="8" width="6" height="1" fill="#000" />
      <rect x="4" y="11" width="4" height="1" fill="#000" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function SkillExplorer({ isVisible, onClose }: SkillExplorerProps) {
  const [view, setView] = useState<ViewMode>('splash');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showCart, setShowCart] = useState(false);
  
  const cart = useCart();
  const playSound = useHapticSound();

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<SkillCategory, Skill[]> = {
      'ai-agents': [], 'design-ux': [], 'web-frontend': [], 'backend-infra': [],
      'audio-media': [], 'career-personal': [], 'health-wellness': [],
      'testing-quality': [], 'data-analytics': [], 'writing-docs': [],
    };
    skills.forEach(skill => {
      const cat = getSkillCategory(skill.id);
      if (grouped[cat]) grouped[cat].push(skill);
    });
    return grouped;
  }, []);

  // Reset when opened
  useEffect(() => {
    if (isVisible) {
      setView('splash');
      setSelectedCategory(null);
      setSelectedSkill(null);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      {/* Title Bar */}
      <div className={styles.titleBar}>
        <button className={styles.controlButton} title="Menu">
          <span>-</span>
        </button>
        <span className={styles.titleText}>SKILL_EXPLORER.EXE</span>
        <div className={styles.titleBarButtons}>
          <button 
            className={`${styles.cartButton} ${cart.cart.length > 0 ? styles.hasItems : ''}`}
            onClick={() => { playSound('click'); setShowCart(!showCart); }}
            title="Cart"
          >
            <CartIcon />
            {cart.cart.length > 0 && (
              <span className={styles.cartBadge}>{cart.cart.length}</span>
            )}
          </button>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            X
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {view === 'splash' && (
          <SplashScreen onComplete={() => setView('categories')} />
        )}

        {view === 'categories' && (
          <CategoryView 
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setView('skills');
            }}
            skillsByCategory={skillsByCategory}
            playSound={playSound}
          />
        )}

        {view === 'skills' && selectedCategory && (
          <SkillListView
            category={selectedCategory}
            skills={skillsByCategory[selectedCategory]}
            onSelectSkill={(skill) => {
              setSelectedSkill(skill);
              setView('detail');
            }}
            onBack={() => setView('categories')}
            cart={cart}
            playSound={playSound}
          />
        )}

        {view === 'detail' && selectedSkill && (
          <SkillDetailView
            skill={selectedSkill}
            onBack={() => setView('skills')}
            cart={cart}
            playSound={playSound}
          />
        )}
      </div>

      {/* Cart Panel */}
      {showCart && (
        <CartPanel 
          cart={cart} 
          playSound={playSound}
          onClose={() => setShowCart(false)}
        />
      )}
    </div>
  );
}
