#!/usr/bin/env node

/**
 * Form Audit Script
 * Scans all form files against the standard template requirements
 * Based on FORM_AUDIT_PLAN.md
 */

import fs from "fs";
import path from "path";

interface AuditResult {
	filePath: string;
	fileName: string;
	category: string;
	status: "✅" | "⚠️" | "🔴";
	issues: string[];
	suggestions: string[];
}

const FORM_PATTERNS = {
	hasHeader: /div.*className=.*space-y-6/,
	hasTitle: /h1.*className=.*font-bold/,
	hasSubtitle: /p.*className=.*muted-foreground/,
	hasCancelButton: /<Button.*onClick.*handleCancel/s,
	hasSaveIcon: /Save|Plus|Edit/,
	hasXIcon: /X\s*from|X\s*className|<X\s+className/,
	hasLoader: /Loader|<Loader/,
	hasIsSubmitting: /isSubmitting/,
	hasHideButtons: /hideButtons={true}/,
	hasDisabledState: /disabled={isSubmitting}/,
	hasDataAttribute: /data-[a-z-]*-form/,
};

const REQUIRED_FEATURES = {
	"wrapper-form": [
		"hasHeader",
		"hasTitle",
		"hasSubtitle",
		"hasCancelButton",
		"hasSaveIcon",
		"hasXIcon",
		"hasLoader",
		"hasIsSubmitting",
		"hasDataAttribute",
		"hasDisabledState",
	],
	"reusable-form": ["hasHideButtons", "hasDataAttribute"],
};

function detectFormType(filePath: string): "wrapper-form" | "reusable-form" | "unknown" {
	const fileName = path.basename(filePath);
	if (fileName.startsWith("new-") || fileName.startsWith("edit-")) {
		return "wrapper-form";
	}
	if (fileName.endsWith("-form.tsx") && !fileName.startsWith("new-") && !fileName.startsWith("edit-")) {
		return "reusable-form";
	}
	return "unknown";
}

function getCategory(filePath: string): string {
	const parts = filePath.split("/");
	const dashboardIndex = parts.indexOf("(dashboard)");
	if (dashboardIndex !== -1) {
		return parts[dashboardIndex + 1] || "unknown";
	}
	return "unknown";
}

function auditFile(filePath: string): AuditResult {
	const content = fs.readFileSync(filePath, "utf-8");
	const fileName = path.basename(filePath);
	const formType = detectFormType(filePath);
	const category = getCategory(filePath);

	const result: AuditResult = {
		filePath,
		fileName,
		category,
		status: "✅",
		issues: [],
		suggestions: [],
	};

	if (formType === "unknown") {
		result.status = "🔴";
		result.issues.push("Cannot determine form type");
		return result;
	}

	const requiredFeatures = REQUIRED_FEATURES[formType];
	let missingCount = 0;

	for (const feature of requiredFeatures) {
		const pattern = FORM_PATTERNS[feature as keyof typeof FORM_PATTERNS];
		if (!pattern.test(content)) {
			missingCount++;
			result.issues.push(`Missing: ${feature}`);

			// Add suggestions
			if (feature === "hasSaveIcon" && formType === "wrapper-form") {
				result.suggestions.push("Add Save icon from lucide-react or Plus icon");
			} else if (feature === "hasXIcon" && formType === "wrapper-form") {
				result.suggestions.push("Add X icon from lucide-react");
			} else if (feature === "hasLoader" && formType === "wrapper-form") {
				result.suggestions.push("Import Loader component from @/components/ui/loader");
			} else if (feature === "hasIsSubmitting" && formType === "wrapper-form") {
				result.suggestions.push("Add isSubmitting state with useState or useTransition");
			} else if (feature === "hasDisabledState" && formType === "wrapper-form") {
				result.suggestions.push("Add disabled={isSubmitting} to buttons");
			} else if (feature === "hasHideButtons" && formType === "reusable-form") {
				result.suggestions.push("Add hideButtons prop interface and conditional button rendering");
			}
		}
	}

	if (missingCount === 0) {
		result.status = "✅";
	} else if (missingCount <= 2) {
		result.status = "⚠️";
	} else {
		result.status = "🔴";
	}

	return result;
}

