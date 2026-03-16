import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { getContactsAction } from "@/lib/features/contacts";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewInteractionForm } from "./new-interaction-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Interaction");

export const revalidate = 0;

export default async function NewInteractionPage() {
	// Load all contacts for selection (will be filtered client-side)
	const contactsResult = await getContactsAction({ page: 1, search: "", pageSize: 1000 });
	const contacts = (contactsResult.data as any)?.contacts || [];

	return (
		<Suspense fallback={<PageLoading />}>
			<NewInteractionForm contacts={contacts} />
		</Suspense>
	);
}
