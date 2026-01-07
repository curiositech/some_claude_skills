"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCP_STATUS_CONFIG = exports.MCP_CATEGORIES = void 0;
/**
 * Category options for MCP filtering
 */
exports.MCP_CATEGORIES = [
    'all',
    'Prompt Engineering',
    'Career & Resume',
    'Code Quality',
    'Data & Analytics',
    'External Services',
    'Productivity',
];
/**
 * Status labels and colors
 */
exports.MCP_STATUS_CONFIG = {
    stable: { label: 'Stable', color: '#166534', bg: '#dcfce7' },
    beta: { label: 'Beta', color: '#854d0e', bg: '#fef9c3' },
    experimental: { label: 'Experimental', color: '#9a3412', bg: '#ffedd5' },
};
