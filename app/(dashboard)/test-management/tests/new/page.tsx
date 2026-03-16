import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewTestForm } from "./new-test-form";

export const metadata = generateCrudMetadata("Tests");

export default function NewTestPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="New Test"
				/>
				<NewTestForm />
			</>
		</Suspense>
	);
}
