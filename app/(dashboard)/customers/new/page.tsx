import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getCustomersAction, getCustomerSystemModuleTypesAction } from "@/lib/features/customers";
import { generateCrudMetadata, getCustomerTypeLabels } from "@/lib/utils/metadata";

import { NewCustomerForm } from "./new-customer-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Customer");

export const revalidate = 0;

export default async function NewCustomerPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const params = await searchParams;
	const type = params.type || "customer";
	const labels = getCustomerTypeLabels(type);

	// Load parent customers and module types
	const [parentsResult, moduleTypesResult] = await Promise.all([getCustomersAction({ page: 1, search: "", pageSize: 1000 }), getCustomerSystemModuleTypesAction(type)]);

	const parentCustomers = (parentsResult.data as any)?.customers || [];
	const moduleTypes = moduleTypesResult.success ? (moduleTypesResult.data as any[]) || [] : [];

	return (
		<>
			<SetBreadcrumb
				segment="new"
				label={labels.createBreadcrumb}
			/>
			<div className="space-y-6">
				{/* Form */}
				<Suspense fallback={<PageLoading />}>
					<NewCustomerForm
						parentCustomers={parentCustomers}
						type={type}
						moduleTypes={moduleTypes}
					/>
				</Suspense>
			</div>
		</>
	);
}
