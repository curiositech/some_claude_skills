"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePlausibleStats = usePlausibleStats;
exports.useSkillStats = useSkillStats;
var react_1 = require("react");
var plausibleStats_json_1 = require("../data/plausibleStats.json");
/**
 * Hook to fetch skill view statistics from Plausible Analytics
 *
 * This hook fetches aggregated "Skill Viewed" events from Plausible's Stats API.
 *
 * Note: For production, you'll need to:
 * 1. Set up a serverless function or API route to proxy Plausible API calls
 * 2. Store your Plausible API key in environment variables
 * 3. Never expose the API key in client-side code
 *
 * For now, this returns mock data for development.
 */
function usePlausibleStats() {
    var _a = (0, react_1.useState)(new Map()), stats = _a[0], setStats = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    (0, react_1.useEffect)(function () {
        var loadStats = function () {
            try {
                setLoading(true);
                // Load stats from JSON file (generated at build time)
                var statsMap_1 = new Map();
                plausibleStats_json_1.default.forEach(function (stat) {
                    statsMap_1.set(stat.skillId, stat);
                });
                setStats(statsMap_1);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load stats'));
            }
            finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);
    return { stats: stats, loading: loading, error: error };
}
/**
 * Get stats for a specific skill
 */
function useSkillStats(skillId) {
    var _a, _b;
    var _c = usePlausibleStats(), stats = _c.stats, loading = _c.loading, error = _c.error;
    var skillStats = stats.get(skillId);
    return {
        views: (_a = skillStats === null || skillStats === void 0 ? void 0 : skillStats.views) !== null && _a !== void 0 ? _a : 0,
        lastUpdated: (_b = skillStats === null || skillStats === void 0 ? void 0 : skillStats.lastUpdated) !== null && _b !== void 0 ? _b : new Date().toISOString(),
        loading: loading,
        error: error,
    };
}
