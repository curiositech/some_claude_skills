// Strangler Fig Pattern
// Gradually replace legacy code without big-bang rewrites

// =============================================================================
// THE PROBLEM: Monolithic Legacy Code
// =============================================================================

// ❌ Monolithic order processor - 500+ lines of tangled logic
class LegacyOrderProcessor {
  processOrder(orderData: any): any {
    // Validation mixed with business logic
    if (!orderData.items) throw new Error('No items');
    if (!orderData.customer) throw new Error('No customer');

    // Pricing calculation intertwined
    let total = 0;
    for (const item of orderData.items) {
      // Complex pricing rules embedded here
      let price = item.basePrice;
      if (orderData.customer.type === 'wholesale') {
        price *= 0.8;
      }
      if (item.quantity > 10) {
        price *= 0.95;
      }
      total += price * item.quantity;
    }

    // Inventory check with database calls
    // Payment processing with external API calls
    // Shipping calculation with carrier integration
    // Email notification with template rendering
    // Audit logging
    // ... 400 more lines of tightly coupled code

    return { orderId: 'generated', total };
  }
}

// Problems:
// 1. Can't test individual components
// 2. Can't modify one thing without risk to everything
// 3. Can't understand what it does without reading all 500 lines
// 4. Can't rewrite all at once (too risky)

// =============================================================================
// STRANGLER FIG PATTERN: Step-by-Step Migration
// =============================================================================

// Step 1: Create a facade that delegates to legacy
// -------------------------------------------------

class OrderProcessorV1 {
  private legacy = new LegacyOrderProcessor();

  async processOrder(order: Order): Promise<OrderResult> {
    // Initially just delegate - establishes the new interface
    const legacyResult = this.legacy.processOrder(order);
    return this.adaptLegacyResult(legacyResult);
  }

  private adaptLegacyResult(legacy: any): OrderResult {
    return {
      orderId: legacy.orderId,
      total: legacy.total,
      status: 'completed',
    };
  }
}

// Step 2: Extract first component (validation)
// -------------------------------------------------

