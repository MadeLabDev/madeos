#!/usr/bin/env node

/**
 * Script to add metadata to all pages that don't have it yet
 * This ensures consistent SEO and social sharing across the application
 */

const fs = require('fs'); // eslint-disable-line @typescript-eslint/no-require-imports
const path = require('path'); // eslint-disable-line @typescript-eslint/no-require-imports

const APP_DIR = path.join(__dirname, '..', 'app');

// Pages that should have auth metadata
const AUTH_PAGES = [
  'auth/signout/page.tsx',
  'auth/activate/page.tsx',
];

// Pages that should have dashboard metadata
const DASHBOARD_PAGES = [
  'access-denied/page.tsx',
  'editor-x/page.tsx',
];

// CRUD entities and their metadata
const CRUD_ENTITIES = {
  'user-groups': 'User Groups',
  'medias': 'Media Files',
  'knowledge': 'Knowledge Base',
  'profile': 'Profile',
  'form-data': 'Form Data',
};

// Skip these pages (already have metadata or don't need it)
const SKIP_PAGES = [
  'page.tsx', // Home page - already done
  'not-found.tsx', // Already has metadata
  'error.tsx', // Client component
  'global-error.tsx', // Client component
  'icon.tsx', // Not a page
  '(dashboard)/dashboard/page.tsx', // Already done
  '(dashboard)/users/page.tsx', // Already done
  '(dashboard)/customers/page.tsx', // Already done
  '(dashboard)/settings/page.tsx', // Already done
  '(dashboard)/roles/page.tsx', // Already done
  '(dashboard)/course/page.tsx', // Already done
  'auth/signin/page.tsx', // Already done
  'auth/forgot-password/page.tsx', // Already done
  'auth/reset-password/page.tsx', // Already done
];

function shouldSkipPage(pagePath) {
  const relativePath = path.relative(APP_DIR, pagePath);
  return SKIP_PAGES.some(skipPath => relativePath === skipPath);
}

function getMetadataImport(pagePath) {
  if (pagePath.includes('/auth/')) {
    return "import { generateAuthMetadata } from '@/lib/utils/metadata';";
  } else if (pagePath.includes('/(dashboard)/')) {
    return "import { generateCrudMetadata } from '@/lib/utils/metadata';";
  }
  return "import { generatePageMetadata } from '@/lib/utils/metadata';";
}

function getMetadataDeclaration(pagePath, entityName) {
  if (pagePath.includes('/auth/')) {
    const pageName = path.basename(path.dirname(pagePath)).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `export const metadata = generateAuthMetadata("${pageName}");`;
  } else if (pagePath.includes('/(dashboard)/')) {
    if (entityName) {
      return `export const metadata = generateCrudMetadata('${entityName}');`;
    }
    return `export const metadata = generateDashboardMetadata("Page");`;
  }
  return `export const metadata = generatePageMetadata("Page");`;
}

function findPageFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findPageFiles(fullPath, files);
    } else if (item === 'page.tsx') {
      files.push(fullPath);
    }
  }

  return files;
}

function processPageFile(filePath) {
  if (shouldSkipPage(filePath)) {
    console.log(`⏭️  Skipping ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Check if already has metadata
  if (content.includes('export const metadata') || content.includes('generateMetadata')) {
    console.log(`✅ Already has metadata: ${filePath}`);
    return;
  }

  console.log(`📝 Processing ${filePath}`);

  // Determine entity name for CRUD pages
  let entityName = null;
  for (const [dir, name] of Object.entries(CRUD_ENTITIES)) {
    if (filePath.includes(`/${dir}/`)) {
      entityName = name;
      break;
    }
  }

  // If it's a detail/edit/new page, try to infer from parent directory
  if (!entityName && filePath.includes('/(dashboard)/')) {
    const parts = filePath.split('/');
    const dashboardIndex = parts.findIndex(p => p === '(dashboard)');
    if (dashboardIndex !== -1 && dashboardIndex + 1 < parts.length) {
      const entityDir = parts[dashboardIndex + 1];
      entityName = CRUD_ENTITIES[entityDir] || entityDir.charAt(0).toUpperCase() + entityDir.slice(1);
    }
  }

  const importStatement = getMetadataImport(filePath);
  const metadataDeclaration = getMetadataDeclaration(filePath, entityName);

  // Find the first import line to insert after
  const lines = content.split('\n');
  let insertIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import') || line.startsWith('export const dynamic')) {
      insertIndex = i + 1;
    } else if (line.startsWith('export default') || line.startsWith('function') || line.startsWith('const')) {
      break;
    }
  }

  // Insert import and metadata before the first non-import/export line
  let newContent = '';
  let metadataInserted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Insert import after the last import
    if (trimmedLine.startsWith('import') && !metadataInserted) {
      newContent += line + '\n';
      continue;
    }

    // Insert metadata after imports but before other code
    if (!trimmedLine.startsWith('import') && !trimmedLine.startsWith('export const dynamic') && !metadataInserted) {
      if (!content.includes(importStatement.replace("import {", "").replace("} from", "").replace("'", "").replace(";", ""))) {
        newContent += importStatement + '\n';
      }
      newContent += '\n' + metadataDeclaration + '\n\n';
      metadataInserted = true;
    }

    newContent += line + '\n';
  }

  fs.writeFileSync(filePath, newContent.trim());
  console.log(`✅ Added metadata to ${filePath}`);
}

function main() {
  console.log('🔍 Finding all page files...');
  const pageFiles = findPageFiles(APP_DIR);

  console.log(`📋 Found ${pageFiles.length} page files`);
  console.log('🔧 Adding metadata...\n');

  let processed = 0;
  for (const file of pageFiles) {
    try {
      processPageFile(file);
      processed++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n✅ Processed ${processed} pages`);
  console.log('🎉 Metadata addition complete!');
}

if (require.main === module) {
  main();
}