import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewDesignReviewForm } from "./new-design-review-form";

export const metadata = generateCrudMetadata("Design Reviews");

export default function NewDesignReviewPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="New Design Review"
				/>
				<NewDesignReviewForm />
			</>
		</Suspense>
	);
}
