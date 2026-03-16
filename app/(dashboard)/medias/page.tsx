import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { uploadMedia } from "@/lib/features/media/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { MediaGrid, MediaPageHeader } from "./components";
import { MediaPageWrapper } from "./media-page-wrapper";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Media Files");

export const revalidate = 0;

export default async function MediasPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("media_pagesize");

	return (
		<MediaPageWrapper uploadMediaAction={uploadMedia}>
			<div className="space-y-6">
				{/* Header with Upload Button */}
				<MediaPageHeader
					title="Medias"
					description="Manage media files"
					searchPlaceholder="Search by name or code..."
					search={search}
					showUploadButton={true}
					uploadMediaAction={uploadMedia}
				/>

				{/* Media Grid with Suspense for loading skeleton */}
				<Suspense fallback={<PageLoading />}>
					<MediaGrid
						page={page}
						search={search}
						pageSize={pageSize}
					/>
				</Suspense>
			</div>
		</MediaPageWrapper>
	);
}
