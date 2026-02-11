'use client';

/**
 * CALC.EXE - Windows 3.1 Calculator
 * 
 * Standard calculator with authentic Win31 styling
 */

import React, { useState, useCallback } from 'react';
import styles from './calculator.module.css';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState(true);
  const [memory, setMemory] = useState(0);

  const handleNumber = useCallback((num: string) => {
    if (newEntry) {
      setDisplay(num);
      setNewEntry(false);
    } else {
      setDisplay(prev => prev === '0' ? num : prev + num);
    }
  }, [newEntry]);

  const handleDecimal = useCallback(() => {
    if (newEntry) {
      setDisplay('0.');
      setNewEntry(false);
    } else if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  }, [display, newEntry]);

  const handleOperation = useCallback((op: string) => {
    const current = parseFloat(display);
    
    if (previousValue !== null && operation && !newEntry) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(current);
    }
    
    setOperation(op);
    setNewEntry(true);
  }, [display, previousValue, operation, newEntry]);

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = useCallback(() => {
    if (previousValue !== null && operation) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewEntry(true);
    }
  }, [display, previousValue, operation]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewEntry(true);
  }, []);

  const handleClearEntry = useCallback(() => {
    setDisplay('0');
    setNewEntry(true);
  }, []);

  const handleBackspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display]);

  const handleSign = useCallback(() => {
    setDisplay(prev => {
      const num = parseFloat(prev);
      return String(-num);
    });
  }, []);

  const handleSqrt = useCallback(() => {
    const num = parseFloat(display);
    if (num >= 0) {
      setDisplay(String(Math.sqrt(num)));
      setNewEntry(true);
    }
  }, [display]);

  const handlePercent = useCallback(() => {
    const num = parseFloat(display);
    setDisplay(String(num / 100));
    setNewEntry(true);
  }, [display]);

  const handleMemoryClear = useCallback(() => setMemory(0), []);
  const handleMemoryRecall = useCallback(() => {
    setDisplay(String(memory));
    setNewEntry(true);
  }, [memory]);
  const handleMemoryStore = useCallback(() => setMemory(parseFloat(display)), [display]);
  const handleMemoryAdd = useCallback(() => setMemory(prev => prev + parseFloat(display)), [display]);

  return (
    <div className={styles.calculator}>
      {/* Display */}
      <div className={styles.display}>
        <span className={styles.displayText}>{display}</span>
      </div>

      {/* Button Grid */}
      <div className={styles.buttonGrid}>
        {/* Row 1: Memory + Backspace */}
        <button className={`${styles.button} ${styles.memory}`} onClick={handleMemoryClear}>MC</button>
        <button className={`${styles.button} ${styles.memory}`} onClick={handleMemoryRecall}>MR</button>
        <button className={`${styles.button} ${styles.memory}`} onClick={handleMemoryStore}>MS</button>
        <button className={`${styles.button} ${styles.memory}`} onClick={handleMemoryAdd}>M+</button>
        <button className={`${styles.button} ${styles.function}`} onClick={handleBackspace}>←</button>

        {/* Row 2 */}
        <button className={`${styles.button} ${styles.function}`} onClick={handleClearEntry}>CE</button>
        <button className={`${styles.button} ${styles.function}`} onClick={handleClear}>C</button>
        <button className={`${styles.button} ${styles.function}`} onClick={handleSign}>±</button>
        <button className={`${styles.button} ${styles.function}`} onClick={handleSqrt}>√</button>
        <button className={`${styles.button} ${styles.operator}`} onClick={() => handleOperation('/')}>÷</button>

        {/* Row 3: 7 8 9 × */}
        <button className={styles.button} onClick={() => handleNumber('7')}>7</button>
        <button className={styles.button} onClick={() => handleNumber('8')}>8</button>
        <button className={styles.button} onClick={() => handleNumber('9')}>9</button>
        <button className={`${styles.button} ${styles.operator}`} onClick={() => handleOperation('*')}>×</button>
        <button className={`${styles.button} ${styles.function}`} onClick={handlePercent}>%</button>

        {/* Row 4: 4 5 6 - */}
        <button className={styles.button} onClick={() => handleNumber('4')}>4</button>
        <button className={styles.button} onClick={() => handleNumber('5')}>5</button>
        <button className={styles.button} onClick={() => handleNumber('6')}>6</button>
        <button className={`${styles.button} ${styles.operator}`} onClick={() => handleOperation('-')}>−</button>
        <button className={`${styles.button} ${styles.function}`}>1/x</button>

        {/* Row 5: 1 2 3 + */}
        <button className={styles.button} onClick={() => handleNumber('1')}>1</button>
        <button className={styles.button} onClick={() => handleNumber('2')}>2</button>
        <button className={styles.button} onClick={() => handleNumber('3')}>3</button>
        <button className={`${styles.button} ${styles.operator}`} onClick={() => handleOperation('+')}>+</button>
        <button 
          className={`${styles.button} ${styles.equals} ${styles.equalsDouble}`} 
          onClick={handleEquals}
        >=</button>

        {/* Row 6: 0 . */}
        <button className={`${styles.button} ${styles.buttonDouble}`} onClick={() => handleNumber('0')}>0</button>
        <button className={styles.button} onClick={handleDecimal}>.</button>
      </div>
    </div>
  );
}
