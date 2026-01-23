#!/usr/bin/env node
/**
 * Document Assembler
 *
 * Merge multiple PDFs, add cover pages, watermarks, and page numbers.
 * Create document packets for legal/HR workflows.
 *
 * Usage:
 *   npx tsx document_assembler.ts merge <output.pdf> <input1.pdf> <input2.pdf> ...
 *   npx tsx document_assembler.ts cover <input.pdf> <output.pdf> --title "Title" --subtitle "Subtitle"
 *   npx tsx document_assembler.ts watermark <input.pdf> <output.pdf> --text "CONFIDENTIAL"
 *   npx tsx document_assembler.ts number <input.pdf> <output.pdf> --start 1
 *
 * Examples:
 *   npx tsx document_assembler.ts merge packet.pdf petition.pdf evidence.pdf affidavit.pdf
 *   npx tsx document_assembler.ts cover petition.pdf petition_with_cover.pdf --title "Petition for Expungement" --subtitle "Case #12345"
 *   npx tsx document_assembler.ts watermark draft.pdf draft_watermarked.pdf --text "DRAFT - NOT FOR FILING"
 *   npx tsx document_assembler.ts number brief.pdf brief_numbered.pdf --start 1 --format "Page {n} of {total}"
 */

import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

interface MergeOptions {
  addBookmarks?: boolean;
  preserveMetadata?: boolean;
}

interface CoverPageOptions {
  title: string;
  subtitle?: string;
  date?: string;
  caseNumber?: string;
  attorney?: string;
  backgroundColor?: { r: number; g: number; b: number };
}

interface WatermarkOptions {
  text: string;
  opacity?: number;
  rotation?: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  diagonal?: boolean;
}

interface PageNumberOptions {
  start?: number;
  format?: string;  // e.g., "Page {n} of {total}", "{n}", "Page {n}"
  position?: 'bottom-center' | 'bottom-right' | 'top-center' | 'top-right';
  fontSize?: number;
}

class DocumentAssembler {
  /**
   * Merge multiple PDFs into one
   */
  async merge(
    outputPath: string,
    inputPaths: string[],
    options: MergeOptions = {}
  ): Promise<void> {
    console.log(`\n📄 Merging ${inputPaths.length} PDFs...\n`);

    const mergedPdf = await PDFDocument.create();

    for (const inputPath of inputPaths) {
      console.log(`  Adding: ${path.basename(inputPath)}`);

      const pdfBytes = fs.readFileSync(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);

      // Copy all pages
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));

