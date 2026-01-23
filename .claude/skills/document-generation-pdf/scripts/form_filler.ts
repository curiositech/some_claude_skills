#!/usr/bin/env node
/**
 * PDF Form Filler
 *
 * Fill PDF forms from JSON data with validation and batch processing.
 * Uses pdf-lib for native PDF form field manipulation.
 *
 * Usage:
 *   npx tsx form_filler.ts fill <template.pdf> <data.json> <output.pdf>
 *   npx tsx form_filler.ts batch <template.pdf> <data-dir/> <output-dir/>
 *   npx tsx form_filler.ts inspect <form.pdf>
 *
 * Examples:
 *   npx tsx form_filler.ts fill petition_template.pdf case_123.json petition_filled.pdf
 *   npx tsx form_filler.ts batch petition_template.pdf ./case_data/ ./filled_petitions/
 *   npx tsx form_filler.ts inspect petition_template.pdf
 */

import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';

interface FormFieldData {
  name: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'radio';
  value: string | boolean | string[];
  required?: boolean;
}

interface FormData {
  fields: Record<string, any>;
  options?: {
    flatten?: boolean;
    encrypt?: boolean;
    password?: string;
  };
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface FilledFormResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  validation?: ValidationResult;
  fieldsFilled: number;
  fieldsTotal: number;
}

