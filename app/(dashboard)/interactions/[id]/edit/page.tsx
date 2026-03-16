import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getContactsAction } from "@/lib/features/contacts";
import { getInteractionByIdAction } from "@/lib/features/interactions";
import type { EditInteractionPageProps } from "@/lib/features/interactions/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditInteractionForm } from "./edit-interaction-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Interaction");

export const revalidate = 0;

export default async function EditInteractionPage({ params }: EditInteractionPageProps) {
	const { id } = await params;
	const result = await getInteractionByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const interaction = result.data as any;

	// Load all contacts for selection (will be filtered client-side)
	const contactsResult = await getContactsAction({ page: 1, search: "", pageSize: 1000 });
	const contacts = (contactsResult.data as any)?.contacts || [];

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={interaction.subject}
			/>
			<SetBreadcrumb
				segment="edit"
				label="Edit"
			/>
			<div className="space-y-6">
				{/* Form */}
				<Suspense fallback={<PageLoading />}>
					<EditInteractionForm
						interaction={interaction}
						contacts={contacts}
					/>
				</Suspense>
			</div>
		</>
	);
}
