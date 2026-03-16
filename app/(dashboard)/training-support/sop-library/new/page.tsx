import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { CreateSOPLibraryForm } from "./create-sop-library-form";

export const metadata = generateCrudMetadata("SOP Library");

export default function CreateSOPLibraryPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="Create SOP"
				/>
				<CreateSOPLibraryForm />
			</>
		</Suspense>
	);
}
