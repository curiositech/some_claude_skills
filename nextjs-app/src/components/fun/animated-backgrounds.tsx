'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './animated-backgrounds.module.css';

/**
 * QBasic Gorillas - Pixel art gorilla throwing bananas
 */
export function GorillasGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score] = useState({ p1: 0, p2: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let bananaX = 50;
    let bananaY = 30;
    let velocityX = 2;
    let velocityY = 0;
    const gravity = 0.1;
    
    const drawGorilla = (x: number, y: number, flip = false) => {
      ctx.fillStyle = '#8B4513';
      // Body
      ctx.fillRect(x, y, 20, 25);
      // Head
      ctx.fillRect(x + 2, y - 12, 16, 14);
      // Arms
      ctx.fillRect(flip ? x - 5 : x + 20, y + 3, 5, 15);
      ctx.fillRect(flip ? x + 20 : x - 5, y + 3, 5, 15);
      // Eyes
      ctx.fillStyle = '#FFF';
      ctx.fillRect(x + 5, y - 6, 3, 3);
      ctx.fillRect(x + 12, y - 6, 3, 3);
    };
    
    const drawBanana = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI, true);
      ctx.fill();
      ctx.restore();
    };
    
    const drawBuildings = () => {
      ctx.fillStyle = '#333';
      for (let i = 0; i < 8; i++) {
        const h = 30 + Math.sin(i * 1.5) * 20;
        ctx.fillRect(i * 30 + 5, canvas.height - h, 25, h);
        // Windows
        ctx.fillStyle = i % 2 ? '#FFD700' : '#333';
        for (let wy = canvas.height - h + 5; wy < canvas.height - 5; wy += 8) {
          for (let wx = i * 30 + 8; wx < i * 30 + 28; wx += 7) {
            ctx.fillRect(wx, wy, 4, 5);
          }
        }
        ctx.fillStyle = '#333';
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#000080'; // DOS blue
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Stars
      ctx.fillStyle = '#FFF';
      for (let i = 0; i < 20; i++) {
        ctx.fillRect((i * 13) % canvas.width, (i * 7) % 40, 1, 1);
      }
      
      drawBuildings();
      drawGorilla(30, canvas.height - 70);
      drawGorilla(canvas.width - 55, canvas.height - 70, true);
      
      // Animate banana
      bananaX += velocityX;
      velocityY += gravity;
      bananaY += velocityY;
      
      if (bananaY > canvas.height - 20 || bananaX > canvas.width - 30) {
        bananaX = 50;
        bananaY = 30;
        velocityX = 1.5 + Math.random();
        velocityY = -2 - Math.random() * 2;
      }
      
      drawBanana(bananaX, bananaY, Date.now() / 100);
      
      // Score
      ctx.fillStyle = '#FFF';
      ctx.font = '10px monospace';
      ctx.fillText(`P1: ${score.p1}  P2: ${score.p2}`, 5, 12);
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [score]);
  
  return (
    <div className={styles.gameWindow}>
      <div className={styles.titleBar}>
        <span>🦍 GORILLAS.BAS</span>
        <div className={styles.windowControls}>
          <button>_</button>
          <button>□</button>
          <button>×</button>
        </div>
      </div>
      <canvas ref={canvasRef} width={240} height={150} className={styles.gameCanvas} />
    </div>
  );
}

/**
 * Windows Clock - Real-time analog clock
 */
