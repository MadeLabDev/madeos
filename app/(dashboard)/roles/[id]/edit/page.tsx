import { Suspense } from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import { getRoleByIdAction } from "@/lib/features/roles/actions";
import type { EditRolePageProps } from "@/lib/features/roles/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditRoleForm } from "./edit-role-form";

export const metadata = generateCrudMetadata("Roles");

export default async function EditRolePage({ params }: EditRolePageProps) {
	const { id } = await params;
	const result = await getRoleByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const role = result.data;

	const isSystemRole = ["admin", "manager"].includes(role.name);

	if (isSystemRole) {
		return (
			<div className="p-8 text-center">
				<p className="font-medium text-amber-600">System roles cannot be edited. Please create a custom role instead.</p>
				<Link
					href="/roles"
					className="mt-4">
					<Button variant="outline">
						<ArrowLeft className="h-4 w-4" />
						Back to Roles
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={role.displayName}
				/>
				<div className="space-y-6">
					{/* Form */}
					<EditRoleForm role={role} />
				</div>
			</>
		</Suspense>
	);
}
