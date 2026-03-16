import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { CourseList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Courses");

export const revalidate = 0;

export default async function CoursePage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; categoryId?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const categoryId = params.categoryId || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Courses"
				description="Explore all available courses and events"
				searchPlaceholder="Search by title..."
				addButtonLabel={undefined}
				addButtonHref={undefined}
				search={search}
				clearHref={search ? "/course" : undefined}
			/>

			{/* Course List */}
			<Suspense fallback={<PageLoading />}>
				<CourseList
					page={page}
					search={search}
					categoryId={categoryId}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
