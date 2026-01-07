"use strict";
/**
 * Unit tests for EmbeddingService
 * Tests caching, contextual embeddings, batch processing, and similarity calculation
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
var embeddings_js_1 = require("../../src/embeddings.js");
// Create a mock embedding of correct dimension
var createMockEmbedding = function (seed) {
    if (seed === void 0) { seed = 0; }
    var embedding = new Array(embeddings_js_1.EMBEDDING_DIM);
    for (var i = 0; i < embeddings_js_1.EMBEDDING_DIM; i++) {
        embedding[i] = Math.sin(i + seed) * 0.1;
    }
    return embedding;
};
// Mock OpenAI
vitest_1.vi.mock('openai', function () {
    var mockCreate = vitest_1.vi.fn();
    return {
        default: vitest_1.vi.fn().mockImplementation(function () { return ({
            embeddings: {
                create: mockCreate
            }
        }); }),
        __mockCreate: mockCreate
    };
});
(0, vitest_1.describe)('EmbeddingService', function () {
    var service;
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
                    service = new embeddings_js_1.EmbeddingService(mockOpenAI, null);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('embed', function () {
        (0, vitest_1.it)('should generate embedding for text', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockEmbedding, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockEmbedding = createMockEmbedding();
                        mockCreate.mockResolvedValueOnce({
                            data: [{ embedding: mockEmbedding }],
                            usage: { total_tokens: 10 }
                        });
                        return [4 /*yield*/, service.embed('Test text')];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledOnce();
                        (0, vitest_1.expect)(result.embedding).toEqual(mockEmbedding);
                        (0, vitest_1.expect)(result.tokens_used).toBe(10);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should return cached embedding on second call', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockEmbedding, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockEmbedding = createMockEmbedding();
                        mockCreate.mockResolvedValueOnce({
                            data: [{ embedding: mockEmbedding }],
                            usage: { total_tokens: 10 }
                        });
                        // First call - should hit API
                        return [4 /*yield*/, service.embed('Test text')];
                    case 1:
                        // First call - should hit API
                        _a.sent();
                        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledOnce();
                        return [4 /*yield*/, service.embed('Test text')];
                    case 2:
                        result = _a.sent();
                        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledOnce(); // Still only one API call
                        (0, vitest_1.expect)(result.embedding).toEqual(mockEmbedding);
                        (0, vitest_1.expect)(result.tokens_used).toBe(0); // Cached, no tokens used
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should bypass cache when useCache is false', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockEmbedding1, mockEmbedding2, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockEmbedding1 = createMockEmbedding(1);
                        mockEmbedding2 = createMockEmbedding(2);
                        mockCreate
                            .mockResolvedValueOnce({
                            data: [{ embedding: mockEmbedding1 }],
                            usage: { total_tokens: 10 }
                        })
                            .mockResolvedValueOnce({
                            data: [{ embedding: mockEmbedding2 }],
                            usage: { total_tokens: 10 }
                        });
                        return [4 /*yield*/, service.embed('Test text', true)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, service.embed('Test text', false)];
                    case 2:
                        result = _a.sent();
                        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledTimes(2);
                        (0, vitest_1.expect)(result.tokens_used).toBe(10); // Fresh call
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should use correct model', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCreate.mockResolvedValueOnce({
                            data: [{ embedding: createMockEmbedding() }],
                            usage: { total_tokens: 10 }
                        });
                        return [4 /*yield*/, service.embed('Test text')];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith({
                            model: 'text-embedding-3-small',
                            input: 'Test text'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('embedContextual', function () {
        (0, vitest_1.it)('should prepend domain and task context', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCreate.mockResolvedValueOnce({
                            data: [{ embedding: createMockEmbedding() }],
                            usage: { total_tokens: 15 }
                        });
                        return [4 /*yield*/, service.embedContextual('Test prompt', 'code_review', 'optimization')];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith({
                            model: 'text-embedding-3-small',
                            input: 'Domain: code_review\nTask: optimization\n\nTest prompt'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should return correct embedding result', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockEmbedding, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockEmbedding = createMockEmbedding();
                        mockCreate.mockResolvedValueOnce({
                            data: [{ embedding: mockEmbedding }],
                            usage: { total_tokens: 15 }
                        });
                        return [4 /*yield*/, service.embedContextual('Test prompt', 'general', 'storage')];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.embedding).toEqual(mockEmbedding);
                        (0, vitest_1.expect)(result.tokens_used).toBe(15);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('embedBatch', function () {
        (0, vitest_1.it)('should batch embed multiple texts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockEmbeddings, texts, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockEmbeddings = [createMockEmbedding(1), createMockEmbedding(2), createMockEmbedding(3)];
                        mockCreate.mockResolvedValueOnce({
                            data: mockEmbeddings.map(function (emb) { return ({ embedding: emb }); }),
                            usage: { total_tokens: 30 }
                        });
                        texts = ['Text 1', 'Text 2', 'Text 3'];
                        return [4 /*yield*/, service.embedBatch(texts)];
                    case 1:
                        results = _a.sent();
                        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledOnce();
                        (0, vitest_1.expect)(results).toHaveLength(3);
                        (0, vitest_1.expect)(results[0].embedding).toEqual(mockEmbeddings[0]);
                        (0, vitest_1.expect)(results[1].embedding).toEqual(mockEmbeddings[1]);
                        (0, vitest_1.expect)(results[2].embedding).toEqual(mockEmbeddings[2]);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should use cached embeddings in batch', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockEmbedding1, mockEmbedding2, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockEmbedding1 = createMockEmbedding(1);
                        mockEmbedding2 = createMockEmbedding(2);
                        // First, cache one embedding
                        mockCreate.mockResolvedValueOnce({
                            data: [{ embedding: mockEmbedding1 }],
                            usage: { total_tokens: 10 }
                        });
                        return [4 /*yield*/, service.embed('Text 1')];
                    case 1:
                        _a.sent();
                        // Now batch embed including the cached one
                        mockCreate.mockResolvedValueOnce({
                            data: [{ embedding: mockEmbedding2 }],
                            usage: { total_tokens: 10 }
                        });
                        return [4 /*yield*/, service.embedBatch(['Text 1', 'Text 2'])];
                    case 2:
                        results = _a.sent();
                        (0, vitest_1.expect)(mockCreate).toHaveBeenCalledTimes(2);
                        // Second call should only have 'Text 2'
                        (0, vitest_1.expect)(mockCreate).toHaveBeenLastCalledWith({
                            model: 'text-embedding-3-small',
                            input: ['Text 2']
                        });
                        (0, vitest_1.expect)(results[0].embedding).toEqual(mockEmbedding1);
                        (0, vitest_1.expect)(results[0].tokens_used).toBe(0); // Cached
                        (0, vitest_1.expect)(results[1].embedding).toEqual(mockEmbedding2);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle empty batch', function () { return __awaiter(void 0, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.embedBatch([])];
                    case 1:
                        results = _a.sent();
                        (0, vitest_1.expect)(results).toHaveLength(0);
                        (0, vitest_1.expect)(mockCreate).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle all cached batch', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockEmbedding, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockEmbedding = createMockEmbedding();
                        mockCreate.mockResolvedValueOnce({
                            data: [{ embedding: mockEmbedding }],
                            usage: { total_tokens: 10 }
                        });
                        // Cache first
                        return [4 /*yield*/, service.embed('Same text')];
                    case 1:
                        // Cache first
                        _a.sent();
                        // Reset mock to verify no new calls
                        mockCreate.mockClear();
                        return [4 /*yield*/, service.embedBatch(['Same text', 'Same text'])];
                    case 2:
                        results = _a.sent();
                        (0, vitest_1.expect)(mockCreate).not.toHaveBeenCalled();
                        (0, vitest_1.expect)(results[0].tokens_used).toBe(0);
                        (0, vitest_1.expect)(results[1].tokens_used).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('cosineSimilarity', function () {
        (0, vitest_1.it)('should return 1 for identical vectors', function () {
            var vec = [0.1, 0.2, 0.3, 0.4, 0.5];
            var similarity = service.cosineSimilarity(vec, vec);
            (0, vitest_1.expect)(similarity).toBeCloseTo(1, 10);
        });
        (0, vitest_1.it)('should return -1 for opposite vectors', function () {
            var vec1 = [1, 0, 0];
            var vec2 = [-1, 0, 0];
            var similarity = service.cosineSimilarity(vec1, vec2);
            (0, vitest_1.expect)(similarity).toBeCloseTo(-1, 10);
        });
        (0, vitest_1.it)('should return 0 for orthogonal vectors', function () {
            var vec1 = [1, 0, 0];
            var vec2 = [0, 1, 0];
            var similarity = service.cosineSimilarity(vec1, vec2);
            (0, vitest_1.expect)(similarity).toBeCloseTo(0, 10);
        });
        (0, vitest_1.it)('should return value between -1 and 1', function () {
            var vec1 = [0.5, 0.3, 0.2, 0.8];
            var vec2 = [0.1, 0.9, 0.4, 0.2];
            var similarity = service.cosineSimilarity(vec1, vec2);
            (0, vitest_1.expect)(similarity).toBeGreaterThanOrEqual(-1);
            (0, vitest_1.expect)(similarity).toBeLessThanOrEqual(1);
        });
        (0, vitest_1.it)('should throw on dimension mismatch', function () {
            var vec1 = [0.1, 0.2, 0.3];
            var vec2 = [0.1, 0.2];
            (0, vitest_1.expect)(function () { return service.cosineSimilarity(vec1, vec2); }).toThrow('Embedding dimensions must match');
        });
        (0, vitest_1.it)('should calculate correct similarity for known values', function () {
            // Known example: cos_sim([1,2,3], [4,5,6]) ≈ 0.9746
            var vec1 = [1, 2, 3];
            var vec2 = [4, 5, 6];
            var similarity = service.cosineSimilarity(vec1, vec2);
            (0, vitest_1.expect)(similarity).toBeCloseTo(0.9746, 3);
        });
    });
    (0, vitest_1.describe)('EMBEDDING_DIM', function () {
        (0, vitest_1.it)('should export correct dimension for text-embedding-3-small', function () {
            (0, vitest_1.expect)(embeddings_js_1.EMBEDDING_DIM).toBe(1536);
        });
    });
});
