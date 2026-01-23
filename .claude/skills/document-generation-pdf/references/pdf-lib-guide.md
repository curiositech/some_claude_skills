# pdf-lib Guide

Complete guide to pdf-lib for form filling, field manipulation, encryption, and PDF generation.

## Installation

```bash
npm install pdf-lib
```

**Latest version**: 1.17.1 (Jan 2024)

---

## Basic Form Filling

### Loading and Saving

```typescript
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';

// Load existing PDF
const existingPdfBytes = fs.readFileSync('template.pdf');
const pdfDoc = await PDFDocument.load(existingPdfBytes);

// Get form
const form = pdfDoc.getForm();

// ... fill fields ...

// Save
const pdfBytes = await pdfDoc.save();
fs.writeFileSync('filled.pdf', pdfBytes);
```

---

## Form Field Types

### Text Fields

```typescript
// Get text field
const nameField = form.getTextField('applicant_name');

// Set text
nameField.setText('John Doe');

// Get current value
const name = nameField.getText();

// Max length
const maxLength = nameField.getMaxLength();

// Set alignment
nameField.setAlignment(Alignment.Center);  // Left, Center, Right

// Set font size
nameField.setFontSize(12);

// Enable multiline
nameField.enableMultiline();

// Disable read-only
nameField.enableReadOnly(false);
```

**Common text fields**:
- Name, address, phone
- Dates (as text)
- Case numbers
- Comments/notes

---

### Check Boxes

```typescript
// Get checkbox
const consentCheckbox = form.getCheckBox('consent_checkbox');

// Check
consentCheckbox.check();

// Uncheck
consentCheckbox.uncheck();

// Get state
const isChecked = consentCheckbox.isChecked();
```

**Use cases**:
- Yes/No questions
- Consent forms
- Attestations
- Option selections

---

### Radio Groups

```typescript
// Get radio group
const employmentStatus = form.getRadioGroup('employment_status');

// Get options
const options = employmentStatus.getOptions();
// Returns: ['employed', 'unemployed', 'self_employed', 'retired']

// Select option
employmentStatus.select('employed');

// Get selected
const selected = employmentStatus.getSelected();

// Clear selection
employmentStatus.clear();
```

**Use cases**:
- Multiple choice (one answer)
- Yes/No/Maybe
- Option groups

---

### Dropdown Fields

```typescript
// Get dropdown
const stateDropdown = form.getDropdown('state');

// Get options
const options = stateDropdown.getOptions();
// Returns: ['CA', 'NY', 'TX', ...]

// Select single option
stateDropdown.select('CA');

// Select multiple (if multiselect enabled)
stateDropdown.select(['CA', 'NY']);

// Get selected
const selected = stateDropdown.getSelected();
// Returns: ['CA']

// Clear
stateDropdown.clear();

// Enable multiselect
stateDropdown.enableMultiselect();
```

**Use cases**:
- State/country selection
- Predefined options
- Category selection

---

## Form Flattening

**Critical**: Flatten forms after filling to prevent user edits.

```typescript
// Fill form
form.getTextField('name').setText('John Doe');
form.getCheckBox('consent').check();

// Flatten (make non-editable)
form.flatten();

// Save
const pdfBytes = await pdfDoc.save();
```

**What flattening does**:
1. Converts form fields to static text/graphics
2. Removes interactive field widgets
3. Preserves visual appearance
4. Makes document non-editable

**When NOT to flatten**:
- Draft documents (user needs to review/edit)
- Multi-step workflows (partial completion)
- Templates for manual filling

---

## Inspecting Forms

### List All Fields

```typescript
const fields = form.getFields();

fields.forEach(field => {
  const name = field.getName();
  const type = field.constructor.name;  // PDFTextField, PDFCheckBox, etc.

  console.log(`${name} (${type})`);

  // Field-specific details
  if (field instanceof PDFTextField) {
    console.log(`  Value: "${field.getText()}"`);
    console.log(`  Max length: ${field.getMaxLength()}`);
  }
});
```

### Get Field by Name

```typescript
try {
  const field = form.getField('field_name');

  // Check type
  if (field instanceof PDFTextField) {
    // Text field operations
  } else if (field instanceof PDFCheckBox) {
    // Checkbox operations
  } else if (field instanceof PDFDropdown) {
    // Dropdown operations
  } else if (field instanceof PDFRadioGroup) {
    // Radio group operations
  }
} catch (err) {
  console.error('Field not found:', err.message);
}
```

