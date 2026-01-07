"use strict";
/**
 * Winamp Skin System
 * Based on classic Winamp aesthetic with multiple theme options
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SKIN = exports.WINAMP_SKINS = void 0;
exports.WINAMP_SKINS = {
    classic: {
        id: 'classic',
        name: 'Classic',
        description: 'The iconic green Winamp skin',
        pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 255, 0, 0.03) 10px, rgba(0, 255, 0, 0.03) 20px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0, 255, 0, 0.02) 10px, rgba(0, 255, 0, 0.02) 20px)',
        colors: {
            bg: '#00AA00',
            bgLight: '#00CC00',
            bgDark: '#008800',
            text: '#00FF00',
            textDim: '#00AA00',
            accent: '#00FF00',
            accentHover: '#00FFAA',
            displayBg: '#000000',
            displayText: '#00FF00',
            buttonBg: '#00AA00',
            buttonHover: '#00CC00',
            progressBar: '#00FF00',
            progressBg: '#004400',
            visualizer: '#00FF00',
            titlebar: '#00AA00',
            border: '#00FF00',
        }
    },
    dolphin: {
        id: 'dolphin',
        name: 'Dolphin Dreams',
        description: 'Deep ocean blue with aquatic vibes',
        pattern: 'radial-gradient(circle at 20% 50%, rgba(0, 191, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(77, 166, 255, 0.06) 0%, transparent 50%), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0, 191, 255, 0.03) 40px, rgba(0, 191, 255, 0.03) 41px)',
        colors: {
            bg: '#1E3A5F',
            bgLight: '#2A4A7F',
            bgDark: '#152840',
            text: '#4DA6FF',
            textDim: '#2A6699',
            accent: '#00BFFF',
            accentHover: '#33D4FF',
            displayBg: '#0A1929',
            displayText: '#4DA6FF',
            buttonBg: '#2A4A7F',
            buttonHover: '#3A5A8F',
            progressBar: '#00BFFF',
            progressBg: '#0D2847',
            visualizer: '#00BFFF',
            titlebar: '#1E3A5F',
            border: '#4DA6FF',
        }
    },
    sailorMoon: {
        id: 'sailorMoon',
        name: 'Sailor Moon',
        description: 'Magical girl aesthetics from the 90s',
        pattern: 'radial-gradient(circle at 30% 30%, rgba(255, 105, 180, 0.15) 0%, transparent 30%), radial-gradient(circle at 70% 70%, rgba(255, 20, 147, 0.1) 0%, transparent 30%), radial-gradient(circle at 50% 50%, rgba(255, 182, 217, 0.08) 0%, transparent 40%)',
        colors: {
            bg: '#FFB6D9',
            bgLight: '#FFC8E3',
            bgDark: '#FF99CC',
            text: '#FF1493',
            textDim: '#CC4499',
            accent: '#FF69B4',
            accentHover: '#FF85C1',
            displayBg: '#FFE6F0',
            displayText: '#CC0066',
            buttonBg: '#FFB6D9',
            buttonHover: '#FFC8E3',
            progressBar: '#FF1493',
            progressBg: '#FFD6E8',
            visualizer: '#FF69B4',
            titlebar: '#FFB6D9',
            border: '#FF1493',
        }
    },
    vintage: {
        id: 'vintage',
        name: 'Vintage Tan',
        description: 'Retro beige computing aesthetics',
        pattern: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(92, 78, 58, 0.03) 2px, rgba(92, 78, 58, 0.03) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 111, 71, 0.02) 2px, rgba(139, 111, 71, 0.02) 4px), radial-gradient(circle at 10% 20%, rgba(92, 78, 58, 0.04) 0%, transparent 50%)',
        colors: {
            bg: '#C9B99B',
            bgLight: '#D9CAB3',
            bgDark: '#B5A689',
            text: '#5C4E3A',
            textDim: '#8C7E6A',
            accent: '#8B6F47',
            accentHover: '#A17E52',
            displayBg: '#E8DCC8',
            displayText: '#4A3C2A',
            buttonBg: '#C9B99B',
            buttonHover: '#D9CAB3',
            progressBar: '#8B6F47',
            progressBg: '#B5A689',
            visualizer: '#8B6F47',
            titlebar: '#C9B99B',
            border: '#8B6F47',
        }
    }
};
exports.DEFAULT_SKIN = 'classic';
