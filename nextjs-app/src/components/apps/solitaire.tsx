'use client';

/**
 * SOLITAIRE.EXE - Windows 3.1 Solitaire Game
 * 
 * Simple card game display (not fully playable, but visually authentic)
 */

import React, { useState, useCallback } from 'react';
import styles from './solitaire.module.css';

// Card suits and values
const SUITS = ['♠', '♥', '♦', '♣'] as const;
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

interface Card {
  suit: typeof SUITS[number];
  value: typeof VALUES[number];
  faceUp: boolean;
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value, faceUp: false });
    }
  }
  return shuffleDeck(deck);
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function Solitaire() {
  const [deck] = useState(() => createDeck());
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Click Deal to start');

  // Create tableau (7 columns)
  const tableau = Array.from({ length: 7 }, (_, i) => {
    const cards = deck.slice(i * (i + 1) / 2, (i + 1) * (i + 2) / 2);
    if (cards.length > 0) {
      cards[cards.length - 1].faceUp = true;
    }
    return cards;
  });

  const handleDeal = useCallback(() => {
    setScore(0);
    setMessage('Game started! Find the aces...');
  }, []);

  const isRed = (suit: string) => suit === '♥' || suit === '♦';

  return (
    <div className={styles.solitaire}>
      {/* Top area: Stock, Waste, and Foundation */}
      <div className={styles.topArea}>
        <div className={styles.stockWaste}>
          {/* Stock pile */}
          <div className={styles.cardPile}>
            <div className={styles.cardBack}>
              <div className={styles.cardBackPattern} />
            </div>
          </div>
          {/* Waste pile */}
          <div className={styles.cardPile}>
            <div className={styles.cardFace}>
              <span className={styles.cardRed}>♥</span>
              <span className={styles.cardValue}>7</span>
            </div>
          </div>
        </div>

        {/* Foundation piles (4) */}
        <div className={styles.foundation}>
          {SUITS.map((suit) => (
            <div key={suit} className={styles.foundationPile}>
              <span className={isRed(suit) ? styles.cardRed : styles.cardBlack}>
                {suit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className={styles.tableau}>
        {tableau.map((column, colIdx) => (
          <div key={colIdx} className={styles.column}>
            {column.map((card, cardIdx) => (
              <div 
                key={`${card.suit}-${card.value}-${cardIdx}`}
                className={`${styles.tableauCard} ${card.faceUp ? styles.faceUp : ''}`}
                style={{ top: `${cardIdx * 20}px` }}
              >
                {card.faceUp ? (
                  <div className={styles.cardFace}>
                    <span className={isRed(card.suit) ? styles.cardRed : styles.cardBlack}>
                      {card.value}
                    </span>
                    <span className={isRed(card.suit) ? styles.cardRed : styles.cardBlack}>
                      {card.suit}
                    </span>
                  </div>
                ) : (
                  <div className={styles.cardBack}>
                    <div className={styles.cardBackPattern} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span className={styles.score}>Score: {score}</span>
        <span className={styles.message}>{message}</span>
        <button className={styles.dealButton} onClick={handleDeal}>
          Deal
        </button>
      </div>
    </div>
  );
}
