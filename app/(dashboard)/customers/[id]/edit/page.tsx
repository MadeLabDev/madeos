import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getCustomerByIdAction, getCustomersAction, getCustomerSystemModuleTypesAction } from "@/lib/features/customers";
import type { EditCustomerPageProps } from "@/lib/features/customers/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditCustomerForm } from "./edit-customer-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Customer");

export const revalidate = 0;

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
	const { id } = await params;
	const result = await getCustomerByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const customer = result.data as any;

	// Load parent customers
	const parentsResult = await getCustomersAction({ page: 1, search: "", pageSize: 1000 });
	const parentCustomers = (parentsResult.data as any)?.customers || [];

	// Load module types for additional fields
	const moduleTypesResult = await getCustomerSystemModuleTypesAction(customer.type || "customer");
	const moduleTypes = moduleTypesResult.success ? (moduleTypesResult.data as any[]) : [];

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={customer.companyName}
			/>
			<SetBreadcrumb
				segment="edit"
				label="Edit"
			/>
			<div className="space-y-6">
				{/* Form */}
				<Suspense fallback={<PageLoading />}>
					<EditCustomerForm
						customer={customer}
						parentCustomers={parentCustomers}
						moduleTypes={moduleTypes}
					/>
				</Suspense>
			</div>
		</>
	);
}
