import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewModuleTypeForm } from "./new-module-type-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Module Type");

export const revalidate = 0;

export default async function NewModuleTypePage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="Create New Module Type"
				/>
				<div className="space-y-6">
					{/* Form */}
					<NewModuleTypeForm />
				</div>
			</>
		</Suspense>
	);
}
