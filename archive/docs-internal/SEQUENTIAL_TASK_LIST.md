# Some Claude Skills: Sequential Task List

## Detailed Implementation Plan with Designs, Logging, and Tests

*Generated: January 2, 2026*
*Estimated Total: 8-12 weeks for solo founder*

---

## Phase 0: Foundation & Tooling (Days 1-3)

### Task 0.1: Set Up Development Environment

**Goal**: Ensure consistent dev experience with proper tooling

**Work**:
```bash
# 1. Update dependencies
cd /Users/erichowens/coding/some_claude_skills/website
npm update
npm audit fix

# 2. Add testing framework (if not present)
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# 3. Add logging utility
npm install -D debug  # or use console with custom wrapper
```

**Files to Create**:
```
website/src/
├── utils/
│   └── logger.ts          # Centralized logging
├── vitest.config.ts       # Test configuration
└── test/
    └── setup.ts           # Test setup file
```

**Logger Implementation** (`src/utils/logger.ts`):
```typescript
// Lightweight logger with levels and namespaces
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (typeof window !== 'undefined' && localStorage.getItem('logLevel') as LogLevel) ||
  (process.env.NODE_ENV === 'development' ? 'debug' : 'warn');

export function createLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`;

  const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
  };

  return {
    debug: (...args) => shouldLog('debug') && console.log(prefix, ...args),
    info: (...args) => shouldLog('info') && console.info(prefix, ...args),
    warn: (...args) => shouldLog('warn') && console.warn(prefix, ...args),
    error: (...args) => shouldLog('error') && console.error(prefix, ...args),
  };
}

// Usage: const log = createLogger('Onboarding');
```

**Test Configuration** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@site': path.resolve(__dirname, '.'),
    },
  },
});
```

**Worries**:
- Docusaurus has its own build system; ensure Vitest doesn't conflict
- SSR components need careful mocking
- localStorage mocking for hook tests

**Tests to Write**:
- [ ] Logger respects log levels
- [ ] Logger outputs correct namespace prefix

---

### Task 0.2: Create Type Definitions

**Goal**: Define all TypeScript interfaces upfront

**File**: `src/types/features.ts`
```typescript
// ============ TUTORIAL TYPES ============
export type TutorialDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type TutorialStatus = 'not-started' | 'in-progress' | 'completed';

export interface TutorialStep {
  id: string;
  title: string;
  content: string; // MDX or plain text
  codeExample?: string;
  estimatedTime: number; // minutes
  validation?: {
    type: 'command' | 'file-exists' | 'manual';
    check?: string;
  };
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: TutorialDifficulty;
  estimatedTime: number;
  steps: TutorialStep[];
  skills: string[]; // related skill IDs
  videoId?: string; // YouTube ID
  prerequisites?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TutorialProgress {
  tutorialId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: number;
  lastAccessedAt: number;
  completedAt?: number;
}

// ============ BUNDLE TYPES ============
export interface SkillBundle {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or image path
  color: 'yellow' | 'lime' | 'teal' | 'magenta' | 'blue';
  skills: string[];
  installCommand: string; // auto-generated
  category: string;
  difficulty: TutorialDifficulty;
  estimatedSetupTime: number;
  useCases: string[];
  featured?: boolean;
  createdAt: string;
}

// ============ VIDEO TYPES ============
export type VideoType = 'spotlight' | 'tutorial' | 'short' | 'founder-story';

export interface VideoTimestamp {
  time: number; // seconds
  label: string;
  description?: string;
}

export interface SkillVideo {
  id: string;
  skillId?: string; // optional, some videos are general
  title: string;
  youtubeId: string;
  duration: number; // seconds
  timestamps: VideoTimestamp[];
  type: VideoType;
  thumbnailUrl?: string;
  createdAt: string;
}

// ============ ONBOARDING TYPES ============
export type OnboardingPath = 'new-user' | 'browse-skills' | 'starter-bundle' | 'skipped';

export interface OnboardingState {
  hasSeenOnboarding: boolean;
  selectedPath: OnboardingPath | null;
  dismissedAt?: number;
  completedSteps: string[];
}

// ============ ANALYTICS TYPES ============
export interface AnalyticsEvent {
  name: string;
  props?: Record<string, string | number | boolean>;
  timestamp: number;
}
```

**Tests**:
- [ ] Type exports compile without errors
- [ ] All required fields are present

---

## Phase 1: Onboarding Flow (Days 4-10)

### Task 1.1: Create Win31 Modal Base Component

**Goal**: Reusable modal following Win31 design patterns

**File**: `src/components/win31/Win31Modal.tsx`

