'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ANIMATED BACKGROUNDS - Win3.1 accessories as ambient decorations
 * Clock, Solitaire, QBasic Gorillas animating in the background
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * WIN31 CLOCK - Analog clock with Memphis colors
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface Win31ClockProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Win31Clock({ size = 150, className, style }: Win31ClockProps) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondAngle = (seconds / 60) * 360;
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360;
  const hourAngle = ((hours + minutes / 60) / 12) * 360;

  return (
    <div
      className={cn('win31-window', className)}
      style={{ width: size + 8, ...style }}
    >
      {/* Title bar */}
      <div className="win31-titlebar text-[10px] py-0.5">
        <span className="win31-titlebar-text">Clock</span>
        <button className="win31-titlebar-btn win31-titlebar-btn-minimize w-3 h-2" />
      </div>

      {/* Menu */}
      <div className="win31-menubar text-[9px] py-0">
        <span className="win31-menubar-item px-2 py-0.5">Settings</span>
      </div>

      {/* Clock face */}
      <div className="p-2 flex items-center justify-center bg-[var(--memphis-cream)]">
        <svg width={size} height={size} viewBox="0 0 100 100">
          {/* Clock face background */}
          <circle cx="50" cy="50" r="48" fill="white" stroke="var(--memphis-black)" strokeWidth="2" />
          
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = 50 + 38 * Math.cos(angle);
            const y1 = 50 + 38 * Math.sin(angle);
            const x2 = 50 + 44 * Math.cos(angle);
            const y2 = 50 + 44 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--memphis-black)"
                strokeWidth={i % 3 === 0 ? 2 : 1}
              />
            );
          })}

          {/* Hour hand */}
          <line
            x1="50"
            y1="50"
            x2={50 + 25 * Math.cos((hourAngle - 90) * (Math.PI / 180))}
            y2={50 + 25 * Math.sin((hourAngle - 90) * (Math.PI / 180))}
            stroke="var(--memphis-purple)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Minute hand */}
          <line
            x1="50"
            y1="50"
            x2={50 + 35 * Math.cos((minuteAngle - 90) * (Math.PI / 180))}
            y2={50 + 35 * Math.sin((minuteAngle - 90) * (Math.PI / 180))}
            stroke="var(--memphis-cyan)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Second hand */}
          <line
            x1="50"
            y1="50"
            x2={50 + 40 * Math.cos((secondAngle - 90) * (Math.PI / 180))}
            y2={50 + 40 * Math.sin((secondAngle - 90) * (Math.PI / 180))}
            stroke="var(--memphis-pink)"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Center dot */}
          <circle cx="50" cy="50" r="3" fill="var(--memphis-coral)" />
        </svg>
      </div>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * WIN31 SOLITAIRE - Animated card dealing
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface SolitaireProps {
  className?: string;
  style?: React.CSSProperties;
}

const CARD_SUITS = ['♠', '♥', '♦', '♣'];
const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function generateCard() {
  const suit = CARD_SUITS[Math.floor(Math.random() * 4)];
  const value = CARD_VALUES[Math.floor(Math.random() * 13)];
  const isRed = suit === '♥' || suit === '♦';
  return { suit, value, isRed };
}

