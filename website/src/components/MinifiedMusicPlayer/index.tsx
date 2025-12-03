import React, { useRef, useEffect, useState } from 'react';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { useFFTData } from '../../hooks/useFFTData';
import styles from './styles.module.css';

// Parse duration string (e.g., "03:45") to seconds
const parseDuration = (duration: string): number => {
  const parts = duration.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 180; // Default 3 min if parsing fails
};

export default function MinifiedMusicPlayer() {
  const {
    isPlaying,
    currentTrack,
    currentTrackIndex,
    progress,
    volume,
    analyserNode,
    isShuffle,
    repeatMode,
    totalTracks,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekToPercent,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    setMinimized
  } = useMusicPlayer();

  const seekBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSeek, setIsDraggingSeek] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [showNullsoft, setShowNullsoft] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Dragging disabled - was causing 150px jump bug on mobile
  // const [isDragging, setIsDragging] = useState(false);
  // const [position, setPosition] = useState({ x: 0, y: 0 });
  // const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Skin quick-switcher
  type SkinType = 'classic' | 'matrix' | 'synthwave' | 'ice' | 'amber';
  const [currentSkin, setCurrentSkin] = useState<SkinType>('classic');
  const [showSkinMenu, setShowSkinMenu] = useState(false);

  const skins: { id: SkinType; name: string; colors: { bg: string; accent: string } }[] = [
    { id: 'classic', name: 'Classic', colors: { bg: '#c0c0c0', accent: '#00ff00' } },
    { id: 'matrix', name: 'Matrix', colors: { bg: '#0d1117', accent: '#00ff41' } },
    { id: 'synthwave', name: 'Synthwave', colors: { bg: '#1a1a2e', accent: '#ff00ff' } },
    { id: 'ice', name: 'Ice', colors: { bg: '#e0f7fa', accent: '#00bcd4' } },
    { id: 'amber', name: 'Amber', colors: { bg: '#2d2d2d', accent: '#ff9800' } },
  ];

  // Mark as interacted after any user action
  const markInteracted = () => {
    if (!hasInteracted) setHasInteracted(true);
  };

  // Smooth progress interpolation
  const [displayProgress, setDisplayProgress] = useState(progress);
  const lastProgressRef = useRef(progress);
  const lastUpdateTimeRef = useRef(Date.now());
  const interpolationFrameRef = useRef<number | null>(null);

  // Interpolate progress smoothly between updates
  useEffect(() => {
    if (isDraggingSeek) {
      // User is dragging - snap to actual progress
      setDisplayProgress(progress);
      return;
    }

    if (!isPlaying) {
      // Not playing - snap to actual progress
      setDisplayProgress(progress);
      lastProgressRef.current = progress;
      return;
    }

    // Calculate expected progress rate based on track duration
    const trackDurationSec = currentTrack?.duration
      ? parseDuration(currentTrack.duration)
      : 180;
    const progressPerSecond = 100 / trackDurationSec;

    // Animate between updates
    const animate = () => {
      const now = Date.now();
      const elapsed = (now - lastUpdateTimeRef.current) / 1000;
      const interpolated = Math.min(100, lastProgressRef.current + (elapsed * progressPerSecond));

      setDisplayProgress(interpolated);

      if (isPlaying && !isDraggingSeek) {
        interpolationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Reset when progress jumps significantly (track change or seek)
    const progressDiff = Math.abs(progress - lastProgressRef.current);
    if (progressDiff > 2) {
      // Big jump - snap
      setDisplayProgress(progress);
      lastProgressRef.current = progress;
      lastUpdateTimeRef.current = Date.now();
    } else {
      // Small update - blend
      lastProgressRef.current = progress;
      lastUpdateTimeRef.current = Date.now();
    }

    interpolationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (interpolationFrameRef.current) {
        cancelAnimationFrame(interpolationFrameRef.current);
      }
    };
  }, [progress, isPlaying, isDraggingSeek, currentTrack?.duration]);

  // NULLSOFT easter egg - double-click title grip
  const handleGripDoubleClick = () => {
    setShowNullsoft(true);
    setTimeout(() => setShowNullsoft(false), 3000);
  };

  // Drag handlers disabled - was causing 150px jump bug
  // const handleDragStart = (e: React.MouseEvent) => {
  //   if (playerRef.current) {
  //     const rect = playerRef.current.getBoundingClientRect();
  //     setDragOffset({
  //       x: e.clientX - rect.left - position.x,
  //       y: e.clientY - rect.top - position.y
  //     });
  //     setIsDragging(true);
  //     markInteracted();
  //   }
  // };

  // Close skin menu when clicking outside
  useEffect(() => {
    if (!showSkinMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      setShowSkinMenu(false);
    };

    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSkinMenu]);

  // Drag move/release disabled - was causing 150px jump bug
  // useEffect(() => {
  //   if (!isDragging) return;
  //   const handleMouseMove = (e: MouseEvent) => {
  //     // Drag position calculation removed
  //   };
  //   const handleMouseUp = () => {
  //     setIsDragging(false);
  //   };
  //   window.addEventListener('mousemove', handleMouseMove);
  //   window.addEventListener('mouseup', handleMouseUp);
  //   return () => {
  //     window.removeEventListener('mousemove', handleMouseMove);
  //     window.removeEventListener('mouseup', handleMouseUp);
  //   };
  // }, [isDragging, dragOffset]);

  // Real FFT data for mini visualizer (5 bars for compact display)
  const frequencyData = useFFTData({
    analyserNode,
    binCount: 5,
    smoothing: 0.7,
    isPlaying,
  });

  // Handle seek bar click/drag
  const handleSeek = (e: React.MouseEvent | MouseEvent) => {
    if (!seekBarRef.current) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    seekToPercent(percent);
  };

  // Handle volume bar click/drag
  const handleVolumeChange = (e: React.MouseEvent | MouseEvent) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setVolume(percent / 100);
  };

  const handleSeekMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSeek(true);
    handleSeek(e);
  };

  const handleVolumeMouseDown = (e: React.MouseEvent) => {
    setIsDraggingVolume(true);
    handleVolumeChange(e);
  };

  useEffect(() => {
    if (!isDraggingSeek && !isDraggingVolume) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSeek) handleSeek(e);
      if (isDraggingVolume) handleVolumeChange(e);
    };
    const handleMouseUp = () => {
      setIsDraggingSeek(false);
      setIsDraggingVolume(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSeek, isDraggingVolume]);

  if (!currentTrack) {
    return null;
  }

  // Format time from progress percentage using actual track duration
  const formatTime = (percent: number): string => {
    const totalSeconds = currentTrack?.duration
      ? parseDuration(currentTrack.duration)
      : 180;
    const currentSeconds = Math.floor((percent / 100) * totalSeconds);
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format track counter (01/29 style)
  const trackCounter = `${(currentTrackIndex + 1).toString().padStart(2, '0')}/${totalTracks.toString().padStart(2, '0')}`;

  // Get repeat mode icon
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one': return '🔂';
      case 'all': return '🔁';
      default: return '↻';
    }
  };

  // Show CTA glow on play button when not playing and user hasn't interacted
  const showPlayCta = !isPlaying && !hasInteracted;

  // Dragging disabled - position transform removed
  // const positionStyle = position.x !== 0 || position.y !== 0
  //   ? { transform: `translate(${position.x}px, ${position.y}px)` }
  //   : {};

  return (
    <div
      ref={playerRef}
      className={`${styles.winampShade} ${hasInteracted ? styles.interacted : ''} ${styles[`skin_${currentSkin}`] || ''}`}
    >
      {/* NULLSOFT Easter Egg Overlay */}
      {showNullsoft && (
        <div className={styles.nullsoftOverlay}>
          <span className={styles.nullsoftText}>NULLSOFT</span>
          <span className={styles.nullsoftSubtext}>Winamp Classic</span>
        </div>
      )}

      {/* Title bar grip (left) - Double-click for easter egg (dragging disabled) */}
      <div
        className={styles.titleGrip}
        onDoubleClick={handleGripDoubleClick}
        title="Double-click for surprise"
      >
        <div className={styles.gripLines}>
          <span></span><span></span><span></span>
        </div>
      </div>

      {/* Mini Album Art */}
      {currentTrack.coverArt && (
        <div className={styles.miniArt}>
          <img src={currentTrack.coverArt} alt="" />
        </div>
      )}

      {/* Mini Visualizer */}
      <div className={styles.miniVis}>
        {frequencyData.map((magnitude, i) => {
          const heightPx = Math.max(2, (magnitude / 255) * 14);
          return (
            <div
              key={i}
              className={styles.visBar}
              style={{ height: `${heightPx}px` }}
            />
          );
        })}
      </div>

      {/* Track Counter */}
      <div className={styles.trackCounter}>
        {trackCounter}
      </div>

      {/* Track Info - Scrolling Marquee */}
      <div
        className={`${styles.trackDisplay} ${!hasInteracted ? styles.clickable : ''}`}
        onClick={() => { markInteracted(); setMinimized(false); }}
        title="Click to open full player"
      >
        <div className={styles.marqueeContainer}>
          <span className={`${styles.marqueeText} ${isPlaying ? styles.scrolling : ''}`}>
            {currentTrack.artist} - {currentTrack.title} ***
          </span>
        </div>
      </div>

      {/* Time Display */}
      <div className={styles.timeDisplay}>
        {formatTime(displayProgress)}
      </div>

      {/* Shuffle/Repeat Buttons */}
      <div className={styles.modeButtons}>
        <button
          className={`${styles.modeBtn} ${isShuffle ? styles.active : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}
          title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
        >
          <span className={styles.btnIcon}>🔀</span>
        </button>
        <button
          className={`${styles.modeBtn} ${repeatMode !== 'off' ? styles.active : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleRepeat(); }}
          title={`Repeat: ${repeatMode}`}
        >
          <span className={styles.btnIcon}>{getRepeatIcon()}</span>
        </button>
      </div>

      {/* Skin Switcher */}
      <div className={styles.skinSwitcher}>
        <button
          className={styles.skinBtn}
          onClick={(e) => { e.stopPropagation(); setShowSkinMenu(!showSkinMenu); }}
          title="Change skin"
        >
          <span className={styles.btnIcon}>🎨</span>
        </button>
        {showSkinMenu && (
          <div className={styles.skinMenu}>
            {skins.map((skin) => (
              <button
                key={skin.id}
                className={`${styles.skinOption} ${currentSkin === skin.id ? styles.activeSkin : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSkin(skin.id);
                  setShowSkinMenu(false);
                  markInteracted();
                }}
              >
                <span
                  className={styles.skinSwatch}
                  style={{ background: skin.colors.bg, borderColor: skin.colors.accent }}
                />
                <span className={styles.skinName}>{skin.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transport Controls */}
      <div className={styles.transportButtons}>
        <button
          className={styles.transportBtn}
          onClick={(e) => { e.stopPropagation(); previousTrack(); }}
          title="Previous"
        >
          <span className={styles.btnIcon}>⏮</span>
        </button>
        <button
          className={`${styles.transportBtn} ${showPlayCta ? styles.ctaGlow : ''}`}
          onClick={(e) => { e.stopPropagation(); markInteracted(); togglePlayPause(); }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <span className={styles.btnIcon}>{isPlaying ? '⏸' : '▶'}</span>
          {showPlayCta && <span className={styles.ctaHint}>Hit Play!</span>}
        </button>
        <button
          className={styles.transportBtn}
          onClick={(e) => { e.stopPropagation(); /* stop would go here */ }}
          title="Stop"
        >
          <span className={styles.btnIcon}>⏹</span>
        </button>
        <button
          className={styles.transportBtn}
          onClick={(e) => { e.stopPropagation(); nextTrack(); }}
          title="Next"
        >
          <span className={styles.btnIcon}>⏭</span>
        </button>
      </div>

      {/* Mini Seek Bar */}
      <div
        className={styles.seekBar}
        ref={seekBarRef}
        onMouseDown={handleSeekMouseDown}
      >
        <div
          className={styles.seekFill}
          style={{ width: `${displayProgress}%` }}
        />
        <div
          className={styles.seekThumb}
          style={{ left: `${displayProgress}%` }}
        />
      </div>

      {/* Volume Bar */}
      <div
        className={styles.volumeBar}
        ref={volumeBarRef}
        onMouseDown={handleVolumeMouseDown}
        title={`Volume: ${Math.round(volume * 100)}%`}
      >
        <div
          className={styles.volumeFill}
          style={{ width: `${volume * 100}%` }}
        />
        <div
          className={styles.volumeThumb}
          style={{ left: `${volume * 100}%` }}
        />
      </div>

      {/* Expand Button */}
      <button
        className={`${styles.expandBtn} ${!hasInteracted ? styles.expandCta : ''}`}
        onClick={() => { markInteracted(); setMinimized(false); }}
        title="Expand Player"
      >
        <span>▼</span>
      </button>
    </div>
  );
}