**Design Spec**:
```
┌─────────────────────────────────────────────────────────┐
│ [■][_][X]  Modal Title                                  │ ← Navy gradient title bar
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    Content Area                         │ ← Gray background
│                                                         │
├─────────────────────────────────────────────────────────┤
│                            [Cancel]  [OK]               │ ← Footer with buttons
└─────────────────────────────────────────────────────────┘

- Border: 4px solid var(--win31-black)
- Box shadow: 12px 12px 0 rgba(0,0,0,0.5)
- Title bar: linear-gradient(90deg, var(--win31-navy), var(--win31-blue))
- Background overlay: rgba(0, 0, 0, 0.85)
- Z-index: 10000
```

**Implementation**:
```typescript
import React, { useEffect, useCallback } from 'react';
import { createLogger } from '@site/src/utils/logger';

const log = createLogger('Win31Modal');

interface Win31ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export default function Win31Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = '600px',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: Win31ModalProps): JSX.Element | null {

  // Escape key handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape') {
      log.debug('Modal closed via Escape key');
      onClose();
    }
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      log.debug('Modal opened:', title);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown, title]);

  if (!isOpen) return null;

  return (
    <div
      className="win31-modal-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="win31-modal-container"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="win31-modal-titlebar">
          <span id="modal-title" className="win31-modal-title">
            {title}
          </span>
          {showCloseButton && (
            <button
              className="win31-btn-3d win31-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              X
            </button>
          )}
        </div>

        {/* Content */}
        <div className="win31-modal-content">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="win31-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
```

**CSS** (add to `win31.css`):
```css
/* Win31 Modal Styles */
.win31-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.win31-modal-container {
  background: var(--win31-gray);
  border: 4px solid var(--win31-black);
  box-shadow: 12px 12px 0 rgba(0,0,0,0.5);
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.win31-modal-titlebar {
  background: linear-gradient(90deg, var(--win31-navy), var(--win31-blue));
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.win31-modal-title {
  color: white;
  font-weight: bold;
  font-family: var(--font-code);
  font-size: 14px;
}

.win31-modal-close {
  width: 24px;
  height: 24px;
  font-size: 14px;
  font-weight: bold;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.win31-modal-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.win31-modal-footer {
  padding: 12px 20px;
  border-top: 2px solid var(--win31-dark-gray);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}
```

**Tests** (`src/components/win31/__tests__/Win31Modal.test.tsx`):
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Win31Modal from '../Win31Modal';

describe('Win31Modal', () => {
  it('renders when isOpen is true', () => {
    render(
      <Win31Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Win31Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Win31Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Win31Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when X button clicked', () => {
    const onClose = vi.fn();
    render(
      <Win31Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Win31Modal>
    );
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape pressed', () => {
    const onClose = vi.fn();
    render(
      <Win31Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Win31Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    render(
      <Win31Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Win31Modal>
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when content clicked', () => {
    const onClose = vi.fn();
    render(
      <Win31Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Win31Modal>
    );
    fireEvent.click(screen.getByText('Content'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
```

**Worries**:
- Focus trap for accessibility (add later)
- Body scroll lock on iOS Safari
- Multiple modals stacking z-index

---

### Task 1.2: Create Onboarding Hook

**Goal**: Manage onboarding state with localStorage persistence

**File**: `src/hooks/useOnboarding.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { createLogger } from '@site/src/utils/logger';
import type { OnboardingState, OnboardingPath } from '@site/src/types/features';

const log = createLogger('useOnboarding');
const STORAGE_KEY = 'onboarding-state';

const DEFAULT_STATE: OnboardingState = {
  hasSeenOnboarding: false,
  selectedPath: null,
  completedSteps: [],
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingState;
        setState(parsed);
        log.debug('Loaded onboarding state:', parsed);
      }
    } catch (e) {
      log.warn('Failed to parse onboarding state:', e);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage on change
  const persistState = useCallback((newState: OnboardingState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      log.debug('Persisted onboarding state:', newState);
    } catch (e) {
      log.warn('Failed to persist onboarding state:', e);
    }
  }, []);

  const selectPath = useCallback((path: OnboardingPath) => {
    setState(prev => {
      const newState = {
        ...prev,
        hasSeenOnboarding: true,
        selectedPath: path,
        dismissedAt: Date.now(),
      };
      persistState(newState);
      log.info('User selected path:', path);
      return newState;
    });
  }, [persistState]);

  const dismiss = useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        hasSeenOnboarding: true,
        selectedPath: 'skipped' as OnboardingPath,
        dismissedAt: Date.now(),
      };
      persistState(newState);
      log.info('User dismissed onboarding');
      return newState;
    });
  }, [persistState]);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    localStorage.removeItem(STORAGE_KEY);
    log.info('Reset onboarding state');
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setState(prev => {
      if (prev.completedSteps.includes(stepId)) return prev;
      const newState = {
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
      };
      persistState(newState);
      log.debug('Completed onboarding step:', stepId);
      return newState;
    });
  }, [persistState]);

  return {
    state,
    isLoaded,
    shouldShowOnboarding: isLoaded && !state.hasSeenOnboarding,
    selectPath,
    dismiss,
    reset,
    completeStep,
  };
}
```

**Tests** (`src/hooks/__tests__/useOnboarding.test.ts`):
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useOnboarding } from '../useOnboarding';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useOnboarding', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('starts with default state', () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.state.hasSeenOnboarding).toBe(false);
    expect(result.current.state.selectedPath).toBe(null);
  });

  it('shows onboarding for new users', async () => {
    const { result } = renderHook(() => useOnboarding());
    // Wait for isLoaded
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
    expect(result.current.shouldShowOnboarding).toBe(true);
  });

  it('persists selected path', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => {
      result.current.selectPath('new-user');
    });
    expect(result.current.state.selectedPath).toBe('new-user');
    expect(result.current.state.hasSeenOnboarding).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('loads persisted state', () => {
    const stored = {
      hasSeenOnboarding: true,
      selectedPath: 'browse-skills',
      completedSteps: [],
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored));

    const { result } = renderHook(() => useOnboarding());
    expect(result.current.state.selectedPath).toBe('browse-skills');
    expect(result.current.shouldShowOnboarding).toBe(false);
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => {
      result.current.selectPath('new-user');
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state.hasSeenOnboarding).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
```