export function Win31Clock() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    
    const drawClock = () => {
      // Clear
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(0, 0, size, size);
      
      // Clock face
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x1 = center + Math.cos(angle) * (radius - 8);
        const y1 = center + Math.sin(angle) * (radius - 8);
        const x2 = center + Math.cos(angle) * (radius - 2);
        const y2 = center + Math.sin(angle) * (radius - 2);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      
      // Get time
      const now = new Date();
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // Hour hand
      const hourAngle = ((hours + minutes / 60) * 30 - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(hourAngle) * (radius * 0.5), center + Math.sin(hourAngle) * (radius * 0.5));
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Minute hand
      const minuteAngle = ((minutes + seconds / 60) * 6 - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(minuteAngle) * (radius * 0.75), center + Math.sin(minuteAngle) * (radius * 0.75));
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Second hand
      const secondAngle = (seconds * 6 - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(secondAngle) * (radius * 0.85), center + Math.sin(secondAngle) * (radius * 0.85));
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Center dot
      ctx.beginPath();
      ctx.arc(center, center, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
    };
    
    drawClock();
    const interval = setInterval(drawClock, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={styles.clockWindow}>
      <div className={styles.titleBar}>
        <span>🕐 Clock</span>
        <div className={styles.windowControls}>
          <button>_</button>
          <button>×</button>
        </div>
      </div>
      <canvas ref={canvasRef} width={120} height={120} className={styles.clockCanvas} />
    </div>
  );
}

/**
 * Solitaire Cards - Bouncing winning animation
 */
export function SolitaireWin() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    interface Card {
      x: number;
      y: number;
      vx: number;
      vy: number;
      suit: string;
      value: string;
      color: string;
    }
    
    const cards: Card[] = [];
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    // Initialize cards
    for (let col = 0; col < 7; col++) {
      const suit = suits[col % 4];
      const value = values[col % 13];
      cards.push({
        x: 20 + col * 35,
        y: 20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2,
        suit,
        value,
        color: suit === '♥' || suit === '♦' ? '#FF0000' : '#000',
      });
    }
    
    let animationId: number;
    
    const drawCard = (card: Card) => {
      // Card background
      ctx.fillStyle = '#FFF';
      ctx.fillRect(card.x, card.y, 30, 40);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(card.x, card.y, 30, 40);
      
      // Card content
      ctx.fillStyle = card.color;
      ctx.font = 'bold 10px serif';
      ctx.fillText(card.value, card.x + 3, card.y + 12);
      ctx.font = '14px serif';
      ctx.fillText(card.suit, card.x + 8, card.y + 30);
    };
    
    const animate = () => {
      // Green felt background
      ctx.fillStyle = '#006400';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw cards
      cards.forEach(card => {
        card.vy += 0.2; // Gravity
        card.x += card.vx;
        card.y += card.vy;
        
        // Bounce off walls
        if (card.x < 0 || card.x > canvas.width - 30) {
          card.vx *= -0.8;
          card.x = Math.max(0, Math.min(canvas.width - 30, card.x));
        }
        
        // Bounce off bottom
        if (card.y > canvas.height - 40) {
          card.vy *= -0.7;
          card.y = canvas.height - 40;
          card.vx *= 0.95;
        }
        
        drawCard(card);
      });
      
      // Occasionally spawn new card
      if (Math.random() < 0.03 && cards.length < 30) {
        const suit = suits[Math.floor(Math.random() * 4)];
        cards.push({
          x: Math.random() * (canvas.width - 30),
          y: -40,
          vx: (Math.random() - 0.5) * 3,
          vy: 0,
          suit,
          value: values[Math.floor(Math.random() * 13)],
          color: suit === '♥' || suit === '♦' ? '#FF0000' : '#000',
        });
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return (
    <div className={styles.solitaireWindow}>
      <div className={styles.titleBar}>
        <span>🃏 Solitaire</span>
        <div className={styles.windowControls}>
          <button>_</button>
          <button>□</button>
          <button>×</button>
        </div>
      </div>
      <canvas ref={canvasRef} width={260} height={180} className={styles.gameCanvas} />
    </div>
  );
}

/**
 * Conway's Game of Life - Classic cellular automaton
 */
export function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const cellSize = 4;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);
    
    // Initialize random grid
    let grid = Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => Math.random() > 0.7)
    );
    
    const countNeighbors = (g: boolean[][], x: number, y: number) => {
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const ni = (y + i + rows) % rows;
          const nj = (x + j + cols) % cols;
          if (g[ni][nj]) count++;
        }
      }
      return count;
    };
    
    let generation = 0;
    let animationId: number;
    
    const animate = () => {
      // Draw background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw cells
      ctx.fillStyle = '#00FF00';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[y][x]) {
            ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
          }
        }
      }
      
      // Next generation
      const newGrid = grid.map((row, y) =>
        row.map((cell, x) => {
          const neighbors = countNeighbors(grid, x, y);
          if (cell) return neighbors === 2 || neighbors === 3;
          return neighbors === 3;
        })
      );
      
      grid = newGrid;
      generation++;
      
      // Draw generation counter
      ctx.fillStyle = '#0F0';
      ctx.font = '10px monospace';
      ctx.fillText(`Gen: ${generation}`, 5, 12);
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Slower animation
    const interval = setInterval(() => {
      cancelAnimationFrame(animationId);
      animate();
    }, 100);
    
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <div className={styles.lifeWindow}>
      <div className={styles.titleBar}>
        <span>🧬 Game of Life</span>
        <div className={styles.windowControls}>
          <button>_</button>
          <button>×</button>
        </div>
      </div>
      <canvas ref={canvasRef} width={200} height={150} className={styles.gameCanvas} />
    </div>
  );
}

