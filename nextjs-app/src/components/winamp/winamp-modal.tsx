'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMusicPlayer } from './music-player-context';
import { MUSIC_LIBRARY } from './music-metadata';
import styles from './winamp.module.css';

export default function WinampModal() {
  const {
    isPlaying,
    isLoading,
    currentTrack,
    currentTrackIndex,
    volume,
    progress,
    isMinimized,
    analyserNode,
    audioContext,
    gainNode,
    eqSettings,
    togglePlayPause,
    setVolume,
    setEQ,
    resetEQ,
    switchTrack,
    nextTrack,
    previousTrack,
    setMinimized,
    seekToPercent,
    setVisualizerFullScreen,
  } = useMusicPlayer();

  // FFT data for visualizer
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(24).fill(0));

  // Update FFT data
  useEffect(() => {
    if (!analyserNode || !isPlaying) {
      if (!isPlaying) {
        setFrequencyData(new Array(24).fill(0));
      }
      return;
    }

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    let animationId: number;

    const updateFFT = () => {
      analyserNode.getByteFrequencyData(dataArray);
      // Sample 24 bars across the frequency spectrum
      const bars = [];
      const binCount = analyserNode.frequencyBinCount;
      for (let i = 0; i < 24; i++) {
        const start = Math.floor((i / 24) * binCount * 0.7);
        const end = Math.floor(((i + 1) / 24) * binCount * 0.7);
        let sum = 0;
        for (let j = start; j < end; j++) {
          sum += dataArray[j];
        }
        bars.push(sum / (end - start));
      }
      setFrequencyData(bars);
      animationId = requestAnimationFrame(updateFFT);
    };

    animationId = requestAnimationFrame(updateFFT);
    return () => cancelAnimationFrame(animationId);
  }, [analyserNode, isPlaying]);

  // Milkdrop state
  const [visualizerMode, setVisualizerMode] = useState<'fft' | 'milkdrop'>('fft');
  const [milkdropReady, setMilkdropReady] = useState(false);
  const [milkdropError, setMilkdropError] = useState<string | null>(null);
  const [currentPreset, setCurrentPreset] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visualizerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const presetsRef = useRef<Record<string, any>>({});
  const presetKeysRef = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Butterchurn when switching to milkdrop mode
  useEffect(() => {
    if (visualizerMode !== 'milkdrop' || isMinimized || !currentTrack) return;

    const init = async () => {
      try {
        const butterchurnModule = await import('butterchurn');
        const butterchurnPresetsModule = await import('butterchurn-presets');

        if (!canvasRef.current || !audioContext || !gainNode) {
          throw new Error('Canvas or audio context not available');
        }

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        const width = container?.clientWidth || 400;
        const height = container?.clientHeight || 120;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        const butterchurn = butterchurnModule.default || butterchurnModule;
        const butterchurnPresets = butterchurnPresetsModule.default || butterchurnPresetsModule;

        if (!butterchurn || typeof butterchurn.createVisualizer !== 'function') {
          throw new Error('Butterchurn createVisualizer not available');
        }

        const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
          width: width * dpr,
          height: height * dpr,
          pixelRatio: 1,
          textureRatio: 1,
        });

        visualizer.connectAudio(gainNode);

        const getPresets = butterchurnPresets.getPresets || butterchurnPresets;
        const loadedPresets = typeof getPresets === 'function' ? getPresets() : getPresets;
        const keys = Object.keys(loadedPresets);

        presetsRef.current = loadedPresets;
        presetKeysRef.current = keys;

        const startPreset = keys[Math.floor(Math.random() * keys.length)];
        visualizer.loadPreset(loadedPresets[startPreset], 0);
        setCurrentPreset(startPreset);

        visualizerRef.current = visualizer;
        setMilkdropReady(true);
        setMilkdropError(null);
      } catch (error) {
        console.error('[WinampModal] Milkdrop init failed:', error);
        setMilkdropError(error instanceof Error ? error.message : 'Failed to load');
        setMilkdropReady(false);
      }
    };

    init();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [visualizerMode, isMinimized, currentTrack, audioContext, gainNode]);

  // Render loop for milkdrop
  useEffect(() => {
    if (visualizerMode !== 'milkdrop' || !milkdropReady || !visualizerRef.current) return;

    const render = () => {
      if (visualizerRef.current) {
        visualizerRef.current.render();
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [visualizerMode, milkdropReady]);

  // Auto-cycle presets
  useEffect(() => {
    if (visualizerMode !== 'milkdrop' || !milkdropReady || !isPlaying) return;

    const interval = setInterval(() => {
      loadRandomPreset();
    }, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizerMode, milkdropReady, isPlaying]);

  const loadRandomPreset = useCallback(() => {
    if (!visualizerRef.current || presetKeysRef.current.length === 0) return;

    const keys = presetKeysRef.current;
    const presets = presetsRef.current;
    const randomIndex = Math.floor(Math.random() * keys.length);
    const presetName = keys[randomIndex];

    visualizerRef.current.loadPreset(presets[presetName], 1.5);
    setCurrentPreset(presetName);
  }, []);

  const toggleVisualizerMode = useCallback(() => {
    setVisualizerMode(prev => prev === 'fft' ? 'milkdrop' : 'fft');
  }, []);

  if (isMinimized || !currentTrack) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={() => setMinimized(true)}>
      <div className={styles.winampModal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>████ WINAMP 5.X ████</div>
          <div className={styles.headerButtons}>
            <button className={styles.closeButton} onClick={() => setMinimized(true)} aria-label="Minimize">_</button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Left: Album Art & Metadata */}
          <div className={styles.leftPanel}>
            <div className={styles.albumCover}>
              <img src={currentTrack.coverArt} alt={currentTrack.album} />
              <div className={styles.coverOverlay}></div>
            </div>

            <div className={styles.metadata}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>TITLE:</span>
                <span className={styles.metaValue}>{currentTrack.title}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>ARTIST:</span>
                <span className={styles.metaValue}>{currentTrack.artist}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>ALBUM:</span>
                <span className={styles.metaValue}>{currentTrack.album}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>YEAR:</span>
                <span className={styles.metaValue}>{currentTrack.year}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>GENRE:</span>
                <span className={styles.metaValue}>{currentTrack.genre}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>BPM:</span>
                <span className={styles.metaValue}>{currentTrack.bpm}</span>
              </div>
              <div className={styles.description}>{currentTrack.description}</div>
            </div>
          </div>

          {/* Right: Player Controls */}
          <div className={styles.rightPanel}>
            {/* Visualizer */}
            <div className={styles.visualizer}>
              <div className={styles.scanlines}></div>

              {visualizerMode === 'fft' && (
                <div className={styles.waveform}>
                  {frequencyData.map((magnitude, i) => {
                    const heightPx = Math.max(4, (magnitude / 255) * 100);
                    return (
                      <div
                        key={i}
                        className={styles.bar}
                        style={{ height: `${heightPx}px`, transition: 'height 50ms ease-out' }}
                      />
                    );
                  })}
                </div>
              )}

              {visualizerMode === 'milkdrop' && (
                <>
                  <canvas ref={canvasRef} className={styles.milkdropCanvas} />
                  {!milkdropReady && !milkdropError && (
                    <div className={styles.milkdropLoading}><span className={styles.loadingDots}>LOADING</span></div>
                  )}
                  {milkdropError && <div className={styles.milkdropError}>{milkdropError}</div>}
                  {milkdropReady && currentPreset && (
                    <div className={styles.presetLabel}>
                      {currentPreset.length > 30 ? currentPreset.substring(0, 30) + '...' : currentPreset}
                    </div>
                  )}
                </>
              )}

              <button className={styles.modeToggleButton} onClick={toggleVisualizerMode} title={visualizerMode === 'fft' ? 'Switch to Milkdrop' : 'Switch to FFT Bars'} aria-label="Toggle visualizer mode">
                <span className={visualizerMode === 'fft' ? styles.milkdropIcon : styles.barsIcon} />
              </button>

              {visualizerMode === 'milkdrop' && milkdropReady && (
                <button className={styles.nextPresetButton} onClick={loadRandomPreset} title="Next Preset" aria-label="Next preset">
                  <span className={styles.shuffleIcon} />
                </button>
              )}

              <button
                className={styles.fullscreenButton}
                onClick={() => { setMinimized(true); setVisualizerFullScreen(true); }}
                title="Launch Milkdrop Visualizer (Full Screen)"
                aria-label="Fullscreen visualizer"
              >
                <span className={styles.expandIcon} />
              </button>
            </div>

            {/* Progress Bar */}
            <div
              className={styles.progressBar}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percent = (clickX / rect.width) * 100;
                seekToPercent(percent);
              }}
              title="Click to seek"
            >
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            {/* Main Controls */}
            <div className={styles.controls}>
              <button className={`${styles.controlButton} ${styles.prevButton}`} onClick={previousTrack} disabled={isLoading} title="Previous" />
              <button className={`${styles.controlButton} ${isPlaying ? styles.pauseButton : styles.playButton}`} onClick={togglePlayPause} disabled={isLoading} title={isPlaying ? 'Pause' : 'Play'} />
              <button className={`${styles.controlButton} ${styles.nextButton}`} onClick={nextTrack} disabled={isLoading} title="Next" />
            </div>

            {/* Volume */}
            <div className={styles.volumeSection}>
              <span className={styles.volumeLabel}>VOL</span>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className={styles.volumeSlider} />
              <span className={styles.volumeValue}>{Math.round(volume * 100)}%</span>
            </div>

            {/* EQ */}
            <div className={styles.eqPanel}>
              <div className={styles.eqHeader}>
                <span className={styles.eqTitle}>▓ EQUALIZER</span>
                <button className={styles.eqResetButton} onClick={resetEQ} title="Reset EQ to flat">RESET</button>
              </div>
              <div className={styles.eqSliders}>
                <div className={styles.eqSliderGroup}>
                  <div className={styles.eqDbLabel}>{eqSettings.bass > 0 ? '+' : ''}{eqSettings.bass}dB</div>
                  <input type="range" min="-12" max="12" step="1" value={eqSettings.bass} onChange={(e) => setEQ('bass', parseInt(e.target.value))} className={styles.eqVerticalSlider} />
                  <div className={styles.eqBandLabel}>BASS</div>
                  <div className={styles.eqFreqLabel}>200Hz</div>
                </div>
                <div className={styles.eqSliderGroup}>
                  <div className={styles.eqDbLabel}>{eqSettings.mid > 0 ? '+' : ''}{eqSettings.mid}dB</div>
                  <input type="range" min="-12" max="12" step="1" value={eqSettings.mid} onChange={(e) => setEQ('mid', parseInt(e.target.value))} className={styles.eqVerticalSlider} />
                  <div className={styles.eqBandLabel}>MID</div>
                  <div className={styles.eqFreqLabel}>1kHz</div>
                </div>
                <div className={styles.eqSliderGroup}>
                  <div className={styles.eqDbLabel}>{eqSettings.treble > 0 ? '+' : ''}{eqSettings.treble}dB</div>
                  <input type="range" min="-12" max="12" step="1" value={eqSettings.treble} onChange={(e) => setEQ('treble', parseInt(e.target.value))} className={styles.eqVerticalSlider} />
                  <div className={styles.eqBandLabel}>TREBLE</div>
                  <div className={styles.eqFreqLabel}>3kHz</div>
                </div>
              </div>
            </div>

            {/* Playlist */}
            <div className={styles.playlist}>
              <div className={styles.playlistHeader}>PLAYLIST</div>
              <div className={styles.trackList}>
                {MUSIC_LIBRARY.map((track, idx) => (
                  <div
                    key={track.id}
                    className={`${styles.playlistItem} ${idx === currentTrackIndex ? styles.playlistItemActive : ''}`}
                    onClick={() => switchTrack(idx)}
                  >
                    <span className={styles.trackNumber}>{String(idx + 1).padStart(2, '0')}</span>
                    <span className={styles.trackName}>{track.title}</span>
                    <span className={styles.trackDuration}>{track.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
