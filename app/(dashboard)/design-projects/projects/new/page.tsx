import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewDesignProjectForm } from "./new-design-project-form";

export const metadata = generateCrudMetadata("Create Design Project");

export default function NewDesignProjectPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<NewDesignProjectForm />
		</Suspense>
	);
}
