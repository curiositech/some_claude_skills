/**
 * Winamp components barrel file
 */

export { MusicPlayerProvider, useMusicPlayer } from './music-player-context';
export { WinampCompact as WinampModal } from './winamp-compact';
export { MUSIC_LIBRARY, type TrackMetadata } from './music-metadata';

// Legacy full-size modal (if needed)
export { default as WinampModalLegacy } from './winamp-modal';
