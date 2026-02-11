'use client';

import * as React from 'react';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ANIMATED BACKGROUNDS - Memphis-inspired Win3.1 accessories
 * 
 * References:
 * - Sowden clock face (geometric circles)
 * - Carlton bookshelf colors
 * - Du Pasquier textile patterns
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * WIN31 CLOCK - Sowden-inspired geometric clock
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface Win31ClockProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Win31Clock({ size = 100, className, style }: Win31ClockProps) {
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
    <div className={className} style={style}>
      <div className="win31-window" style={{ width: size + 4 }}>
        <div className="win31-titlebar" style={{ height: 14 }}>
          <span className="win31-titlebar-text text-[9px]">Clock</span>
        </div>
        <div className="p-1 bg-[var(--memphis-surface)]">
          <svg width={size - 8} height={size - 8} viewBox="0 0 100 100">
            {/* Outer ring - Memphis purple */}
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--memphis-purple)" strokeWidth="3" />
            
            {/* Inner face - yellow like Sowden */}
            <circle cx="50" cy="50" r="44" fill="var(--memphis-yellow)" />
            
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              return (
                <circle
                  key={i}
                  cx={50 + 38 * Math.cos(angle)}
                  cy={50 + 38 * Math.sin(angle)}
                  r={i % 3 === 0 ? 3 : 2}
                  fill="var(--memphis-purple)"
                />
              );
            })}

            {/* Hour hand - red */}
            <line
              x1="50" y1="50"
              x2={50 + 22 * Math.cos((hourAngle - 90) * Math.PI / 180)}
              y2={50 + 22 * Math.sin((hourAngle - 90) * Math.PI / 180)}
              stroke="var(--memphis-red)" strokeWidth="4" strokeLinecap="square"
            />

            {/* Minute hand - blue */}
            <line
              x1="50" y1="50"
              x2={50 + 32 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
              y2={50 + 32 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
              stroke="var(--memphis-blue)" strokeWidth="3" strokeLinecap="square"
            />

            {/* Second hand - pink */}
            <line
              x1="50" y1="50"
              x2={50 + 36 * Math.cos((secondAngle - 90) * Math.PI / 180)}
              y2={50 + 36 * Math.sin((secondAngle - 90) * Math.PI / 180)}
              stroke="var(--memphis-pink)" strokeWidth="1"
            />

            {/* Center dot */}
            <circle cx="50" cy="50" r="4" fill="var(--memphis-coral)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * WIN31 SOLITAIRE - Minimized to just cards falling
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function Win31Solitaire({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [cards, setCards] = React.useState<Array<{
    id: number; x: number; y: number; suit: string; value: string; rot: number;
  }>>([]);

  React.useEffect(() => {
    let id = 0;
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = prev.filter(c => c.y < 140).map(c => ({
          ...c,
          y: c.y + 3,
          rot: c.rot + 2,
        }));
        
        if (prev.length < 8) {
          newCards.push({
            id: id++,
            x: 10 + Math.random() * 100,
            y: -20,
            suit: suits[Math.floor(Math.random() * 4)],
            value: values[Math.floor(Math.random() * 13)],
            rot: Math.random() * 40 - 20,
          });
        }
        
        return newCards;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className} style={style}>
      <div className="win31-window" style={{ width: 140, height: 160 }}>
        <div className="win31-titlebar" style={{ height: 14 }}>
          <span className="win31-titlebar-text text-[9px]">Solitaire</span>
        </div>
        <div className="relative overflow-hidden" style={{ background: '#008000', height: 140 }}>
          {cards.map(c => (
            <div
              key={c.id}
              className="absolute w-6 h-8 bg-white border border-gray-400 text-[8px] flex items-center justify-center"
              style={{
                left: c.x,
                top: c.y,
                transform: `rotate(${c.rot}deg)`,
                color: c.suit === '♥' || c.suit === '♦' ? '#c00' : '#000',
              }}
            >
              {c.value}{c.suit}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * WIN31 MINESWEEPER - Static display
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function Win31Minesweeper({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style}>
      <div className="win31-window" style={{ width: 120 }}>
        <div className="win31-titlebar" style={{ height: 14 }}>
          <span className="win31-titlebar-text text-[9px]">Minesweeper</span>
        </div>
        <div className="p-1 bg-[var(--memphis-surface)]">
          {/* Header */}
          <div className="flex justify-between items-center mb-1">
            <div className="bg-black text-red-500 px-1 text-[10px] font-mono">010</div>
            <div className="text-[14px]">😊</div>
            <div className="bg-black text-red-500 px-1 text-[10px] font-mono">042</div>
          </div>
          {/* Grid */}
          <div className="grid grid-cols-6 gap-0 bevel-in">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bevel-out text-[6px] flex items-center justify-center"
                style={{ color: i === 5 ? '#00f' : i === 11 ? '#080' : i === 17 ? '#f00' : '#000' }}
              >
                {i === 5 ? '1' : i === 11 ? '2' : i === 17 ? '3' : i === 8 ? '💣' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * QBASIC GORILLAS - Simplified cityscape
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function QBasicGorillas({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [banana, setBanana] = React.useState({ x: 30, y: 20, active: true });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBanana(prev => {
        if (!prev.active || prev.y > 80) {
          return { x: 30 + Math.random() * 60, y: 20, active: true };
        }
        return { ...prev, y: prev.y + 4, x: prev.x + 2 };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className} style={style}>
      <div className="win31-window" style={{ width: 160, height: 110 }}>
        <div className="win31-titlebar" style={{ height: 14 }}>
          <span className="win31-titlebar-text text-[9px]">GORILLA.BAS</span>
        </div>
        <div className="relative overflow-hidden" style={{ background: '#0000aa', height: 90 }}>
          {/* Sun */}
          <div className="absolute text-[14px]" style={{ top: 2, left: 70 }}>☀️</div>
          
          {/* Buildings */}
          <div className="absolute bottom-0 left-0 right-0 flex">
            {[40, 55, 35, 60, 45, 50].map((h, i) => (
              <div
                key={i}
                className="flex-1"
                style={{
                  height: h,
                  background: ['#c00', '#0a0', '#00a', '#a0a', '#0aa', '#aa0'][i],
                }}
              />
            ))}
          </div>
          
          {/* Gorillas */}
          <div className="absolute text-[14px]" style={{ bottom: 55, left: 15 }}>🦍</div>
          <div className="absolute text-[14px]" style={{ bottom: 60, right: 15 }}>🦍</div>
          
          {/* Banana */}
          {banana.active && (
            <div
              className="absolute text-[10px]"
              style={{ left: banana.x, top: banana.y, transform: 'rotate(45deg)' }}
            >
              🍌
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * DESKTOP SCENE - Container with Memphis pattern background
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface DesktopSceneProps {
  scene?: 'default' | 'skills' | 'tutorials' | 'windags';
  children?: React.ReactNode;
}

export function DesktopScene({ children }: DesktopSceneProps) {
  return (
    <div className="win31-desktop relative min-h-screen">
      {/* Subtle Memphis decorations in corners */}
      <div className="absolute top-2 right-2 opacity-60 pointer-events-none">
        <Win31Clock size={80} />
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
