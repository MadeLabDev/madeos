import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getContactByIdAction } from "@/lib/features/contacts";
import type { EditContactPageProps } from "@/lib/features/contacts/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditContactForm } from "./edit-contact-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Contact");

export const revalidate = 0;

export default async function EditContactPage({ params }: EditContactPageProps) {
	const { id } = await params;
	const result = await getContactByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const contact = result.data as any;

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={`${contact.firstName} ${contact.lastName}`}
			/>
			<SetBreadcrumb
				segment="edit"
				label="Edit"
			/>
			<div className="space-y-6">
				{/* Form */}
				<Suspense fallback={<PageLoading />}>
					<EditContactForm contact={contact} />
				</Suspense>
			</div>
		</>
	);
}
