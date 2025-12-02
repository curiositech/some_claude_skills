"use strict";
/**
 * Integration tests for the MCP Server
 *
 * These tests require:
 * - Docker running with Qdrant (port 6333) and Redis (port 6379)
 * - OPENAI_API_KEY environment variable set
 *
 * Run with: npm run test:integration
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
var js_client_rest_1 = require("@qdrant/js-client-rest");
var ioredis_1 = require("ioredis");
var openai_1 = require("openai");
var uuid_1 = require("uuid");
var embeddings_js_1 = require("../../src/embeddings.js");
var vectordb_js_1 = require("../../src/vectordb.js");
var optimizer_js_1 = require("../../src/optimizer.js");
// Test configuration
var QDRANT_URL = process.env.VECTOR_DB_URL || 'http://localhost:6333';
var REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
var OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Skip tests if no API key
var describeWithApiKey = OPENAI_API_KEY ? vitest_1.describe : vitest_1.describe.skip;
(0, vitest_1.describe)('Integration Tests - Infrastructure', function () {
    var qdrantClient;
    var redisClient;
    (0, vitest_1.beforeAll)(function () {
        qdrantClient = new js_client_rest_1.QdrantClient({ url: QDRANT_URL });
        redisClient = new ioredis_1.Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            connectTimeout: 5000
        });
    });
    (0, vitest_1.afterAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, redisClient.quit()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should connect to Qdrant', function () { return __awaiter(void 0, void 0, void 0, function () {
        var collections;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, qdrantClient.getCollections()];
                case 1:
                    collections = _a.sent();
                    (0, vitest_1.expect)(collections).toBeDefined();
                    (0, vitest_1.expect)(Array.isArray(collections.collections)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should connect to Redis', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pong;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, redisClient.ping()];
                case 1:
                    pong = _a.sent();
                    (0, vitest_1.expect)(pong).toBe('PONG');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should have prompt_embeddings collection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var collections, hasCollection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, qdrantClient.getCollections()];
                case 1:
                    collections = _a.sent();
                    hasCollection = collections.collections.some(function (c) { return c.name === 'prompt_embeddings'; });
                    (0, vitest_1.expect)(hasCollection).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should have correct vector dimensions in collection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var info, vectorConfig, size;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, qdrantClient.getCollection('prompt_embeddings')];
                case 1:
                    info = _a.sent();
                    (0, vitest_1.expect)(info.config.params.vectors).toBeDefined();
                    vectorConfig = info.config.params.vectors;
                    size = typeof vectorConfig === 'object' && 'size' in vectorConfig
                        ? vectorConfig.size
                        : embeddings_js_1.EMBEDDING_DIM;
                    (0, vitest_1.expect)(size).toBe(embeddings_js_1.EMBEDDING_DIM);
                    return [2 /*return*/];
            }
        });
    }); });
});
describeWithApiKey('Integration Tests - EmbeddingService (requires API key)', function () {
    var service;
    var redisClient;
    var openai;
    (0, vitest_1.beforeAll)(function () {
        openai = new openai_1.default({ apiKey: OPENAI_API_KEY });
        redisClient = new ioredis_1.Redis(REDIS_URL, { maxRetriesPerRequest: 3 });
        service = new embeddings_js_1.EmbeddingService(openai, redisClient);
    });
    (0, vitest_1.afterAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, redisClient.quit()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should generate embeddings from OpenAI', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, service.embed('Test prompt for embedding', false)];
                case 1:
                    result = _a.sent();
                    (0, vitest_1.expect)(result.embedding).toBeDefined();
                    (0, vitest_1.expect)(result.embedding.length).toBe(embeddings_js_1.EMBEDDING_DIM);
                    (0, vitest_1.expect)(result.tokens_used).toBeGreaterThan(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should cache embeddings in Redis', function () { return __awaiter(void 0, void 0, void 0, function () {
        var text, result1, result2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    text = "Unique test text ".concat(Date.now());
                    return [4 /*yield*/, service.embed(text, true)];
                case 1:
                    result1 = _a.sent();
                    (0, vitest_1.expect)(result1.tokens_used).toBeGreaterThan(0);
                    return [4 /*yield*/, service.embed(text, true)];
                case 2:
                    result2 = _a.sent();
                    (0, vitest_1.expect)(result2.tokens_used).toBe(0);
                    (0, vitest_1.expect)(result2.embedding).toEqual(result1.embedding);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should generate contextual embeddings', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, service.embedContextual('Review the code for bugs', 'code_review', 'optimization')];
                case 1:
                    result = _a.sent();
                    (0, vitest_1.expect)(result.embedding).toBeDefined();
                    (0, vitest_1.expect)(result.embedding.length).toBe(embeddings_js_1.EMBEDDING_DIM);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should batch embed multiple texts', function () { return __awaiter(void 0, void 0, void 0, function () {
        var texts, results, _i, results_1, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    texts = [
                        "Batch test 1 ".concat(Date.now()),
                        "Batch test 2 ".concat(Date.now()),
                        "Batch test 3 ".concat(Date.now())
                    ];
                    return [4 /*yield*/, service.embedBatch(texts)];
                case 1:
                    results = _a.sent();
                    (0, vitest_1.expect)(results).toHaveLength(3);
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        result = results_1[_i];
                        (0, vitest_1.expect)(result.embedding.length).toBe(embeddings_js_1.EMBEDDING_DIM);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
});
describeWithApiKey('Integration Tests - VectorDB (requires API key)', function () {
    var db;
    var embeddings;
    var openai;
    var testIds = [];
    (0, vitest_1.beforeAll)(function () {
        openai = new openai_1.default({ apiKey: OPENAI_API_KEY });
        embeddings = new embeddings_js_1.EmbeddingService(openai, null);
        db = new vectordb_js_1.VectorDB(QDRANT_URL);
    });
    (0, vitest_1.afterAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _i, testIds_1, id, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, testIds_1 = testIds;
                    _a.label = 1;
                case 1:
                    if (!(_i < testIds_1.length)) return [3 /*break*/, 6];
                    id = testIds_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.delete(id)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should upsert and retrieve a prompt', function () { return __awaiter(void 0, void 0, void 0, function () {
        var id, promptText, embedding, retrieved;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = (0, uuid_1.v4)();
                    testIds.push(id);
                    promptText = 'Write a function to sort an array of numbers';
                    return [4 /*yield*/, embeddings.embed(promptText)];
                case 1:
                    embedding = (_a.sent()).embedding;
                    return [4 /*yield*/, db.upsert(id, embedding, {
                            prompt_text: promptText,
                            contextualized_text: "Domain: code\n\n".concat(promptText),
                            domain: 'code',
                            task_type: 'generation',
                            metrics: {
                                success_rate: 0.85,
                                avg_latency_ms: 150,
                                token_efficiency: 0.8,
                                observation_count: 1,
                                last_updated: new Date().toISOString()
                            },
                            created_at: new Date().toISOString(),
                            tags: ['test', 'integration']
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.get(id)];
                case 3:
                    retrieved = _a.sent();
                    (0, vitest_1.expect)(retrieved).not.toBeNull();
                    (0, vitest_1.expect)(retrieved === null || retrieved === void 0 ? void 0 : retrieved.prompt_text).toBe(promptText);
                    (0, vitest_1.expect)(retrieved === null || retrieved === void 0 ? void 0 : retrieved.domain).toBe('code');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should search for similar prompts', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testPrompts, _i, testPrompts_1, prompt_1, id, embedding_1, query, embedding, results, _a, results_2, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    testPrompts = [
                        { text: 'Sort numbers in ascending order', domain: 'code', successRate: 0.9 },
                        { text: 'Order a list of integers', domain: 'code', successRate: 0.85 },
                        { text: 'Arrange data numerically', domain: 'code', successRate: 0.75 }
                    ];
                    _i = 0, testPrompts_1 = testPrompts;
                    _b.label = 1;
                case 1:
                    if (!(_i < testPrompts_1.length)) return [3 /*break*/, 5];
                    prompt_1 = testPrompts_1[_i];
                    id = (0, uuid_1.v4)();
                    testIds.push(id);
                    return [4 /*yield*/, embeddings.embed(prompt_1.text)];
                case 2:
                    embedding_1 = (_b.sent()).embedding;
                    return [4 /*yield*/, db.upsert(id, embedding_1, {
                            prompt_text: prompt_1.text,
                            contextualized_text: "Domain: ".concat(prompt_1.domain, "\n\n").concat(prompt_1.text),
                            domain: prompt_1.domain,
                            task_type: 'generation',
                            metrics: {
                                success_rate: prompt_1.successRate,
                                avg_latency_ms: 100,
                                token_efficiency: 0.8,
                                observation_count: 5,
                                last_updated: new Date().toISOString()
                            },
                            created_at: new Date().toISOString(),
                            tags: ['test']
                        })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: 
                // Wait for indexing
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 6:
                    // Wait for indexing
                    _b.sent();
                    query = 'Sort a list of numbers';
                    return [4 /*yield*/, embeddings.embed(query)];
                case 7:
                    embedding = (_b.sent()).embedding;
                    return [4 /*yield*/, db.search(embedding, { topK: 5, domain: 'code' })];
                case 8:
                    results = _b.sent();
                    (0, vitest_1.expect)(results.length).toBeGreaterThan(0);
                    // Results should have similarity scores
                    for (_a = 0, results_2 = results; _a < results_2.length; _a++) {
                        result = results_2[_a];
                        (0, vitest_1.expect)(result.score).toBeGreaterThan(0);
                        (0, vitest_1.expect)(result.score).toBeLessThanOrEqual(1);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should filter by minimum performance', function () { return __awaiter(void 0, void 0, void 0, function () {
        var embedding, highPerfResults, _i, highPerfResults_1, result, metrics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, embeddings.embed('Sort numbers')];
                case 1:
                    embedding = (_a.sent()).embedding;
                    return [4 /*yield*/, db.search(embedding, {
                            topK: 10,
                            minPerformance: 0.8
                        })];
                case 2:
                    highPerfResults = _a.sent();
                    // All results should have success_rate >= 0.8
                    for (_i = 0, highPerfResults_1 = highPerfResults; _i < highPerfResults_1.length; _i++) {
                        result = highPerfResults_1[_i];
                        metrics = result.payload.metrics;
                        (0, vitest_1.expect)(metrics.success_rate).toBeGreaterThanOrEqual(0.8);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should update metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
        var id, embedding, newMetrics, updated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = (0, uuid_1.v4)();
                    testIds.push(id);
                    return [4 /*yield*/, embeddings.embed('Test update prompt')];
                case 1:
                    embedding = (_a.sent()).embedding;
                    // Insert initial
                    return [4 /*yield*/, db.upsert(id, embedding, {
                            prompt_text: 'Test update prompt',
                            contextualized_text: '',
                            domain: 'general',
                            task_type: 'general',
                            metrics: {
                                success_rate: 0.5,
                                avg_latency_ms: 100,
                                token_efficiency: 0.6,
                                observation_count: 1,
                                last_updated: new Date().toISOString()
                            },
                            created_at: new Date().toISOString(),
                            tags: []
                        })];
                case 2:
                    // Insert initial
                    _a.sent();
                    newMetrics = {
                        success_rate: 0.9,
                        avg_latency_ms: 80,
                        token_efficiency: 0.85,
                        observation_count: 10,
                        last_updated: new Date().toISOString()
                    };
                    return [4 /*yield*/, db.updateMetrics(id, newMetrics)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, db.get(id)];
                case 4:
                    updated = _a.sent();
                    (0, vitest_1.expect)(updated === null || updated === void 0 ? void 0 : updated.metrics.success_rate).toBe(0.9);
                    (0, vitest_1.expect)(updated === null || updated === void 0 ? void 0 : updated.metrics.observation_count).toBe(10);
                    return [2 /*return*/];
            }
        });
    }); });
});
describeWithApiKey('Integration Tests - PromptOptimizer (requires API key)', function () {
    var optimizer;
    var openai;
    (0, vitest_1.beforeAll)(function () {
        openai = new openai_1.default({ apiKey: OPENAI_API_KEY });
        optimizer = new optimizer_js_1.PromptOptimizer(openai, {
            maxIterations: 3, // Limit iterations for faster tests
            targetScore: 0.85
        });
    });
    (0, vitest_1.it)('should score a prompt using LLM evaluation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var score, evaluation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, optimizer.scorePrompt('Summarize the document concisely.', 'general')];
                case 1:
                    score = _a.sent();
                    (0, vitest_1.expect)(score).toBeGreaterThan(0);
                    (0, vitest_1.expect)(score).toBeLessThanOrEqual(1);
                    evaluation = optimizer.getLastEvaluation();
                    (0, vitest_1.expect)(evaluation).not.toBeNull();
                    (0, vitest_1.expect)(evaluation === null || evaluation === void 0 ? void 0 : evaluation.reasoning).toBeDefined();
                    (0, vitest_1.expect)(evaluation === null || evaluation === void 0 ? void 0 : evaluation.scores).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should score different prompts differently', function () { return __awaiter(void 0, void 0, void 0, function () {
        var vagueScore, specificScore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, optimizer.scorePrompt('Do stuff', 'general')];
                case 1:
                    vagueScore = _a.sent();
                    return [4 /*yield*/, optimizer.scorePrompt("Analyze the provided sales data and generate a summary report that includes:\n1. Total revenue by quarter\n2. Top 5 performing products\n3. Customer acquisition trends\n4. Key insights and recommendations\n\nFormat the output as a structured markdown document with clear sections.", 'general')];
                case 2:
                    specificScore = _a.sent();
                    (0, vitest_1.expect)(specificScore).toBeGreaterThan(vagueScore);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should optimize a vague prompt', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, optimizer.optimize('Write code', [], 'code')];
                case 1:
                    result = _a.sent();
                    (0, vitest_1.expect)(result.original_prompt).toBe('Write code');
                    (0, vitest_1.expect)(result.optimized_prompt).not.toBe('Write code');
                    (0, vitest_1.expect)(result.optimized_prompt.length).toBeGreaterThan(result.original_prompt.length);
                    (0, vitest_1.expect)(result.improvements_made.length).toBeGreaterThan(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should learn from similar high-performing prompts', function () { return __awaiter(void 0, void 0, void 0, function () {
        var similarPrompts, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    similarPrompts = [
                        {
                            id: '1',
                            prompt_text: "Write a Python function that takes a list and returns it sorted.\nInclude type hints, docstring, and handle edge cases like empty lists.",
                            contextualized_text: '',
                            domain: 'code',
                            task_type: 'generation',
                            metrics: {
                                success_rate: 0.95,
                                avg_latency_ms: 100,
                                token_efficiency: 0.9,
                                observation_count: 50,
                                last_updated: ''
                            },
                            created_at: '',
                            tags: []
                        }
                    ];
                    return [4 /*yield*/, optimizer.optimize('Write sorting function', similarPrompts, 'code')];
                case 1:
                    result = _a.sent();
                    // Should have learned from the similar prompt
                    (0, vitest_1.expect)(result.similar_prompts_used).toBe(1);
                    (0, vitest_1.expect)(result.improvements_made.some(function (i) { return i.includes('RAG'); })).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('Integration Tests - End-to-End Flow', function () {
    var hasApiKey = !!OPENAI_API_KEY;
    vitest_1.it.skipIf(!hasApiKey)('should complete full optimization workflow', function () { return __awaiter(void 0, void 0, void 0, function () {
        var openai, embeddings, db, optimizer, originalPrompt, embedding, similarPrompts, promptRecords, result, newId, newEmbedding, stored;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    openai = new openai_1.default({ apiKey: OPENAI_API_KEY });
                    embeddings = new embeddings_js_1.EmbeddingService(openai, null);
                    db = new vectordb_js_1.VectorDB(QDRANT_URL);
                    optimizer = new optimizer_js_1.PromptOptimizer(openai, { maxIterations: 2 });
                    originalPrompt = 'Help me with data';
                    return [4 /*yield*/, embeddings.embedContextual(originalPrompt, 'general', 'optimization')];
                case 1:
                    embedding = (_a.sent()).embedding;
                    return [4 /*yield*/, db.search(embedding, { topK: 5, minPerformance: 0.7 })];
                case 2:
                    similarPrompts = _a.sent();
                    promptRecords = similarPrompts.map(function (r) { return ({
                        id: r.id,
                        prompt_text: r.payload.prompt_text,
                        contextualized_text: r.payload.contextualized_text || '',
                        domain: r.payload.domain || 'general',
                        task_type: r.payload.task_type || 'general',
                        metrics: r.payload.metrics,
                        created_at: r.payload.created_at || '',
                        tags: r.payload.tags || []
                    }); });
                    return [4 /*yield*/, optimizer.optimize(originalPrompt, promptRecords, 'general')];
                case 3:
                    result = _a.sent();
                    (0, vitest_1.expect)(result.optimized_prompt).not.toBe(originalPrompt);
                    (0, vitest_1.expect)(result.estimated_improvement).toBeGreaterThan(0);
                    newId = (0, uuid_1.v4)();
                    return [4 /*yield*/, embeddings.embed(result.optimized_prompt)];
                case 4:
                    newEmbedding = (_a.sent()).embedding;
                    return [4 /*yield*/, db.upsert(newId, newEmbedding, {
                            prompt_text: result.optimized_prompt,
                            contextualized_text: "Domain: general\n\n".concat(result.optimized_prompt),
                            domain: 'general',
                            task_type: 'general',
                            metrics: {
                                success_rate: 0.8 + result.estimated_improvement,
                                avg_latency_ms: 100,
                                token_efficiency: 0.8,
                                observation_count: 1,
                                last_updated: new Date().toISOString()
                            },
                            created_at: new Date().toISOString(),
                            tags: ['optimized', 'e2e-test']
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, db.get(newId)];
                case 6:
                    stored = _a.sent();
                    (0, vitest_1.expect)(stored).not.toBeNull();
                    (0, vitest_1.expect)(stored === null || stored === void 0 ? void 0 : stored.prompt_text).toBe(result.optimized_prompt);
                    // Cleanup
                    return [4 /*yield*/, db.delete(newId)];
                case 7:
                    // Cleanup
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
