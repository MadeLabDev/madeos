"use client";

import { useState } from "react";

import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEMO_ACCOUNTS, isDevMode } from "@/lib/utils/dev-mode";

/**
 * Demo Accounts Panel
 * Shows demo login credentials (only in dev mode)
 */
export function DemoAccountsPanel() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

	if (!isDevMode()) return null;

	const copyToClipboard = (text: string, type: "email" | "password") => {
		navigator.clipboard.writeText(text);
		setCopiedEmail(text);
		toast.success(`${type === "email" ? "Email" : "Password"} copied to clipboard`);

		setTimeout(() => {
			setCopiedEmail(null);
		}, 2000);
	};

	return (
		<Card className="mb-6 border-yellow-500 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-950/20">
			<div className="px-6">
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className="flex w-full items-center justify-between text-left">
					<div>
						<h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Demo Accounts (Development Only)</h3>
						<p className="text-xs text-yellow-700 dark:text-yellow-400">Test accounts for quick login</p>
					</div>
					{isExpanded ? <ChevronUp className="h-5 w-5 text-yellow-800 dark:text-yellow-300" /> : <ChevronDown className="h-5 w-5 text-yellow-800 dark:text-yellow-300" />}
				</button>

				{isExpanded && (
					<div className="mt-4 space-y-3">
						{DEMO_ACCOUNTS.map((account) => (
							<div
								key={account.email}
								className="rounded-lg border border-yellow-200 bg-white p-3 dark:border-yellow-800 dark:bg-yellow-950/50">
								<div className="mb-2 flex items-center justify-between">
									<span className="text-sm font-medium text-yellow-900 dark:text-yellow-200">{account.role}</span>
									<span className="text-xs text-yellow-700 dark:text-yellow-400">{account.description}</span>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<code className="flex-1 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200">{account.email}</code>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => copyToClipboard(account.email, "email")}
											className="h-7 w-7 p-0">
											{copiedEmail === account.email ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
										</Button>
									</div>

									<div className="flex items-center gap-2">
										<code className="flex-1 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200">{account.password}</code>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => copyToClipboard(account.password, "password")}
											className="h-7 w-7 p-0">
											{copiedEmail === account.password ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</Card>
	);
}
