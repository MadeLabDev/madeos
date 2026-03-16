import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewSampleForm } from "./new-sample-form";

export const metadata = generateCrudMetadata("Samples");

export default function NewSamplePage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="New Sample"
				/>
				<NewSampleForm />
			</>
		</Suspense>
	);
}
