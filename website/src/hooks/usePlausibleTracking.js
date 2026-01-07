"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePlausibleTracking = usePlausibleTracking;
exports.useTimeTracking = useTimeTracking;
exports.useScrollTracking = useScrollTracking;
exports.useSkillNavigationTracking = useSkillNavigationTracking;
var react_1 = require("react");
function usePlausibleTracking() {
    var track = (0, react_1.useCallback)(function (eventName, props) {
        if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
            try {
                window.plausible(eventName, { props: props });
            }
            catch (error) {
                // Silently fail in development when Plausible isn't loaded
                console.debug('Plausible tracking skipped:', eventName);
            }
        }
    }, []);
    return { track: track };
}
// Hook for tracking time spent on a section
function useTimeTracking(sectionName) {
    var startTimeRef = (0, react_1.useRef)(Date.now());
    var track = usePlausibleTracking().track;
    (0, react_1.useEffect)(function () {
        startTimeRef.current = Date.now();
        return function () {
            var timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000); // seconds
            if (timeSpent > 2) { // Only track if spent more than 2 seconds
                track('Time Spent', {
                    section: sectionName,
                    duration: timeSpent,
                });
            }
        };
    }, [sectionName, track]);
}
// Hook for tracking scroll depth
function useScrollTracking(pageName) {
    var track = usePlausibleTracking().track;
    var maxScrollRef = (0, react_1.useRef)(0);
    var trackedMilestonesRef = (0, react_1.useRef)(new Set());
    (0, react_1.useEffect)(function () {
        var handleScroll = function () {
            var scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
            maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent);
            // Track milestones: 25%, 50%, 75%, 100%
            var milestones = [25, 50, 75, 100];
            milestones.forEach(function (milestone) {
                if (scrollPercent >= milestone &&
                    !trackedMilestonesRef.current.has(milestone)) {
                    trackedMilestonesRef.current.add(milestone);
                    track('Scroll Depth', {
                        page: pageName,
                        depth: milestone,
                    });
                }
            });
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return function () { return window.removeEventListener('scroll', handleScroll); };
    }, [pageName, track]);
}
// Hook for tracking skill navigation patterns
function useSkillNavigationTracking() {
    var track = usePlausibleTracking().track;
    var lastSkillRef = (0, react_1.useRef)(null);
    var trackSkillView = (0, react_1.useCallback)(function (skillId, source) {
        var previousSkill = lastSkillRef.current;
        // Track skill view
        track('Skill Viewed', {
            skill: skillId,
            source: source,
        });
        // Track skill-to-skill navigation if there was a previous skill
        if (previousSkill && previousSkill !== skillId) {
            track('Skill Navigation', {
                from: previousSkill,
                to: skillId,
            });
        }
        lastSkillRef.current = skillId;
    }, [track]);
    return { trackSkillView: trackSkillView };
}
