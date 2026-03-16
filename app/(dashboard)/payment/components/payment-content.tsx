"use client";

import { useCallback, useEffect, useState } from "react";

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

import { Pagination } from "@/components/pagination/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAvailablePlansAction, getSubscriptionDetailsAction, handlePaymentSuccessAction } from "@/lib/features/pricing/actions/subscription.actions";

import { PaymentMethodSection } from "./payment-method-section";

interface PaymentContentProps {
	page: number;
	pageSize: number;
	status?: string;
	planId?: string;
}

export function PaymentContent({ page, pageSize, status, planId }: PaymentContentProps) {
	const [subscription, setSubscription] = useState<any>(null);
	const [history, setHistory] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPlan, setCurrentPlan] = useState<any>(null);

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// Handle payment success - create invoice if needed
			if (status === "success" && planId) {
				try {
					// Get plan details
					const plansResult = await getAvailablePlansAction();
					const plansData = plansResult.data as any;
					if (plansResult.success && plansData?.plans) {
						const plan = plansData.plans.find((p: any) => p.id === planId);
						if (plan && plan.monthlyPrice > 0) {
							// Create invoice for paid plan
							const billingPeriodStart = new Date();
							const billingPeriodEnd = new Date();
							billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1);

							await handlePaymentSuccessAction({
								userId: "", // This will be handled server-side
								planId: plan.id,
								paymentId: "stripe_" + Date.now(), // TODO: Get from Stripe webhook
								amount: plan.monthlyPrice,
								currency: "USD",
								billingPeriodStart,
								billingPeriodEnd,
							});
						}
					}
				} catch (error) {
					console.error("Error processing payment success:", error);
				}
			}

			// Get subscription details
			const result = await getSubscriptionDetailsAction();

			if (!result.success || !result.data) {
				setError("Failed to load payment details");
				return;
			}

			const data = result.data as any;
			setSubscription(data);
			setHistory(data?.history || []);
			setCurrentPlan(data?.currentPlan);
		} catch (err) {
			console.error("Error loading payment data:", err);
			setError("Failed to load payment data");
		} finally {
			setLoading(false);
		}
	}, [status, planId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	// Pagination logic for payment history
	const totalHistory = history.length;
	const totalPages = Math.ceil(totalHistory / pageSize);
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedHistory = history.slice(startIndex, endIndex);

	return (
		<div className="space-y-6">
			{/* Breadcrumb */}
			<div className="text-muted-foreground flex items-center gap-2 text-sm">
				<Link
					href="/pricing"
					className="hover:text-foreground">
					Pricing
				</Link>
				<span>/</span>
				<span>Payment</span>
			</div>

			{/* Success Message */}
			{status === "success" && (
				<Alert className="border-green-200 bg-green-50 dark:border-green-950 dark:bg-green-950">
					<CheckCircle className="h-4 w-4 text-green-600" />
					<AlertDescription className="text-green-700 dark:text-green-300">✓ Your plan has been successfully activated! Welcome to {currentPlan?.displayName || "your new plan"}.</AlertDescription>
				</Alert>
			)}

			{/* Payment Method */}
			<PaymentMethodSection subscription={subscription?.subscription} />

			{/* Payment History Table */}
			{history && history.length > 0 ? (
				<div className="space-y-4">
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Plan Change</TableHead>
									<TableHead className="text-right">Amount</TableHead>
									<TableHead className="text-right">Currency</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedHistory.map((record: any) => (
									<TableRow key={record.id}>
										<TableCell className="font-medium">{new Date(record.createdAt).toLocaleDateString()}</TableCell>
										<TableCell>{record.actionType.replace(/_/g, " ").toLowerCase()}</TableCell>
										<TableCell>
											{record.fromPlan && record.toPlan ? (
												<span className="text-muted-foreground text-sm">
													{record.fromPlan.displayName} → {record.toPlan.displayName}
												</span>
											) : record.toPlan ? (
												<span className="text-muted-foreground text-sm">→ {record.toPlan.displayName}</span>
											) : record.fromPlan ? (
												<span className="text-muted-foreground text-sm">{record.fromPlan.displayName} →</span>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell className="text-right font-semibold">
											{record.amount > 0 ? "+" : "-"}${Math.abs(record.amount).toFixed(2)}
										</TableCell>
										<TableCell className="text-right">{record.currency || "USD"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<Pagination
							page={page}
							total={totalHistory}
							pageSize={pageSize}
							itemName="payments"
							baseUrl="/payment"
						/>
					)}
				</div>
			) : (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No payment history yet</p>
					<p className="text-muted-foreground mt-2 text-sm">Your payment transactions will appear here</p>
				</div>
			)}

			{/* Quick Actions */}
			<Card className="bg-muted/50">
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">Manage your billing and subscription settings</p>
					<div className="flex gap-2">
						<Link href="/billing">
							<Button variant="outline">Manage Billing</Button>
						</Link>
						<Link href="/pricing">
							<Button variant="outline">Change Plan</Button>
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* Help Section */}
			<Card className="bg-muted/50">
				<CardHeader>
					<CardTitle>Need Help?</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">If you have any questions about your payments or need assistance, please contact our support team.</p>
					<div className="flex gap-2">
						<Link href="/help">
							<Button variant="outline">View Help Center</Button>
						</Link>
						<Link href="/contact-us">
							<Button variant="outline">Contact Support</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
