"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WinampModal;
var react_1 = require("react");
var MusicPlayerContext_1 = require("../../contexts/MusicPlayerContext");
var musicMetadata_1 = require("../../data/musicMetadata");
var useFFTData_1 = require("../../hooks/useFFTData");
var styles_module_css_1 = require("./styles.module.css");
function WinampModal() {
    var _a = (0, MusicPlayerContext_1.useMusicPlayer)(), isPlaying = _a.isPlaying, isLoading = _a.isLoading, currentTrack = _a.currentTrack, currentTrackIndex = _a.currentTrackIndex, volume = _a.volume, progress = _a.progress, isMinimized = _a.isMinimized, analyserNode = _a.analyserNode, eqSettings = _a.eqSettings, togglePlayPause = _a.togglePlayPause, setVolume = _a.setVolume, setEQ = _a.setEQ, resetEQ = _a.resetEQ, switchTrack = _a.switchTrack, nextTrack = _a.nextTrack, previousTrack = _a.previousTrack, setMinimized = _a.setMinimized;
    // Real FFT frequency data for visualizer (24 bars)
    var frequencyData = (0, useFFTData_1.useFFTData)({
        analyserNode: analyserNode,
        binCount: 24,
        smoothing: 0.7,
        isPlaying: isPlaying,
    });
    if (isMinimized || !currentTrack) {
        return null;
    }
    var genreColors = (0, musicMetadata_1.getGenreColors)(currentTrack.genre);
    return (<div className={styles_module_css_1.default.modalOverlay} onClick={function () { return setMinimized(true); }}>
      <div className={styles_module_css_1.default.winampModal} onClick={function (e) { return e.stopPropagation(); }}>
        {/* Header */}
        <div className={styles_module_css_1.default.header}>
          <div className={styles_module_css_1.default.title}>
            ████ WINAMP 5.X ████
          </div>
          <div className={styles_module_css_1.default.headerButtons}>
            <button className={styles_module_css_1.default.closeButton} onClick={function () { return setMinimized(true); }} aria-label="Minimize">
              _
            </button>
          </div>
        </div>

        <div className={styles_module_css_1.default.content}>
          {/* Left: Album Art & Metadata */}
          <div className={styles_module_css_1.default.leftPanel}>
            <div className={styles_module_css_1.default.albumCover}>
              <img src={currentTrack.coverArt} alt={currentTrack.album}/>
              <div className={styles_module_css_1.default.coverOverlay}></div>
            </div>

            <div className={styles_module_css_1.default.metadata}>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>TITLE:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.title}</span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>ARTIST:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.artist}</span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>ALBUM:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.album}</span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>YEAR:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.year}</span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>GENRE:</span>
                <span className={styles_module_css_1.default.metaValue} style={{ color: genreColors.primary }}>
                  {currentTrack.genre}
                </span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>BPM:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.bpm}</span>
              </div>
              <div className={styles_module_css_1.default.metaRow}>
                <span className={styles_module_css_1.default.metaLabel}>MOOD:</span>
                <span className={styles_module_css_1.default.metaValue}>{currentTrack.mood}</span>
              </div>
              <div className={styles_module_css_1.default.description}>
                {currentTrack.description}
              </div>

              {/* AI Generation Credits */}
              {currentTrackIndex < 7 && (<div className={styles_module_css_1.default.aiCredits}>
                  <span className={styles_module_css_1.default.creditIcon}>🤖</span>
                  <span className={styles_module_css_1.default.creditText}>
                    MIDI & Album Art: AI-Generated
                  </span>
                </div>)}
            </div>
          </div>

          {/* Right: Player Controls */}
          <div className={styles_module_css_1.default.rightPanel}>
            {/* Real FFT Visualizer */}
            <div className={styles_module_css_1.default.visualizer}>
              <div className={styles_module_css_1.default.scanlines}></div>
              <div className={styles_module_css_1.default.waveform}>
                {frequencyData.map(function (magnitude, i) {
            // Normalize magnitude (0-255) to percentage height
            var heightPercent = Math.max(2, (magnitude / 255) * 100);
            return (<div key={i} className={styles_module_css_1.default.bar} style={{
                    height: "".concat(heightPercent, "%"),
                    background: "linear-gradient(180deg, ".concat(genreColors.primary, ", ").concat(genreColors.secondary, ")"),
                    transition: 'height 50ms ease-out',
                }}/>);
        })}
              </div>
            </div>

            {/* Progress Bar */}
            <div className={styles_module_css_1.default.progressBar}>
              <div className={styles_module_css_1.default.progressFill} style={{
            width: "".concat(progress, "%"),
            background: "linear-gradient(90deg, ".concat(genreColors.primary, ", ").concat(genreColors.secondary, ")")
        }}/>
            </div>

            {/* Main Controls */}
            <div className={styles_module_css_1.default.controls}>
              <button className={styles_module_css_1.default.controlButton} onClick={previousTrack} disabled={isLoading}>
                ⏮
              </button>
              <button className={"".concat(styles_module_css_1.default.controlButton, " ").concat(styles_module_css_1.default.playButton)} onClick={togglePlayPause} disabled={isLoading}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className={styles_module_css_1.default.controlButton} onClick={nextTrack} disabled={isLoading}>
                ⏭
              </button>
            </div>

            {/* Volume Control */}
            <div className={styles_module_css_1.default.volumeSection}>
              <span className={styles_module_css_1.default.volumeLabel}>VOL</span>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={function (e) { return setVolume(parseFloat(e.target.value)); }} className={styles_module_css_1.default.volumeSlider} style={{
            background: "linear-gradient(90deg, ".concat(genreColors.primary, ", ").concat(genreColors.secondary, ")")
        }}/>
              <span className={styles_module_css_1.default.volumeValue}>{Math.round(volume * 100)}%</span>
            </div>

            {/* Windows 3.1 Style EQ Panel */}
            <div className={styles_module_css_1.default.eqPanel}>
              <div className={styles_module_css_1.default.eqHeader}>
                <span className={styles_module_css_1.default.eqTitle}>▓ EQUALIZER</span>
                <button className={styles_module_css_1.default.eqResetButton} onClick={resetEQ} title="Reset EQ to flat">
                  RESET
                </button>
              </div>
              <div className={styles_module_css_1.default.eqSliders}>
                {/* Bass */}
                <div className={styles_module_css_1.default.eqSliderGroup}>
                  <div className={styles_module_css_1.default.eqDbLabel}>
                    {eqSettings.bass > 0 ? '+' : ''}{eqSettings.bass}dB
                  </div>
                  <input type="range" min="-12" max="12" step="1" value={eqSettings.bass} onChange={function (e) { return setEQ('bass', parseInt(e.target.value)); }} className={styles_module_css_1.default.eqVerticalSlider} orient="vertical"/>
                  <div className={styles_module_css_1.default.eqBandLabel}>BASS</div>
                  <div className={styles_module_css_1.default.eqFreqLabel}>200Hz</div>
                </div>

                {/* Mid */}
                <div className={styles_module_css_1.default.eqSliderGroup}>
                  <div className={styles_module_css_1.default.eqDbLabel}>
                    {eqSettings.mid > 0 ? '+' : ''}{eqSettings.mid}dB
                  </div>
                  <input type="range" min="-12" max="12" step="1" value={eqSettings.mid} onChange={function (e) { return setEQ('mid', parseInt(e.target.value)); }} className={styles_module_css_1.default.eqVerticalSlider} orient="vertical"/>
                  <div className={styles_module_css_1.default.eqBandLabel}>MID</div>
                  <div className={styles_module_css_1.default.eqFreqLabel}>1kHz</div>
                </div>

                {/* Treble */}
                <div className={styles_module_css_1.default.eqSliderGroup}>
                  <div className={styles_module_css_1.default.eqDbLabel}>
                    {eqSettings.treble > 0 ? '+' : ''}{eqSettings.treble}dB
                  </div>
                  <input type="range" min="-12" max="12" step="1" value={eqSettings.treble} onChange={function (e) { return setEQ('treble', parseInt(e.target.value)); }} className={styles_module_css_1.default.eqVerticalSlider} orient="vertical"/>
                  <div className={styles_module_css_1.default.eqBandLabel}>TREBLE</div>
                  <div className={styles_module_css_1.default.eqFreqLabel}>3kHz</div>
                </div>
              </div>
            </div>

            {/* Track List */}
            <div className={styles_module_css_1.default.playlist}>
              <div className={styles_module_css_1.default.playlistHeader}>PLAYLIST</div>
              <div className={styles_module_css_1.default.trackList}>
                {musicMetadata_1.MUSIC_LIBRARY.map(function (track, idx) { return (<div key={track.id} className={"".concat(styles_module_css_1.default.playlistItem, " ").concat(idx === currentTrackIndex ? styles_module_css_1.default.playlistItemActive : '')} onClick={function () { return switchTrack(idx); }} style={idx === currentTrackIndex ? {
                borderColor: genreColors.primary,
                background: "linear-gradient(90deg, ".concat(genreColors.primary, "22, ").concat(genreColors.secondary, "22)")
            } : {}}>
                    <span className={styles_module_css_1.default.trackNumber}>{String(idx + 1).padStart(2, '0')}</span>
                    <span className={styles_module_css_1.default.trackName}>{track.title}</span>
                    <span className={styles_module_css_1.default.trackDuration}>{track.duration}</span>
                  </div>); })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
