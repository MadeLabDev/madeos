import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { getCampaignTemplateByIdAction } from "@/lib/features/marketing/actions";

import { CampaignTemplateForm } from "../../../components/campaign-template-form";

interface EditTemplatePageProps {
	params: Promise<{ id: string }>;
}

async function EditTemplateContent({ id }: { id: string }) {
	const result = await getCampaignTemplateByIdAction(id);

	if (!result.success || !result.data) {
		return (
			<div className="py-12 text-center">
				<p className="text-red-600">{result.message || "Template not found"}</p>
			</div>
		);
	}

	return <CampaignTemplateForm template={result.data} />;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
	const { id } = await params;

	return (
		<Suspense fallback={<PageLoading />}>
			<EditTemplateContent id={id} />
		</Suspense>
	);
}
