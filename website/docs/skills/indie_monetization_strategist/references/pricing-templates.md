---
title: Pricing Page Templates
sidebar_label: Pricing Page Templates
sidebar_position: 2
---
# Pricing Page Templates

Copy-paste templates for common indie pricing scenarios.

## SaaS Pricing Table (3 Tiers)

```html
<div class="pricing-container">
  <div class="pricing-card">
    <h3>Free</h3>
    <p class="price">$0<span>/month</span></p>
    <ul>
      <li>✓ Core features</li>
      <li>✓ 1,000 API calls/month</li>
      <li>✓ Community support</li>
      <li class="muted">✗ Custom branding</li>
      <li class="muted">✗ Priority support</li>
    </ul>
    <button class="btn-secondary">Get Started</button>
  </div>

  <div class="pricing-card featured">
    <span class="badge">Most Popular</span>
    <h3>Pro</h3>
    <p class="price">$29<span>/month</span></p>
    <p class="annual-price">$19/month billed annually</p>
    <ul>
      <li>✓ Everything in Free</li>
      <li>✓ 50,000 API calls/month</li>
      <li>✓ Custom branding</li>
      <li>✓ Priority email support</li>
      <li>✓ Advanced analytics</li>
    </ul>
    <button class="btn-primary">Start Free Trial</button>
  </div>

  <div class="pricing-card">
    <h3>Team</h3>
    <p class="price">$99<span>/month</span></p>
    <ul>
      <li>✓ Everything in Pro</li>
      <li>✓ Unlimited API calls</li>
      <li>✓ 5 team members</li>
      <li>✓ SSO/SAML</li>
      <li>✓ Dedicated support</li>
    </ul>
    <button class="btn-secondary">Contact Sales</button>
  </div>
</div>
```

### CSS for Pricing Table

```css
.pricing-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.pricing-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  position: relative;
}

.pricing-card.featured {
  border: 2px solid #007bff;
  transform: scale(1.05);
}

.badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.price {
  font-size: 3rem;
  font-weight: bold;
  margin: 1rem 0;
}

.price span {
  font-size: 1rem;
  color: #666;
}

.annual-price {
  color: #28a745;
  font-size: 0.9rem;
}

.pricing-card ul {
  list-style: none;
  padding: 0;
  text-align: left;
}

.pricing-card li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.pricing-card li.muted {
  color: #999;
}
```

## Pay-What-You-Want Template

```html
<div class="pwyw-container">
  <h2>Support This Project</h2>
  <p>This tool is free, but your support keeps it alive.</p>

  <div class="amount-options">
    <button class="amount-btn" data-amount="5">$5</button>
    <button class="amount-btn selected" data-amount="15">$15</button>
    <button class="amount-btn" data-amount="50">$50</button>
    <input type="number" class="custom-amount" placeholder="Custom" min="1">
  </div>

  <div class="impact-message">
    <span class="impact-text">$15 funds 3 hours of development</span>
  </div>

  <button class="btn-primary btn-large">Support with Stripe</button>

  <div class="social-proof">
    <p>💖 Supported by 234 developers</p>
    <div class="supporter-avatars">
      <!-- Avatar images -->
    </div>
  </div>
</div>
```

## Sponsorship Tiers (README)

```markdown
## Sponsors

### 💎 Diamond ($2,500/month)
- Logo on homepage hero section
- Dedicated integration example
- Co-branded content
- Direct Slack access
- **[Your company here]**

### 🥇 Gold ($1,000/month)
- Logo in documentation sidebar
- Logo in all videos
- Monthly newsletter feature
- **[Your company here]**

### 🥈 Silver ($500/month)
- Logo on website footer
- Monthly newsletter mention
- **[Your company here]**

### 🥉 Bronze ($100/month)
- Logo in README sponsors section
- Thank you tweet

<a href="https://yoursite.com/sponsor">
  Become a sponsor →
</a>
```

## One-Time Purchase Template

