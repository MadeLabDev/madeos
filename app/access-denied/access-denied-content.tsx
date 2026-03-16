"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessDeniedContent() {
	const searchParams = useSearchParams();
	const pathname = searchParams.get("pathname");
	const moduleName = searchParams.get("module");
	const action = searchParams.get("action");

	return (
		<div className="bg-background flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mb-4 flex justify-center">
						<AlertCircle className="h-12 w-12 text-red-500" />
					</div>
					<CardTitle className="text-2xl">Access Denied</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6 text-center">
					<div className="space-y-2">
						<p className="text-muted-foreground">You don't have permission to access this page.</p>
						<p className="text-muted-foreground text-sm">If you believe this is an error, please contact your administrator.</p>
					</div>

					{(moduleName || action) && (
						<div className="bg-muted space-y-1 rounded-lg p-3 text-left text-sm">
							{moduleName && (
								<p className="text-muted-foreground">
									<strong>Module:</strong> {moduleName}
								</p>
							)}
							{action && (
								<p className="text-muted-foreground">
									<strong>Required Action:</strong> {action}
								</p>
							)}
						</div>
					)}

					<div className="flex justify-center gap-3">
						<Button
							variant="outline"
							onClick={() => window.history.back()}>
							Go Back
						</Button>
						<Link href="/dashboard">
							<Button>Go to Dashboard</Button>
						</Link>
					</div>

					{pathname && <p className="text-muted-foreground pt-2 text-xs">Attempted access: {pathname}</p>}
				</CardContent>
			</Card>
		</div>
	);
}
