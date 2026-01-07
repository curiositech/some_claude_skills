"use strict";
/**
 * Prompt optimization engine using APE/OPRO patterns
 *
 * This is PRODUCTION code. All evaluation is done via actual LLM calls.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptOptimizer = void 0;
var DEFAULT_CONFIG = {
    maxIterations: 10,
    targetScore: 0.95,
    convergenceThreshold: 0.02,
    convergenceWindow: 3
};
// Evaluation criteria with weights
var EVALUATION_CRITERIA = {
    clarity: { weight: 0.25, description: 'How clear and unambiguous is the instruction?' },
    specificity: { weight: 0.25, description: 'Does it provide specific guidance without being overly restrictive?' },
    completeness: { weight: 0.20, description: 'Does it cover all necessary aspects of the task?' },
    structure: { weight: 0.15, description: 'Is it well-organized with appropriate formatting?' },
    effectiveness: { weight: 0.15, description: 'How likely is it to produce the desired output?' }
};
// Pattern-based improvements that don't require LLM calls
var IMPROVEMENT_PATTERNS = [
    {
        name: 'add_structure',
        check: function (p) { return !p.includes('1.') && !p.includes('step') && !p.includes('first'); },
        apply: function (p) { return "".concat(p, "\n\nProvide your response in a structured format with clear sections."); },
        expectedImprovement: 0.15
    },
    {
        name: 'add_chain_of_thought',
        check: function (p) { return !p.toLowerCase().includes('step by step') && !p.toLowerCase().includes('think through'); },
        apply: function (p) { return "".concat(p, "\n\nThink through this step by step, showing your reasoning."); },
        expectedImprovement: 0.20
    },
    {
        name: 'add_constraints',
        check: function (p) { return p.length < 150 && !p.includes('Requirements'); },
        apply: function (p) { return "".concat(p, "\n\nRequirements:\n- Be specific and precise\n- Support claims with evidence\n- Stay focused on the core question"); },
        expectedImprovement: 0.10
    },
    {
        name: 'add_output_format',
        check: function (p) { return !p.toLowerCase().includes('format') && !p.toLowerCase().includes('respond with'); },
        apply: function (p) { return "".concat(p, "\n\nFormat your response clearly with headers where appropriate."); },
        expectedImprovement: 0.08
    },
    {
        name: 'add_context_request',
        check: function (p) { return !p.toLowerCase().includes('context') && !p.toLowerCase().includes('background'); },
        apply: function (p) { return "".concat(p, "\n\nConsider relevant context and background information."); },
        expectedImprovement: 0.05
    }
];
var PromptOptimizer = /** @class */ (function () {
    function PromptOptimizer(openai, config) {
        if (config === void 0) { config = {}; }
        this.history = [];
        // Store last evaluation for debugging/insight
        this.lastEvaluation = null;
        this.openai = openai;
        this.config = __assign(__assign({}, DEFAULT_CONFIG), config);
    }
    /**
     * Optimize a prompt using pattern-based and LLM-based approaches
     */
    PromptOptimizer.prototype.optimize = function (originalPrompt_1) {
        return __awaiter(this, arguments, void 0, function (originalPrompt, similarPrompts, domain) {
            var improvements, currentPrompt, iterations, scores, originalScore, _a, patternImproved, applied, _b, ragImproved, insights, currentScore, candidate, candidateScore, improvement, evaluation, finalScore;
            if (similarPrompts === void 0) { similarPrompts = []; }
            if (domain === void 0) { domain = 'general'; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        improvements = [];
                        currentPrompt = originalPrompt;
                        iterations = 0;
                        scores = [];
                        return [4 /*yield*/, this.scorePrompt(originalPrompt, domain)];
                    case 1:
                        originalScore = _c.sent();
                        improvements.push("Original score: ".concat((originalScore * 100).toFixed(1), "%"));
                        _a = this.applyPatterns(currentPrompt), patternImproved = _a.improved, applied = _a.applied;
                        if (applied.length > 0) {
                            currentPrompt = patternImproved;
                            improvements.push.apply(improvements, applied.map(function (p) { return "Applied pattern: ".concat(p); }));
                        }
                        if (!(similarPrompts.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.learnFromSimilar(currentPrompt, similarPrompts)];
                    case 2:
                        _b = _c.sent(), ragImproved = _b.improved, insights = _b.insights;
                        if (ragImproved !== currentPrompt) {
                            currentPrompt = ragImproved;
                            improvements.push("RAG improvement: ".concat(insights));
                        }
                        _c.label = 3;
                    case 3: return [4 /*yield*/, this.scorePrompt(currentPrompt, domain)];
                    case 4:
                        currentScore = _c.sent();
                        scores.push(currentScore);
                        this.history = [{ prompt: originalPrompt, score: originalScore }];
                        _c.label = 5;
                    case 5:
                        if (!(iterations < this.config.maxIterations)) return [3 /*break*/, 8];
                        iterations++;
                        return [4 /*yield*/, this.generateCandidate(currentPrompt, domain)];
                    case 6:
                        candidate = _c.sent();
                        return [4 /*yield*/, this.scorePrompt(candidate, domain)];
                    case 7:
                        candidateScore = _c.sent();
                        scores.push(candidateScore);
                        this.history.push({ prompt: candidate, score: candidateScore });
                        // Check if improvement
                        if (candidateScore > currentScore) {
                            improvement = candidateScore - currentScore;
                            currentPrompt = candidate;
                            currentScore = candidateScore;
                            improvements.push("Iteration ".concat(iterations, ": +").concat((improvement * 100).toFixed(1), "% (now ").concat((currentScore * 100).toFixed(1), "%)"));
                            evaluation = this.getLastEvaluation();
                            if (evaluation === null || evaluation === void 0 ? void 0 : evaluation.reasoning) {
                                improvements.push("  Reason: ".concat(evaluation.reasoning.slice(0, 100), "..."));
                            }
                        }
                        else {
                            improvements.push("Iteration ".concat(iterations, ": No improvement (").concat((candidateScore * 100).toFixed(1), "% vs ").concat((currentScore * 100).toFixed(1), "%)"));
                        }
                        // Check convergence
                        if (this.checkConvergence(scores)) {
                            improvements.push('Converged - stopping optimization');
                            return [3 /*break*/, 8];
                        }
                        // Check if target reached
                        if (currentScore >= this.config.targetScore) {
                            improvements.push("Target score ".concat((this.config.targetScore * 100).toFixed(0), "% reached!"));
                            return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 5];
                    case 8:
                        finalScore = currentScore;
                        return [2 /*return*/, {
                                original_prompt: originalPrompt,
                                optimized_prompt: currentPrompt,
                                improvements_made: improvements,
                                iterations: iterations,
                                estimated_improvement: finalScore - originalScore,
                                similar_prompts_used: similarPrompts.length
                            }];
                }
            });
        });
    };
    /**
     * Apply pattern-based improvements
     */
    PromptOptimizer.prototype.applyPatterns = function (prompt) {
        var improved = prompt;
        var applied = [];
        for (var _i = 0, IMPROVEMENT_PATTERNS_1 = IMPROVEMENT_PATTERNS; _i < IMPROVEMENT_PATTERNS_1.length; _i++) {
            var pattern = IMPROVEMENT_PATTERNS_1[_i];
            if (pattern.check(improved)) {
                improved = pattern.apply(improved);
                applied.push(pattern.name);
            }
        }
        return { improved: improved, applied: applied };
    };
    /**
     * Learn from similar high-performing prompts
     */
    PromptOptimizer.prototype.learnFromSimilar = function (prompt, similarPrompts) {
        return __awaiter(this, void 0, void 0, function () {
            var sorted, topPrompts, response, improved;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        sorted = __spreadArray([], similarPrompts, true).sort(function (a, b) { return b.metrics.success_rate - a.metrics.success_rate; });
                        topPrompts = sorted.slice(0, 3).map(function (p) { return p.prompt_text; });
                        return [4 /*yield*/, this.openai.chat.completions.create({
                                model: 'gpt-4o-mini',
                                messages: [
                                    {
                                        role: 'system',
                                        content: "You are a prompt optimization expert. Analyze high-performing prompts and suggest improvements."
                                    },
                                    {
                                        role: 'user',
                                        content: "Current prompt to improve:\n".concat(prompt, "\n\nHigh-performing similar prompts:\n").concat(topPrompts.map(function (p, i) { return "".concat(i + 1, ". ").concat(p); }).join('\n\n'), "\n\nBased on what makes the high-performing prompts effective, provide an improved version of the current prompt. Only output the improved prompt, nothing else.")
                                    }
                                ],
                                max_tokens: 500,
                                temperature: 0.7
                            })];
                    case 1:
                        response = _d.sent();
                        improved = ((_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim()) || prompt;
                        return [2 /*return*/, {
                                improved: improved,
                                insights: "Learned from ".concat(topPrompts.length, " high-performing prompts")
                            }];
                }
            });
        });
    };
    /**
     * Generate a candidate using OPRO-style meta-prompting
     */
    PromptOptimizer.prototype.generateCandidate = function (currentPrompt, domain) {
        return __awaiter(this, void 0, void 0, function () {
            var historyText, response;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        historyText = this.history
                            .slice(-5)
                            .map(function (h) { return "Prompt (score: ".concat(h.score.toFixed(2), "): ").concat(h.prompt.slice(0, 100), "..."); })
                            .join('\n');
                        return [4 /*yield*/, this.openai.chat.completions.create({
                                model: 'gpt-4o-mini',
                                messages: [
                                    {
                                        role: 'system',
                                        content: "You are optimizing prompts for the \"".concat(domain, "\" domain. Generate improved versions that score higher.")
                                    },
                                    {
                                        role: 'user',
                                        content: "Previous attempts and scores:\n".concat(historyText, "\n\nGenerate an improved prompt that will score higher. Focus on:\n1. Clarity and specificity\n2. Appropriate constraints\n3. Clear output format expectations\n4. Domain-appropriate language\n\nCurrent prompt:\n").concat(currentPrompt, "\n\nImproved prompt (output only the prompt, nothing else):")
                                    }
                                ],
                                max_tokens: 500,
                                temperature: 0.8
                            })];
                    case 1:
                        response = _d.sent();
                        return [2 /*return*/, ((_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim()) || currentPrompt];
                }
            });
        });
    };
    /**
     * Score a prompt using actual LLM-based evaluation
     * This is production code - we use real evaluation, not heuristics
     */
    PromptOptimizer.prototype.scorePrompt = function (prompt_1) {
        return __awaiter(this, arguments, void 0, function (prompt, domain) {
            var criteriaList, response, evaluation, weightedScore, _i, _a, _b, criterion, weight, score;
            var _c, _d;
            if (domain === void 0) { domain = 'general'; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        criteriaList = Object.entries(EVALUATION_CRITERIA)
                            .map(function (_a) {
                            var name = _a[0], description = _a[1].description;
                            return "- ".concat(name, ": ").concat(description);
                        })
                            .join('\n');
                        return [4 /*yield*/, this.openai.chat.completions.create({
                                model: 'gpt-4o-mini',
                                messages: [
                                    {
                                        role: 'system',
                                        content: "You are an expert prompt engineer evaluating prompt quality. Rate prompts on a 0-10 scale for each criterion. Be critical but fair. Output ONLY valid JSON."
                                    },
                                    {
                                        role: 'user',
                                        content: "Evaluate this prompt for the \"".concat(domain, "\" domain:\n\n---\n").concat(prompt, "\n---\n\nRate each criterion (0-10):\n").concat(criteriaList, "\n\nOutput JSON format:\n{\n  \"clarity\": <0-10>,\n  \"specificity\": <0-10>,\n  \"completeness\": <0-10>,\n  \"structure\": <0-10>,\n  \"effectiveness\": <0-10>,\n  \"reasoning\": \"<brief explanation of strengths and weaknesses>\"\n}")
                                    }
                                ],
                                max_tokens: 300,
                                temperature: 0.3, // Low temp for consistent evaluation
                                response_format: { type: 'json_object' }
                            })];
                    case 1:
                        response = _e.sent();
                        try {
                            evaluation = JSON.parse(((_d = (_c = response.choices[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) || '{}');
                            weightedScore = 0;
                            for (_i = 0, _a = Object.entries(EVALUATION_CRITERIA); _i < _a.length; _i++) {
                                _b = _a[_i], criterion = _b[0], weight = _b[1].weight;
                                score = evaluation[criterion] || 0;
                                weightedScore += (score / 10) * weight;
                            }
                            // Store reasoning for potential use
                            this.lastEvaluation = {
                                scores: evaluation,
                                reasoning: evaluation.reasoning,
                                weightedScore: weightedScore
                            };
                            return [2 /*return*/, weightedScore];
                        }
                        catch (e) {
                            console.error('[Optimizer] Failed to parse evaluation:', e);
                            // Fallback to quick heuristic only if LLM fails
                            return [2 /*return*/, this.quickHeuristicFallback(prompt)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fallback heuristic ONLY used if LLM evaluation fails
     */
    PromptOptimizer.prototype.quickHeuristicFallback = function (prompt) {
        var score = 0.5;
        var length = prompt.length;
        if (length > 50 && length < 500)
            score += 0.1;
        if (prompt.includes('\n'))
            score += 0.05;
        if (prompt.match(/\d\./))
            score += 0.05;
        if (prompt.toLowerCase().includes('step by step'))
            score += 0.1;
        return Math.min(score, 1.0);
    };
    /**
     * Get the last evaluation details
     */
    PromptOptimizer.prototype.getLastEvaluation = function () {
        return this.lastEvaluation;
    };
    /**
     * Check if optimization has converged
     */
    PromptOptimizer.prototype.checkConvergence = function (scores) {
        if (scores.length < this.config.convergenceWindow)
            return false;
        var recent = scores.slice(-this.config.convergenceWindow);
        var maxRecent = Math.max.apply(Math, recent);
        var minRecent = Math.min.apply(Math, recent);
        return (maxRecent - minRecent) < this.config.convergenceThreshold;
    };
    /**
     * Get suggestions without full optimization
     */
    PromptOptimizer.prototype.getSuggestions = function (prompt) {
        var suggestions = [];
        for (var _i = 0, IMPROVEMENT_PATTERNS_2 = IMPROVEMENT_PATTERNS; _i < IMPROVEMENT_PATTERNS_2.length; _i++) {
            var pattern = IMPROVEMENT_PATTERNS_2[_i];
            if (pattern.check(prompt)) {
                suggestions.push({
                    type: pattern.name,
                    description: "Add ".concat(pattern.name.replace(/_/g, ' ')),
                    example: pattern.apply(prompt).slice(prompt.length).trim(),
                    expectedImprovement: pattern.expectedImprovement
                });
            }
        }
        return suggestions;
    };
    return PromptOptimizer;
}());
exports.PromptOptimizer = PromptOptimizer;