      console.log(`    ✓ ${pdf.getPageCount()} pages copied`);
    }

    // Preserve metadata from first document
    if (options.preserveMetadata && inputPaths.length > 0) {
      const firstPdfBytes = fs.readFileSync(inputPaths[0]);
      const firstPdf = await PDFDocument.load(firstPdfBytes);

      if (firstPdf.getTitle()) mergedPdf.setTitle(firstPdf.getTitle());
      if (firstPdf.getAuthor()) mergedPdf.setAuthor(firstPdf.getAuthor());
      if (firstPdf.getSubject()) mergedPdf.setSubject(firstPdf.getSubject());
      if (firstPdf.getCreator()) mergedPdf.setCreator(firstPdf.getCreator());
    }

    // Save
    const pdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`\n✅ Merged PDF saved: ${outputPath}`);
    console.log(`   Total pages: ${mergedPdf.getPageCount()}\n`);
  }

  /**
   * Add cover page to PDF
   */
  async addCoverPage(
    inputPath: string,
    outputPath: string,
    options: CoverPageOptions
  ): Promise<void> {
    console.log(`\n📄 Adding cover page...\n`);

    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Create new document with cover page
    const newPdf = await PDFDocument.create();

    // Add cover page
    const coverPage = newPdf.addPage([612, 792]);  // 8.5" x 11" (US Letter)

    // Background color
    if (options.backgroundColor) {
      const { r, g, b } = options.backgroundColor;
      coverPage.drawRectangle({
        x: 0,
        y: 0,
        width: coverPage.getWidth(),
        height: coverPage.getHeight(),
        color: rgb(r, g, b)
      });
    }

    const helveticaBold = await newPdf.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await newPdf.embedFont(StandardFonts.Helvetica);

    let yPosition = 650;

    // Title
    const titleSize = 32;
    const titleWidth = helveticaBold.widthOfTextAtSize(options.title, titleSize);
    coverPage.drawText(options.title, {
      x: (coverPage.getWidth() - titleWidth) / 2,
      y: yPosition,
      size: titleSize,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });

    yPosition -= 60;

    // Subtitle
    if (options.subtitle) {
      const subtitleSize = 18;
      const subtitleWidth = helvetica.widthOfTextAtSize(options.subtitle, subtitleSize);
      coverPage.drawText(options.subtitle, {
        x: (coverPage.getWidth() - subtitleWidth) / 2,
        y: yPosition,
        size: subtitleSize,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3)
      });
      yPosition -= 40;
    }

    // Case number
    if (options.caseNumber) {
      const caseSize = 14;
      const caseText = `Case No. ${options.caseNumber}`;
      const caseWidth = helvetica.widthOfTextAtSize(caseText, caseSize);
      coverPage.drawText(caseText, {
        x: (coverPage.getWidth() - caseWidth) / 2,
        y: yPosition,
        size: caseSize,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4)
      });
      yPosition -= 100;
    }

    // Attorney/Author
    if (options.attorney) {
      const attorneySize = 12;
      const attorneyText = `Prepared by: ${options.attorney}`;
      const attorneyWidth = helvetica.widthOfTextAtSize(attorneyText, attorneySize);
      coverPage.drawText(attorneyText, {
        x: (coverPage.getWidth() - attorneyWidth) / 2,
        y: yPosition,
        size: attorneySize,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5)
      });
    }

    // Date (bottom)
    const date = options.date || new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateSize = 12;
    const dateWidth = helvetica.widthOfTextAtSize(date, dateSize);
    coverPage.drawText(date, {
      x: (coverPage.getWidth() - dateWidth) / 2,
      y: 50,
      size: dateSize,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5)
    });

    // Copy original pages
    const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach(page => newPdf.addPage(page));

    // Save
    const pdfBytes = await newPdf.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`✅ Cover page added: ${outputPath}`);
    console.log(`   Total pages: ${newPdf.getPageCount()} (1 cover + ${pdfDoc.getPageCount()} original)\n`);
  }

  /**
   * Add watermark to all pages
   */
  async addWatermark(
    inputPath: string,
    outputPath: string,
    options: WatermarkOptions
  ): Promise<void> {
    console.log(`\n💧 Adding watermark: "${options.text}"\n`);

    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = options.fontSize || 60;
    const opacity = options.opacity !== undefined ? options.opacity : 0.3;
    const color = options.color || { r: 0.7, g: 0.7, b: 0.7 };
    const rotation = options.rotation !== undefined ? options.rotation : (options.diagonal ? -45 : 0);

    const pages = pdfDoc.getPages();
    const textWidth = font.widthOfTextAtSize(options.text, fontSize);

    pages.forEach((page, index) => {
      const { width, height } = page.getSize();

      // Center position
      const x = (width - textWidth) / 2;
      const y = height / 2;

      page.drawText(options.text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
        opacity,
        rotate: degrees(rotation)
      });

      if ((index + 1) % 10 === 0) {
        console.log(`  ✓ Watermarked ${index + 1} pages...`);
      }
    });

    console.log(`  ✓ Watermarked all ${pages.length} pages`);

    // Save
    const outputBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, outputBytes);

    console.log(`\n✅ Watermarked PDF saved: ${outputPath}\n`);
  }

  /**
   * Add page numbers
   */
  async addPageNumbers(
    inputPath: string,
    outputPath: string,
    options: PageNumberOptions = {}
  ): Promise<void> {
    console.log(`\n🔢 Adding page numbers...\n`);

    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = options.fontSize || 10;
    const position = options.position || 'bottom-center';
    const start = options.start || 1;
    const format = options.format || 'Page {n} of {total}';

    const pages = pdfDoc.getPages();
    const total = pages.length;

    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const pageNumber = start + index;

      // Format text
      const text = format
        .replace('{n}', pageNumber.toString())
        .replace('{total}', total.toString());

      const textWidth = font.widthOfTextAtSize(text, fontSize);

      // Calculate position
      let x: number, y: number;

      switch (position) {
        case 'bottom-center':
          x = (width - textWidth) / 2;
          y = 30;
          break;
        case 'bottom-right':
          x = width - textWidth - 50;
          y = 30;
          break;
        case 'top-center':
          x = (width - textWidth) / 2;
          y = height - 50;
          break;
        case 'top-right':
          x = width - textWidth - 50;
          y = height - 50;
          break;
        default:
          x = (width - textWidth) / 2;
          y = 30;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0)
      });

      if ((index + 1) % 10 === 0) {
        console.log(`  ✓ Numbered ${index + 1} pages...`);
      }
    });

    console.log(`  ✓ Numbered all ${pages.length} pages`);

    // Save
    const outputBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, outputBytes);

    console.log(`\n✅ Numbered PDF saved: ${outputPath}\n`);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const assembler = new DocumentAssembler();

  switch (command) {
    case 'merge': {
      if (args.length < 3) {
        console.error('Usage: npx tsx document_assembler.ts merge <output.pdf> <input1.pdf> <input2.pdf> ...');
        process.exit(1);
      }

      const outputPath = args[1];
      const inputPaths = args.slice(2);

      assembler.merge(outputPath, inputPaths, { preserveMetadata: true });
      break;
    }

    case 'cover': {
      if (args.length < 3) {
        console.error('Usage: npx tsx document_assembler.ts cover <input.pdf> <output.pdf> --title "Title" [--subtitle "Subtitle"] [--case "12345"]');
        process.exit(1);
      }

      const inputPath = args[1];
      const outputPath = args[2];

      // Parse options
      const options: CoverPageOptions = { title: '' };
      for (let i = 3; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];

        switch (flag) {
          case '--title':
            options.title = value;
            break;
          case '--subtitle':
            options.subtitle = value;
            break;
          case '--case':
            options.caseNumber = value;
            break;
          case '--attorney':
            options.attorney = value;
            break;
          case '--date':
            options.date = value;
            break;
        }
      }

      if (!options.title) {
        console.error('Error: --title is required');
        process.exit(1);
      }

      assembler.addCoverPage(inputPath, outputPath, options);
      break;
    }

    case 'watermark': {
      if (args.length < 3) {
        console.error('Usage: npx tsx document_assembler.ts watermark <input.pdf> <output.pdf> --text "TEXT" [--opacity 0.3] [--diagonal]');
        process.exit(1);
      }

      const inputPath = args[1];
      const outputPath = args[2];

      // Parse options
      const options: WatermarkOptions = { text: '' };
      for (let i = 3; i < args.length; i++) {
        const flag = args[i];

        switch (flag) {
          case '--text':
            options.text = args[++i];
            break;
          case '--opacity':
            options.opacity = parseFloat(args[++i]);
            break;
          case '--rotation':
            options.rotation = parseInt(args[++i]);
            break;
          case '--diagonal':
            options.diagonal = true;
            break;
          case '--size':
            options.fontSize = parseInt(args[++i]);
            break;
        }
      }

      if (!options.text) {
        console.error('Error: --text is required');
        process.exit(1);
      }

      assembler.addWatermark(inputPath, outputPath, options);
      break;
    }

    case 'number': {
      if (args.length < 3) {
        console.error('Usage: npx tsx document_assembler.ts number <input.pdf> <output.pdf> [--start 1] [--format "Page {n} of {total}"] [--position bottom-center]');
        process.exit(1);
      }

      const inputPath = args[1];
      const outputPath = args[2];

      // Parse options
      const options: PageNumberOptions = {};
      for (let i = 3; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];

        switch (flag) {
          case '--start':
            options.start = parseInt(value);
            break;
          case '--format':
            options.format = value;
            break;
          case '--position':
            options.position = value as any;
            break;
          case '--size':
            options.fontSize = parseInt(value);
            break;
        }
      }

      assembler.addPageNumbers(inputPath, outputPath, options);
      break;
    }

    default:
      console.error('Unknown command. Available commands:');
      console.error('  merge <output.pdf> <input1.pdf> <input2.pdf> ...');
      console.error('  cover <input.pdf> <output.pdf> --title "Title" [options]');
      console.error('  watermark <input.pdf> <output.pdf> --text "TEXT" [options]');
      console.error('  number <input.pdf> <output.pdf> [options]');
      process.exit(1);
  }
}

export { DocumentAssembler, MergeOptions, CoverPageOptions, WatermarkOptions, PageNumberOptions };
