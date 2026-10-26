"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("vitest/config");
var path_1 = require("path");
exports.default = (0, config_1.defineConfig)({
    esbuild: { jsx: "automatic" },
    test: {
        globals: true,
        environment: 'jsdom', // Changed for React component testing
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        exclude: ['node_modules', 'dist', '.docusaurus', 'src/data/artifacts/**'],
        coverage: {
            provider: 'v8',
            include: ['src/dag/**/*.ts', 'src/hooks/**/*.ts', 'src/components/**/*.tsx'],
            exclude: ['src/dag/**/*.test.ts', 'src/dag/**/index.ts', 'src/**/*.test.tsx'],
            thresholds: {
                'src/hooks/**': {
                    lines: 80,
                    functions: 80,
                    branches: 80,
                    statements: 80,
                },
                'src/components/**': {
                    lines: 70,
                    functions: 70,
                    branches: 70,
                    statements: 70,
                },
            },
        },
        testTimeout: 30000, // 30 seconds for async tests
    },
    resolve: {
        alias: {
            '@site': path_1.default.resolve(__dirname, './'),
        },
    },
});