---

### Task 1.3: Create Onboarding Modal Component

**Goal**: Welcome wizard with path selection

**File**: `src/components/onboarding/OnboardingModal.tsx`

**Design Spec**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [■][_][X]  Welcome to Claude Skills                             │
├─────────────────┬───────────────────────────────────────────────┤
│  ┌─────────────┐│                                               │
│  │ 1. Welcome  ││  Welcome! What brings you here today?        │
│  │ ○ 2. Path   ││                                               │
│  │ ○ 3. Start  ││  ┌─────────────────────────────────────────┐  │
│  └─────────────┘│  │  🆕  I'm new to Claude Code             │  │
│                 │  │                                         │  │
│  ████░░░░░ 33%  │  │  Start with basics - learn how skills   │  │
│                 │  │  work and install your first one.       │  │
│                 │  └─────────────────────────────────────────┘  │
│                 │                                               │
│                 │  ┌─────────────────────────────────────────┐  │
│                 │  │  🔧  I want specific skills             │  │
│                 │  │                                         │  │
│                 │  │  Browse the gallery and find skills     │  │
│                 │  │  for your workflow.                     │  │
│                 │  └─────────────────────────────────────────┘  │
│                 │                                               │
│                 │  ┌─────────────────────────────────────────┐  │
│                 │  │  📦  Give me a starter bundle           │  │
│                 │  │                                         │  │
│                 │  │  One-click install of curated skills    │  │
│                 │  │  for common workflows.                  │  │
│                 │  └─────────────────────────────────────────┘  │
│                 ├───────────────────────────────────────────────┤
│                 │                    [Skip]      [Continue →]   │
└─────────────────┴───────────────────────────────────────────────┘
```

**Implementation**:
```typescript
import React, { useState } from 'react';
import { useHistory } from '@docusaurus/router';
import Win31Modal from '@site/src/components/win31/Win31Modal';
import { useOnboarding } from '@site/src/hooks/useOnboarding';
import { usePlausibleTracking } from '@site/src/hooks/usePlausibleTracking';
import { createLogger } from '@site/src/utils/logger';
import type { OnboardingPath } from '@site/src/types/features';

const log = createLogger('OnboardingModal');

interface PathOption {
  id: OnboardingPath;
  icon: string;
  title: string;
  description: string;
  destination: string;
}

const PATH_OPTIONS: PathOption[] = [
  {
    id: 'new-user',
    icon: '🆕',
    title: "I'm new to Claude Code",
    description: 'Start with basics - learn how skills work and install your first one.',
    destination: '/docs/tutorials/getting-started/install-first-skill',
  },
  {
    id: 'browse-skills',
    icon: '🔧',
    title: 'I want specific skills',
    description: 'Browse the gallery and find skills for your workflow.',
    destination: '/skills',
  },
  {
    id: 'starter-bundle',
    icon: '📦',
    title: 'Give me a starter bundle',
    description: 'One-click install of curated skills for common workflows.',
    destination: '/bundles',
  },
];

