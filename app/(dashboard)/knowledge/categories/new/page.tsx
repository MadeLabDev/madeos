import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewCategoryForm } from "./new-category-form";

export const metadata = generateCrudMetadata("Knowledge Base");

export default function NewCategoryPage() {
	return (
		<>
			<SetBreadcrumb
				segment="new"
				label="Create New Category"
			/>
			<div className="space-y-6">
				{/* Form */}
				<Suspense fallback={<PageLoading />}>
					<NewCategoryForm />
				</Suspense>
			</div>
		</>
	);
}
