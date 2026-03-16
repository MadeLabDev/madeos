import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getAllRolesAction, getUserByIdAction } from "@/lib/features/users/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditUserForm } from "./edit-user-form";

export const metadata = generateCrudMetadata("Users");

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	// Get user data
	const userResult = await getUserByIdAction(id);
	if (!userResult.success || !userResult.data) {
		notFound();
	}

	// Get all roles
	const rolesResult = await getAllRolesAction();
	if (!rolesResult.success || !rolesResult.data) {
		return <div>Error loading roles</div>;
	}

	const user = userResult.data as any;
	const roles = rolesResult.data as any[];

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={user.name || user.email}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<div className="space-y-6">
					{/* Form */}
					<EditUserForm
						userId={id}
						user={user}
						roles={roles}
					/>
				</div>
			</>
		</Suspense>
	);
}