/**
 * Minesweeper - Quick visual representation
 */
export function MinesweeperGame() {
  const [grid, setGrid] = useState<(number | 'mine' | null)[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  
  useEffect(() => {
    const rows = 8;
    const cols = 10;
    const mines = 10;
    
    // Initialize grid
    const newGrid: (number | 'mine' | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));
    const newRevealed = Array(rows).fill(null).map(() => Array(cols).fill(false));
    
    // Place mines
    let placed = 0;
    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (newGrid[r][c] !== 'mine') {
        newGrid[r][c] = 'mine';
        placed++;
      }
    }
    
    // Calculate numbers
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c] === 'mine') continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc] === 'mine') {
              count++;
            }
          }
        }
        newGrid[r][c] = count > 0 ? count : null;
      }
    }
    
    // Reveal some cells for visual interest
    for (let i = 0; i < 20; i++) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      newRevealed[r][c] = true;
    }
    
    setGrid(newGrid);
    setRevealed(newRevealed);
  }, []);
  
  const colors: Record<number, string> = {
    1: '#0000FF', 2: '#008000', 3: '#FF0000', 4: '#000080',
    5: '#800000', 6: '#008080', 7: '#000000', 8: '#808080',
  };
  
  return (
    <div className={styles.minesweeperWindow}>
      <div className={styles.titleBar}>
        <span>💣 Minesweeper</span>
        <div className={styles.windowControls}>
          <button>_</button>
          <button>□</button>
          <button>×</button>
        </div>
      </div>
      <div className={styles.minesweeperCounter}>
        <span className={styles.lcdDisplay}>010</span>
        <button className={styles.smileyButton}>😊</button>
        <span className={styles.lcdDisplay}>042</span>
      </div>
      <div className={styles.minesweeperGrid}>
        {grid.map((row, r) => (
          <div key={r} className={styles.minesweeperRow}>
            {row.map((cell, c) => (
              <div
                key={c}
                className={`${styles.minesweeperCell} ${revealed[r]?.[c] ? styles.revealed : ''}`}
              >
                {revealed[r]?.[c] && cell === 'mine' && '💥'}
                {revealed[r]?.[c] && typeof cell === 'number' && (
                  <span style={{ color: colors[cell] }}>{cell}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * All backgrounds combined with positioning
 */
export function AnimatedDesktopBackgrounds() {
  return (
    <div className={styles.backgroundsContainer}>
      <div className={styles.bgTopLeft}>
        <GorillasGame />
      </div>
      <div className={styles.bgTopRight}>
        <Win31Clock />
      </div>
      <div className={styles.bgBottomLeft}>
        <SolitaireWin />
      </div>
      <div className={styles.bgBottomRight}>
        <GameOfLife />
      </div>
    </div>
  );
}
