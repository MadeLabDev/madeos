import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getDesignReviewById } from "@/lib/features/design/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { DesignReviewDetail } from "./design-review-detail";

export const metadata = generateCrudMetadata("Design Reviews");

export default async function DesignReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getDesignReviewById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const review = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<SetBreadcrumb
				segment={id}
				label={`Review by ${review.reviewerName || "Unknown"}`}
			/>
			<DesignReviewDetail id={id} />
		</Suspense>
	);
}
