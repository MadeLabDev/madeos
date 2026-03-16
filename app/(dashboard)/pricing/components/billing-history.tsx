"use client";

import { useEffect, useState } from "react";

import { AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvoiceDetailsAction, getInvoicesAction, getSubscriptionHistoryAction } from "@/lib/features/pricing/actions";
import type { Invoice, SubscriptionHistoryRecord } from "@/lib/features/pricing/types";
import { formatDate } from "@/lib/utils";
import { ClientPDFGenerator } from "@/lib/utils/pdf-generator";

export function BillingHistory() {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [history, setHistory] = useState<SubscriptionHistoryRecord[]>([]);
	const [activeTab, setActiveTab] = useState<"invoices" | "history">("invoices");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			const [invoicesResult, historyResult] = await Promise.all([getInvoicesAction(), getSubscriptionHistoryAction()]);

			if (invoicesResult.success) setInvoices((invoicesResult.data as any) || []);
			if (historyResult.success) setHistory((historyResult.data as any) || []);
			setLoading(false);
		};
		load();
	}, []);

	const getStatusColor = (status: string) => {
		switch (status?.toUpperCase()) {
			case "PAID":
				return "bg-green-50 text-green-700 border-green-200";
			case "PENDING":
				return "bg-yellow-50 text-yellow-700 border-yellow-200";
			case "OVERDUE":
				return "bg-red-50 text-red-700 border-red-200";
			case "CANCELLED":
			case "REFUNDED":
				return "bg-gray-50 text-gray-700 border-gray-200";
			default:
				return "bg-blue-50 text-blue-700 border-blue-200";
		}
	};

	const getActionColor = (action: string) => {
		switch (action?.toUpperCase()) {
			case "UPGRADED":
				return "bg-blue-100 text-blue-800";
			case "DOWNGRADED":
				return "bg-orange-100 text-orange-800";
			case "CANCELLED":
				return "bg-red-100 text-red-800";
			case "REACTIVATED":
				return "bg-green-100 text-green-800";
			case "RENEWED":
				return "bg-purple-100 text-purple-800";
			case "CREATED":
			case "TRIAL_STARTED":
				return "bg-cyan-100 text-cyan-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (loading) return <div className="text-muted-foreground text-center">Loading history...</div>;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Billing & History</CardTitle>
				<CardDescription>View your invoices and subscription changes</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Tab Selection */}
				<div className="flex gap-2 border-b">
					<button
						onClick={() => setActiveTab("invoices")}
						className={`px-4 pb-2 text-sm font-medium transition-colors ${activeTab === "invoices" ? "text-primary border-primary border-b-2" : "text-muted-foreground hover:text-foreground"}`}>
						Invoices ({invoices.length})
					</button>
					<button
						onClick={() => setActiveTab("history")}
						className={`px-4 pb-2 text-sm font-medium transition-colors ${activeTab === "history" ? "text-primary border-primary border-b-2" : "text-muted-foreground hover:text-foreground"}`}>
						History ({history.length})
					</button>
				</div>

				{/* Invoices Tab */}
				{activeTab === "invoices" && (
					<div className="space-y-4">
						{invoices.length === 0 ? (
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>No invoices yet. Invoices will appear here after payment.</AlertDescription>
							</Alert>
						) : (
							<div className="space-y-3">
								{invoices.map((invoice) => (
									<div
										key={invoice.id}
										className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors">
										<div className="space-y-1">
											<p className="font-semibold">{invoice.invoiceNumber}</p>
											<p className="text-muted-foreground text-sm">
												{formatDate(new Date(invoice.billingPeriodStart))} - {formatDate(new Date(invoice.billingPeriodEnd))}
											</p>
										</div>

										<div className="flex items-center gap-4">
											<div className="text-right">
												<p className="font-semibold">${invoice.amount.toFixed(2)}</p>
												<Badge
													variant="outline"
													className={getStatusColor(invoice.status)}>
													{invoice.status}
												</Badge>
											</div>

											<Button
												variant="ghost"
												size="sm"
												onClick={async () => {
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
														toast.error("Failed to download invoice");
													}
												}}>
												<Download className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* History Tab */}
				{activeTab === "history" && (
					<div className="space-y-4">
						{history.length === 0 ? (
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>No subscription changes yet.</AlertDescription>
							</Alert>
						) : (
							<div className="space-y-3">
								{history.map((record) => (
									<div
										key={record.id}
										className="hover:bg-muted/50 rounded-lg border p-4 transition-colors">
										<div className="mb-2 flex items-start justify-between">
											<div>
												<Badge className={getActionColor(record.actionType)}>{record.actionType}</Badge>
											</div>
											<p className="text-muted-foreground text-sm">{formatDate(new Date(record.createdAt))}</p>
										</div>

										{record.reason && <p className="text-foreground mt-2 text-sm">{record.reason}</p>}

										{(record.fromPlanId || record.toPlanId) && (
											<p className="text-muted-foreground mt-2 text-xs">
												{record.fromPlanId && `From plan: ${record.fromPlanId}`}
												{record.fromPlanId && record.toPlanId && " → "}
												{record.toPlanId && `To plan: ${record.toPlanId}`}
											</p>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
