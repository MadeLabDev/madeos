import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewContactForm } from "./new-contact-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Contact");

export const revalidate = 0;

export default async function NewContactPage() {
	return (
		<>
			<SetBreadcrumb
				segment="new"
				label="New Contact"
			/>
			<div className="space-y-6">
				{/* Form */}
				<Suspense fallback={<PageLoading />}>
					<NewContactForm />
				</Suspense>
			</div>
		</>
	);
}