class FormFiller {
  /**
   * Fill a single PDF form
   */
  async fill(
    templatePath: string,
    data: FormData,
    outputPath: string
  ): Promise<FilledFormResult> {
    try {
      console.log(`\n📄 Filling form: ${path.basename(templatePath)}`);

      // Load PDF
      const existingPdfBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      // Get all fields
      const fields = form.getFields();
      console.log(`Found ${fields.length} form fields\n`);

      // Validate data
      const validation = this.validate(form, data);
      if (!validation.valid) {
        console.error('❌ Validation failed:');
        validation.errors.forEach(err => console.error(`  - ${err}`));
        return {
          success: false,
          error: 'Validation failed',
          validation,
          fieldsFilled: 0,
          fieldsTotal: fields.length
        };
      }

      if (validation.warnings.length > 0) {
        console.warn('⚠️  Warnings:');
        validation.warnings.forEach(warn => console.warn(`  - ${warn}`));
      }

      // Fill fields
      let fieldsFilled = 0;
      for (const [fieldName, fieldValue] of Object.entries(data.fields)) {
        try {
          const field = form.getField(fieldName);

          if (field instanceof PDFTextField) {
            field.setText(String(fieldValue));
            console.log(`✓ Text field: ${fieldName} = "${fieldValue}"`);
            fieldsFilled++;
          } else if (field instanceof PDFCheckBox) {
            if (fieldValue === true || fieldValue === 'true' || fieldValue === 'yes') {
              field.check();
              console.log(`✓ Checkbox: ${fieldName} = checked`);
            } else {
              field.uncheck();
              console.log(`✓ Checkbox: ${fieldName} = unchecked`);
            }
            fieldsFilled++;
          } else if (field instanceof PDFDropdown) {
            field.select(String(fieldValue));
            console.log(`✓ Dropdown: ${fieldName} = "${fieldValue}"`);
            fieldsFilled++;
          } else if (field instanceof PDFRadioGroup) {
            field.select(String(fieldValue));
            console.log(`✓ Radio: ${fieldName} = "${fieldValue}"`);
            fieldsFilled++;
          }
        } catch (err) {
          console.warn(`⚠️  Could not fill field "${fieldName}": ${err.message}`);
        }
      }

      // Flatten form (make non-editable)
      if (data.options?.flatten !== false) {
        form.flatten();
        console.log('\n🔒 Form flattened (fields are now non-editable)');
      }

      // Save PDF
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        ...(data.options?.encrypt && {
          userPassword: data.options.password || this.generatePassword(),
          ownerPassword: process.env.PDF_OWNER_PASSWORD || 'owner',
          permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: true,
            documentAssembly: false
          }
        })
      });

      fs.writeFileSync(outputPath, pdfBytes);

      console.log(`\n✅ Filled form saved to: ${outputPath}`);
      console.log(`   Fields filled: ${fieldsFilled}/${fields.length}`);

      return {
        success: true,
        outputPath,
        validation,
        fieldsFilled,
        fieldsTotal: fields.length
      };
    } catch (error) {
      console.error(`\n❌ Error filling form: ${error.message}`);
      return {
        success: false,
        error: error.message,
        fieldsFilled: 0,
        fieldsTotal: 0
      };
    }
  }

  /**
   * Batch fill multiple forms
   */
  async batch(
    templatePath: string,
    dataDir: string,
    outputDir: string
  ): Promise<void> {
    console.log(`\n📦 Batch filling forms...`);
    console.log(`Template: ${templatePath}`);
    console.log(`Data dir: ${dataDir}`);
    console.log(`Output dir: ${outputDir}\n`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Find all JSON files
    const dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${dataFiles.length} data files\n`);

    const results: FilledFormResult[] = [];
    const startTime = Date.now();

    for (const dataFile of dataFiles) {
      const dataPath = path.join(dataDir, dataFile);
      const outputPath = path.join(
        outputDir,
        dataFile.replace('.json', '.pdf')
      );

      const data: FormData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      const result = await this.fill(templatePath, data, outputPath);
      results.push(result);

      console.log('─'.repeat(60));
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n📊 Batch Results:`);
    console.log(`   Total: ${results.length}`);
    console.log(`   ✅ Success: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏱️  Time: ${elapsed}s`);
    console.log(`   📈 Rate: ${(results.length / parseFloat(elapsed)).toFixed(1)} forms/sec\n`);

    if (failed > 0) {
      console.log('Failed forms:');
      results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.error}`));
    }
  }

  /**
   * Inspect PDF form fields
   */
  async inspect(pdfPath: string): Promise<void> {
    console.log(`\n🔍 Inspecting form: ${path.basename(pdfPath)}\n`);

    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    console.log(`Found ${fields.length} form fields:\n`);

    fields.forEach((field, index) => {
      const name = field.getName();
      const type = this.getFieldType(field);

      console.log(`${index + 1}. ${name}`);
      console.log(`   Type: ${type}`);

      // Field-specific details
      if (field instanceof PDFTextField) {
        const value = field.getText();
        const maxLength = field.getMaxLength();
        console.log(`   Value: "${value || '(empty)'}"`);
        if (maxLength) {
          console.log(`   Max length: ${maxLength}`);
        }
      } else if (field instanceof PDFCheckBox) {
        const checked = field.isChecked();
        console.log(`   Checked: ${checked}`);
      } else if (field instanceof PDFDropdown) {
        const options = field.getOptions();
        const selected = field.getSelected();
        console.log(`   Options: [${options.join(', ')}]`);
        console.log(`   Selected: ${selected.join(', ') || '(none)'}`);
      } else if (field instanceof PDFRadioGroup) {
        const options = field.getOptions();
        const selected = field.getSelected();
        console.log(`   Options: [${options.join(', ')}]`);
        console.log(`   Selected: ${selected || '(none)'}`);
      }

      console.log('');
    });

    // Generate sample JSON
    console.log('📝 Sample JSON structure:\n');
    const sampleData: FormData = {
      fields: {},
      options: {
        flatten: true,
        encrypt: false
      }
    };

    fields.forEach(field => {
      const name = field.getName();
      if (field instanceof PDFTextField) {
        sampleData.fields[name] = 'Sample text';
      } else if (field instanceof PDFCheckBox) {
        sampleData.fields[name] = false;
      } else if (field instanceof PDFDropdown) {
        const options = field.getOptions();
        sampleData.fields[name] = options[0] || 'option';
      } else if (field instanceof PDFRadioGroup) {
        const options = field.getOptions();
        sampleData.fields[name] = options[0] || 'option';
      }
    });

    console.log(JSON.stringify(sampleData, null, 2));
    console.log('\n');
  }

  /**
   * Validate form data
   */
  private validate(form: any, data: FormData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const formFieldNames = form.getFields().map((f: any) => f.getName());

    // Check for missing required fields
    for (const fieldName of formFieldNames) {
      if (!(fieldName in data.fields)) {
        warnings.push(`Field "${fieldName}" not provided in data`);
      }
    }

    // Check for unknown fields
    for (const fieldName of Object.keys(data.fields)) {
      if (!formFieldNames.includes(fieldName)) {
        warnings.push(`Field "${fieldName}" not found in PDF form`);
      }
    }

    // Type validation
    for (const [fieldName, fieldValue] of Object.entries(data.fields)) {
      try {
        const field = form.getField(fieldName);

        if (field instanceof PDFTextField) {
          if (typeof fieldValue !== 'string' && typeof fieldValue !== 'number') {
            errors.push(`Field "${fieldName}" expects string/number, got ${typeof fieldValue}`);
          }
        } else if (field instanceof PDFCheckBox) {
          if (typeof fieldValue !== 'boolean' && fieldValue !== 'true' && fieldValue !== 'false') {
            warnings.push(`Field "${fieldName}" is checkbox, value "${fieldValue}" will be converted to boolean`);
          }
        } else if (field instanceof PDFDropdown) {
          const options = field.getOptions();
          if (!options.includes(String(fieldValue))) {
            errors.push(`Field "${fieldName}" value "${fieldValue}" not in options: [${options.join(', ')}]`);
          }
        } else if (field instanceof PDFRadioGroup) {
          const options = field.getOptions();
          if (!options.includes(String(fieldValue))) {
            errors.push(`Field "${fieldName}" value "${fieldValue}" not in options: [${options.join(', ')}]`);
          }
        }
      } catch (err) {
        // Field not found - already warned above
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get field type as string
   */
  private getFieldType(field: any): string {
    if (field instanceof PDFTextField) return 'Text';
    if (field instanceof PDFCheckBox) return 'Checkbox';
    if (field instanceof PDFDropdown) return 'Dropdown';
    if (field instanceof PDFRadioGroup) return 'Radio';
    return 'Unknown';
  }

  /**
   * Generate secure random password
   */
  private generatePassword(): string {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const filler = new FormFiller();

  switch (command) {
    case 'fill': {
      if (args.length < 4) {
        console.error('Usage: npx tsx form_filler.ts fill <template.pdf> <data.json> <output.pdf>');
        process.exit(1);
      }

      const templatePath = args[1];
      const dataPath = args[2];
      const outputPath = args[3];

      const data: FormData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      filler.fill(templatePath, data, outputPath);
      break;
    }

    case 'batch': {
      if (args.length < 4) {
        console.error('Usage: npx tsx form_filler.ts batch <template.pdf> <data-dir/> <output-dir/>');
        process.exit(1);
      }

      const templatePath = args[1];
      const dataDir = args[2];
      const outputDir = args[3];

      filler.batch(templatePath, dataDir, outputDir);
      break;
    }

    case 'inspect': {
      if (args.length < 2) {
        console.error('Usage: npx tsx form_filler.ts inspect <form.pdf>');
        process.exit(1);
      }

      const pdfPath = args[1];
      filler.inspect(pdfPath);
      break;
    }

    default:
      console.error('Unknown command. Available commands:');
      console.error('  fill <template.pdf> <data.json> <output.pdf>');
      console.error('  batch <template.pdf> <data-dir/> <output-dir/>');
      console.error('  inspect <form.pdf>');
      process.exit(1);
  }
}

export { FormFiller, FormData, FormFieldData, ValidationResult, FilledFormResult };
