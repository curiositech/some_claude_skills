// Extract Method Refactoring Example
// Transform long methods into focused, single-responsibility functions

// =============================================================================
// BEFORE: Long method with multiple responsibilities
// =============================================================================

// ❌ Long method with multiple responsibilities
function processOrderBefore(order: Order): OrderResult {
  // Validate order
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
  if (!order.customer) {
    throw new Error('Order must have customer');
  }
  if (!order.customer.email) {
    throw new Error('Customer must have email');
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of order.items) {
    subtotal += item.price * item.quantity;
  }
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  // Apply discounts
  let discount = 0;
  if (order.customer.loyaltyTier === 'gold') {
    discount = total * 0.1;
  } else if (order.customer.loyaltyTier === 'silver') {
    discount = total * 0.05;
  }
  const finalTotal = total - discount;

  // Create order record
  const orderRecord = {
    id: generateId(),
    items: order.items,
    customer: order.customer,
    subtotal,
    tax,
    shipping,
    discount,
    total: finalTotal,
    status: 'pending',
    createdAt: new Date(),
  };

  // Send confirmation email
  const emailContent = `
    Dear ${order.customer.name},

    Thank you for your order #${orderRecord.id}.

    Items: ${order.items.length}
    Subtotal: $${subtotal.toFixed(2)}
    Tax: $${tax.toFixed(2)}
    Shipping: $${shipping.toFixed(2)}
    Discount: -$${discount.toFixed(2)}
    Total: $${finalTotal.toFixed(2)}

    Best regards
  `;
  sendEmail(order.customer.email, 'Order Confirmation', emailContent);

  return orderRecord;
}

// =============================================================================
// AFTER: Clean, single-responsibility functions
// =============================================================================

// ✅ Main orchestration function - reads like a story
function processOrder(order: Order): OrderResult {
  validateOrder(order);

  const pricing = calculatePricing(order);
  const discount = calculateLoyaltyDiscount(order.customer, pricing.total);
  const finalTotal = pricing.total - discount;

  const orderRecord = createOrderRecord(order, pricing, discount, finalTotal);

  sendOrderConfirmation(order.customer, orderRecord, pricing, discount);

  return orderRecord;
}

// ✅ Focused validation with custom error type
function validateOrder(order: Order): void {
  if (!order.items?.length) {
    throw new OrderValidationError('Order must have items');
  }
  if (!order.customer) {
    throw new OrderValidationError('Order must have customer');
  }
  if (!order.customer.email) {
    throw new OrderValidationError('Customer must have email');
  }
}

// ✅ Clear interface for pricing data
interface OrderPricing {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// ✅ Pricing calculation with extracted sub-functions
function calculatePricing(order: Order): OrderPricing {
  const subtotal = calculateSubtotal(order.items);
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);

  return {
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
  };
}

// ✅ Pure function - easy to test
function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ✅ Constants replace magic numbers
function calculateTax(subtotal: number): number {
  const TAX_RATE = 0.08;
  return subtotal * TAX_RATE;
}

// ✅ Business rules are clear
function calculateShipping(subtotal: number): number {
  const FREE_SHIPPING_THRESHOLD = 100;
  const STANDARD_SHIPPING = 10;
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

// ✅ Lookup table replaces conditional chain
const LOYALTY_DISCOUNTS: Record<LoyaltyTier, number> = {
  gold: 0.10,
  silver: 0.05,
  bronze: 0,
  none: 0,
};

function calculateLoyaltyDiscount(customer: Customer, total: number): number {
  const discountRate = LOYALTY_DISCOUNTS[customer.loyaltyTier] ?? 0;
  return total * discountRate;
}

// ✅ Factory function with clear parameters
function createOrderRecord(
  order: Order,
  pricing: OrderPricing,
  discount: number,
  finalTotal: number
): OrderRecord {
  return {
    id: generateId(),
    items: order.items,
    customer: order.customer,
    ...pricing,
    discount,
    total: finalTotal,
    status: 'pending',
    createdAt: new Date(),
  };
}

// ✅ Email building extracted for testability
function sendOrderConfirmation(
  customer: Customer,
  orderRecord: OrderRecord,
  pricing: OrderPricing,
  discount: number
): void {
  const emailContent = buildOrderConfirmationEmail(
    customer,
    orderRecord,
    pricing,
    discount
  );
  sendEmail(customer.email, 'Order Confirmation', emailContent);
}

// =============================================================================
// Key Benefits
// =============================================================================
// 1. Each function has ONE responsibility
// 2. Functions are small enough to understand at a glance
// 3. Business rules (tax rate, shipping threshold) are named constants
// 4. Easy to test each function in isolation
// 5. Main function reads like documentation
// 6. Changes to one concern don't affect others

// =============================================================================
// Type Definitions (for completeness)
// =============================================================================

interface Order {
  items: OrderItem[];
  customer: Customer;
}

interface OrderItem {
  price: number;
  quantity: number;
}

interface Customer {
  name: string;
  email: string;
  loyaltyTier: LoyaltyTier;
}

type LoyaltyTier = 'gold' | 'silver' | 'bronze' | 'none';

interface OrderRecord {
  id: string;
  items: OrderItem[];
  customer: Customer;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: string;
  createdAt: Date;
}

type OrderResult = OrderRecord;

class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

// Stubs for external dependencies
declare function generateId(): string;
declare function sendEmail(to: string, subject: string, body: string): void;
declare function buildOrderConfirmationEmail(
  customer: Customer,
  order: OrderRecord,
  pricing: OrderPricing,
  discount: number
): string;
