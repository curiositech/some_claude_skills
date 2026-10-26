import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Win31Modal.module.css';

export interface Win31ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: string;
  showCloseButton?: boolean;
}

/**
 * Windows 3.1 style modal dialog
 *
 * Features:
 * - Navy gradient title bar
 * - 3D beveled borders
 * - Portal rendering (outside DOM hierarchy)
 * - Escape key support
 * - Body scroll lock when open
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Win31Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Welcome"
 *   icon="📄"
 * >
 *   <p>Modal content here</p>
 * </Win31Modal>
 * ```
 */
export const Win31Modal: React.FC<Win31ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  icon = '📄',
  showCloseButton = true,
}) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Lock scroll
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore scroll
        document.body.style.overflow = '';

        // Restore focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.titleBar}>
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
          <span className={styles.title} id="modal-title">
            {title}
          </span>
          {showCloseButton && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );

  // Render in portal (outside React root)
  return createPortal(modalContent, document.body);
};