export default function OnboardingModal(): JSX.Element | null {
  const { shouldShowOnboarding, selectPath, dismiss } = useOnboarding();
  const { track } = usePlausibleTracking();
  const history = useHistory();
  const [selectedOption, setSelectedOption] = useState<OnboardingPath | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  if (!shouldShowOnboarding) return null;

  const handleContinue = () => {
    if (!selectedOption) return;

    const option = PATH_OPTIONS.find(p => p.id === selectedOption);
    if (!option) return;

    log.info('User continuing with path:', selectedOption);
    track('Onboarding Path Selected', { path: selectedOption });
    selectPath(selectedOption);
    history.push(option.destination);
  };

  const handleSkip = () => {
    log.info('User skipped onboarding');
    track('Onboarding Skipped', {});
    dismiss();
  };

  return (
    <Win31Modal
      isOpen={true}
      onClose={handleSkip}
      title="Welcome to Claude Skills"
      width="700px"
      footer={
        <>
          <button className="win31-push-button" onClick={handleSkip}>
            Skip
          </button>
          <button
            className="win31-push-button win31-push-button-default"
            onClick={handleContinue}
            disabled={!selectedOption}
          >
            Continue →
          </button>
        </>
      }
    >
      <div className="onboarding-layout">
        {/* Sidebar */}
        <div className="onboarding-sidebar">
          <div className="onboarding-steps">
            <div className={`onboarding-step ${currentStep >= 1 ? 'active' : ''}`}>
              1. Welcome
            </div>
            <div className={`onboarding-step ${currentStep >= 2 ? 'active' : ''}`}>
              ○ 2. Choose Path
            </div>
            <div className={`onboarding-step ${currentStep >= 3 ? 'active' : ''}`}>
              ○ 3. Get Started
            </div>
          </div>
          <div className="onboarding-progress">
            <div
              className="onboarding-progress-bar"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="onboarding-content">
          <h2 className="onboarding-heading">
            What brings you here today?
          </h2>

          <div className="onboarding-options">
            {PATH_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`onboarding-option ${selectedOption === option.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedOption(option.id);
                  setCurrentStep(2);
                  log.debug('Selected option:', option.id);
                }}
              >
                <span className="onboarding-option-icon">{option.icon}</span>
                <div className="onboarding-option-text">
                  <strong>{option.title}</strong>
                  <p>{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Win31Modal>
  );
}
```

**CSS** (add to `win31.css` or create `onboarding.css`):
```css
/* Onboarding Modal Styles */
.onboarding-layout {
  display: flex;
  gap: 24px;
  min-height: 300px;
}

.onboarding-sidebar {
  width: 140px;
  flex-shrink: 0;
  padding-right: 16px;
  border-right: 2px solid var(--win31-dark-gray);
}

.onboarding-steps {
  font-family: var(--font-system);
  font-size: 12px;
}

.onboarding-step {
  padding: 8px 0;
  color: var(--win31-dark-gray);
}

.onboarding-step.active {
  color: var(--win31-black);
  font-weight: bold;
}

.onboarding-progress {
  margin-top: 16px;
  height: 8px;
  background: var(--win31-dark-gray);
  border: 1px inset var(--win31-gray);
}

.onboarding-progress-bar {
  height: 100%;
  background: var(--win31-navy);
  transition: width 0.3s ease;
}

.onboarding-content {
  flex: 1;
}

.onboarding-heading {
  font-family: var(--font-window);
  font-size: 18px;
  color: var(--win31-navy);
  margin: 0 0 20px 0;
}

.onboarding-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.onboarding-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--win31-white);
  border: 2px solid var(--win31-dark-gray);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.onboarding-option:hover {
  border-color: var(--win31-navy);
  background: #fff8dc;
}

.onboarding-option.selected {
  border-color: var(--win31-navy);
  background: #e8f4ff;
  box-shadow: inset 0 0 0 2px var(--win31-navy);
}

.onboarding-option-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.onboarding-option-text {
  flex: 1;
}

.onboarding-option-text strong {
  display: block;
  font-family: var(--font-code);
  font-size: 14px;
  margin-bottom: 4px;
}

.onboarding-option-text p {
  margin: 0;
  font-size: 13px;
  color: var(--win31-dark-gray);
  line-height: 1.4;
}
```

**Tests**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OnboardingModal from '../OnboardingModal';
import { useOnboarding } from '@site/src/hooks/useOnboarding';

vi.mock('@site/src/hooks/useOnboarding');
vi.mock('@docusaurus/router', () => ({
  useHistory: () => ({ push: vi.fn() }),
}));

describe('OnboardingModal', () => {
  beforeEach(() => {
    vi.mocked(useOnboarding).mockReturnValue({
      shouldShowOnboarding: true,
      selectPath: vi.fn(),
      dismiss: vi.fn(),
      // ... other properties
    });
  });

  it('renders path options', () => {
    render(<OnboardingModal />);
    expect(screen.getByText("I'm new to Claude Code")).toBeInTheDocument();
    expect(screen.getByText('I want specific skills')).toBeInTheDocument();
    expect(screen.getByText('Give me a starter bundle')).toBeInTheDocument();
  });

  it('enables Continue button when option selected', () => {
    render(<OnboardingModal />);
    const continueBtn = screen.getByText('Continue →');
    expect(continueBtn).toBeDisabled();

    fireEvent.click(screen.getByText("I'm new to Claude Code"));
    expect(continueBtn).not.toBeDisabled();
  });

  it('calls dismiss when Skip clicked', () => {
    const dismiss = vi.fn();
    vi.mocked(useOnboarding).mockReturnValue({
      shouldShowOnboarding: true,
      selectPath: vi.fn(),
      dismiss,
    });

    render(<OnboardingModal />);
    fireEvent.click(screen.getByText('Skip'));
    expect(dismiss).toHaveBeenCalled();
  });
});
```

**Worries**:
- Mobile responsive layout (stack sidebar above content)
- Keyboard accessibility (arrow keys to select options)
- Screen reader announcements

---

### Task 1.4: Integrate Onboarding into Homepage

**Goal**: Show onboarding modal on first visit

**File**: Modify `src/pages/index.tsx`

```typescript
// Add import at top
import OnboardingModal from '@site/src/components/onboarding/OnboardingModal';

// Inside Home component, add:
export default function Home(): JSX.Element {
  // ... existing code ...

  return (
    <Layout>
      {/* Add at the start of Layout children */}
      <OnboardingModal />

      {/* ... rest of existing content ... */}
    </Layout>
  );
}
```

**Tests**:
- [ ] Modal appears on first visit (empty localStorage)
- [ ] Modal does not appear on return visit
- [ ] Path selection navigates to correct page
- [ ] Analytics events fire correctly

---

### Task 1.5: Add Analytics for Onboarding

**Goal**: Track onboarding funnel in Plausible

**Events to Track**:
| Event | Properties | When |
|-------|------------|------|
| `Onboarding Shown` | `{ firstVisit: boolean }` | Modal opens |
| `Onboarding Path Selected` | `{ path: string }` | User selects option |
| `Onboarding Completed` | `{ path: string, timeSpent: number }` | User clicks Continue |
| `Onboarding Skipped` | `{ timeSpent: number }` | User clicks Skip |

**Implementation** (in `OnboardingModal.tsx`):
```typescript
// Track modal shown on mount
useEffect(() => {
  if (shouldShowOnboarding) {
    track('Onboarding Shown', { firstVisit: true });
    startTimeRef.current = Date.now();
  }
}, [shouldShowOnboarding]);

// Track completion with time spent
const handleContinue = () => {
  const timeSpent = Date.now() - startTimeRef.current;
  track('Onboarding Completed', {
    path: selectedOption,
    timeSpent: Math.round(timeSpent / 1000), // seconds
  });
  // ... rest of handler
};
```

---

## Phase 2: Tutorial System (Days 11-25)

### Task 2.1: Create Tutorial Progress Hook

**File**: `src/hooks/useTutorialProgress.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { createLogger } from '@site/src/utils/logger';
import type { TutorialProgress } from '@site/src/types/features';

const log = createLogger('useTutorialProgress');
const STORAGE_KEY = 'tutorial-progress';

export function useTutorialProgress(tutorialId: string) {
  const [progress, setProgress] = useState<TutorialProgress | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allProgress: Record<string, TutorialProgress> = JSON.parse(stored);
        if (allProgress[tutorialId]) {
          setProgress(allProgress[tutorialId]);
          log.debug('Loaded progress for', tutorialId, allProgress[tutorialId]);
        }
      }
    } catch (e) {
      log.warn('Failed to load tutorial progress:', e);
    }
    setIsLoaded(true);
  }, [tutorialId]);

  const persistProgress = useCallback((newProgress: TutorialProgress) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allProgress = stored ? JSON.parse(stored) : {};
      allProgress[tutorialId] = newProgress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
      log.debug('Persisted progress for', tutorialId);
    } catch (e) {
      log.warn('Failed to persist tutorial progress:', e);
    }
  }, [tutorialId]);

  const markStepComplete = useCallback((stepId: string) => {
    setProgress(prev => {
      const base = prev || {
        tutorialId,
        currentStep: 0,
        completedSteps: [],
        startedAt: Date.now(),
        lastAccessedAt: Date.now(),
      };

      if (base.completedSteps.includes(stepId)) return base;

      const newProgress = {
        ...base,
        completedSteps: [...base.completedSteps, stepId],
        lastAccessedAt: Date.now(),
      };

      persistProgress(newProgress);
      log.info('Step completed:', stepId);
      return newProgress;
    });
  }, [tutorialId, persistProgress]);

  const isStepComplete = useCallback((stepId: string): boolean => {
    return progress?.completedSteps.includes(stepId) || false;
  }, [progress]);

  const resetProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allProgress = JSON.parse(stored);
        delete allProgress[tutorialId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
      }
      setProgress(null);
      log.info('Reset progress for', tutorialId);
    } catch (e) {
      log.warn('Failed to reset tutorial progress:', e);
    }
  }, [tutorialId]);

  const completionPercentage = progress
    ? Math.round((progress.completedSteps.length / (progress.currentStep || 1)) * 100)
    : 0;

  return {
    progress,
    isLoaded,
    markStepComplete,
    isStepComplete,
    resetProgress,
    completionPercentage,
    isStarted: progress !== null,
    isComplete: progress?.completedAt !== undefined,
  };
}
```

---

### Task 2.2: Create Tutorial Step Component

**File**: `src/components/tutorial/TutorialStep.tsx`

**Design Spec**:
```
┌────────────────────────────────────────────────────────────┐
│ [?]  Step 2: Run the install command                   [▾] │ ← Collapsible header
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Copy and paste this command into your terminal:          │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  claude mcp add skill-coach                   [📋] │   │ ← Code block with copy
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  You should see "Skill installed successfully".           │
│                                                            │
│                               [← Back]  [Mark Complete ✓]  │
└────────────────────────────────────────────────────────────┘
```

**Implementation**: (Approximately 150 lines - see full implementation in master plan)

**Tests**:
```typescript
describe('TutorialStep', () => {
  it('renders step title and content', () => {});
  it('shows completed state when marked complete', () => {});
  it('calls onComplete when button clicked', () => {});
  it('copies code to clipboard when copy button clicked', () => {});
  it('collapses/expands on header click', () => {});
});
```

---

### Task 2.3: Create Tutorial Layout Component

**File**: `src/components/tutorial/TutorialLayout.tsx`

**Goal**: Wrapper for tutorial pages with progress sidebar

```typescript
interface TutorialLayoutProps {
  tutorial: Tutorial;
  children: React.ReactNode;
}
```

---

### Task 2.4: Create First 4 Beginner Tutorials (MDX)

**Files to Create**:
```
docs/tutorials/getting-started/
├── _category_.json
├── install-first-skill.mdx
├── what-makes-great-skill.mdx
├── using-skills-effectively.mdx
└── customizing-workflow.mdx
```

**Example Tutorial** (`install-first-skill.mdx`):
```mdx
---
sidebar_position: 1
title: Install Your First Skill
description: Learn to install a Claude skill in under 5 minutes
---

