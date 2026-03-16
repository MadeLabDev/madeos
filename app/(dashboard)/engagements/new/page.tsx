import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewEngagementForm } from "./new-engagement-form";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export const metadata = generateCrudMetadata("Contact Us");

export default function NewEngagementPage() {
	return (
		<>
			<SetBreadcrumb
				segment="new"
				label="Create New Engagement"
			/>

			<Suspense fallback={<PageLoading />}>
				<NewEngagementForm />
			</Suspense>
		</>
	);
}
