import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";

import { NewTagForm } from "./new-tag-form";

export const metadata = {
	title: "Create New Tag | Knowledge",
	description: "Create a new knowledge base tag",
};

export default function NewTagPage() {
	return (
		<div className="space-y-6">
			<SetBreadcrumb
				segment="new"
				label="Create Tag"
			/>
			<Suspense fallback={<PageLoading />}>
				<NewTagForm />
			</Suspense>
		</div>
	);
}