import TutorialStep from '@site/src/components/tutorial/TutorialStep';
import TutorialProgress from '@site/src/components/tutorial/TutorialProgress';

# Install Your First Skill

<TutorialProgress tutorialId="install-first-skill" totalSteps={3} />

Welcome! In this tutorial, you'll learn how to install your first Claude skill.

## Prerequisites

- Claude Code installed (`npm install -g @anthropic/claude-code`)
- Terminal access

## Steps

<TutorialStep
  tutorialId="install-first-skill"
  stepId="open-terminal"
  stepNumber={1}
  title="Open your terminal"
  estimatedTime={1}
>
  Launch Terminal on Mac (⌘+Space → "Terminal") or Command Prompt on Windows.
</TutorialStep>

<TutorialStep
  tutorialId="install-first-skill"
  stepId="run-install"
  stepNumber={2}
  title="Run the install command"
  estimatedTime={1}
  codeExample="claude mcp add skill-coach"
>
  Copy and paste this command to install the Skill Coach skill.
</TutorialStep>

<TutorialStep
  tutorialId="install-first-skill"
  stepId="verify"
  stepNumber={3}
  title="Verify installation"
  estimatedTime={1}
  codeExample='claude "Help me create a custom skill"'
>
  Test your new skill by asking Claude for help.
