"use client";

import { useCallback, useEffect, useState } from "react";

import { AlertCircle, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Pagination } from "@/components/pagination/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvoiceDetailsAction, getInvoicesAction, getSubscriptionDetailsAction } from "@/lib/features/pricing/actions/subscription.actions";
import { ClientPDFGenerator } from "@/lib/utils/pdf-generator";

interface BillingContentProps {
	page: number;
	pageSize: number;
}

export function BillingContent({ page, pageSize }: BillingContentProps) {
	const [subscription, setSubscription] = useState<any>(null);
	const [invoices, setInvoices] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPlan, setCurrentPlan] = useState<any>(null);
	const [downloadingInvoices, setDownloadingInvoices] = useState<Set<string>>(new Set());

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const [subscriptionResult, invoicesResult] = await Promise.all([getSubscriptionDetailsAction(), getInvoicesAction()]);

			if (subscriptionResult.success) {
				const data = subscriptionResult.data as any;
				setSubscription(data);
				setCurrentPlan(data?.currentPlan);
			} else {
				setError(subscriptionResult.message || "Failed to load subscription details");
			}

			if (invoicesResult.success) {
				setInvoices((invoicesResult.data as any) || []);
			} else {
				setError(invoicesResult.message || "Failed to load invoices");
			}
		} catch (err) {
			console.error("Error loading billing data:", err);
			setError("Failed to load billing data");
		} finally {
			setLoading(false);
		}
	}, []);

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

	// Pagination logic for invoices
	const totalInvoices = invoices.length;
	const totalPages = Math.ceil(totalInvoices / pageSize);
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedInvoices = invoices.slice(startIndex, endIndex);

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
				<span>Billing</span>
			</div>

			{/* Current Plan Overview */}
			<Card>
				<CardHeader>
					<CardTitle>Current Plan</CardTitle>
					<CardDescription>Your active subscription details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-2xl font-bold">{currentPlan?.displayName}</p>
							<p className="text-muted-foreground">${currentPlan?.monthlyPrice.toFixed(2)}/month</p>
						</div>
						<div className="flex gap-2">
							<Link href="/pricing">
								<Button variant="outline">Change Plan</Button>
							</Link>
							<Link href="/payment">
								<Button variant="outline">Payment History</Button>
							</Link>
						</div>
					</div>

					{subscription && (
						<div className="grid grid-cols-2 gap-4 border-t pt-4">
							<div>
								<p className="text-muted-foreground text-sm">Status</p>
								<p className="font-medium capitalize">{subscription.status}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Active Since</p>
								<p className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p>
							</div>
							{subscription.renewalDate && (
								<div>
									<p className="text-muted-foreground text-sm">Next Billing</p>
									<p className="font-medium">{new Date(subscription.renewalDate).toLocaleDateString()}</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Recent Invoices */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Invoices</CardTitle>
					<CardDescription>Download your billing statements</CardDescription>
				</CardHeader>
				<CardContent>
					{invoices.length > 0 ? (
						<div className="space-y-3">
							{paginatedInvoices.map((invoice: any) => {
								const isDownloading = downloadingInvoices.has(invoice.id);
								const status = invoice.status || "paid"; // Default to paid if no status
								const statusColor = status === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";

								return (
									<div
										key={invoice.id}
										className="flex items-center justify-between rounded-lg border p-4">
										<div className="flex-1">
											<div className="mb-1 flex items-center gap-2">
												<p className="text-sm font-medium">{invoice.invoiceNumber}</p>
												<Badge
													variant="secondary"
													className={`text-xs ${statusColor}`}>
													{status.charAt(0).toUpperCase() + status.slice(1)}
												</Badge>
											</div>
											<p className="text-muted-foreground text-xs">{new Date(invoice.issuedAt).toLocaleDateString()}</p>
											<p className="text-muted-foreground text-xs font-medium">${invoice.amount.toFixed(2)}</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											disabled={isDownloading}
											onClick={async () => {
												setDownloadingInvoices((prev) => new Set(prev).add(invoice.id));
												try {
													const result = await getInvoiceDetailsAction(invoice.id);
													if (result.success && result.data) {
														ClientPDFGenerator.generateInvoicePDF(result.data as any);
														toast.success("Invoice downloaded successfully");
													} else {
														toast.error(result.message || "Failed to get invoice details");
													}
												} catch (error) {
													console.error("Error downloading invoice:", error);
													toast.error("Failed to download invoice. Please try again.");
												} finally {
													setDownloadingInvoices((prev) => {
														const newSet = new Set(prev);
														newSet.delete(invoice.id);
														return newSet;
													});
												}
											}}>
											{isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
											{isDownloading ? "Downloading..." : "Download"}
										</Button>
									</div>
								);
							})}

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="pt-4">
									<Pagination
										page={page}
										total={totalInvoices}
										pageSize={pageSize}
										itemName="invoices"
										baseUrl="/billing"
									/>
								</div>
							)}
						</div>
					) : (
						<div className="py-12 text-center">
							<div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
								<Download className="text-muted-foreground h-6 w-6" />
							</div>
							<p className="text-muted-foreground font-medium">No invoices yet</p>
							<p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">Invoices will appear here after your first payment. You'll be able to download PDF copies of all your billing statements.</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
