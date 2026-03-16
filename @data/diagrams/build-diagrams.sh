#!/bin/bash

# Script to automatically build Mermaid diagrams
# Usage: ./scripts/build-diagrams.sh [svg|png|pdf|all]
# Default: all

# Trap signals to handle script termination gracefully
trap "echo '❌ Script interrupted! Cleaning up...'; exit 1" SIGINT SIGTERM

FORMAT=${1:-all}
DIAGRAM_DIR="@data/diagrams"
INPUT_DIR="$DIAGRAM_DIR"
SVG_OUTPUT_DIR="$DIAGRAM_DIR/out-svg"
PNG_OUTPUT_DIR="$DIAGRAM_DIR/out-png"
PDF_OUTPUT_DIR="$DIAGRAM_DIR/out-pdf"

# Create output directories if they don't exist
mkdir -p "$SVG_OUTPUT_DIR"
mkdir -p "$PNG_OUTPUT_DIR"
mkdir -p "$PDF_OUTPUT_DIR"

# Find all .mmd files and count them
TOTAL_FILES=$(find "$INPUT_DIR" -maxdepth 1 -name "*.mmd" -type f | wc -l)

if [ "$TOTAL_FILES" -eq 0 ]; then
  echo "❌ No .mmd files found in $INPUT_DIR"
  exit 1
fi

echo "📊 Found $TOTAL_FILES Mermaid files:"
find "$INPUT_DIR" -maxdepth 1 -name "*.mmd" -type f | sort | sed 's/^/  /'

# Build SVG
if [ "$FORMAT" = "svg" ] || [ "$FORMAT" = "all" ]; then
  echo ""
  echo "🔨 Building SVG diagrams..."
  
  while IFS= read -r file; do
    filename=$(basename "$file" .mmd)
    output="$SVG_OUTPUT_DIR/$filename.svg"
    echo "  → $filename.svg"
    npx mmdc -i "$file" -o "$output" 2>&1 | grep -v "^Generating single mermaid chart" || true
  done < <(find "$INPUT_DIR" -maxdepth 1 -name "*.mmd" -type f | sort)
  
  echo "✅ SVG diagrams built successfully"
fi

# Build PNG with large scale (4x for high resolution)
if [ "$FORMAT" = "png" ] || [ "$FORMAT" = "all" ]; then
  echo ""
  echo "🔨 Building PNG diagrams (high resolution - 4x scale)..."
  
  # Check if puppeteer is available
  if ! npx -y puppeteer browsers list 2>/dev/null | grep -q "chrome"; then
    echo "⚠️  Installing Chrome for Puppeteer (this may take a moment)..."
    npx -y puppeteer browsers install chrome-headless-shell || true
  fi
  
  while IFS= read -r file; do
    filename=$(basename "$file" .mmd)
    output="$PNG_OUTPUT_DIR/$filename.png"
    echo "  → $filename.png (4x resolution)"
    npx mmdc -i "$file" -o "$output" -s 4 2>&1 | grep -v "^Generating single mermaid chart" || true
  done < <(find "$INPUT_DIR" -maxdepth 1 -name "*.mmd" -type f | sort)
  
  echo "✅ PNG diagrams built successfully"
fi

# Build PDF (viewable on Google Drive - single page per diagram)
if [ "$FORMAT" = "pdf" ] || [ "$FORMAT" = "all" ]; then
  echo ""
  echo "🔨 Building PDF diagrams (single page per diagram)..."
  
  # Check if puppeteer is available
  if ! npx -y puppeteer browsers list 2>/dev/null | grep -q "chrome"; then
    echo "⚠️  Installing Chrome for Puppeteer (this may take a moment)..."
    npx -y puppeteer browsers install chrome-headless-shell || true
  fi
  
  # Use custom Node.js script for better PDF rendering
  if [ -f "$INPUT_DIR/render-pdf.js" ]; then
    cd "$INPUT_DIR"
    node render-pdf.js
    cd - > /dev/null
  else
    echo "⚠️  render-pdf.js not found, falling back to mmdc..."
    while IFS= read -r file; do
      filename=$(basename "$file" .mmd)
      output="$PDF_OUTPUT_DIR/$filename.pdf"
      echo "  → $filename.pdf"
      npx mmdc -i "$file" -o "$output" 2>&1 | grep -v "^Generating single mermaid chart" || true
    done < <(find "$INPUT_DIR" -maxdepth 1 -name "*.mmd" -type f | sort)
    
    echo "✅ PDF diagrams built successfully"
  fi
fi

echo ""
echo "🎉 All diagrams built successfully!"
echo ""
echo "📁 Output locations:"
echo "  SVG: $SVG_OUTPUT_DIR"
echo "  PNG: $PNG_OUTPUT_DIR (4x resolution)"
echo "  PDF: $PDF_OUTPUT_DIR (Google Drive compatible)"

# Ensure cleanup on exit
# trap "echo '🧹 Cleaning up temporary files...'; rm -rf $SVG_OUTPUT_DIR $PNG_OUTPUT_DIR $PDF_OUTPUT_DIR" EXIT

