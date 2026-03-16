import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewCampaignForm } from "./new-campaign-form";

export const metadata = generateCrudMetadata("Marketing Campaign");

export default function NewCampaignPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<NewCampaignForm />
		</Suspense>
	);
}
