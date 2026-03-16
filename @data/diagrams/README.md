# Diagrams Export (Mermaid → SVG/PNG)

This folder contains Mermaid source files (.mmd) for system diagrams. You can export to SVG/PNG for Figma import.

## Quick Start

1) Install Mermaid CLI dev dependency (one-time):

```sh
yarn add -D @mermaid-js/mermaid-cli
sudo npx puppeteer browsers install chrome-headless-shell
npx puppeteer browsers list
```

2) Render all diagrams (SVG + PNG):

```sh
sudo yarn diagrams:build
```

Outputs:

- SVG: @data/diagrams/out-svg/*.svg (recommended for Figma)
- PNG: @data/diagrams/out-png/*.png

Alternatively, render only one format:


```sh
yarn diagrams:build:svg
# or
yarn diagrams:build:png
```

## Figma Import Tips

- Drag & drop the .svg files into your Figma file. They are vector and editable.
- For complex labels, group elements in Figma after import for easier handling.
- Use Figma styles for colors/typography to align with your design system.

---

Source Mermaid files:

- system-context.mmd
- data-model-er.mmd
- rbac-flow.mmd
- knowledge-visibility.mmd
- dynamic-modules.mmd
- media-upload-seq.mmd
- external-form-data.mmd
