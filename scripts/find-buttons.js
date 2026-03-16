#!/usr/bin/env node

const fs = require('fs'); // eslint-disable-line @typescript-eslint/no-require-imports
const path = require('path'); // eslint-disable-line @typescript-eslint/no-require-imports

/**
 * Script to find ALL buttons in dashboard pages and check for icons
 */

function findButtonsInFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Find all Button components (both regular and self-closing)
        const buttonRegex = /<Button[\s\S]*?<\/Button>/g;
        const selfClosingButtonRegex = /<Button[^>]*\/>/g;

        const buttons = [];
        let match;

        // Reset regex lastIndex
        buttonRegex.lastIndex = 0;
        selfClosingButtonRegex.lastIndex = 0;

        // Find regular buttons
        while ((match = buttonRegex.exec(content)) !== null) {
            const buttonContent = match[0];

            // Check if button has icon (lucide icons, Loader, or any icon class)
            const hasIcon = /<([A-Z][a-zA-Z0-9]*)\s+className="[^"]*(h-4 w-4|w-4 h-4|h-3 w-3|w-3 h-3)[^"]*"|<Loader|className="[^"]*\b(lucide|icon)\b/.test(buttonContent);

            // Extract button text (remove nested components and whitespace)
            let innerContent = buttonContent.replace(/^<Button[^>]*>/, '').replace(/<\/Button>$/, '');
            const textContent = innerContent.replace(/<[^>]+>/g, '').trim();

            // Skip if it's just whitespace or empty
            if (!textContent || textContent.length === 0) continue;

            // Skip buttons that are clearly just icons (no text)
            if (!innerContent.includes(textContent) && innerContent.trim().length < 10) continue;

            buttons.push({
                text: textContent,
                content: buttonContent.length > 150 ? buttonContent.substring(0, 150) + '...' : buttonContent,
                hasIcon: hasIcon,
                lineNumber: getLineNumber(content, match.index)
            });
        }

        // Find self-closing buttons (usually icon-only buttons)
        while ((match = selfClosingButtonRegex.exec(content)) !== null) {
            const buttonContent = match[0];

            // Check if button has icon
            const hasIcon = /<([A-Z][a-zA-Z0-9]*)\s+className="[^"]*(h-4 w-4|w-4 h-4|h-3 w-3|w-3 h-3)[^"]*"|<Loader|className="[^"]*\b(lucide|icon)\b/.test(buttonContent);

            buttons.push({
                text: 'Icon Button',
                content: buttonContent,
                hasIcon: hasIcon,
                lineNumber: getLineNumber(content, match.index)
            });
        }

        return buttons;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return [];
    }
}

function getLineNumber(content, index) {
    const lines = content.substring(0, index).split('\n');
    return lines.length;
}

function scanDirectory(dirPath, results = []) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath, results);
        } else if (item.endsWith('.tsx') && fullPath.includes('app/(dashboard)')) {
            const buttons = findButtonsInFile(fullPath);
            if (buttons.length > 0) {
                results.push({
                    file: path.relative(process.cwd(), fullPath),
                    buttons: buttons
                });
            }
        }
    }

    return results;
}

function main() {
    console.log('🔍 Scanning for ALL buttons in dashboard pages...\n');

    const dashboardPath = path.join(process.cwd(), 'app/(dashboard)');
    const results = scanDirectory(dashboardPath);

    if (results.length === 0) {
        console.log('✅ No buttons found in dashboard pages!');
        return;
    }

    let totalButtons = 0;
    let buttonsWithoutIcons = 0;

    results.forEach(result => {
        console.log(`📄 ${result.file}:`);
        result.buttons.forEach(button => {
            totalButtons++;
            const iconStatus = button.hasIcon ? '✅' : '❌';
            console.log(`  ${iconStatus} "${button.text}"`);
            if (!button.hasIcon) {
                buttonsWithoutIcons++;
                // Show more context for buttons without icons
                console.log(`    📍 Line ${button.lineNumber}: ${button.content}`);
            }
        });
        console.log('');
    });

    console.log(`📊 Summary:`);
    console.log(`  Total buttons found: ${totalButtons}`);
    console.log(`  Buttons without icons: ${buttonsWithoutIcons}`);
    console.log(`  Buttons with icons: ${totalButtons - buttonsWithoutIcons}`);

    if (buttonsWithoutIcons > 0) {
        console.log('\n💡 Suggested icons based on button text:');
        console.log('  - "Edit", "Update" → Pencil icon');
        console.log('  - "Create", "Add", "New" → Plus icon');
        console.log('  - "Delete", "Remove" → Trash2 icon');
        console.log('  - "Save", "Submit" → Save icon');
        console.log('  - "Cancel", "Close" → X icon');
        console.log('  - "Search" → Search icon');
        console.log('  - "Back" → ArrowLeft icon');
        console.log('  - "View" → Eye icon');
        console.log('  - "Download" → Download icon');
        console.log('  - "Upload" → Upload icon');
    }
}

if (require.main === module) {
    main();
}

module.exports = { findButtonsInFile, scanDirectory };