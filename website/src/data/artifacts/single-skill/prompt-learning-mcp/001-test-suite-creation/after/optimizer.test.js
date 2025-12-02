"use strict";
/**
 * Unit tests for PromptOptimizer
 * Tests pattern-based improvements, convergence detection, and suggestion generation
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var openai_1 = require("openai");
var optimizer_js_1 = require("../../src/optimizer.js");
// Mock OpenAI
vitest_1.vi.mock('openai', function () {
    var mockCreate = vitest_1.vi.fn();
    return {
        default: vitest_1.vi.fn().mockImplementation(function () { return ({
            chat: {
                completions: {
                    create: mockCreate
                }
            }
        }); }),
        __mockCreate: mockCreate
    };
});
(0, vitest_1.describe)('PromptOptimizer', function () {
    var optimizer;
    var mockOpenAI;
    var mockCreate;
    (0, vitest_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var mod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('openai'); })];
                case 1:
                    mod = _a.sent();
                    mockCreate = mod.__mockCreate;
                    mockCreate.mockReset();
                    mockOpenAI = new openai_1.default({ apiKey: 'test-key' });
                    optimizer = new optimizer_js_1.PromptOptimizer(mockOpenAI);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('applyPatterns', function () {
        (0, vitest_1.it)('should apply add_structure pattern to short prompts without structure', function () {
            var prompt = 'Summarize this document';
            var _a = optimizer.applyPatterns(prompt), improved = _a.improved, applied = _a.applied;
            (0, vitest_1.expect)(applied).toContain('add_structure');
            (0, vitest_1.expect)(improved).toContain('structured format');
        });
        (0, vitest_1.it)('should apply add_chain_of_thought to prompts without reasoning', function () {
            var prompt = 'Analyze the data';
            var _a = optimizer.applyPatterns(prompt), improved = _a.improved, applied = _a.applied;
            (0, vitest_1.expect)(applied).toContain('add_chain_of_thought');
            (0, vitest_1.expect)(improved.toLowerCase()).toContain('step by step');
        });
        (0, vitest_1.it)('should apply add_constraints to short prompts without requirements', function () {
            var prompt = 'Write code';
            var _a = optimizer.applyPatterns(prompt), improved = _a.improved, applied = _a.applied;
            (0, vitest_1.expect)(applied).toContain('add_constraints');
            (0, vitest_1.expect)(improved).toContain('Requirements');
        });
        (0, vitest_1.it)('should apply add_output_format to prompts without format spec', function () {
            // Use a prompt that:
            // - Has '1.' to skip add_structure (which would add "format" text)
            // - Is longer than 150 chars to skip add_constraints
            // - Has 'step by step' to skip add_chain_of_thought
            // - Does NOT have 'format' or 'respond with'
            var prompt = '1. First, analyze the data step by step. 2. Then identify patterns in the results. 3. Finally, draw conclusions from your analysis and provide actionable recommendations.';
            var _a = optimizer.applyPatterns(prompt), improved = _a.improved, applied = _a.applied;
            (0, vitest_1.expect)(applied).toContain('add_output_format');
            (0, vitest_1.expect)(improved.toLowerCase()).toContain('format');
        });
        (0, vitest_1.it)('should NOT apply patterns that are already present', function () {
            var prompt = "Step 1. First, analyze the data step by step.\nRequirements:\n- Be specific\nFormat your response as JSON.";
            var applied = optimizer.applyPatterns(prompt).applied;
            // Should not apply most patterns since they're already present
            (0, vitest_1.expect)(applied).not.toContain('add_structure');
            (0, vitest_1.expect)(applied).not.toContain('add_chain_of_thought');
            (0, vitest_1.expect)(applied).not.toContain('add_output_format');
        });
        (0, vitest_1.it)('should apply multiple applicable patterns', function () {
            var prompt = 'Do the thing';
            var applied = optimizer.applyPatterns(prompt).applied;
            // Should apply multiple patterns to this vague prompt
            (0, vitest_1.expect)(applied.length).toBeGreaterThan(1);
        });
    });
    (0, vitest_1.describe)('checkConvergence', function () {
        (0, vitest_1.it)('should return false when not enough scores', function () {
            var scores = [0.5, 0.6];
            (0, vitest_1.expect)(optimizer.checkConvergence(scores)).toBe(false);
        });
        (0, vitest_1.it)('should return true when scores plateau', function () {
            var scores = [0.5, 0.6, 0.75, 0.76, 0.76, 0.77];
            (0, vitest_1.expect)(optimizer.checkConvergence(scores)).toBe(true);
        });
        (0, vitest_1.it)('should return false when scores are still improving', function () {
            var scores = [0.5, 0.6, 0.7, 0.8, 0.9];
            (0, vitest_1.expect)(optimizer.checkConvergence(scores)).toBe(false);
        });
        (0, vitest_1.it)('should detect convergence in the last window', function () {
            // Even if early scores were improving, check only the last window
            var scores = [0.5, 0.6, 0.7, 0.85, 0.85, 0.86];
            (0, vitest_1.expect)(optimizer.checkConvergence(scores)).toBe(true);
        });
    });
    (0, vitest_1.describe)('getSuggestions', function () {
        (0, vitest_1.it)('should return suggestions for a vague prompt', function () {
            var prompt = 'Help me';
            var suggestions = optimizer.getSuggestions(prompt);
            (0, vitest_1.expect)(suggestions.length).toBeGreaterThan(0);
            // Each suggestion should have required fields
            for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
                var suggestion = suggestions_1[_i];
                (0, vitest_1.expect)(suggestion).toHaveProperty('type');
                (0, vitest_1.expect)(suggestion).toHaveProperty('description');
                (0, vitest_1.expect)(suggestion).toHaveProperty('example');
                (0, vitest_1.expect)(suggestion).toHaveProperty('expectedImprovement');
                (0, vitest_1.expect)(suggestion.expectedImprovement).toBeGreaterThan(0);
            }
        });
        (0, vitest_1.it)('should return fewer suggestions for well-structured prompts', function () {
            var vaguePrompt = 'Do stuff';
            var structuredPrompt = "Step 1. First, analyze the data step by step.\nRequirements:\n- Be specific and precise\nFormat: JSON response with headers.";
            var vagueSuggestions = optimizer.getSuggestions(vaguePrompt);
            var structuredSuggestions = optimizer.getSuggestions(structuredPrompt);
            (0, vitest_1.expect)(vagueSuggestions.length).toBeGreaterThan(structuredSuggestions.length);
        });
        (0, vitest_1.it)('should provide example text for each suggestion', function () {
            var prompt = 'Analyze this';
            var suggestions = optimizer.getSuggestions(prompt);
            for (var _i = 0, suggestions_2 = suggestions; _i < suggestions_2.length; _i++) {
                var suggestion = suggestions_2[_i];
                (0, vitest_1.expect)(suggestion.example.length).toBeGreaterThan(0);
            }
        });
    });
    (0, vitest_1.describe)('scorePrompt (with mock)', function () {
        (0, vitest_1.it)('should calculate weighted score from LLM evaluation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var score;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock a successful evaluation response
                        mockCreate.mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: JSON.stringify({
                                            clarity: 8,
                                            specificity: 7,
                                            completeness: 6,
                                            structure: 8,
                                            effectiveness: 7,
                                            reasoning: 'Good prompt with clear structure'
                                        })
                                    }
                                }]
                        });
                        return [4 /*yield*/, optimizer.scorePrompt('Test prompt', 'general')];
                    case 1:
                        score = _a.sent();
                        // Verify the API was called
                        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledOnce();
                        // Verify the score is calculated correctly
                        // (8*0.25 + 7*0.25 + 6*0.20 + 8*0.15 + 7*0.15) / 10 = 0.72
                        (0, vitest_1.expect)(score).toBeCloseTo(0.72, 2);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should store evaluation for later retrieval', function () { return __awaiter(void 0, void 0, void 0, function () {
            var evaluation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCreate.mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: JSON.stringify({
                                            clarity: 9,
                                            specificity: 8,
                                            completeness: 7,
                                            structure: 8,
                                            effectiveness: 8,
                                            reasoning: 'Excellent clarity'
                                        })
                                    }
                                }]
                        });
                        return [4 /*yield*/, optimizer.scorePrompt('Test prompt', 'general')];
                    case 1:
                        _a.sent();
                        evaluation = optimizer.getLastEvaluation();
                        (0, vitest_1.expect)(evaluation).not.toBeNull();
                        (0, vitest_1.expect)(evaluation === null || evaluation === void 0 ? void 0 : evaluation.reasoning).toBe('Excellent clarity');
                        (0, vitest_1.expect)(evaluation === null || evaluation === void 0 ? void 0 : evaluation.scores.clarity).toBe(9);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should fall back to heuristics if LLM fails', function () { return __awaiter(void 0, void 0, void 0, function () {
            var score;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCreate.mockRejectedValueOnce(new Error('API Error'));
                        return [4 /*yield*/, optimizer.scorePrompt('Test step by step prompt', 'general')];
                    case 1:
                        score = _a.sent();
                        (0, vitest_1.expect)(score).toBeGreaterThan(0);
                        (0, vitest_1.expect)(score).toBeLessThanOrEqual(1);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle malformed JSON gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var score;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCreate.mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: 'This is not JSON'
                                    }
                                }]
                        });
                        return [4 /*yield*/, optimizer.scorePrompt('Test prompt', 'general')];
                    case 1:
                        score = _a.sent();
                        // Should fall back to heuristic
                        (0, vitest_1.expect)(score).toBeGreaterThan(0);
                        (0, vitest_1.expect)(score).toBeLessThanOrEqual(1);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('generateCandidate (with mock)', function () {
        (0, vitest_1.it)('should generate improved prompt candidate', function () { return __awaiter(void 0, void 0, void 0, function () {
            var candidate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCreate.mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: 'An improved, more specific prompt with clear requirements.'
                                    }
                                }]
                        });
                        return [4 /*yield*/, optimizer.generateCandidate('Original prompt', 'general')];
                    case 1:
                        candidate = _a.sent();
                        (0, vitest_1.expect)(candidate).toBe('An improved, more specific prompt with clear requirements.');
                        (0, vitest_1.expect)(mockCreate).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should return original prompt if generation fails', function () { return __awaiter(void 0, void 0, void 0, function () {
            var candidate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCreate.mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: null
                                    }
                                }]
                        });
                        return [4 /*yield*/, optimizer.generateCandidate('Original prompt', 'general')];
                    case 1:
                        candidate = _a.sent();
                        (0, vitest_1.expect)(candidate).toBe('Original prompt');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('learnFromSimilar (with mock)', function () {
        (0, vitest_1.it)('should synthesize improvements from similar prompts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var similarPrompts, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        similarPrompts = [
                            {
                                id: '1',
                                prompt_text: 'A high-performing prompt with structure',
                                contextualized_text: '',
                                domain: 'general',
                                task_type: 'general',
                                metrics: { success_rate: 0.9, avg_latency_ms: 100, token_efficiency: 0.8, observation_count: 10, last_updated: '' },
                                created_at: '',
                                tags: []
                            },
                            {
                                id: '2',
                                prompt_text: 'Another excellent prompt',
                                contextualized_text: '',
                                domain: 'general',
                                task_type: 'general',
                                metrics: { success_rate: 0.85, avg_latency_ms: 100, token_efficiency: 0.8, observation_count: 10, last_updated: '' },
                                created_at: '',
                                tags: []
                            }
                        ];
                        mockCreate.mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: 'Improved prompt based on learning from similar high performers'
                                    }
                                }]
                        });
                        return [4 /*yield*/, optimizer.learnFromSimilar('Original prompt', similarPrompts)];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.improved).toBe('Improved prompt based on learning from similar high performers');
                        (0, vitest_1.expect)(result.insights).toContain('Learned from');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('optimize (full flow with mock)', function () {
        (0, vitest_1.it)('should run full optimization pipeline', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock evaluation calls (original, after patterns, after iteration 1)
                        mockCreate
                            .mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: JSON.stringify({
                                            clarity: 5, specificity: 4, completeness: 4, structure: 3, effectiveness: 4,
                                            reasoning: 'Vague prompt'
                                        })
                                    }
                                }]
                        })
                            .mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: JSON.stringify({
                                            clarity: 7, specificity: 6, completeness: 6, structure: 6, effectiveness: 6,
                                            reasoning: 'Better with patterns'
                                        })
                                    }
                                }]
                        })
                            .mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: 'An optimized prompt candidate'
                                    }
                                }]
                        })
                            .mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: JSON.stringify({
                                            clarity: 8, specificity: 8, completeness: 7, structure: 8, effectiveness: 8,
                                            reasoning: 'Excellent prompt'
                                        })
                                    }
                                }]
                        })
                            // Add more mocks for convergence (same scores)
                            .mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: 'Another candidate'
                                    }
                                }]
                        })
                            .mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: JSON.stringify({
                                            clarity: 8, specificity: 8, completeness: 7, structure: 8, effectiveness: 8,
                                            reasoning: 'Same quality'
                                        })
                                    }
                                }]
                        })
                            .mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: 'Third candidate'
                                    }
                                }]
                        })
                            .mockResolvedValueOnce({
                            choices: [{
                                    message: {
                                        content: JSON.stringify({
                                            clarity: 8, specificity: 8, completeness: 7, structure: 8, effectiveness: 8,
                                            reasoning: 'Still same'
                                        })
                                    }
                                }]
                        });
                        return [4 /*yield*/, optimizer.optimize('Do stuff', [], 'general')];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.original_prompt).toBe('Do stuff');
                        (0, vitest_1.expect)(result.optimized_prompt).not.toBe('Do stuff');
                        (0, vitest_1.expect)(result.improvements_made.length).toBeGreaterThan(0);
                        (0, vitest_1.expect)(result.estimated_improvement).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
