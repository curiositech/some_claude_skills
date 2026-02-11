'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TERMINAL.EXE - MS-DOS Prompt for ASCII Art/Diagrams
 * 
 * A chat interface that outputs ANSI/ASCII diagrams.
 * Type a request, get back beautiful text art.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './terminal.module.css';

interface TerminalLine {
  type: 'input' | 'output' | 'processing';
  content: string;
}

const ASCII_DIAGRAMS: Record<string, string> = {
  'neural network': `
      (Input)
         |
         v
    [ LAYER 1 ]----.
         |          \\
         v           \\
    [ LAYER 2 ]-------[ WEIGHTS ]
         |           /
         v          /
    [ LAYER 3 ]----'
         |
         v
     ( Output )
`,
  'flowchart': `
    ┌─────────┐
    │  START  │
    └────┬────┘
         │
    ┌────▼────┐     ┌──────────┐
    │ Process ├────►│ Decision │
    └────┬────┘     └────┬─────┘
         │               │
         │          ┌────▼────┐
         │          │  Yes?   │
         │          └────┬────┘
         │               │
    ┌────▼───────────────▼────┐
    │         END             │
    └─────────────────────────┘
`,
  'database': `
         ╔═══════════════╗
         ║   DATABASE    ║
         ╠═══════════════╣
    ────►║    users      ║◄────
         ╠───────────────╣
    ────►║    skills     ║◄────
         ╠───────────────╣
    ────►║    sessions   ║◄────
         ╚═══════════════╝
`,
  'tree': `
    ROOT/
    ├── src/
    │   ├── components/
    │   │   ├── Button.tsx
    │   │   └── Modal.tsx
    │   ├── hooks/
    │   │   └── useAuth.ts
    │   └── App.tsx
    ├── public/
    │   └── index.html
    └── package.json
`,
  'state machine': `
    ┌───────────┐    start    ┌───────────┐
    │   IDLE    │────────────►│  LOADING  │
    └───────────┘             └─────┬─────┘
         ▲                         │
         │                    success/error
         │                         │
         │      ┌─────────────────┴──────────────┐
         │      │                                 │
         │ ┌────▼────┐                     ┌─────▼─────┐
         │ │ SUCCESS │                     │   ERROR   │
         │ └────┬────┘                     └─────┬─────┘
         │      │                                 │
         └──────┴────────────retry───────────────┘
`,
  'api': `
    ┌──────────┐         ┌──────────┐         ┌──────────┐
    │  CLIENT  │──GET───►│   API    │──QUERY─►│    DB    │
    │          │◄─JSON───│  SERVER  │◄─ROWS───│          │
    └──────────┘         └──────────┘         └──────────┘
         │                    │
         │              ┌─────▼─────┐
         └──WEBSOCKET──►│   CACHE   │
                        └───────────┘
`,
  'help': `
Available diagram commands:
  
  diagram --subject "neural network"
  diagram --subject "flowchart"
  diagram --subject "database"
  diagram --subject "tree"
  diagram --subject "state machine"
  diagram --subject "api"
  
Other commands:
  cls          - Clear screen
  help         - Show this help
  ver          - Show version
  dir          - List available diagrams
`,
};

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'Microsoft(R) MS-DOS(R) Version 6.22' },
    { type: 'output', content: '(C)Copyright Microsoft Corp 1981-1994.' },
    { type: 'output', content: '' },
    { type: 'output', content: 'SKILLS Terminal - ASCII Diagram Generator' },
    { type: 'output', content: 'Type "help" for available commands.' },
    { type: 'output', content: '' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on click
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const typeOutput = useCallback((text: string, callback: () => void) => {
    const lines = text.split('\n');
    let lineIndex = 0;

    const addLine = () => {
      if (lineIndex < lines.length) {
        setLines(prev => [...prev, { type: 'output', content: lines[lineIndex] }]);
        lineIndex++;
        setTimeout(addLine, 20); // Typing effect
      } else {
        callback();
      }
    };

    addLine();
  }, []);

  const handleCommand = useCallback((command: string) => {
    const trimmed = command.trim().toLowerCase();
    
    // Add input line
    setLines(prev => [...prev, { type: 'input', content: `C:\\SKILLS> ${command}` }]);
    
    if (trimmed === 'cls') {
      setLines([]);
      return;
    }
    
    if (trimmed === 'help') {
      setIsProcessing(true);
      setLines(prev => [...prev, { type: 'processing', content: '' }]);
      setTimeout(() => {
        setLines(prev => prev.filter(l => l.type !== 'processing'));
        typeOutput(ASCII_DIAGRAMS['help'], () => {
          setIsProcessing(false);
          setLines(prev => [...prev, { type: 'output', content: '' }]);
        });
      }, 300);
      return;
    }

    if (trimmed === 'ver') {
      setLines(prev => [...prev, 
        { type: 'output', content: '' },
        { type: 'output', content: 'SKILLS Terminal Version 1.0' },
        { type: 'output', content: 'ASCII Diagram Generator for Claude' },
        { type: 'output', content: '' },
      ]);
      return;
    }

    if (trimmed === 'dir') {
      setLines(prev => [...prev,
        { type: 'output', content: '' },
        { type: 'output', content: ' Volume in drive C is SKILLS' },
        { type: 'output', content: ' Directory of C:\\SKILLS' },
        { type: 'output', content: '' },
        { type: 'output', content: 'NEURALNT TXT      Neural Network diagram' },
        { type: 'output', content: 'FLOWCHRT TXT      Flowchart diagram' },
        { type: 'output', content: 'DATABASE TXT      Database diagram' },
        { type: 'output', content: 'TREE     TXT      Directory tree' },
        { type: 'output', content: 'STATEMCH TXT      State machine' },
        { type: 'output', content: 'API      TXT      API architecture' },
        { type: 'output', content: '' },
        { type: 'output', content: '        6 file(s)' },
        { type: 'output', content: '' },
      ]);
      return;
    }

    // Parse diagram command
    const diagramMatch = trimmed.match(/diagram\s+--subject\s+"([^"]+)"/);
    if (diagramMatch) {
      const subject = diagramMatch[1].toLowerCase();
      const diagram = ASCII_DIAGRAMS[subject];
      
      setIsProcessing(true);
      setLines(prev => [...prev, 
        { type: 'output', content: '' },
        { type: 'processing', content: 'PROCESSING...' },
      ]);
      
      setTimeout(() => {
        setLines(prev => prev.filter(l => l.type !== 'processing'));
        
        if (diagram) {
          typeOutput(diagram, () => {
            setIsProcessing(false);
            setLines(prev => [...prev, { type: 'output', content: '' }]);
          });
        } else {
          setLines(prev => [...prev, 
            { type: 'output', content: `Unknown subject: "${subject}"` },
            { type: 'output', content: 'Type "dir" for available diagrams.' },
            { type: 'output', content: '' },
          ]);
          setIsProcessing(false);
        }
      }, 500);
      return;
    }

    // Unknown command
    setLines(prev => [...prev,
      { type: 'output', content: '' },
      { type: 'output', content: `Bad command or file name: ${command}` },
      { type: 'output', content: '' },
    ]);
  }, [typeOutput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleCommand(currentInput);
      setCurrentInput('');
    }
  }, [currentInput, handleCommand, isProcessing]);

  return (
    <div className={styles.container} onClick={handleContainerClick}>
      <div className={styles.content} ref={contentRef}>
        {lines.map((line, i) => (
          <div key={i} className={`${styles.line} ${styles[line.type]}`}>
            {line.type === 'processing' ? (
              <span className={styles.blinking}>{line.content || 'PROCESSING...'}</span>
            ) : (
              <pre>{line.content}</pre>
            )}
          </div>
        ))}
        
        {/* Current input line */}
        <div className={styles.inputLine}>
          <span className={styles.prompt}>C:\SKILLS&gt; </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.input}
            disabled={isProcessing}
            autoFocus
          />
          <span className={styles.cursor}>_</span>
        </div>
      </div>
    </div>
  );
}
