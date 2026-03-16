import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewModuleInstanceForm } from "./new-module-instance-form";

export const metadata = generateCrudMetadata("Meta");

export default function NewModuleInstancePage() {
	return (
		<>
			<Suspense fallback={<PageLoading />}>
				<SetBreadcrumb
					segment="new"
					label="New Module Instance"
				/>
				<NewModuleInstanceForm />
			</Suspense>
		</>
	);
}