---

## Creating Forms

### Add Text Field

```typescript
const textField = form.createTextField('new_field');

textField.addToPage(page, {
  x: 100,
  y: 500,
  width: 200,
  height: 30
});

textField.setText('Default value');
textField.setFontSize(12);
```

### Add Checkbox

```typescript
const checkbox = form.createCheckBox('new_checkbox');

checkbox.addToPage(page, {
  x: 100,
  y: 450,
  width: 20,
  height: 20
});

checkbox.check();
```

### Add Dropdown

```typescript
const dropdown = form.createDropdown('new_dropdown');

dropdown.addToPage(page, {
  x: 100,
  y: 400,
  width: 150,
  height: 25
});

dropdown.addOptions(['Option 1', 'Option 2', 'Option 3']);
dropdown.select('Option 1');
```

---

## PDF Encryption

### Password Protection

```typescript
const pdfBytes = await pdfDoc.save({
  userPassword: 'user123',     // Password to open PDF
  ownerPassword: 'owner456',   // Password to change permissions
  permissions: {
    printing: 'highResolution',        // 'lowResolution' | 'highResolution' | false
    modifying: false,                  // Prevent modifications
    copying: false,                    // Prevent text/image copying
    annotating: false,                 // Prevent annotations
    fillingForms: false,               // Prevent form filling
    contentAccessibility: true,        // Allow screen readers
    documentAssembly: false            // Prevent page insertion/deletion
  }
});
```

**Permission levels**:
- `'highResolution'` - Allow high-quality printing
- `'lowResolution'` - Allow low-quality printing only
- `false` - Disallow

**Use cases**:
- Legal documents: Prevent editing
- Confidential files: Require password
- HIPAA compliance: Restrict copying
- Public records: Allow reading only

---

## Fonts and Styling

### Embed Standard Fonts

```typescript
import { StandardFonts } from 'pdf-lib';

const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
const courier = await pdfDoc.embedFont(StandardFonts.Courier);
```

**Standard fonts** (always available):
- Helvetica, Helvetica-Bold, Helvetica-Oblique, Helvetica-BoldOblique
- Times-Roman, Times-Bold, Times-Italic, Times-BoldItalic
- Courier, Courier-Bold, Courier-Oblique, Courier-BoldOblique

### Embed Custom Fonts

```typescript
const fontBytes = fs.readFileSync('CustomFont.ttf');
const customFont = await pdfDoc.embedFont(fontBytes);

// Use in text field
textField.updateWidgets({
  defaultAppearance: PDFTextField.createDefaultAppearance(customFont, 12)
});
```

---

## Adding Images

```typescript
// Embed PNG
const pngImageBytes = fs.readFileSync('logo.png');
const pngImage = await pdfDoc.embedPng(pngImageBytes);

// Embed JPEG
const jpgImageBytes = fs.readFileSync('signature.jpg');
const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);

// Draw on page
const page = pdfDoc.getPage(0);

page.drawImage(pngImage, {
  x: 100,
  y: 200,
  width: 150,
  height: 50
});
```

**Use cases**:
- Company logos
- Signature images
- Diagrams
- Photos

---

## Creating PDFs from Scratch

```typescript
const pdfDoc = await PDFDocument.create();

// Add blank page (US Letter: 612 x 792 points)
const page = pdfDoc.addPage([612, 792]);

// Draw text
const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

page.drawText('Hello, World!', {
  x: 50,
  y: 750,
  size: 24,
  font: helvetica,
  color: rgb(0, 0, 0)
});

// Draw rectangle
page.drawRectangle({
  x: 50,
  y: 700,
  width: 200,
  height: 100,
  borderColor: rgb(0, 0, 0),
  borderWidth: 2,
  color: rgb(0.95, 0.95, 0.95)
});

// Save
const pdfBytes = await pdfDoc.save();
```

**Coordinate system**:
- Origin (0, 0) is bottom-left
- X increases right
- Y increases up
- Units: points (1 pt = 1/72 inch)

---

## Merging PDFs

