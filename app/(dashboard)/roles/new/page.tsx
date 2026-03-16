import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { CreateRoleForm } from "./create-role-form";

export const metadata = generateCrudMetadata("Roles");

export default function CreateRolePage() {
	return (
		<>
			<Suspense fallback={<PageLoading />}>
				<SetBreadcrumb
					segment="new"
					label="Create New Role"
				/>
				<div className="space-y-6">
					{/* Form */}
					<CreateRoleForm />
				</div>
			</Suspense>
		</>
	);
}
