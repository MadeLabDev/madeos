import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { getUserGroupAction } from "@/lib/features/user-groups/actions";
import type { EditUserGroupPageProps } from "@/lib/features/user-groups/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditUserGroupForm } from "./edit-user-group-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("User Group");

export const revalidate = 0;

export default async function EditUserGroupPage({ params }: EditUserGroupPageProps) {
	const { id } = await params;

	// Get user group data
	const result = await getUserGroupAction(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const userGroup = result.data;

	return (
		<>
			<SetBreadcrumb
				segment={userGroup.id}
				label={userGroup.name}
			/>
			<SetBreadcrumb
				segment="edit"
				label="Edit"
			/>
			<EditUserGroupForm userGroup={userGroup} />
		</>
	);
}
