# Complete Stripe Integration Guide

Step-by-step guide for adding payments to indie projects.

## Quick Start Checklist

- [ ] Create Stripe account (stripe.com)
- [ ] Get API keys (Dashboard → Developers → API keys)
- [ ] Create products and prices (Dashboard → Products)
- [ ] Implement checkout flow
- [ ] Set up webhooks for fulfillment
- [ ] Test with test mode keys
- [ ] Switch to live keys when ready

## 1. Environment Setup

### Install Dependencies

```bash
# Node.js
npm install stripe @stripe/stripe-js

# Python
pip install stripe

# Ruby
gem install stripe
```

### Environment Variables

```bash
# .env.local (never commit this!)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

## 2. One-Time Payment (Checkout Sessions)

### Create Checkout Session (Next.js API Route)

```typescript
// pages/api/checkout.ts
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { priceId, email } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      metadata: {
        // Add custom data here for webhook processing
        userId: req.body.userId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
```

### Frontend Checkout Button

```typescript
// components/CheckoutButton.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function CheckoutButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Loading...' : 'Buy Now'}
    </button>
  );
}
```

## 3. Subscription Payments

### Create Subscription Checkout

```typescript
// pages/api/subscribe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req, res) {
  const { priceId, email, customerId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId, // Existing customer
      customer_email: customerId ? undefined : email, // Or new customer
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      subscription_data: {
        trial_period_days: 14, // Optional free trial
        metadata: {
          userId: req.body.userId,
        },
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Customer Portal (Manage Subscriptions)

```typescript
// pages/api/portal.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req, res) {
  const { customerId } = req.body;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## 4. Webhook Handler

### Set Up Webhooks

```typescript
// pages/api/webhooks/stripe.ts
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const config = {
  api: {
    bodyParser: false, // Required for webhook signature verification
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCreated(subscription);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCanceled(subscription);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentSucceeded(invoice);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}

// Handler functions
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;

  // Grant access to purchased product
  await db.users.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      hasPurchased: true,
      purchasedAt: new Date(),
    },
  });

  // Send confirmation email
  await sendEmail({
    to: session.customer_email!,
    template: 'purchase-confirmation',
    data: { session },
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;

  await db.subscriptions.create({
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await db.subscriptions.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      stripePriceId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  await db.subscriptions.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
    },
  });

  // Send cancellation email
  const customer = await stripe.customers.retrieve(
    subscription.customer as string
  );
  if (customer.email) {
    await sendEmail({
      to: customer.email,
      template: 'subscription-canceled',
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );

  // Send payment failed email
  await sendEmail({
    to: invoice.customer_email!,
    template: 'payment-failed',
    data: {
      amountDue: invoice.amount_due / 100,
      updatePaymentUrl: `${process.env.NEXT_PUBLIC_URL}/update-payment`,
    },
  });
}
```

## 5. Testing

### Test Mode

Always use test keys during development:
- `sk_test_...` for secret key
- `pk_test_...` for publishable key

### Test Card Numbers

```
# Successful payments
4242424242424242 - Visa (success)
5555555555554444 - Mastercard (success)

# Declined payments
4000000000000002 - Card declined
4000000000009995 - Insufficient funds

# 3D Secure
4000002500003155 - Requires authentication

# Use any future expiry date
# Use any 3-digit CVC
```

### Test Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook secret (whsec_xxx) to .env.local
```

## 6. Production Checklist

### Before Going Live

- [ ] Switch to live API keys
- [ ] Set up production webhook endpoint
- [ ] Test complete purchase flow
- [ ] Verify webhook handling for all event types
- [ ] Set up error alerting (Sentry, etc.)
- [ ] Configure Stripe receipts and invoices
- [ ] Add refund handling logic
- [ ] Set up tax collection if needed (Stripe Tax)

### Security

- [ ] Never expose secret key to client
- [ ] Verify webhook signatures
- [ ] Use environment variables for all keys
- [ ] Enable 3D Secure for fraud prevention
- [ ] Set up Radar rules for fraud detection

### Legal

- [ ] Display clear pricing (including taxes)
- [ ] Add terms of service
- [ ] Add privacy policy
- [ ] Add refund policy
- [ ] Display cancellation terms for subscriptions

## Common Patterns

### Check Subscription Status

```typescript
async function checkAccess(userId: string): Promise<boolean> {
  const user = await db.users.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user?.subscription) return false;

  return (
    user.subscription.status === 'active' ||
    user.subscription.status === 'trialing'
  );
}
```

### Usage-Based Billing

```typescript
// Record usage
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: apiCallCount,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment',
  }
);
```

### Proration on Plan Changes

```typescript
// Upgrade subscription
await stripe.subscriptions.update(subscriptionId, {
  items: [
    {
      id: existingItemId,
      price: newPriceId,
    },
  ],
  proration_behavior: 'create_prorations',
});
```
