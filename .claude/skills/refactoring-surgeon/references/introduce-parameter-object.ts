// Introduce Parameter Object
// Replace long parameter lists with structured objects

// =============================================================================
// BEFORE: Long parameter list
// =============================================================================

// ❌ Long parameter list - hard to read, easy to make mistakes
function searchProductsBefore(
  query: string,
  category: string,
  minPrice: number,
  maxPrice: number,
  inStock: boolean,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  page: number,
  pageSize: number
): Product[] {
  // Implementation...
  return [];
}

// Calling code is hard to read and error-prone
const productsBefore = searchProductsBefore(
  'laptop',      // query
  'electronics', // category
  500,           // minPrice? maxPrice? Who knows!
  2000,          // Is this min or max?
  true,          // What is this boolean?
  'price',       // sortBy
  'asc',         // sortOrder
  1,             // page
  20             // pageSize
);

// Problems:
// 1. Easy to swap min/max by accident
// 2. Boolean without context
// 3. Can't skip optional parameters
// 4. Hard to add new parameters
// 5. No IDE autocomplete help

// =============================================================================
// AFTER: Parameter objects with clear intent
// =============================================================================

// ✅ Separate "what to find" from "how to return it"
interface ProductSearchCriteria {
  query: string;
  category?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  inStockOnly?: boolean;
  brand?: string;
  rating?: {
    min?: number;
  };
}

interface ProductSearchOptions {
  sortBy?: 'price' | 'name' | 'rating' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  pagination?: {
    page: number;
    pageSize: number;
  };
}

interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ✅ Clean function signature
function searchProducts(
  criteria: ProductSearchCriteria,
  options: ProductSearchOptions = {}
): ProductSearchResult {
  // Destructure with defaults
  const {
    sortBy = 'relevance',
    sortOrder = 'desc',
    pagination = { page: 1, pageSize: 20 }
  } = options;

  // Implementation uses clear, named properties
  let results = findProducts(criteria.query);

  if (criteria.category) {
    results = results.filter(p => p.category === criteria.category);
  }

  if (criteria.priceRange) {
    const { min = 0, max = Infinity } = criteria.priceRange;
    results = results.filter(p => p.price >= min && p.price <= max);
  }

  if (criteria.inStockOnly) {
    results = results.filter(p => p.inStock);
  }

  // Sort and paginate
  results = sortProducts(results, sortBy, sortOrder);
  const paged = paginateResults(results, pagination);

  return paged;
}

// ✅ Calling code is self-documenting
const products = searchProducts(
  {
    query: 'laptop',
    category: 'electronics',
    priceRange: { min: 500, max: 2000 },
    inStockOnly: true,
  },
  {
    sortBy: 'price',
    sortOrder: 'asc',
    pagination: { page: 1, pageSize: 20 },
  }
);

// ✅ Easy to use partial criteria
const simpleSearch = searchProducts({ query: 'keyboard' });

const categoryBrowse = searchProducts(
  { query: '', category: 'monitors' },
  { sortBy: 'rating' }
);

// =============================================================================
// Builder Pattern for Complex Objects
// =============================================================================

// For even more complex scenarios, use a builder
class ProductSearchBuilder {
  private criteria: ProductSearchCriteria = { query: '' };
  private options: ProductSearchOptions = {};

  query(query: string): this {
    this.criteria.query = query;
    return this;
  }

  category(category: string): this {
    this.criteria.category = category;
    return this;
  }

  priceRange(min?: number, max?: number): this {
    this.criteria.priceRange = { min, max };
    return this;
  }

  inStockOnly(): this {
    this.criteria.inStockOnly = true;
    return this;
  }

  sortBy(field: ProductSearchOptions['sortBy'], order: 'asc' | 'desc' = 'desc'): this {
    this.options.sortBy = field;
    this.options.sortOrder = order;
    return this;
  }

  page(page: number, pageSize: number = 20): this {
    this.options.pagination = { page, pageSize };
    return this;
  }

  execute(): ProductSearchResult {
    return searchProducts(this.criteria, this.options);
  }
}

// ✅ Fluent interface for complex searches
const builderSearch = new ProductSearchBuilder()
  .query('laptop')
  .category('electronics')
  .priceRange(500, 2000)
  .inStockOnly()
  .sortBy('price', 'asc')
  .page(1, 20)
  .execute();

// =============================================================================
// Validation with Parameter Objects
// =============================================================================

// Parameter objects make validation cleaner too
function validateSearchCriteria(criteria: ProductSearchCriteria): void {
  if (!criteria.query && !criteria.category) {
    throw new Error('Must provide query or category');
  }

  if (criteria.priceRange) {
    const { min = 0, max = Infinity } = criteria.priceRange;
    if (min < 0) throw new Error('Min price cannot be negative');
    if (max < min) throw new Error('Max price must be >= min price');
  }

  if (criteria.rating?.min !== undefined) {
    if (criteria.rating.min < 0 || criteria.rating.min > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
  }
}

// =============================================================================
// When to Use Parameter Objects
// =============================================================================

/*
✅ USE WHEN:
- 3+ parameters (some say 2+)
- Parameters are logically related
- Same parameter groups appear in multiple functions
- Optional parameters create awkward signatures
- You want to add parameters without breaking callers

❌ DON'T USE WHEN:
- Only 1-2 simple parameters
- Parameters are truly independent
- Would create one-off objects with no reuse
- Function is private/internal with few callers

BONUS BENEFITS:
1. Easier to test - create test fixtures
2. Easier to document - describe the object shape
3. Easier to validate - centralized validation
4. Easier to evolve - add properties without breaking
5. IDE autocomplete - shows available options
*/

// =============================================================================
// Type Definitions
// =============================================================================

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  rating: number;
  brand: string;
}

// Stub functions
declare function findProducts(query: string): Product[];
declare function sortProducts(
  products: Product[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): Product[];
declare function paginateResults(
  products: Product[],
  pagination: { page: number; pageSize: number }
): ProductSearchResult;
