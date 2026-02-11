'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WINAMP CLASSIC - Authentic 275x116 pixel size
 * 
 * Main Window: 275 x 116 pixels
 * Equalizer: 275 x 116 pixels  
 * Playlist: 275px wide, resizable height
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef, useState } from 'react';
import { useMusicPlayer } from './music-player-context';
import { MUSIC_LIBRARY } from './music-metadata';
import styles from './winamp-compact.module.css';

export function WinampCompact() {
  const {
    isPlaying,
    isLoading,
    currentTrack,
    currentTrackIndex,
    volume,
    progress,
    isMinimized,
    analyserNode,
    isShuffle,
    repeatMode,
    eqSettings,
    togglePlayPause,
    setVolume,
    setEQ,
    previousTrack,
    nextTrack,
    setMinimized,
    seekToPercent,
    toggleShuffle,
    toggleRepeat,
    switchTrack,
  } = useMusicPlayer();

  const [showEQ, setShowEQ] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(19).fill(0));
  const [position, setPosition] = useState({ x: 20, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // FFT Visualization
  useEffect(() => {
    if (!analyserNode || !isPlaying) {
      if (!isPlaying) setFrequencyData(new Array(19).fill(0));
      return;
    }

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    let animationId: number;

    const updateFFT = () => {
      analyserNode.getByteFrequencyData(dataArray);
      const bars = [];
      const binCount = analyserNode.frequencyBinCount;
      for (let i = 0; i < 19; i++) {
        const start = Math.floor((i / 19) * binCount * 0.6);
        const end = Math.floor(((i + 1) / 19) * binCount * 0.6);
        let sum = 0;
        for (let j = start; j < end; j++) sum += dataArray[j];
        bars.push(sum / (end - start));
      }
      setFrequencyData(bars);
      animationId = requestAnimationFrame(updateFFT);
    };

    animationId = requestAnimationFrame(updateFFT);
    return () => cancelAnimationFrame(animationId);
  }, [analyserNode, isPlaying]);

  // Dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    };

    const handleUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging]);

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse duration string "MM:SS" to seconds
  const parseDuration = (durationStr: string): number => {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
  };

  if (isMinimized) return null;

  const trackDuration = currentTrack?.duration ? parseDuration(currentTrack.duration) : 0;
  const currentTime = (progress / 100) * trackDuration;

  return (
    <div 
      className={styles.container}
      style={{ left: position.x, top: position.y }}
    >
      {/* MAIN WINDOW - 275 x 116 */}
      <div className={styles.mainWindow}>
        {/* Title Bar */}
        <div 
          className={styles.titleBar}
          onMouseDown={handleTitleBarMouseDown}
        >
          <div className={styles.titleBarLeft}>
            <button className={styles.menuBtn} title="Menu">O</button>
          </div>
          <span className={styles.titleText}>Winamp</span>
          <div className={styles.titleBarRight}>
            <button className={styles.titleBtn} onClick={() => setMinimized(true)}>_</button>
            <button className={styles.titleBtn} title="Shade">-</button>
            <button className={styles.titleBtn} onClick={() => setMinimized(true)}>X</button>
          </div>
        </div>

        {/* Display */}
        <div className={styles.display}>
          {/* Left side - visualizer + timer */}
          <div className={styles.displayLeft}>
            {/* Visualizer */}
            <div className={styles.visualizer}>
              {frequencyData.map((value, i) => (
                <div 
                  key={i} 
                  className={styles.vizBar}
                  style={{ 
                    height: `${Math.min(100, (value / 255) * 100)}%`,
                    background: value > 200 ? '#ff0000' : value > 150 ? '#ffff00' : '#00ff00',
                  }}
                />
              ))}
            </div>
            {/* Timer */}
            <div className={styles.timer}>
              <span className={styles.timerDigit}>{formatTime(currentTime)}</span>
            </div>
          </div>

          {/* Right side - info */}
          <div className={styles.displayRight}>
            <div className={styles.trackInfo}>
              <div className={styles.kbps}>128</div>
              <div className={styles.khz}>44</div>
              <div className={styles.stereo}>stereo</div>
            </div>
            <div className={styles.scrollText}>
              <span className={styles.scrollTextInner}>
                {isLoading ? 'Loading...' : currentTrack?.title || 'No track loaded'}
                {currentTrack?.artist && ` - ${currentTrack.artist}`}
              </span>
            </div>
          </div>
        </div>

        {/* Seek Bar */}
        <div className={styles.seekBar}>
          <input 
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => seekToPercent(Number(e.target.value))}
            className={styles.seekInput}
          />
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlsLeft}>
            <button 
              className={`${styles.ctrlBtn} ${styles.prev}`}
              onClick={previousTrack}
              title="Previous"
            >
              <PrevIcon />
            </button>
            <button 
              className={`${styles.ctrlBtn} ${styles.play}`}
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button 
              className={`${styles.ctrlBtn} ${styles.next}`}
              onClick={nextTrack}
              title="Next"
            >
              <NextIcon />
            </button>
            <button className={`${styles.ctrlBtn} ${styles.stop}`} title="Stop">
              <StopIcon />
            </button>
          </div>

          <div className={styles.controlsRight}>
            {/* Volume */}
            <div className={styles.volumeControl}>
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className={styles.volumeSlider}
              />
            </div>
            {/* Balance */}
            <div className={styles.balanceControl}>
              <div className={styles.balanceBar} />
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className={styles.bottomBar}>
          <button 
            className={`${styles.bottomBtn} ${showEQ ? styles.active : ''}`}
            onClick={() => setShowEQ(!showEQ)}
          >
            EQ
          </button>
          <button 
            className={`${styles.bottomBtn} ${showPlaylist ? styles.active : ''}`}
            onClick={() => setShowPlaylist(!showPlaylist)}
          >
            PL
          </button>
          <div className={styles.bottomSpacer} />
          <button 
            className={`${styles.toggleBtn} ${isShuffle ? styles.active : ''}`}
            onClick={toggleShuffle}
            title="Shuffle"
          >
            S
          </button>
          <button 
            className={`${styles.toggleBtn} ${repeatMode !== 'off' ? styles.active : ''}`}
            onClick={toggleRepeat}
            title="Repeat"
          >
            R
          </button>
        </div>
      </div>

      {/* EQUALIZER WINDOW - 275 x 116 */}
      {showEQ && (
        <div className={styles.eqWindow}>
          <div 
            className={styles.titleBar}
            onMouseDown={handleTitleBarMouseDown}
          >
            <span className={styles.titleText}>Equalizer</span>
            <button className={styles.titleBtn} onClick={() => setShowEQ(false)}>X</button>
          </div>
          <div className={styles.eqContent}>
            <div className={styles.eqToggle}>
              <span>ON</span>
            </div>
            <div className={styles.eqSliders}>
              {/* Preamp */}
              <div className={styles.eqSliderCol}>
                <input 
                  type="range" 
                  min="-12" 
                  max="12" 
                  defaultValue="0" 
                  className={styles.eqSlider}
                />
                <span className={styles.eqLabel}>PRE</span>
              </div>
              {/* Bands */}
              {['60', '170', '310', '600', '1K', '3K', '6K', '12K', '14K', '16K'].map((freq, i) => (
                <div key={freq} className={styles.eqSliderCol}>
                  <input 
                    type="range" 
                    min="-12" 
                    max="12" 
                    value={i < 3 ? eqSettings.bass : i < 6 ? eqSettings.mid : eqSettings.treble}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (i < 3) setEQ('bass', val);
                      else if (i < 6) setEQ('mid', val);
                      else setEQ('treble', val);
                    }}
                    className={styles.eqSlider}
                  />
                  <span className={styles.eqLabel}>{freq}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PLAYLIST WINDOW - 275 x variable */}
      {showPlaylist && (
        <div className={styles.playlistWindow}>
          <div 
            className={styles.titleBar}
            onMouseDown={handleTitleBarMouseDown}
          >
            <span className={styles.titleText}>Playlist</span>
            <button className={styles.titleBtn} onClick={() => setShowPlaylist(false)}>X</button>
          </div>
          <div className={styles.playlistContent}>
            {MUSIC_LIBRARY.map((track, i) => (
              <div 
                key={i}
                className={`${styles.playlistItem} ${i === currentTrackIndex ? styles.active : ''}`}
                onClick={() => switchTrack(i)}
              >
                <span className={styles.playlistNum}>{i + 1}.</span>
                <span className={styles.playlistTitle}>{track.title}</span>
                <span className={styles.playlistDuration}>{track.duration}</span>
              </div>
            ))}
          </div>
          <div className={styles.playlistFooter}>
            {MUSIC_LIBRARY.length} tracks
          </div>
        </div>
      )}
    </div>
  );
}

// SVG Icons
function PlayIcon() {
  return (
    <svg viewBox="0 0 10 10" className={styles.ctrlIcon}>
      <polygon points="2,1 2,9 9,5" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 10 10" className={styles.ctrlIcon}>
      <rect x="2" y="1" width="2" height="8" fill="currentColor" />
      <rect x="6" y="1" width="2" height="8" fill="currentColor" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 10 10" className={styles.ctrlIcon}>
      <rect x="2" y="2" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg viewBox="0 0 10 10" className={styles.ctrlIcon}>
      <rect x="1" y="2" width="2" height="6" fill="currentColor" />
      <polygon points="9,2 9,8 4,5" fill="currentColor" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg viewBox="0 0 10 10" className={styles.ctrlIcon}>
      <polygon points="1,2 1,8 6,5" fill="currentColor" />
      <rect x="7" y="2" width="2" height="6" fill="currentColor" />
    </svg>
  );
}

// Re-export as default with WinampModal name for compatibility
export { WinampCompact as WinampModal };
