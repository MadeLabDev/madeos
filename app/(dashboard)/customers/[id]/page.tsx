import { Suspense } from "react";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getCustomerByIdAction } from "@/lib/features/customers";
import type { CustomerDetailPageProps } from "@/lib/features/customers/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Customers");

export const revalidate = 0;

export default async function CustomerDetailPage({ params, searchParams }: CustomerDetailPageProps & { searchParams: Promise<{ type?: string }> }) {
	const { id } = await params;
	const { type = "customer" } = await searchParams;
	const result = await getCustomerByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const customer = result.data as any;

	// Type badge helper
	const getTypeBadge = (type: string) => {
		switch (type) {
			case "ENTERPRISE":
				return <Badge variant="default">Enterprise</Badge>;
			case "WHOLESALE":
				return <Badge variant="secondary">Wholesale</Badge>;
			default:
				return <Badge variant="outline">Standard</Badge>;
		}
	};

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={customer.companyName}
			/>

			<div className="space-y-6">
				<Suspense fallback={<PageLoading />}>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold">{customer.companyName}</h1>
							<div className="mt-2 flex items-center gap-2">
								{getTypeBadge(customer.type)}
								{!customer.isActive && <Badge variant="destructive">Inactive</Badge>}
							</div>
						</div>
						<div className="flex gap-2">
							<Link href={`/customers/${id}/edit?type=${type}`}>
								<Button>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Button>
							</Link>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						{/* Main Information */}
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Company Information</h2>
							<div className="space-y-3">
								<div>
									<p className="text-muted-foreground text-sm">Email</p>
									<p className="font-medium">{customer.email}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Phone</p>
									<p className="font-medium">{customer.phone || "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Tax ID</p>
									<p className="font-medium">{customer.taxId || "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Address</p>
									<p className="font-medium">{customer.address}</p>
									<p className="font-medium">
										{customer.city}, {customer.state} {customer.zipCode}
									</p>
								</div>
							</div>
						</Card>

						{/* Contact Information */}
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Contact Information</h2>
							<div className="space-y-3">
								<div>
									<p className="text-muted-foreground text-sm">Contact Name</p>
									<p className="font-medium">{customer.contactName}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Contact Email</p>
									<p className="font-medium">{customer.contactEmail || "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Contact Phone</p>
									<p className="font-medium">{customer.contactPhone || "-"}</p>
								</div>
							</div>
						</Card>

						{/* Business Terms */}
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Business Terms</h2>
							<div className="space-y-3">
								<div>
									<p className="text-muted-foreground text-sm">Discount</p>
									<p className="font-medium">{customer.discountPercent}%</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Payment Terms</p>
									<p className="font-medium">{customer.paymentTermsDays} days</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Credit Limit</p>
									<p className="font-medium">${customer.creditLimit?.toLocaleString() || "0"}</p>
								</div>
							</div>
						</Card>

						{/* Locations/Parent Info */}
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Hierarchy</h2>
							<div className="space-y-3">
								{customer.parent ? (
									<>
										<div>
											<p className="text-muted-foreground text-sm">Parent Company</p>
											<Link
												href={`/customers/${customer.parentId}?type=${type}`}
												className="font-medium underline">
												{customer.parent.companyName}
											</Link>
										</div>
									</>
								) : customer.locations && customer.locations.length > 0 ? (
									<>
										<div>
											<p className="text-muted-foreground mb-2 text-sm">Locations ({customer.locations.length})</p>
											<div className="space-y-2">
												{customer.locations.map((location: any) => (
													<Link
														key={location.id}
														href={`/customers/${location.id}?type=${type}`}
														className="block text-sm underline">
														{location.companyName} • {location.city}, {location.state}
													</Link>
												))}
											</div>
										</div>
									</>
								) : (
									<p className="text-muted-foreground text-sm">Standalone customer</p>
								)}
							</div>
						</Card>
					</div>

					{/* Recent Orders (if any) */}
					{customer.orders && customer.orders.length > 0 && (
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Recent Orders ({customer.orders.length})</h2>
							<div className="space-y-2 text-sm">
								{customer.orders.slice(0, 5).map((order: any) => (
									<div
										key={order.id}
										className="flex justify-between border-b py-2 last:border-0">
										<span className="text-muted-foreground">Order #{order.id.slice(0, 8)}</span>
										<Badge variant="outline">{order.status}</Badge>
									</div>
								))}
							</div>
						</Card>
					)}
				</Suspense>
			</div>
		</>
	);
}