class OrderValidator {
  validate(order: Order): ValidationResult {
    const errors: string[] = [];

    if (!order.items?.length) {
      errors.push('Order must have items');
    }
    if (!order.customer) {
      errors.push('Order must have customer');
    }
    if (!order.customer?.email) {
      errors.push('Customer must have email');
    }

    // Can add new validations without touching legacy
    if (order.items?.some(item => item.quantity <= 0)) {
      errors.push('All items must have positive quantity');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

class OrderProcessorV2 {
  private legacy = new LegacyOrderProcessor();
  private validator = new OrderValidator(); // NEW!

  async processOrder(order: Order): Promise<OrderResult> {
    // Use NEW validation
    const validation = this.validator.validate(order);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // Still delegate rest to legacy
    const legacyResult = this.legacy.processOrder(order);
    return this.adaptLegacyResult(legacyResult);
  }

  private adaptLegacyResult(legacy: any): OrderResult {
    return {
      orderId: legacy.orderId,
      total: legacy.total,
      status: 'completed',
    };
  }
}

// Step 3: Extract pricing service
// -------------------------------------------------

interface PricingResult {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

class PricingService {
  calculate(order: Order): PricingResult {
    const subtotal = this.calculateSubtotal(order);
    const discount = this.calculateDiscount(order, subtotal);
    const tax = this.calculateTax(subtotal - discount);
    const shipping = this.calculateShipping(order);

    return {
      subtotal,
      tax,
      shipping,
      discount,
      total: subtotal - discount + tax + shipping,
    };
  }

  private calculateSubtotal(order: Order): number {
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  private calculateDiscount(order: Order, subtotal: number): number {
    // Wholesale discount
    if (order.customer.type === 'wholesale') {
      return subtotal * 0.2;
    }
    // Volume discount
    const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
    if (totalItems > 10) {
      return subtotal * 0.05;
    }
    return 0;
  }

  private calculateTax(taxableAmount: number): number {
    return taxableAmount * 0.08;
  }

  private calculateShipping(order: Order): number {
    const weight = order.items.reduce(
      (sum, i) => sum + (i.weight || 0) * i.quantity,
      0
    );
    if (weight === 0) return 0;
    if (weight < 5) return 5.99;
    if (weight < 20) return 12.99;
    return 24.99;
  }
}

class OrderProcessorV3 {
  private legacy = new LegacyOrderProcessor();
  private validator = new OrderValidator();
  private pricingService = new PricingService(); // NEW!

  async processOrder(order: Order): Promise<OrderResult> {
    const validation = this.validator.validate(order);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // Use NEW pricing
    const pricing = this.pricingService.calculate(order);

    // Delegate rest to legacy, but pass in our pricing
    const legacyResult = this.legacy.processOrderWithPricing(order, pricing);
    return this.adaptLegacyResult(legacyResult, pricing);
  }

  private adaptLegacyResult(legacy: any, pricing: PricingResult): OrderResult {
    return {
      orderId: legacy.orderId,
      total: pricing.total,
      status: 'completed',
    };
  }
}

// Step 4: Continue extracting until legacy is gone
// -------------------------------------------------

// Fully migrated - no more legacy!
class OrderProcessor {
  constructor(
    private validator: OrderValidator,
    private pricingService: PricingService,
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
    private shippingService: ShippingService,
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {}

  async processOrder(order: Order): Promise<OrderResult> {
    // Validate
    const validation = this.validator.validate(order);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // Calculate pricing
    const pricing = this.pricingService.calculate(order);

    // Reserve inventory
    const inventoryReservation = await this.inventoryService.reserve(order.items);

    try {
      // Process payment
      const payment = await this.paymentService.charge(
        order.customer,
        pricing.total
      );

      // Schedule shipping
      const shipping = await this.shippingService.schedule(order);

      // Create order record
      const orderResult = await this.createOrder(order, pricing, payment, shipping);

      // Send confirmation
      await this.notificationService.sendConfirmation(order.customer, orderResult);

      // Audit log
      await this.auditService.log('order_created', orderResult);

      return orderResult;
    } catch (error) {
      // Release inventory on failure
      await this.inventoryService.release(inventoryReservation);
      throw error;
    }
  }

  private async createOrder(
    order: Order,
    pricing: PricingResult,
    payment: PaymentResult,
    shipping: ShippingResult
  ): Promise<OrderResult> {
    return {
      orderId: generateOrderId(),
      total: pricing.total,
      status: 'confirmed',
      paymentId: payment.transactionId,
      trackingNumber: shipping.trackingNumber,
    };
  }
}

// =============================================================================
// BRANCH BY ABSTRACTION: Feature Flag Approach
// =============================================================================

// Use feature flags to safely switch between old and new
class OrderProcessorWithFeatureFlag {
  constructor(
    private legacy: LegacyOrderProcessor,
    private newProcessor: OrderProcessor,
    private featureFlags: FeatureFlags
  ) {}

  async processOrder(order: Order): Promise<OrderResult> {
    // Gradual rollout by customer segment
    const useNewProcessor = this.featureFlags.isEnabled(
      'new_order_processor',
      { customerId: order.customer.id }
    );

    if (useNewProcessor) {
      return this.newProcessor.processOrder(order);
    } else {
      const legacyResult = this.legacy.processOrder(order);
      return this.adaptResult(legacyResult);
    }
  }

  private adaptResult(legacy: any): OrderResult {
    return {
      orderId: legacy.orderId,
      total: legacy.total,
      status: 'completed',
    };
  }
}

// =============================================================================
// PARALLEL RUN: Verify New System
// =============================================================================

// Run both systems and compare results (shadow mode)
class OrderProcessorParallelRun {
  constructor(
    private legacy: LegacyOrderProcessor,
    private newProcessor: OrderProcessor,
    private comparisonLogger: ComparisonLogger
  ) {}

  async processOrder(order: Order): Promise<OrderResult> {
    // Always use legacy for real result
    const legacyResult = this.legacy.processOrder(order);

    // Run new processor in shadow mode (don't affect real state)
    try {
      const newResult = await this.newProcessor.processOrderDryRun(order);

      // Log comparison for analysis
      this.comparisonLogger.logComparison({
        orderId: legacyResult.orderId,
        legacyTotal: legacyResult.total,
        newTotal: newResult.total,
        match: Math.abs(legacyResult.total - newResult.total) < 0.01,
      });
    } catch (error) {
      this.comparisonLogger.logError({
        orderId: legacyResult.orderId,
        error: error.message,
      });
    }

    return this.adaptResult(legacyResult);
  }

  private adaptResult(legacy: any): OrderResult {
    return {
      orderId: legacy.orderId,
      total: legacy.total,
      status: 'completed',
    };
  }
}

// =============================================================================
// Type Definitions
// =============================================================================

interface Order {
  customer: Customer;
  items: OrderItem[];
}

interface Customer {
  id: string;
  email: string;
  type: 'retail' | 'wholesale';
}

interface OrderItem {
  productId: string;
  price: number;
  quantity: number;
  weight?: number;
}

interface OrderResult {
  orderId: string;
  total: number;
  status: string;
  paymentId?: string;
  trackingNumber?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface PaymentResult {
  transactionId: string;
}

interface ShippingResult {
  trackingNumber: string;
}

class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
  }
}

// Service interfaces
interface InventoryService {
  reserve(items: OrderItem[]): Promise<string>;
  release(reservationId: string): Promise<void>;
}

interface PaymentService {
  charge(customer: Customer, amount: number): Promise<PaymentResult>;
}

interface ShippingService {
  schedule(order: Order): Promise<ShippingResult>;
}

interface NotificationService {
  sendConfirmation(customer: Customer, order: OrderResult): Promise<void>;
}

interface AuditService {
  log(event: string, data: any): Promise<void>;
}

interface FeatureFlags {
  isEnabled(flag: string, context?: any): boolean;
}

interface ComparisonLogger {
  logComparison(data: any): void;
  logError(data: any): void;
}

declare function generateOrderId(): string;
