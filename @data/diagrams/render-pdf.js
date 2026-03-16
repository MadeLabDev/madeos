#!/usr/bin/env node

/**
 * Script to render Mermaid diagrams to PDF with custom page sizes
 * This ensures each diagram fits on a single page
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const INPUT_DIR = '.';
const OUTPUT_DIR = './out-pdf';

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function renderPDF() {
  let browser;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    // Find all .mmd files
    const files = fs
      .readdirSync(INPUT_DIR)
      .filter((f) => f.endsWith('.mmd') && !f.startsWith('build'))
      .sort();

    if (files.length === 0) {
      console.error('❌ No .mmd files found');
      process.exit(1);
    }

    console.log(`📊 Found ${files.length} Mermaid files:`);
    files.forEach((f) => console.log(`  ${f}`));
    console.log('');

    for (const file of files) {
      const filename = path.basename(file, '.mmd');
      const outputFile = path.join(OUTPUT_DIR, `${filename}.pdf`);

      console.log(`  ⏳ Rendering ${filename}.pdf...`);

      try {
        // First render to SVG
        const svgTemp = `/tmp/${filename}.svg`;
        execSync(`npx mmdc -i "${file}" -o "${svgTemp}" 2>/dev/null`, {
          stdio: 'pipe',
        });

        // Read SVG to get dimensions
        const svgContent = fs.readFileSync(svgTemp, 'utf-8');

        // Extract width and height from SVG
        const widthMatch = svgContent.match(/width="([\d.]+)(?:px)?"/);
        const heightMatch = svgContent.match(/height="([\d.]+)(?:px)?"/);

        let width = 1200;
        let height = 800;

        if (widthMatch) width = parseFloat(widthMatch[1]);
        if (heightMatch) height = parseFloat(heightMatch[1]);

        // Add some padding
        const pageWidth = Math.ceil(width / 72) + 0.5; // Convert px to inches + padding
        const pageHeight = Math.ceil(height / 72) + 0.5;

        // Create HTML with SVG
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background: white;
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .mermaid-container {
      display: flex;
      justify-content: center;
      align-items: center;
      background: white;
      padding: 0;
      margin: 0;
    }
    svg {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div class="mermaid-container">
    ${svgContent}
  </div>
</body>
</html>
`;

        const htmlFile = `/tmp/${filename}.html`;
        fs.writeFileSync(htmlFile, htmlContent);

        // Open HTML in browser and print to PDF
        const page = await browser.newPage();

        // Set viewport to be large enough for content
        await page.setViewport({ width: 1920, height: 1080 });

        await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });

        // Wait for content to render
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));

        // Get actual SVG bounds to avoid blank space
        const contentBounds = await page.evaluate(() => {
          const svg = document.querySelector('svg');
          if (svg) {
            const rect = svg.getBoundingClientRect();
            return {
              x: rect.x,
              y: rect.y,
              width: Math.ceil(rect.width),
              height: Math.ceil(rect.height),
              scrollWidth: svg.scrollWidth,
              scrollHeight: svg.scrollHeight,
            };
          }
          return { width: 1200, height: 800, scrollWidth: 1200, scrollHeight: 800 };
        });

        // Use actual content dimensions with minimal padding
        const contentWidth = Math.max(contentBounds.scrollWidth, contentBounds.width);
        const contentHeight = Math.max(contentBounds.scrollHeight, contentBounds.height);

        // Convert to inches (96 DPI) with minimal padding
        const pdfWidth = (contentWidth / 96) + 0.2;
        const pdfHeight = (contentHeight / 96) + 0.2;

        await page.pdf({
          path: outputFile,
          width: `${pdfWidth}in`,
          height: `${pdfHeight}in`,
          margin: {
            top: '0.1in',
            right: '0.1in',
            bottom: '0.1in',
            left: '0.1in',
          },
          printBackground: true,
        });

        await page.close();

        // Clean up temp files
        if (fs.existsSync(svgTemp)) fs.unlinkSync(svgTemp);
        if (fs.existsSync(htmlFile)) fs.unlinkSync(htmlFile);

        console.log(`     ✅ ${filename}.pdf`);
      } catch (error) {
        console.error(`     ❌ Error rendering ${filename}:`, error.message);
      }
    }

    console.log('');
    console.log('🎉 All PDFs built successfully!');
    console.log(`📁 Output: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

renderPDF();
