import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import type { SOPLibraryWithRelations } from "@/lib/features/sop-library";
import { getSOPAction } from "@/lib/features/sop-library";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { SOPLibraryDetail } from "../../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("SOP Library");

export const revalidate = 0;

interface SOPLibraryDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function SOPLibraryDetailPage({ params }: SOPLibraryDetailPageProps) {
	const { id } = await params;

	const result = await getSOPAction(id);

	if (!result.success || !result.data) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-muted-foreground">SOP Library not found</p>
			</div>
		);
	}

	const sop: SOPLibraryWithRelations = result.data as SOPLibraryWithRelations;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={sop.title}
				/>
				<SOPLibraryDetail sop={sop} />
			</>
		</Suspense>
	);
}
