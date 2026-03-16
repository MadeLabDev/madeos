#!/usr/bin/env node

/**
 * Form Auto-Fix Script
 * Automatically fixes form issues based on audit results
 */

import fs from "fs";
import path from "path";

interface FormFix {
	filePath: string;
	issues: string[];
	fixes: { type: string; description: string }[];
}

const AUDIT_REPORT = process.argv[2] || "FORM_AUDIT_REPORT.json";

function readAuditReport(): any[] {
	const reportPath = path.join(process.cwd(), AUDIT_REPORT);
	if (!fs.existsSync(reportPath)) {
		console.error(`Audit report not found: ${reportPath}`);
		process.exit(1);
	}
	return JSON.parse(fs.readFileSync(reportPath, "utf-8"));
}

function isReusableForm(filePath: string): boolean {
	const fileName = path.basename(filePath);
	return fileName.endsWith("-form.tsx") && !fileName.startsWith("new-") && !fileName.startsWith("edit-");
}

function isWrapperForm(filePath: string): boolean {
	const fileName = path.basename(filePath);
	return fileName.startsWith("new-") || fileName.startsWith("edit-");
}

function addHideButtonsToReusableForm(content: string): string {
	// Check if already has hideButtons
	if (content.includes("hideButtons")) {
		return content;
	}

	// Find interface and add hideButtons prop
	const interfaceMatch = content.match(/interface\s+(\w+Props)\s*\{([^}]+)\}/s);
	if (interfaceMatch) {
		const interfaceName = interfaceMatch[1];
		const interfaceBody = interfaceMatch[2];

		if (!interfaceBody.includes("hideButtons")) {
			const newInterfaceBody = interfaceBody + "\n  hideButtons?: boolean;";
			content = content.replace(interfaceMatch[0], `interface ${interfaceName} {${newInterfaceBody}}`);
		}
	}

	// Add hideButtons destructuring to function
	const functionMatch = content.match(/export\s+function\s+\w+\(\s*\{([^}]+)\}\s*:/s);
	if (functionMatch && !functionMatch[1].includes("hideButtons")) {
		const destructured = functionMatch[1];
		const newDestructured = destructured + ", hideButtons = false";
		content = content.replace(
			/export\s+function\s+\w+\(\s*\{([^}]+)\}\s*:/,
			(match) => match.replace(destructured, newDestructured)
		);
	}

	// Wrap submit button with conditional
	const submitButtonMatch = content.match(/<button\s+type=["']submit["'][^>]*>[\s\S]*?<\/button>/);
	if (submitButtonMatch && !content.includes("!hideButtons")) {
		const submitButton = submitButtonMatch[0];
		const wrappedButton = `{!hideButtons && ${submitButton}}\n      {hideButtons && <button type="submit" hidden />}`;
		content = content.replace(submitButton, wrappedButton);
	}

	return content;
}

function addMissingIconsToWrapperForm(content: string, issues: string[]): string {
	if (!isWrapperForm(content)) return content;

	// Add X icon if missing
	if (issues.includes("Missing: hasXIcon") && !content.includes("X from")) {
		const saveImportMatch = content.match(/import\s*\{([^}]*Save[^}]*)\}\s*from\s*["']lucide-react["']/);
		if (saveImportMatch) {
			const imports = saveImportMatch[1];
			if (!imports.includes("X")) {
				content = content.replace(
					/import\s*\{([^}]*Save[^}]*)\}\s*from\s*["']lucide-react["']/,
					(match) => match.replace(saveImportMatch[1], imports.replace("Save", "Save, X"))
				);
			}
		}
	}

	// Add Save icon if missing
	if (issues.includes("Missing: hasSaveIcon") && !content.includes("Save from")) {
		const lucideImport = content.match(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/);
		if (lucideImport) {
			const imports = lucideImport[1];
			if (!imports.includes("Save")) {
				content = content.replace(lucideImport[0], lucideImport[0].replace(imports, imports + ", Save"));
			}
		}
	}

	return content;
}

