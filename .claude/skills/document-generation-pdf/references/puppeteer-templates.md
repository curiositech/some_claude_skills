# Puppeteer PDF Templates

Complete guide to generating PDFs from HTML using Puppeteer with templates, page breaks, and print styling.

## When to Use Puppeteer

✅ **Use Puppeteer for**:
- Invoices with complex layouts
- Reports with charts/graphs
- Certificates with custom designs
- Documents requiring HTML/CSS flexibility

❌ **Don't use Puppeteer for**:
- Simple form filling (use pdf-lib)
- Government forms (use pdf-lib)
- Batch processing 1000+ documents (too slow)

---

## Installation

```bash
npm install puppeteer
```

**Latest version**: 21.6.1 (Jan 2024)

**Bundle size**: ~300MB (includes Chromium)

---

## Basic Usage

```typescript
import puppeteer from 'puppeteer';

async function generatePDF(htmlContent: string, outputPath: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Load HTML
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0'  // Wait for resources to load
  });

  // Generate PDF
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '1in',
      right: '1in',
      bottom: '1in',
      left: '1in'
    }
  });

  await browser.close();
}
```

---

## Page Formats

```typescript
// Standard formats
await page.pdf({
  format: 'Letter',  // 8.5" x 11" (US)
  // or: 'A4', 'A3', 'Legal', 'Tabloid'
});

// Custom size
await page.pdf({
  width: '8.5in',
  height: '11in'
});

// Landscape
await page.pdf({
  format: 'Letter',
  landscape: true
});
```

**Common formats**:
| Format | Size (inches) | Size (mm) |
|--------|---------------|-----------|
| Letter | 8.5 × 11 | 216 × 279 |
| A4 | 8.27 × 11.69 | 210 × 297 |
| Legal | 8.5 × 14 | 216 × 356 |
| A3 | 11.69 × 16.54 | 297 × 420 |

---

## Print CSS

### Critical @media print Rule

```html
<style>
  @media print {
    /* Print-specific styles */
    .no-print {
      display: none !important;
    }

    body {
      font-size: 12pt;
      color: black;
    }

    /* Force page breaks */
    .page-break {
      page-break-after: always;
    }

    /* Avoid breaking inside elements */
    .avoid-break {
      page-break-inside: avoid;
    }

    /* Keep headings with content */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
      page-break-inside: avoid;
    }

    /* Keep tables together */
    table, figure {
      page-break-inside: avoid;
    }

    /* Avoid breaking after first line of paragraph */
    p {
      orphans: 3;
      widows: 3;
    }
  }
</style>
```

---

## Page Break Control

### Force Page Break

```html
<style>
  @media print {
    .page-break {
      page-break-after: always;
    }
  }
</style>

<section>
  <h1>Section 1</h1>
  <p>Content...</p>
</section>

<div class="page-break"></div>

<section>
  <h1>Section 2</h1>
  <p>Content...</p>
</section>
```

### Avoid Page Break

```html
<style>
  @media print {
    .avoid-break {
      page-break-inside: avoid;
    }
  }
</style>

<section class="avoid-break">
  <h2>Terms and Conditions</h2>
  <ol>
    <li>This entire section stays together</li>
    <li>No page breaks in the middle</li>
  </ol>
</section>
```

### Page Break Properties

```css
@media print {
  /* Before element */
  .new-page-before {
    page-break-before: always;
  }

  /* After element */
  .new-page-after {
    page-break-after: always;
  }

  /* Inside element */
  .no-break-inside {
    page-break-inside: avoid;
  }

  /* Control orphans/widows */
  p {
    orphans: 3;  /* Min lines at bottom of page */
    widows: 3;   /* Min lines at top of page */
  }
}
```

---

