#!/usr/bin/env zsh
set -euo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "$0")/.." && pwd)
DIAGRAM_DIR="$ROOT_DIR/@data/diagrams"
OUT_SVG_DIR="$DIAGRAM_DIR/out-svg"
OUT_PNG_DIR="$DIAGRAM_DIR/out-png"

mkdir -p "$OUT_SVG_DIR" "$OUT_PNG_DIR"

# Prefer local puppeteer cache if present to avoid permission issues
if [ -d "$ROOT_DIR/.puppeteer-cache" ]; then
  export PUPPETEER_CACHE_DIR="$ROOT_DIR/.puppeteer-cache"
  # Try to locate chrome-headless-shell executable
  EXEC_PATH=$(find "$ROOT_DIR/.puppeteer-cache" -type f -name chrome-headless-shell 2>/dev/null | head -n 1 || true)
  if [ -n "${EXEC_PATH:-}" ]; then
    export PUPPETEER_EXECUTABLE_PATH="$EXEC_PATH"
  fi
fi

if ! command -v mmdc >/dev/null 2>&1; then
  echo "Mermaid CLI (mmdc) not found. Install dev dependency first: yarn add -D @mermaid-js/mermaid-cli" >&2
  exit 1
fi

for file in "$DIAGRAM_DIR"/*.mmd; do
  [ -e "$file" ] || continue
  base=${file:t:r}
  echo "Rendering $base ..."
  mmdc -i "$file" -o "$OUT_SVG_DIR/$base.svg" -b transparent
  mmdc -i "$file" -o "$OUT_PNG_DIR/$base.png" -b transparent -s 2
done

echo "Done. SVGs: $OUT_SVG_DIR | PNGs: $OUT_PNG_DIR"
