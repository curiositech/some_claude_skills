"use strict";
/**
 * Unit tests for VectorDB
 * Tests search, upsert, retrieval, and filtering operations
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
var vectordb_js_1 = require("../../src/vectordb.js");
var embeddings_js_1 = require("../../src/embeddings.js");
// Mock Qdrant client
vitest_1.vi.mock('@qdrant/js-client-rest', function () {
    var mockClient = {
        getCollections: vitest_1.vi.fn(),
        createCollection: vitest_1.vi.fn(),
        createPayloadIndex: vitest_1.vi.fn(),
        search: vitest_1.vi.fn(),
        upsert: vitest_1.vi.fn(),
        retrieve: vitest_1.vi.fn(),
        setPayload: vitest_1.vi.fn(),
        getCollection: vitest_1.vi.fn(),
        delete: vitest_1.vi.fn(),
        scroll: vitest_1.vi.fn()
    };
    return {
        QdrantClient: vitest_1.vi.fn().mockImplementation(function () { return mockClient; }),
        __mockClient: mockClient
    };
});
// Create a mock embedding
var createMockEmbedding = function (seed) {
    if (seed === void 0) { seed = 0; }
    var embedding = new Array(embeddings_js_1.EMBEDDING_DIM);
    for (var i = 0; i < embeddings_js_1.EMBEDDING_DIM; i++) {
        embedding[i] = Math.sin(i + seed) * 0.1;
    }
    return embedding;
};
(0, vitest_1.describe)('VectorDB', function () {
    var db;
    var mockClient;
    (0, vitest_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var mod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('@qdrant/js-client-rest'); })];
                case 1:
                    mod = _a.sent();
                    mockClient = mod.__mockClient;
                    // Reset all mocks
                    Object.values(mockClient).forEach(function (mock) { var _a; return (_a = mock.mockReset) === null || _a === void 0 ? void 0 : _a.call(mock); });
                    // Default: collection exists
                    mockClient.getCollections.mockResolvedValue({
                        collections: [{ name: 'prompt_embeddings' }]
                    });
                    db = new vectordb_js_1.VectorDB('http://localhost:6333');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('initialize', function () {
        (0, vitest_1.it)('should skip creation if collection exists', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.getCollections.mockResolvedValue({
                            collections: [{ name: 'prompt_embeddings' }]
                        });
                        return [4 /*yield*/, db.initialize()];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockClient.getCollections).toHaveBeenCalled();
                        (0, vitest_1.expect)(mockClient.createCollection).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should create collection if not exists', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.getCollections.mockResolvedValue({
                            collections: []
                        });
                        return [4 /*yield*/, db.initialize()];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockClient.createCollection).toHaveBeenCalledWith('prompt_embeddings', {
                            vectors: {
                                size: embeddings_js_1.EMBEDDING_DIM,
                                distance: 'Cosine'
                            }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should create indexes on new collection', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.getCollections.mockResolvedValue({
                            collections: []
                        });
                        return [4 /*yield*/, db.initialize()];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockClient.createPayloadIndex).toHaveBeenCalledTimes(3);
                        (0, vitest_1.expect)(mockClient.createPayloadIndex).toHaveBeenCalledWith('prompt_embeddings', {
                            field_name: 'metrics.success_rate',
                            field_schema: 'float'
                        });
                        (0, vitest_1.expect)(mockClient.createPayloadIndex).toHaveBeenCalledWith('prompt_embeddings', {
                            field_name: 'domain',
                            field_schema: 'keyword'
                        });
                        (0, vitest_1.expect)(mockClient.createPayloadIndex).toHaveBeenCalledWith('prompt_embeddings', {
                            field_name: 'created_at',
                            field_schema: 'datetime'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should only initialize once', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db.initialize()];
                    case 2:
                        _a.sent();
                        (0, vitest_1.expect)(mockClient.getCollections).toHaveBeenCalledOnce();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('search', function () {
        (0, vitest_1.it)('should search with embedding', function () { return __awaiter(void 0, void 0, void 0, function () {
            var embedding, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        embedding = createMockEmbedding();
                        mockClient.search.mockResolvedValue([
                            { id: '1', score: 0.95, payload: { prompt_text: 'Test prompt' } }
                        ]);
                        return [4 /*yield*/, db.search(embedding)];
                    case 1:
                        results = _a.sent();
                        (0, vitest_1.expect)(mockClient.search).toHaveBeenCalledWith('prompt_embeddings', {
                            vector: embedding,
                            limit: 10,
                            filter: undefined,
                            with_payload: true
                        });
                        (0, vitest_1.expect)(results).toHaveLength(1);
                        (0, vitest_1.expect)(results[0].id).toBe('1');
                        (0, vitest_1.expect)(results[0].score).toBe(0.95);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should filter by minimum performance', function () { return __awaiter(void 0, void 0, void 0, function () {
            var embedding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        embedding = createMockEmbedding();
                        mockClient.search.mockResolvedValue([]);
                        return [4 /*yield*/, db.search(embedding, { minPerformance: 0.7 })];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockClient.search).toHaveBeenCalledWith('prompt_embeddings', {
                            vector: embedding,
                            limit: 10,
                            filter: {
                                must: [{
                                        key: 'metrics.success_rate',
                                        range: { gte: 0.7 }
                                    }]
                            },
                            with_payload: true
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should filter by domain', function () { return __awaiter(void 0, void 0, void 0, function () {
            var embedding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        embedding = createMockEmbedding();
                        mockClient.search.mockResolvedValue([]);
                        return [4 /*yield*/, db.search(embedding, { domain: 'code_review' })];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockClient.search).toHaveBeenCalledWith('prompt_embeddings', {
                            vector: embedding,
                            limit: 10,
                            filter: {
                                must: [{
                                        key: 'domain',
                                        match: { value: 'code_review' }
                                    }]
                            },
                            with_payload: true
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should combine multiple filters', function () { return __awaiter(void 0, void 0, void 0, function () {
            var embedding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        embedding = createMockEmbedding();
                        mockClient.search.mockResolvedValue([]);
                        return [4 /*yield*/, db.search(embedding, { minPerformance: 0.8, domain: 'general', topK: 5 })];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockClient.search).toHaveBeenCalledWith('prompt_embeddings', {
                            vector: embedding,
                            limit: 5,
                            filter: {
                                must: [
                                    { key: 'metrics.success_rate', range: { gte: 0.8 } },
                                    { key: 'domain', match: { value: 'general' } }
                                ]
                            },
                            with_payload: true
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should return empty array on error', function () { return __awaiter(void 0, void 0, void 0, function () {
            var embedding, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        embedding = createMockEmbedding();
                        mockClient.search.mockRejectedValue(new Error('Search failed'));
                        return [4 /*yield*/, db.search(embedding)];
                    case 1:
                        results = _a.sent();
                        (0, vitest_1.expect)(results).toEqual([]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('upsert', function () {
        (0, vitest_1.it)('should upsert prompt record', function () { return __awaiter(void 0, void 0, void 0, function () {
            var embedding, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        embedding = createMockEmbedding();
                        record = {
                            prompt_text: 'Test prompt',
                            contextualized_text: 'Context',
                            domain: 'general',
                            task_type: 'general',
                            metrics: {
                                success_rate: 0.9,
                                avg_latency_ms: 100,
                                token_efficiency: 0.8,
                                observation_count: 5,
                                last_updated: new Date().toISOString()
                            },
                            created_at: new Date().toISOString(),
                            tags: ['test']
                        };
                        return [4 /*yield*/, db.upsert('test-id', embedding, record)];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockClient.upsert).toHaveBeenCalledWith('prompt_embeddings', {
                            wait: true,
                            points: [{
                                    id: 'test-id',
                                    vector: embedding,
                                    payload: record
                                }]
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should throw on upsert error', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.upsert.mockRejectedValue(new Error('Upsert failed'));
                        return [4 /*yield*/, (0, vitest_1.expect)(db.upsert('test-id', createMockEmbedding(), {
                                prompt_text: 'Test',
                                contextualized_text: '',
                                domain: 'general',
                                task_type: 'general',
                                metrics: { success_rate: 0, avg_latency_ms: 0, token_efficiency: 0, observation_count: 0, last_updated: '' },
                                created_at: '',
                                tags: []
                            })).rejects.toThrow('Upsert failed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('get', function () {
        (0, vitest_1.it)('should retrieve prompt by id', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.retrieve.mockResolvedValue([{
                                id: 'test-id',
                                payload: {
                                    prompt_text: 'Test prompt',
                                    domain: 'general',
                                    metrics: { success_rate: 0.9 }
                                }
                            }]);
                        return [4 /*yield*/, db.get('test-id')];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(mockClient.retrieve).toHaveBeenCalledWith('prompt_embeddings', {
                            ids: ['test-id'],
                            with_payload: true,
                            with_vector: false
                        });
                        (0, vitest_1.expect)(result).not.toBeNull();
                        (0, vitest_1.expect)(result === null || result === void 0 ? void 0 : result.id).toBe('test-id');
                        (0, vitest_1.expect)(result === null || result === void 0 ? void 0 : result.prompt_text).toBe('Test prompt');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should return null for non-existent id', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.retrieve.mockResolvedValue([]);
                        return [4 /*yield*/, db.get('non-existent')];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should return null on error', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.retrieve.mockRejectedValue(new Error('Retrieve failed'));
                        return [4 /*yield*/, db.get('test-id')];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('updateMetrics', function () {
        (0, vitest_1.it)('should update metrics for prompt', function () { return __awaiter(void 0, void 0, void 0, function () {
            var metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metrics = {
                            success_rate: 0.95,
                            avg_latency_ms: 80,
                            token_efficiency: 0.85,
                            observation_count: 10,
                            last_updated: new Date().toISOString()
                        };
                        return [4 /*yield*/, db.updateMetrics('test-id', metrics)];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockClient.setPayload).toHaveBeenCalledWith('prompt_embeddings', {
                            wait: true,
                            points: ['test-id'],
                            payload: { metrics: metrics }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should throw on update error', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.setPayload.mockRejectedValue(new Error('Update failed'));
                        return [4 /*yield*/, (0, vitest_1.expect)(db.updateMetrics('test-id', {
                                success_rate: 0.9,
                                avg_latency_ms: 100,
                                token_efficiency: 0.8,
                                observation_count: 1,
                                last_updated: ''
                            })).rejects.toThrow('Update failed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('getStats', function () {
        (0, vitest_1.it)('should return collection statistics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.getCollection.mockResolvedValue({
                            points_count: 100
                        });
                        return [4 /*yield*/, db.getStats()];
                    case 1:
                        stats = _a.sent();
                        (0, vitest_1.expect)(stats.total).toBe(100);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should return zeros on error', function () { return __awaiter(void 0, void 0, void 0, function () {
            var stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.getCollection.mockRejectedValue(new Error('Stats failed'));
                        return [4 /*yield*/, db.getStats()];
                    case 1:
                        stats = _a.sent();
                        (0, vitest_1.expect)(stats.total).toBe(0);
                        (0, vitest_1.expect)(stats.byDomain).toEqual({});
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('delete', function () {
        (0, vitest_1.it)('should delete prompt by id', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.delete('test-id')];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockClient.delete).toHaveBeenCalledWith('prompt_embeddings', {
                            wait: true,
                            points: ['test-id']
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should throw on delete error', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.delete.mockRejectedValue(new Error('Delete failed'));
                        return [4 /*yield*/, (0, vitest_1.expect)(db.delete('test-id')).rejects.toThrow('Delete failed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('scroll', function () {
        (0, vitest_1.it)('should scroll through prompts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.scroll.mockResolvedValue({
                            points: [
                                { id: '1', payload: { prompt_text: 'Prompt 1', domain: 'general' } },
                                { id: '2', payload: { prompt_text: 'Prompt 2', domain: 'code' } }
                            ],
                            next_page_offset: null
                        });
                        return [4 /*yield*/, db.scroll(10)];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(mockClient.scroll).toHaveBeenCalledWith('prompt_embeddings', {
                            limit: 10,
                            offset: undefined,
                            with_payload: true,
                            with_vector: false
                        });
                        (0, vitest_1.expect)(result.records).toHaveLength(2);
                        (0, vitest_1.expect)(result.nextOffset).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle pagination', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.scroll.mockResolvedValue({
                            points: [
                                { id: '3', payload: { prompt_text: 'Prompt 3' } }
                            ],
                            next_page_offset: { id: '4' }
                        });
                        return [4 /*yield*/, db.scroll(1, '2')];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(mockClient.scroll).toHaveBeenCalledWith('prompt_embeddings', {
                            limit: 1,
                            offset: { id: '2' },
                            with_payload: true,
                            with_vector: false
                        });
                        (0, vitest_1.expect)(result.nextOffset).toBe('3');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should return empty on error', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockClient.scroll.mockRejectedValue(new Error('Scroll failed'));
                        return [4 /*yield*/, db.scroll()];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.records).toEqual([]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
