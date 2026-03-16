import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata, getCustomerTypeLabels } from "@/lib/utils/metadata";

import { CustomerList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Customer");

export const revalidate = 0;

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string; type?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const type = params.type || "customer";
	const labels = getCustomerTypeLabels(type);

	// Dynamic title and description based on type
	const typeTitle = labels.formattedType;
	const typeDescription = labels.manageDescription;
	const typeNewHref = `/customers/new?type=${type}`;
	const typeClearHref = search ? `/customers?type=${type}` : `/customers?type=${type}`;

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title={typeTitle}
				description={typeDescription}
				searchPlaceholder="Search by company name, email, or contact..."
				addButtonLabel={`Add ${labels.formattedType}`}
				addButtonHref={typeNewHref}
				search={search}
				clearHref={search ? typeClearHref : undefined}
				type={type}
			/>

			{/* Customers List */}
			<Suspense fallback={<PageLoading />}>
				<CustomerList
					page={page}
					search={search}
					pageSize={pageSize}
					type={type}
				/>
			</Suspense>
		</div>
	);
}
