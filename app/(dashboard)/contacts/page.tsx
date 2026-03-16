import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { ContactList } from "./components/contact-list";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Contacts");

export const revalidate = 0;

// Force dynamic rendering - prevent automatic revalidation
export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string; customerId?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const customerId = params.customerId || "";

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Contacts"
				description="Manage customer contacts and their information"
				searchPlaceholder="Search by name, email, or title..."
				addButtonLabel="Add Contact"
				addButtonHref="/contacts/new"
				search={search}
				clearHref={search ? "/contacts" : undefined}
			/>

			{/* Contacts List */}
			<Suspense fallback={<PageLoading />}>
				<ContactList
					page={page}
					search={search}
					pageSize={pageSize}
					customerId={customerId}
				/>
			</Suspense>
		</div>
	);
}
