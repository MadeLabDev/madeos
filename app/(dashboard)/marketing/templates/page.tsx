import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { getCampaignTemplatesAction } from "@/lib/features/marketing/actions";

import { CampaignTemplateList } from "../components/campaign-template-list";

interface TemplatesPageProps {
	searchParams: Promise<{ page?: string; search?: string; type?: string }>;
}

async function TemplatesContent({ page = "1", search = "", type = "" }: Record<string, string>) {
	const pageNum = parseInt(page, 10) || 1;
	const limit = 20;

	const typeValue = (["GENERAL", "EVENT_INVITATION", "EVENT_REMINDER", "NEWSLETTER", "SPONSOR_UPDATE"].includes(type) ? type : undefined) as any;

	const result = await getCampaignTemplatesAction(
		{
			search: search || undefined,
			type: typeValue,
		},
		pageNum,
		limit,
	);

	if (!result.success) {
		return (
			<div className="py-12 text-center">
				<p className="text-red-600">{result.message || "Failed to load templates"}</p>
			</div>
		);
	}

	return (
		<CampaignTemplateList
			templates={result.data?.templates || []}
			total={result.data?.total || 0}
			currentPage={pageNum}
			limit={limit}
		/>
	);
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
	const params = await searchParams;
	const { page = "1", search = "", type = "" } = params;

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Campaign Templates"
				description="Manage reusable email templates for your campaigns"
				searchPlaceholder="Search templates..."
				addButtonLabel="Create Template"
				addButtonHref="/marketing/templates/new"
				search={search}
				showFilters={true}
				clearHref={search || type ? "/marketing/templates" : undefined}
			/>

			{/* Campaign Template List */}
			<Suspense fallback={<PageLoading />}>
				<TemplatesContent
					page={page}
					search={search}
					type={type}
				/>
			</Suspense>
		</div>
	);
}