```typescript
const mergedPdf = await PDFDocument.create();

// Load source PDFs
const pdf1Bytes = fs.readFileSync('doc1.pdf');
const pdf1 = await PDFDocument.load(pdf1Bytes);

const pdf2Bytes = fs.readFileSync('doc2.pdf');
const pdf2 = await PDFDocument.load(pdf2Bytes);

// Copy pages
const copiedPages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
copiedPages1.forEach(page => mergedPdf.addPage(page));

const copiedPages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
copiedPages2.forEach(page => mergedPdf.addPage(page));

// Save
const pdfBytes = await mergedPdf.save();
```

---

## Metadata

```typescript
// Set metadata
pdfDoc.setTitle('Petition for Expungement');
pdfDoc.setAuthor('John Doe');
pdfDoc.setSubject('Legal Document');
pdfDoc.setKeywords(['expungement', 'legal', 'petition']);
pdfDoc.setProducer('Expungement Guide');
pdfDoc.setCreator('pdf-lib');
pdfDoc.setCreationDate(new Date());
pdfDoc.setModificationDate(new Date());

// Get metadata
const title = pdfDoc.getTitle();
const author = pdfDoc.getAuthor();
```

---

## Save Options

```typescript
const pdfBytes = await pdfDoc.save({
  // Optimize for file size
  useObjectStreams: false,

  // Encryption
  userPassword: 'user123',
  ownerPassword: 'owner456',
  permissions: { /* ... */ },

  // Update existing PDF (instead of creating new)
  updateFieldAppearances: false,

  // Add metadata
  addDefaultPage: false
});
```

---

## Common Patterns

### Batch Processing

```typescript
async function batchFillForms(
  templatePath: string,
  dataFiles: string[],
  outputDir: string
) {
  const templateBytes = fs.readFileSync(templatePath);

  for (const dataFile of dataFiles) {
    // Load template
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    // Load data
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

    // Fill fields
    for (const [field, value] of Object.entries(data)) {
      try {
        const fieldObj = form.getField(field);
        if (fieldObj instanceof PDFTextField) {
          fieldObj.setText(String(value));
        } else if (fieldObj instanceof PDFCheckBox) {
          if (value) fieldObj.check();
        }
      } catch (err) {
        console.warn(`Field ${field} not found`);
      }
    }

    // Flatten and save
    form.flatten();
    const pdfBytes = await pdfDoc.save();

    const outputPath = path.join(outputDir, path.basename(dataFile, '.json') + '.pdf');
    fs.writeFileSync(outputPath, pdfBytes);
  }
}
```

### Conditional Fields

```typescript
const form = pdfDoc.getForm();

// Show field if condition met
const hasPriorConvictions = data.prior_convictions === 'yes';

if (hasPriorConvictions) {
  form.getTextField('conviction_details').setText(data.conviction_details);
  form.getTextField('conviction_date').setText(data.conviction_date);
} else {
  // Hide/disable fields
  const detailsField = form.getTextField('conviction_details');
  detailsField.setText('N/A');
  detailsField.enableReadOnly();
}
```

### Signature Placeholders

```typescript
// Add signature field
const signatureField = form.createTextField('applicant_signature');

signatureField.addToPage(page, {
  x: 100,
  y: 100,
  width: 200,
  height: 50
});

// Add border for visual indication
signatureField.updateWidgets({
  borderWidth: 1,
  borderColor: rgb(0, 0, 0)
});

// Add placeholder text
signatureField.setText('________________________________________');

// Mark as required
signatureField.enableRequired();
```

---

## Error Handling

```typescript
try {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  try {
    const field = form.getField('field_name');
    // ... use field
  } catch (err) {
    console.error('Field not found:', err.message);
    // Continue with other fields
  }

  const outputBytes = await pdfDoc.save();
} catch (err) {
  console.error('Failed to load PDF:', err.message);
  throw err;
}
```

---

## Performance Tips

1. **Reuse loaded templates** for batch processing
2. **Don't flatten** until the very end
3. **Use object streams** for smaller file size
4. **Embed fonts once** per document
5. **Batch save operations** (don't save after each field)

**Benchmark** (1000 forms):
- Reuse template: 5 seconds
- Reload template each time: 45 seconds

---

## Resources

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [GitHub Repository](https://github.com/Hopding/pdf-lib)
- [Form Examples](https://pdf-lib.js.org/docs/api/classes/pdfform)
