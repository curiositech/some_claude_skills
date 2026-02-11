/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MEMPHIS GROUP × WINDOWS 3.1
 * Component exports for the retro-future skill gallery
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Core window system
export {
  ProgramManager,
  Win31Window,
  Win31Button,
  Win31Dialog,
  type ProgramGroup,
  type ProgramIcon,
} from './program-manager';

// File Manager
export { FileManager } from './file-manager';

// Animated backgrounds
export {
  Win31Clock,
  Win31Solitaire,
  Win31Minesweeper,
  QBasicGorillas,
  DesktopScene,
} from './animated-backgrounds';

// Tutorial wizard system
export {
  TutorialWizard,
  TUTORIALS,
  type TutorialStep,
  type TutorialId,
} from './tutorial-wizard';