</TutorialStep>

## Next Steps

- [What Makes a Great Skill](/docs/tutorials/getting-started/what-makes-great-skill)
- [Browse All Skills](/skills)
```

---

### Task 2.5: Add Tutorial Analytics

**Events to Track**:
| Event | Properties |
|-------|------------|
| `Tutorial Started` | `{ tutorialId, difficulty }` |
| `Tutorial Step Completed` | `{ tutorialId, stepId, stepNumber }` |
| `Tutorial Completed` | `{ tutorialId, timeSpent, stepsCompleted }` |
| `Tutorial Abandoned` | `{ tutorialId, lastStep, completionRate }` |

---

## Phase 3: Skill Bundles (Days 26-35)

### Task 3.1: Create Bundle YAML Schema

**File**: `bundles/schema.yaml` (for reference)
```yaml
# Bundle Schema
id: string (required, kebab-case)
title: string (required)
description: string (required)
icon: string (emoji, required)
color: enum (yellow, lime, teal, magenta, blue)
skills: array of skill IDs (required, min 3)
category: string (required)
difficulty: enum (beginner, intermediate, advanced)
estimatedSetupTime: number (minutes)
useCases: array of strings
featured: boolean (optional)
```

---

### Task 3.2: Create Bundle Definitions

**Files**:
```
bundles/
├── starter-pack.yaml
├── web-developer.yaml
├── ml-researcher.yaml
├── content-creator.yaml
├── devops-pro.yaml
└── founder-toolkit.yaml
```

**Example** (`starter-pack.yaml`):
```yaml
id: starter-pack
title: Starter Pack
description: Essential skills for getting started with Claude Code
icon: "🚀"
color: lime
skills:
  - skill-coach
  - code-review-expert
  - debugging-wizard
  - documentation-writer
  - git-workflow-helper
