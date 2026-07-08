'use client';

import React, { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import styles from './PromptInput.module.css';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  /** Free Cloudflare-powered drawings remaining (null = unknown/loading). */
  usesRemaining?: number | null;
  /** Total free drawings granted per user. */
  usesLimit?: number;
  /** True when the user has their own API key (unlimited, no counter). */
  unlimited?: boolean;
}

export function PromptInput({
  onSubmit,
  isLoading,
  disabled,
  usesRemaining,
  usesLimit = 5,
  unlimited,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading && !disabled) {
      onSubmit(prompt.trim());
    }
  };

  const outOfFree = !unlimited && usesRemaining === 0;

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to draw... (e.g., 'a sunset over mountains')"
          className={styles.input}
          disabled={isLoading || disabled}
        />
      </div>
      <span
        className={styles.quota}
        title={
          unlimited
            ? 'Using your own API key — unlimited drawings'
            : 'Free AI drawings powered by Cloudflare. Add your own API key in Settings for unlimited.'
        }
      >
        {unlimited
          ? '∞ unlimited'
          : usesRemaining === null || usesRemaining === undefined
            ? `${usesLimit} free`
            : outOfFree
              ? '0 left — add key in Settings'
              : `${usesRemaining} / ${usesLimit} free left`}
      </span>
      <button
        type="submit"
        className={styles.button}
        disabled={!prompt.trim() || isLoading || disabled}
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className={styles.spinner} />
            <span>Thinking...</span>
          </>
        ) : (
          <>
            <Wand2 size={14} />
            <span>Paint it!</span>
          </>
        )}
      </button>
    </form>
  );
}