function findAllFormFiles(): string[] {
	const dashboardPath = path.join(process.cwd(), "app", "(dashboard)");

	if (!fs.existsSync(dashboardPath)) {
		console.error("Dashboard path not found:", dashboardPath);
		return [];
	}

	const files: string[] = [];

	function walkDir(dir: string) {
		const entries = fs.readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				walkDir(fullPath);
			} else if (entry.isFile() && entry.name.endsWith("-form.tsx")) {
				files.push(fullPath);
			}
		}
	}

	walkDir(dashboardPath);
	return files;
}

function generateReport(results: AuditResult[]) {
	console.log("\n" + "=".repeat(80));
	console.log("FORM AUDIT REPORT");
	console.log("=".repeat(80) + "\n");

	// Summary
	const total = results.length;
	const passed = results.filter((r) => r.status === "✅").length;
	const warning = results.filter((r) => r.status === "⚠️").length;
	const failed = results.filter((r) => r.status === "🔴").length;

	console.log(`📊 SUMMARY`);
	console.log(`  ✅ Passed: ${passed}/${total}`);
	console.log(`  ⚠️  Warning: ${warning}/${total}`);
	console.log(`  🔴 Failed: ${failed}/${total}`);
	console.log();

	// By Category
	const byCategory: Record<string, AuditResult[]> = {};
	results.forEach((r) => {
		if (!byCategory[r.category]) {
			byCategory[r.category] = [];
		}
		(byCategory[r.category] as AuditResult[]).push(r);
	});

	console.log(`📂 BY CATEGORY`);
	Object.entries(byCategory)
		.sort()
		.forEach(([category, items]) => {
			const catPassed = items?.filter((r) => r.status === "✅").length ?? 0;
			const catWarning = items?.filter((r) => r.status === "⚠️").length ?? 0;
			const catFailed = items?.filter((r) => r.status === "🔴").length ?? 0;
			console.log(`  ${category}: ${catPassed}✅ ${catWarning}⚠️ ${catFailed}🔴 (${items?.length ?? 0})`);
		});

	console.log("\n" + "=".repeat(80));
	console.log("DETAILED RESULTS");
	console.log("=".repeat(80) + "\n");

	// Failed & Warning items
	const problemItems = results.filter((r) => r.status !== "✅");

	problemItems.forEach((result) => {
		console.log(`${result.status} ${result.fileName}`);
		console.log(`   Path: ${result.filePath}`);
		if (result.issues.length > 0) {
			console.log(`   Issues:`);
			result.issues.forEach((issue) => {
				console.log(`     - ${issue}`);
			});
		}
		if (result.suggestions.length > 0) {
			console.log(`   Suggestions:`);
			result.suggestions.forEach((suggestion) => {
				console.log(`     - ${suggestion}`);
			});
		}
		console.log();
	});

	// Save detailed report to JSON
	const reportPath = path.join(process.cwd(), "FORM_AUDIT_REPORT.json");
	fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
	console.log(`✅ Detailed report saved to: ${reportPath}`);
}

function main() {
	console.log("🔍 Scanning for form files...\n");

	const formFiles = findAllFormFiles();
	console.log(`Found ${formFiles.length} form files\n`);

	const results = formFiles.map((filePath) => {
		try {
			return auditFile(filePath);
		} catch (error) {
			console.error(`Error auditing ${filePath}:`, error);
			return {
				filePath,
				fileName: path.basename(filePath),
				category: "error",
				status: "🔴" as const,
				issues: ["Failed to audit file"],
				suggestions: [],
			};
		}
	});

	generateReport(results);
}

main();
