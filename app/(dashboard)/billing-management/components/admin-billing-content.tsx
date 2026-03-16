import { DollarSign, FileText, TrendingUp, Users } from "lucide-react";

import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllInvoicesAction, getAllUserSubscriptionsAction, getBillingStatisticsAction } from "@/lib/features/pricing/actions/admin.actions";

interface AdminBillingContentProps {
	page: number;
	pageSize: number;
}

export async function AdminBillingContent({ page, pageSize }: AdminBillingContentProps) {
	// Fetch data on server side
	const [subscriptionsResult, invoicesResult, statisticsResult] = await Promise.all([getAllUserSubscriptionsAction(), getAllInvoicesAction(), getBillingStatisticsAction()]);

	const subscriptions = subscriptionsResult.success ? (subscriptionsResult.data as any) || [] : [];
	const invoices = invoicesResult.success ? (invoicesResult.data as any) || [] : [];
	const statistics = statisticsResult.success ? (statisticsResult.data as any) : null;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString();
	};

	const getStatusBadge = (status: string) => {
		const statusColors = {
			ACTIVE: "bg-green-100 text-green-800",
			CANCELLED: "bg-red-100 text-red-800",
			PAUSED: "bg-yellow-100 text-yellow-800",
			TRIAL: "bg-blue-100 text-blue-800",
			PAID: "bg-green-100 text-green-800",
			PENDING: "bg-yellow-100 text-yellow-800",
			OVERDUE: "bg-red-100 text-red-800",
		};
		return <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>{status}</Badge>;
	};

	// Pagination logic for subscriptions
	const totalSubscriptions = subscriptions.length;
	const startSubscriptionIndex = (page - 1) * pageSize;
	const endSubscriptionIndex = startSubscriptionIndex + pageSize;
	const paginatedSubscriptions = subscriptions.slice(startSubscriptionIndex, endSubscriptionIndex);

	// Pagination logic for invoices
	const totalInvoices = invoices.length;
	const startInvoiceIndex = (page - 1) * pageSize;
	const endInvoiceIndex = startInvoiceIndex + pageSize;
	const paginatedInvoices = invoices.slice(startInvoiceIndex, endInvoiceIndex);

	return (
		<div className="space-y-8">
			{/* Statistics Cards */}
			{statistics && (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
							<DollarSign className="text-muted-foreground h-4 w-4" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(statistics.totalRevenue)}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
							<Users className="text-muted-foreground h-4 w-4" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{statistics.activeSubscriptions}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
							<FileText className="text-muted-foreground h-4 w-4" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{statistics.totalInvoices}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Growth</CardTitle>
							<TrendingUp className="text-muted-foreground h-4 w-4" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">+12%</div>
							<p className="text-muted-foreground text-xs">vs last month</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Recent Payments */}
			{statistics?.recentPayments && statistics.recentPayments.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Recent Payments</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Paid At</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{statistics.recentPayments.map((payment: any) => (
									<TableRow key={payment.id}>
										<TableCell>{payment.user?.name || payment.user?.email}</TableCell>
										<TableCell>{formatCurrency(payment.amount)}</TableCell>
										<TableCell>{getStatusBadge(payment.status)}</TableCell>
										<TableCell>{payment.paidAt ? formatDate(payment.paidAt) : "N/A"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{/* All Subscriptions */}
			<Card>
				<CardHeader>
					<CardTitle>All User Subscriptions</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Plan</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Last Updated</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedSubscriptions.map((subscription: any) => (
								<TableRow key={subscription.id}>
									<TableCell>{subscription.user?.name || subscription.user?.email}</TableCell>
									<TableCell>{subscription.plan?.displayName || subscription.plan?.name}</TableCell>
									<TableCell>{getStatusBadge(subscription.status)}</TableCell>
									<TableCell>{formatDate(subscription.createdAt)}</TableCell>
									<TableCell>{formatDate(subscription.updatedAt)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{totalSubscriptions > pageSize && (
						<div className="mt-4">
							<Pagination
								page={page}
								total={totalSubscriptions}
								pageSize={pageSize}
								itemName="subscriptions"
								baseUrl="/billing-management"
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* All Invoices */}
			<Card>
				<CardHeader>
					<CardTitle>All Invoices</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice #</TableHead>
								<TableHead>User</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Issued At</TableHead>
								<TableHead>Due Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedInvoices.map((invoice: any) => (
								<TableRow key={invoice.id}>
									<TableCell>{invoice.invoiceNumber}</TableCell>
									<TableCell>{invoice.user?.name || invoice.user?.email}</TableCell>
									<TableCell>{formatCurrency(invoice.amount)}</TableCell>
									<TableCell>{getStatusBadge(invoice.status)}</TableCell>
									<TableCell>{formatDate(invoice.issuedAt)}</TableCell>
									<TableCell>{formatDate(invoice.dueDate)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{totalInvoices > pageSize && (
						<div className="mt-4">
							<Pagination
								page={page}
								total={totalInvoices}
								pageSize={pageSize}
								itemName="invoices"
								baseUrl="/billing-management"
							/>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