category: Getting Started
difficulty: beginner
estimatedSetupTime: 3
useCases:
  - Learning Claude Code basics
  - Setting up development workflow
  - First-time skill installation
featured: true
```

---

### Task 3.3: Create Bundle Generator Script

**File**: `scripts/generateBundles.ts`

```typescript
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import type { SkillBundle } from '../src/types/features';

const BUNDLES_DIR = path.join(__dirname, '../bundles');
const OUTPUT_FILE = path.join(__dirname, '../src/data/bundles.ts');

function generateBundles(): void {
  console.log('Generating bundles...');

  const bundleFiles = fs.readdirSync(BUNDLES_DIR)
    .filter(f => f.endsWith('.yaml') && f !== 'schema.yaml');

  const bundles: SkillBundle[] = [];

  for (const file of bundleFiles) {
    const content = fs.readFileSync(path.join(BUNDLES_DIR, file), 'utf-8');
    const bundle = yaml.parse(content) as Omit<SkillBundle, 'installCommand'>;

    // Generate install command
    const installCommand = bundle.skills
      .map(skill => `claude mcp add ${skill}`)
      .join(' && ');

    bundles.push({
      ...bundle,
      installCommand,
      createdAt: new Date().toISOString(),
    });

    console.log(`  ✓ ${bundle.title} (${bundle.skills.length} skills)`);
  }

  // Generate TypeScript
  const tsContent = `/**
 * Skill Bundles Registry
 * AUTO-GENERATED - DO NOT EDIT
 * Run: npm run generate:bundles
 */

import type { SkillBundle } from '../types/features';

export const SKILL_BUNDLES: SkillBundle[] = ${JSON.stringify(bundles, null, 2)};

export function getBundleById(id: string): SkillBundle | undefined {
  return SKILL_BUNDLES.find(b => b.id === id);
}

export function getBundlesByCategory(category: string): SkillBundle[] {
  return SKILL_BUNDLES.filter(b => b.category === category);
}

export function getFeaturedBundles(): SkillBundle[] {
  return SKILL_BUNDLES.filter(b => b.featured);
}
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent);
  console.log(`\n✓ Generated ${bundles.length} bundles → ${OUTPUT_FILE}`);
}

generateBundles();
```

**Add to `package.json`**:
```json
{
  "scripts": {
    "generate:bundles": "tsx scripts/generateBundles.ts",
    "prebuild": "npm run generate:bundles"
  }
}
```

---

### Task 3.4: Create BundleCard Component

**File**: `src/components/bundle/BundleCard.tsx`

(See design spec in master plan - 3D software box with expand/collapse)

---

### Task 3.5: Create Bundles Gallery Page

**File**: `src/pages/bundles.tsx`

```typescript
import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { SKILL_BUNDLES, getFeaturedBundles } from '@site/src/data/bundles';
import BundleCard from '@site/src/components/bundle/BundleCard';

export default function BundlesPage(): JSX.Element {
  const [filter, setFilter] = useState<string>('all');

  const featured = getFeaturedBundles();
  const categories = [...new Set(SKILL_BUNDLES.map(b => b.category))];

  const filteredBundles = filter === 'all'
    ? SKILL_BUNDLES
    : SKILL_BUNDLES.filter(b => b.category === filter);

  return (
    <Layout title="Skill Bundles" description="Curated skill collections for common workflows">
      <main className="container" style={{ padding: '40px 20px' }}>
        <h1>Skill Bundles</h1>
        <p>One-click installation of curated skill collections.</p>

        {/* Featured Section */}
        {featured.length > 0 && (
          <section>
            <h2>Featured Bundles</h2>
            <div className="bundles-grid">
              {featured.map(bundle => (
                <BundleCard key={bundle.id} bundle={bundle} />
              ))}
            </div>
          </section>
        )}

        {/* Filter */}
        <div className="bundles-filter">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* All Bundles */}
        <div className="bundles-grid">
          {filteredBundles.map(bundle => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
```

---

## Phase 4: Video System (Days 36-50)

### Task 4.1: Create Win31VideoPlayer Component

**File**: `src/components/video/Win31VideoPlayer.tsx`

(See design spec in master plan - Media Player with VCR controls and chapters)

---

### Task 4.2: Create Video Gallery Page

**File**: `src/pages/videos.tsx`

---

### Task 4.3: Integrate Videos with Skill Pages

**Goal**: Show related videos on skill documentation pages

---

## Phase 5: UX Fixes (Days 51-60)

### Task 5.1: Fix Marquee ADHD Issue

**Changes to `src/pages/index.tsx`**:
- Add grid/screensaver toggle
- Default to grid mode
- Pause on hover
- Slow animation (120s instead of current)

---

### Task 5.2: Fix QuickView Button Hierarchy

**Changes to `src/components/SkillQuickView.tsx`**:
- Make "Copy Install Command" the primary CTA
- Group secondary actions (Docs, Download, Star)
- Move tertiary actions to text links

---

### Task 5.3: Simplify Homepage Above-Fold

**Changes to `src/pages/index.tsx`**:
- Reduce elements to 7 or fewer
- Use progressive disclosure
- Integrate onboarding as the discovery path

---

## Testing Strategy

### Unit Tests (Vitest)

**What to Test**:
- Hooks: State transitions, localStorage persistence
- Components: Rendering, user interactions, accessibility
- Utilities: Pure functions, data transformations

**Test File Naming**: `ComponentName.test.tsx` or `hookName.test.ts`

**Coverage Target**: 80% for hooks, 70% for components

### Integration Tests

**What to Test**:
- Onboarding flow end-to-end
- Tutorial completion flow
- Bundle installation flow

### Manual Testing Checklist

Before each deploy:
- [ ] Onboarding shows for new user (incognito)
- [ ] Onboarding persists after page refresh
- [ ] Tutorial progress saves correctly
- [ ] Bundle install command copies correctly
- [ ] Video player loads and plays
- [ ] Mobile responsive (375px, 768px)
- [ ] Keyboard navigation works
- [ ] Screen reader announcements work

---

## Logging Strategy

### Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| `debug` | Development only | Hook state changes, render timing |
| `info` | User actions | "User selected path: new-user" |
| `warn` | Recoverable issues | "Failed to load from localStorage" |
| `error` | Unrecoverable issues | "API call failed" |

### Log Namespaces

- `Onboarding` - Onboarding flow
- `Tutorial` - Tutorial progress
- `Bundle` - Bundle operations
- `Video` - Video player
- `Analytics` - Event tracking

### Production Behavior

- `debug` and `info` disabled
- `warn` and `error` logged to console
- Consider integrating with Sentry for error tracking

---

## Deployment Checklist

Before each release:

1. [ ] All tests pass (`npm test`)
2. [ ] TypeScript compiles (`npm run build`)
3. [ ] Lint passes (`npm run lint`)
4. [ ] Manual testing complete
5. [ ] Bundle generator runs (`npm run generate:bundles`)
6. [ ] Analytics events verified in Plausible

---

## Risk Tracking

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| localStorage quota exceeded | Low | Medium | Implement cleanup for old progress |
| Mobile Safari scroll lock | Medium | Low | Test in Safari, use touch-action |
| YouTube embed blocked | Low | High | Show fallback with link |
| Build time increases | Medium | Low | Lazy load heavy components |
| Analytics blocked by adblockers | Medium | Low | Accept reduced data, use server-side fallback |

---

## Summary

**Total Tasks**: 25+ discrete implementation tasks
**Estimated Time**: 8-12 weeks for solo founder
**Critical Path**: Onboarding → Tutorials → Bundles → Videos

**Key Files to Create**:
- 10+ new components in `src/components/`
- 3+ new hooks in `src/hooks/`
- 6+ bundle YAML files in `bundles/`
- 4+ tutorial MDX files in `docs/tutorials/`
- 2+ new pages in `src/pages/`

**Test Coverage Goals**:
- Hooks: 80%+
- Components: 70%+
- Integration: Key flows covered

**Start with**: Task 0.1 (Dev environment) then Task 1.1 (Win31Modal)
