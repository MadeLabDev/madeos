import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getAllRolesAction } from "@/lib/features/users/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewUserForm } from "./new-user-form";

export const metadata = generateCrudMetadata("Users");

export default async function NewUserPage() {
	// Get all roles
	const rolesResult = await getAllRolesAction();
	if (!rolesResult.success || !rolesResult.data) {
		return <div>Error loading roles</div>;
	}

	const roles = rolesResult.data as any[];

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="Create New User"
				/>
				<div className="space-y-6">
					{/* Form */}
					<NewUserForm roles={roles} />
				</div>
			</>
		</Suspense>
	);
}