function addLoadingStateToWrapperForm(content: string, issues: string[]): string {
	if (!isWrapperForm(content)) return content;

	// Check if it needs loading state
	const needsLoader = issues.includes("Missing: hasLoader");
	const needsSubmitting = issues.includes("Missing: hasIsSubmitting");
	const needsDisabled = issues.includes("Missing: hasDisabledState");

	if (!needsLoader && !needsSubmitting && !needsDisabled) {
		return content;
	}

	// Add Loader import if needed
	if (needsLoader && !content.includes("Loader")) {
		if (content.includes("import { toast }")) {
			content = content.replace(
				/import { toast }\s+from\s+["']sonner["']/,
				'import { Loader } from "@/components/ui/loader";\nimport { toast } from "sonner"'
			);
		}
	}

	// Add useState for isSubmitting if using useState
	if (needsSubmitting && !content.includes("useState") && content.includes("useTransition")) {
		// Already using useTransition, should be fine
	} else if (needsSubmitting && !content.includes("isSubmitting")) {
		if (content.includes("const [isSubmitting")) {
			// Already has isSubmitting
		} else if (content.includes("useTransition")) {
			// Using useTransition, replace with proper state
			content = content.replace(
				/const \[isSubmitting, startTransition\]\s*=\s*useTransition\(\);/,
				"const [isSubmitting, setIsSubmitting] = useState(false);"
			);
			content = content.replace(/import { useTransition }/, "import { useState }");
		}
	}

	// Add disabled state to buttons
	if (needsDisabled && !content.includes("disabled={isSubmitting}")) {
		// Find Cancel button and add disabled state
		content = content.replace(
			/(<Button[^>]*onClick={handleCancel}[^>]*>)/,
			"$1 disabled={isSubmitting}".replace(
				'disabled={isSubmitting} >',
				" disabled={isSubmitting}>"
			)
		);

		// Find Submit button and add disabled state
		content = content.replace(
			/(<Button[^>]*onClick={handleHeaderSubmit}[^>]*>)/,
			"$1 disabled={isSubmitting}".replace(
				'disabled={isSubmitting} >',
				" disabled={isSubmitting}>"
			)
		);
	}

	return content;
}

function applyFixes(result: any): FormFix {
	const filePath = result.filePath;
	const issues = result.issues;
	const fixes: FormFix["fixes"] = [];

	if (!fs.existsSync(filePath)) {
		return { filePath, issues, fixes: [{ type: "error", description: "File not found" }] };
	}

	let content = fs.readFileSync(filePath, "utf-8");
	const originalContent = content;

	// Apply fixes based on form type
	if (isReusableForm(filePath)) {
		if (issues.includes("Missing: hasHideButtons")) {
			content = addHideButtonsToReusableForm(content);
			fixes.push({ type: "hideButtons", description: "Added hideButtons prop" });
		}
	} else if (isWrapperForm(filePath)) {
		if (issues.some((i) => i.includes("Icon"))) {
			content = addMissingIconsToWrapperForm(content, issues);
			fixes.push({ type: "icons", description: "Added missing icons" });
		}

		if (issues.some((i) => i.includes("Loader") || i.includes("isSubmitting") || i.includes("Disabled"))) {
			content = addLoadingStateToWrapperForm(content, issues);
			fixes.push({ type: "loadingState", description: "Added loading state handling" });
		}
	}

	// Write back if changed
	if (content !== originalContent) {
		fs.writeFileSync(filePath, content, "utf-8");
	}

	return { filePath, issues, fixes };
}

function main() {
	const results = readAuditReport();
	const problemForms = results.filter((r: any) => r.status !== "✅");

	console.log("\n" + "=".repeat(80));
	console.log("FORM AUTO-FIX");
	console.log("=".repeat(80) + "\n");

	console.log(`🔧 Attempting to fix ${problemForms.length} forms...\n`);

	const fixedForms = problemForms.map(applyFixes);

	let successCount = 0;
	let errorCount = 0;

	fixedForms.forEach((result) => {
		if (result.fixes.some((f) => f.type === "error")) {
			console.log(`❌ ${path.basename(result.filePath)}: ${result.fixes[0].description}`);
			errorCount++;
		} else if (result.fixes.length > 0) {
			console.log(`✅ ${path.basename(result.filePath)}: ${result.fixes.map((f) => f.description).join(", ")}`);
			successCount++;
		} else {
			console.log(`⏭️  ${path.basename(result.filePath)}: No automatic fixes available`);
		}
	});

	console.log("\n" + "=".repeat(80));
	console.log(`✅ Fixed: ${successCount} | ❌ Errors: ${errorCount} | ⏭️  Manual Review: ${problemForms.length - successCount - errorCount}`);
	console.log("=".repeat(80) + "\n");
}

main();