## Invoice Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #333;
    }

    .invoice {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }

    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1in;
      border-bottom: 2px solid #000;
      padding-bottom: 0.25in;
    }

    .company-info h1 {
      font-size: 24pt;
      margin-bottom: 0.1in;
    }

    .invoice-info {
      text-align: right;
    }

    .invoice-number {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 0.1in;
    }

    .billing-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5in;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0.5in;
    }

    .items-table th {
      background: #f0f0f0;
      padding: 0.1in;
      text-align: left;
      border-bottom: 2px solid #000;
    }

    .items-table td {
      padding: 0.1in;
      border-bottom: 1px solid #ddd;
    }

    .items-table .amount {
      text-align: right;
    }

    .total-section {
      margin-left: auto;
      width: 3in;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.05in 0;
    }

    .total-row.grand-total {
      font-size: 14pt;
      font-weight: bold;
      border-top: 2px solid #000;
      padding-top: 0.1in;
      margin-top: 0.1in;
    }

    .footer {
      margin-top: 1in;
      padding-top: 0.25in;
      border-top: 1px solid #ddd;
      font-size: 10pt;
      color: #666;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      .items-table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="company-info">
        <h1>{{company_name}}</h1>
        <p>{{company_address}}</p>
        <p>{{company_phone}}</p>
        <p>{{company_email}}</p>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">Invoice #{{invoice_number}}</div>
        <p>Date: {{invoice_date}}</p>
        <p>Due: {{due_date}}</p>
      </div>
    </div>

    <div class="billing-info">
      <div class="bill-to">
        <strong>Bill To:</strong><br>
        {{customer_name}}<br>
        {{customer_address}}<br>
        {{customer_phone}}
      </div>
      <div class="ship-to">
        <strong>Ship To:</strong><br>
        {{shipping_name}}<br>
        {{shipping_address}}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th class="amount">Unit Price</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{description}}</td>
          <td>{{quantity}}</td>
          <td class="amount">${{unit_price}}</td>
          <td class="amount">${{amount}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>${{subtotal}}</span>
      </div>
      <div class="total-row">
        <span>Tax ({{tax_rate}}%):</span>
        <span>${{tax_amount}}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total:</span>
        <span>${{total}}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>Payment due within 30 days. Please make checks payable to {{company_name}}.</p>
    </div>
  </div>
</body>
</html>
```

---

## Certificate Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: 11in 8.5in landscape;
      margin: 0;
    }

    body {
      font-family: 'Georgia', serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .certificate {
      width: 11in;
      height: 8.5in;
      padding: 1in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      border: 20px double #333;
      background: white;
    }

    .title {
      font-size: 48pt;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 0.5in;
      text-transform: uppercase;
      letter-spacing: 0.1in;
    }

    .subtitle {
      font-size: 20pt;
      color: #7f8c8d;
      margin-bottom: 0.75in;
    }

    .recipient {
      font-size: 36pt;
      font-weight: bold;
      color: #34495e;
      margin-bottom: 0.5in;
      font-style: italic;
    }

    .description {
      font-size: 16pt;
      color: #555;
      max-width: 8in;
      margin-bottom: 0.75in;
      line-height: 1.6;
    }

    .footer {
      display: flex;
      justify-content: space-around;
      width: 100%;
      max-width: 8in;
      margin-top: 0.5in;
    }

    .signature-line {
      text-align: center;
    }

    .line {
      border-top: 2px solid #333;
      width: 2.5in;
      margin-bottom: 0.1in;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="title">Certificate of Completion</div>
    <div class="subtitle">This is to certify that</div>
    <div class="recipient">{{recipient_name}}</div>
    <div class="description">
      has successfully completed the {{course_name}} program
      on {{completion_date}} with a score of {{score}}%.
    </div>
    <div class="footer">
      <div class="signature-line">
        <div class="line"></div>
        <div>Instructor Signature</div>
        <div>{{instructor_name}}</div>
      </div>
      <div class="signature-line">
        <div class="line"></div>
        <div>Date</div>
        <div>{{issue_date}}</div>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## Template Engine Integration

### Handlebars

```typescript
import handlebars from 'handlebars';

async function generateFromTemplate(
  templatePath: string,
  data: any,
  outputPath: string
) {
  // Load template
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);

  // Render with data
  const html = template(data);

  // Generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    format: 'Letter',
    printBackground: true
  });

  await browser.close();
}
```

---

## Headers and Footers

```typescript
await page.pdf({
  path: outputPath,
  format: 'Letter',
  displayHeaderFooter: true,
  headerTemplate: `
    <div style="font-size: 10px; text-align: center; width: 100%;">
      <span>Company Name - Confidential</span>
    </div>
  `,
  footerTemplate: `
    <div style="font-size: 10px; text-align: center; width: 100%; margin: 0 1in;">
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `,
  margin: {
    top: '0.75in',
    bottom: '0.75in',
    left: '1in',
    right: '1in'
  }
});
```

**Template variables**:
- `{{pageNumber}}` - Current page number
- `{{totalPages}}` - Total page count
- `{{url}}` - Document URL
- `{{title}}` - Document title
- `{{date}}` - Print date

---

## Performance Optimization

### Reuse Browser Instance

```typescript
// ❌ SLOW - Launch browser for each PDF
for (const data of dataArray) {
  const browser = await puppeteer.launch();
  // ...
  await browser.close();
}

// ✅ FAST - Reuse browser
const browser = await puppeteer.launch();

for (const data of dataArray) {
  const page = await browser.newPage();
  // ...
  await page.close();
}

await browser.close();
```

**Benchmark**:
- Reuse browser: 100 PDFs in 15 seconds
- New browser each time: 100 PDFs in 180 seconds

### Wait Strategies

```typescript
// Wait for all resources
await page.setContent(html, {
  waitUntil: 'networkidle0'  // Wait until no network activity
});

// Wait for specific element
await page.waitForSelector('.invoice-total');

// Wait for timeout (last resort)
await page.waitForTimeout(1000);
```

---

## Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Page.pdf() API](https://pptr.dev/api/puppeteer.page.pdf)
- [Print CSS Spec](https://www.w3.org/TR/css-page-3/)
