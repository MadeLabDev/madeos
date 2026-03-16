import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewDesignBriefForm } from "./new-design-brief-form";

export const metadata = generateCrudMetadata("Design Briefs");

export default function NewDesignBriefPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="New Design Brief"
				/>
				<NewDesignBriefForm />
			</>
		</Suspense>
	);
}
