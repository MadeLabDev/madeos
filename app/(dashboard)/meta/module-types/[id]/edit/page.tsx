import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getModuleTypeByIdAction } from "@/lib/features/meta";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditModuleTypeForm } from "./edit-module-type-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Module Type");

export const revalidate = 0;

export default async function EditModuleTypePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const result = await getModuleTypeByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const moduleType = result.data as any;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={moduleType.name}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<div className="space-y-6">
					{/* Form */}
					<EditModuleTypeForm moduleType={moduleType} />
				</div>
			</>
		</Suspense>
	);
}
