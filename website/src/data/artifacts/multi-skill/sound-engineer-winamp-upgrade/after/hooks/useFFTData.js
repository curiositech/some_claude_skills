"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFFTData = useFFTData;
exports.useVUMeter = useVUMeter;
var react_1 = require("react");
function useFFTData(_a) {
    var analyserNode = _a.analyserNode, _b = _a.binCount, binCount = _b === void 0 ? 24 : _b, _c = _a.smoothing, smoothing = _c === void 0 ? 0.7 : _c, _d = _a.isPlaying, isPlaying = _d === void 0 ? false : _d;
    var _e = (0, react_1.useState)(function () { return new Array(binCount).fill(0); }), frequencyData = _e[0], setFrequencyData = _e[1];
    var smoothedDataRef = (0, react_1.useRef)(new Float32Array(binCount));
    var rafIdRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        // Reset to zero when not playing
        if (!analyserNode || !isPlaying) {
            // Smoothly decay to zero
            var decay_1 = function () {
                var allZero = true;
                var newData = new Array(binCount);
                for (var i = 0; i < binCount; i++) {
                    smoothedDataRef.current[i] *= 0.85; // Decay factor
                    if (smoothedDataRef.current[i] > 0.5) {
                        allZero = false;
                    }
                    newData[i] = Math.round(smoothedDataRef.current[i]);
                }
                setFrequencyData(newData);
                if (!allZero) {
                    rafIdRef.current = requestAnimationFrame(decay_1);
                }
            };
            decay_1();
            return function () {
                if (rafIdRef.current) {
                    cancelAnimationFrame(rafIdRef.current);
                }
            };
        }
        var bufferLength = analyserNode.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        var updateFrequencyData = function () {
            // Get frequency data from analyser (0-255 values)
            analyserNode.getByteFrequencyData(dataArray);
            // Downsample to desired bin count
            var binsPerGroup = Math.floor(bufferLength / binCount);
            var newData = new Array(binCount);
            for (var i = 0; i < binCount; i++) {
                var sum = 0;
                var start = i * binsPerGroup;
                var end = Math.min(start + binsPerGroup, bufferLength);
                for (var j = start; j < end; j++) {
                    sum += dataArray[j];
                }
                var average = sum / binsPerGroup;
                // Apply exponential moving average for smoothing
                smoothedDataRef.current[i] =
                    smoothing * smoothedDataRef.current[i] +
                        (1 - smoothing) * average;
                newData[i] = Math.round(smoothedDataRef.current[i]);
            }
            setFrequencyData(newData);
            rafIdRef.current = requestAnimationFrame(updateFrequencyData);
        };
        // Start the animation loop
        rafIdRef.current = requestAnimationFrame(updateFrequencyData);
        return function () {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [analyserNode, binCount, smoothing, isPlaying]);
    return frequencyData;
}
function useVUMeter(_a) {
    var analyserNode = _a.analyserNode, isPlaying = _a.isPlaying;
    var _b = (0, react_1.useState)(0), level = _b[0], setLevel = _b[1];
    var _c = (0, react_1.useState)(0), peak = _c[0], setPeak = _c[1];
    var rafIdRef = (0, react_1.useRef)(null);
    var peakTimeoutRef = (0, react_1.useRef)(null);
    var peakValueRef = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(function () {
        if (!analyserNode || !isPlaying) {
            // Decay to zero
            var decay_2 = function () {
                setLevel(function (prev) {
                    var newLevel = prev * 0.9;
                    if (newLevel < 1)
                        return 0;
                    rafIdRef.current = requestAnimationFrame(decay_2);
                    return newLevel;
                });
                setPeak(function (prev) {
                    var newPeak = prev * 0.95;
                    return newPeak < 1 ? 0 : newPeak;
                });
            };
            decay_2();
            return function () {
                if (rafIdRef.current)
                    cancelAnimationFrame(rafIdRef.current);
                if (peakTimeoutRef.current)
                    clearTimeout(peakTimeoutRef.current);
            };
        }
        var dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        var updateLevel = function () {
            // Get time-domain data
            analyserNode.getByteTimeDomainData(dataArray);
            // Calculate RMS (Root Mean Square) level
            var sum = 0;
            for (var i = 0; i < dataArray.length; i++) {
                // Normalize to -1 to 1 range (128 is center)
                var normalized = (dataArray[i] - 128) / 128;
                sum += normalized * normalized;
            }
            var rms = Math.sqrt(sum / dataArray.length);
            // Convert to dB scale (-60 to 0 dB), then to 0-100
            var db = 20 * Math.log10(rms || 0.0001);
            var normalizedLevel = Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
            setLevel(normalizedLevel);
            // Update peak with hold
            if (normalizedLevel > peakValueRef.current) {
                peakValueRef.current = normalizedLevel;
                setPeak(normalizedLevel);
                // Clear existing timeout
                if (peakTimeoutRef.current) {
                    clearTimeout(peakTimeoutRef.current);
                }
                // Hold peak for 1.5 seconds, then decay
                peakTimeoutRef.current = window.setTimeout(function () {
                    peakValueRef.current = 0;
                }, 1500);
            }
            rafIdRef.current = requestAnimationFrame(updateLevel);
        };
        rafIdRef.current = requestAnimationFrame(updateLevel);
        return function () {
            if (rafIdRef.current)
                cancelAnimationFrame(rafIdRef.current);
            if (peakTimeoutRef.current)
                clearTimeout(peakTimeoutRef.current);
        };
    }, [analyserNode, isPlaying]);
    return {
        level: level,
        peak: peak,
        isClipping: level > 95,
    };
}
exports.default = useFFTData;