```html
<div class="product-card">
  <span class="sale-badge">Launch Price - Save 40%</span>

  <h2>The Complete Package</h2>
  <p class="tagline">Everything you need to master [skill]</p>

  <div class="price-container">
    <span class="original-price">$149</span>
    <span class="current-price">$89</span>
    <span class="price-note">one-time payment</span>
  </div>

  <ul class="features">
    <li>✓ 50+ video lessons (12 hours)</li>
    <li>✓ Downloadable source code</li>
    <li>✓ Lifetime updates</li>
    <li>✓ Private Discord community</li>
    <li>✓ Certificate of completion</li>
  </ul>

  <button class="btn-primary btn-large">Get Instant Access</button>

  <p class="guarantee">
    <img src="/icons/shield.svg" alt="">
    30-day money-back guarantee. No questions asked.
  </p>
</div>
```

## Pricing Comparison Table

```markdown
| Feature | Free | Pro ($29/mo) | Team ($99/mo) |
|---------|------|--------------|---------------|
| Projects | 3 | Unlimited | Unlimited |
| API calls | 1,000/mo | 50,000/mo | Unlimited |
| Collaborators | - | 1 | 10 |
| Custom domains | - | ✓ | ✓ |
| Remove branding | - | ✓ | ✓ |
| Priority support | - | Email | Dedicated |
| SSO/SAML | - | - | ✓ |
| SLA | - | - | 99.9% |
```

## Feature Comparison Cards

```html
<div class="comparison-grid">
  <div class="comparison-card free">
    <h3>Perfect for trying out</h3>
    <p>Get started with the basics</p>
    <div class="included">
      <h4>Includes:</h4>
      <ul>
        <li>Core editor</li>
        <li&gt;3 projects</li>
        <li>Community support</li>
      </ul>
    </div>
  </div>

  <div class="comparison-card pro">
    <h3>Perfect for professionals</h3>
    <p>Everything you need to ship</p>
    <div class="included">
      <h4>Everything in Free, plus:</h4>
      <ul>
        <li>Unlimited projects</li>
        <li>Custom domains</li>
        <li>Remove branding</li>
        <li>Priority support</li>
        <li>Advanced analytics</li>
      </ul>
    </div>
  </div>
</div>
```

## FAQ Section Template

```markdown
## Pricing FAQ

### Can I switch plans later?
Yes! Upgrade or downgrade anytime. When upgrading, you pay the prorated difference. When downgrading, the credit applies to future bills.

### Do you offer refunds?
Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.

### What happens when I hit my limits?
We'll notify you at 80% and 100% usage. You can upgrade anytime, or we'll pause your service until the next billing cycle.

### Do you offer discounts?
- **Annual billing**: Save 35% vs monthly
- **Students**: 50% off (verify with .edu email)
- **Open source**: Free Pro tier for qualifying projects
- **Startups**: Special pricing for early-stage companies

### Can I pay annually?
Yes! Annual billing saves 35% and ensures uninterrupted service.
```

## Upgrade CTA Patterns

```html
<!-- Inline upgrade prompt -->
<div class="upgrade-prompt">
  <span class="icon">⚡</span>
  <div class="content">
    <strong>Unlock this feature</strong>
    <p>Upgrade to Pro for unlimited exports</p>
  </div>
  <button class="btn-primary btn-small">Upgrade</button>
</div>

<!-- Limit reached modal -->
<div class="limit-modal">
  <h3>You've reached your limit</h3>
  <p>You've used 3 of 3 projects this month.</p>

  <div class="options">
    <div class="option current">
      <strong>Free</strong>
      <p&gt;3 projects/month</p>
    </div>
    <div class="option recommended">
      <span class="badge">Recommended</span>
      <strong>Pro - $29/month</strong>
      <p>Unlimited projects</p>
      <button class="btn-primary">Upgrade Now</button>
    </div>
  </div>

  <button class="btn-link">Remind me later</button>
</div>
```
