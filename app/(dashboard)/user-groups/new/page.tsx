import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewUserGroupForm } from "./new-user-group-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("User Group");

export const revalidate = 0;

export default function NewUserGroupPage() {
	return (
		<>
			<SetBreadcrumb
				segment="new"
				label="Create User Group"
			/>
			<NewUserGroupForm />
		</>
	);
}