export function Win31Solitaire({ className, style }: SolitaireProps) {
  const [cards, setCards] = React.useState<Array<{
    id: number;
    card: { suit: string; value: string; isRed: boolean };
    x: number;
    y: number;
    rotation: number;
    opacity: number;
  }>>([]);

  React.useEffect(() => {
    let cardId = 0;
    const interval = setInterval(() => {
      const newCard = {
        id: cardId++,
        card: generateCard(),
        x: Math.random() * 200,
        y: -50,
        rotation: (Math.random() - 0.5) * 30,
        opacity: 1,
      };

      setCards(prev => [...prev.slice(-15), newCard]); // Keep max 15 cards
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Animate cards falling
  React.useEffect(() => {
    const animate = setInterval(() => {
      setCards(prev =>
        prev.map(c => ({
          ...c,
          y: c.y + 2,
          opacity: c.y > 150 ? Math.max(0, c.opacity - 0.05) : c.opacity,
        })).filter(c => c.opacity > 0)
      );
    }, 50);

    return () => clearInterval(animate);
  }, []);

  return (
    <div
      className={cn('win31-window overflow-hidden', className)}
      style={{ width: 260, height: 200, ...style }}
    >
      {/* Title bar */}
      <div className="win31-titlebar text-[10px] py-0.5">
        <span className="win31-titlebar-text">Solitaire</span>
      </div>

      {/* Menu */}
      <div className="win31-menubar text-[9px] py-0">
        <span className="win31-menubar-item px-2 py-0.5">Game</span>
        <span className="win31-menubar-item px-2 py-0.5">Help</span>
      </div>

      {/* Game area */}
      <div className="relative bg-[#008000] flex-1 overflow-hidden" style={{ height: 160 }}>
        {/* Card slots at top */}
        <div className="absolute top-2 left-2 flex gap-1">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="w-8 h-11 border border-white/30 rounded-sm"
            />
          ))}
        </div>

        {/* Falling cards */}
        {cards.map(({ id, card, x, y, rotation, opacity }) => (
          <div
            key={id}
            className="absolute w-7 h-10 bg-white rounded-sm border border-gray-300 flex items-center justify-center text-xs font-bold shadow-sm"
            style={{
              left: x,
              top: y,
              transform: `rotate(${rotation}deg)`,
              opacity,
              color: card.isRed ? '#c00' : '#000',
            }}
          >
            <span>{card.value}</span>
            <span className="text-[10px]">{card.suit}</span>
          </div>
        ))}

        {/* Score */}
        <div className="absolute bottom-1 right-2 text-white text-[10px]">
          Score: {Math.floor(Math.random() * 1000)} Time: {Math.floor(Math.random() * 300)}
        </div>
      </div>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * QBASIC GORILLAS - Banana-throwing gorillas cityscape
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface GorillasProps {
  className?: string;
  style?: React.CSSProperties;
}

export function QBasicGorillas({ className, style }: GorillasProps) {
  const [bananas, setBananas] = React.useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
  }>>([]);

  const [gorilla1Arm, setGorilla1Arm] = React.useState(0);
  const [gorilla2Arm, setGorilla2Arm] = React.useState(0);

  // Generate buildings once
  const buildings = React.useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      x: i * 36,
      width: 32,
      height: 40 + Math.random() * 60,
      color: ['#c00', '#0a0', '#00a', '#a0a', '#0aa', '#aa0', '#aaa', '#888'][i % 8],
    }));
  }, []);

  // Throw bananas periodically
  React.useEffect(() => {
    let bananaId = 0;
    const interval = setInterval(() => {
      const fromLeft = Math.random() > 0.5;
      const startX = fromLeft ? 30 : 260;
      const targetX = fromLeft ? 260 : 30;
      
      if (fromLeft) {
        setGorilla1Arm(1);
        setTimeout(() => setGorilla1Arm(0), 200);
      } else {
        setGorilla2Arm(1);
        setTimeout(() => setGorilla2Arm(0), 200);
      }

      setBananas(prev => [...prev.slice(-5), {
        id: bananaId++,
        x: startX,
        y: 50,
        vx: (targetX - startX) / 100,
        vy: -4,
        rotation: 0,
      }]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Animate bananas
  React.useEffect(() => {
    const animate = setInterval(() => {
      setBananas(prev =>
        prev.map(b => ({
          ...b,
          x: b.x + b.vx,
          y: b.y + b.vy,
          vy: b.vy + 0.15, // gravity
          rotation: b.rotation + 10,
        })).filter(b => b.y < 150)
      );
    }, 30);

    return () => clearInterval(animate);
  }, []);

  return (
    <div
      className={cn('win31-window overflow-hidden', className)}
      style={{ width: 300, height: 180, ...style }}
    >
      {/* Title bar */}
      <div className="win31-titlebar text-[10px] py-0.5 bg-[#0000aa]">
        <span className="win31-titlebar-text">GORILLA.BAS</span>
      </div>

      {/* Game area - CGA-style blue background */}
      <div className="relative bg-[#0000aa] flex-1 overflow-hidden" style={{ height: 160 }}>
        {/* Sun */}
        <div
          className="absolute text-2xl"
          style={{ top: 5, left: '50%', transform: 'translateX(-50%)' }}
        >
          🌞
        </div>

        {/* City skyline */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {buildings.map((b, i) => (
            <div
              key={i}
              style={{
                width: b.width,
                height: b.height,
                backgroundColor: b.color,
                marginLeft: i === 0 ? 0 : 4,
              }}
              className="relative"
            >
              {/* Windows */}
              {[...Array(Math.floor(b.height / 12))].map((_, row) =>
                [...Array(2)].map((_, col) => (
                  <div
                    key={`${row}-${col}`}
                    className="absolute w-2 h-2"
                    style={{
                      left: 4 + col * 14,
                      top: 4 + row * 12,
                      backgroundColor: Math.random() > 0.3 ? '#ff0' : '#000',
                    }}
                  />
                ))
              )}
            </div>
          ))}
        </div>

        {/* Gorilla 1 (left) */}
        <div
          className="absolute text-3xl"
          style={{
            bottom: buildings[1]?.height + 5 || 80,
            left: 20,
            transform: gorilla1Arm ? 'scaleX(-1)' : 'none',
          }}
        >
          🦍
        </div>

        {/* Gorilla 2 (right) */}
        <div
          className="absolute text-3xl"
          style={{
            bottom: buildings[6]?.height + 5 || 80,
            right: 20,
            transform: gorilla2Arm ? 'scaleX(-1)' : 'none',
          }}
        >
          🦍
        </div>

        {/* Flying bananas */}
        {bananas.map(({ id, x, y, rotation }) => (
          <div
            key={id}
            className="absolute text-lg"
            style={{
              left: x,
              top: y,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            🍌
          </div>
        ))}

        {/* Score */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#0000aa] px-2 text-white text-[10px]">
          0 &gt; Score &lt; 0
        </div>
      </div>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * MINESWEEPER - Classic grid game
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface MinesweeperProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Win31Minesweeper({ className, style }: MinesweeperProps) {
  const [grid] = React.useState(() =>
    [...Array(8)].map(() =>
      [...Array(8)].map(() => ({
        revealed: Math.random() > 0.7,
        value: Math.floor(Math.random() * 4),
        isMine: Math.random() > 0.85,
        flagged: false,
      }))
    )
  );

  const [smiley, setSmiley] = React.useState('😊');

  // Randomly change smiley
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSmiley(['😊', '😮', '😎', '😵'][Math.floor(Math.random() * 4)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn('win31-window', className)}
      style={{ width: 160, ...style }}
    >
      {/* Title bar */}
      <div className="win31-titlebar text-[10px] py-0.5">
        <span className="win31-titlebar-text">Minesweeper</span>
      </div>

      {/* Menu */}
      <div className="win31-menubar text-[9px] py-0">
        <span className="win31-menubar-item px-2 py-0.5">Game</span>
        <span className="win31-menubar-item px-2 py-0.5">Help</span>
      </div>

      {/* Header with counters and smiley */}
      <div className="bg-[var(--memphis-cream)] p-1 flex items-center justify-between border-b border-[var(--memphis-shadow)]">
        {/* Mine counter */}
        <div className="bg-black text-red-500 font-mono text-sm px-1 font-bold">
          010
        </div>

        {/* Smiley */}
        <button className="win31-button !p-0.5 !min-w-0 text-lg">
          {smiley}
        </button>

        {/* Timer */}
        <div className="bg-black text-red-500 font-mono text-sm px-1 font-bold">
          {String(Math.floor(Math.random() * 999)).padStart(3, '0')}
        </div>
      </div>

      {/* Grid */}
      <div className="p-1 bg-[var(--memphis-cream)]">
        <div className="grid grid-cols-8 gap-0 border border-[var(--memphis-shadow)]">
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={cn(
                  'w-4 h-4 text-[9px] flex items-center justify-center font-bold',
                  cell.revealed
                    ? 'bg-[var(--memphis-cream-dark)]'
                    : 'bg-[var(--memphis-cream)] border-t border-l border-white border-r border-b border-r-[var(--memphis-shadow)] border-b-[var(--memphis-shadow)]'
                )}
                style={{
                  color: cell.value === 1 ? 'blue' : cell.value === 2 ? 'green' : cell.value === 3 ? 'red' : 'purple',
                }}
              >
                {cell.revealed && (cell.isMine ? '💣' : cell.value > 0 ? cell.value : '')}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * DESKTOP SCENE - Combines all animated elements
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface DesktopSceneProps {
  scene?: 'default' | 'skills' | 'tutorials' | 'windags';
  children?: React.ReactNode;
}

export function DesktopScene({ scene = 'default', children }: DesktopSceneProps) {
  return (
    <div className="win31-desktop relative min-h-screen">
      {/* Memphis decorations */}
      <div className="memphis-squiggle memphis-squiggle-1 top-20 right-10 animate-float" />
      <div className="memphis-squiggle memphis-squiggle-2 bottom-40 left-20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="memphis-triangle top-40 left-1/4 animate-bounce" style={{ animationDelay: '0.5s' }} />
      <div className="memphis-circle top-60 right-1/3 animate-bounce" style={{ animationDelay: '1.5s' }} />

      {/* Animated background windows based on scene */}
      {scene === 'default' && (
        <>
          <Win31Clock
            size={100}
            className="absolute top-4 left-4 opacity-80 pointer-events-none z-0"
          />
          <Win31Solitaire
            className="absolute bottom-4 right-4 opacity-70 pointer-events-none z-0"
          />
        </>
      )}

      {scene === 'skills' && (
        <>
          <Win31Minesweeper
            className="absolute top-4 right-4 opacity-80 pointer-events-none z-0"
          />
          <Win31Clock
            size={80}
            className="absolute bottom-4 left-4 opacity-70 pointer-events-none z-0"
          />
        </>
      )}

      {scene === 'tutorials' && (
        <>
          <QBasicGorillas
            className="absolute bottom-4 left-4 opacity-80 pointer-events-none z-0"
          />
        </>
      )}

      {scene === 'windags' && (
        <>
          <Win31Solitaire
            className="absolute top-4 left-4 opacity-70 pointer-events-none z-0"
          />
          <Win31Minesweeper
            className="absolute bottom-4 right-4 opacity-80 pointer-events-none z-0"
          />
        </>
      )}

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
