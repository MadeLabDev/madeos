import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getDesignBriefById } from "@/lib/features/design/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { DesignBriefDetail } from "../../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Design Briefs");

export const revalidate = 0;

export default async function DesignBriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getDesignBriefById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const brief = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<SetBreadcrumb
				segment={id}
				label={`${brief.designProject?.title || "Project"} Brief`}
			/>
			<DesignBriefDetail briefId={id} />
		</Suspense>
	);
}
