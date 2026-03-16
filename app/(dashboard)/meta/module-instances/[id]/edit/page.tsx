import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { getModuleInstanceByIdAction, getModuleTypesAction } from "@/lib/features/meta";
import type { EditModuleInstancePageProps } from "@/lib/features/meta/types";

import { EditModuleInstanceForm } from "./edit-module-instance-form";

export const dynamic = "force-dynamic";
import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const metadata = generateCrudMetadata("Meta");

export const revalidate = 0;

export default async function EditModuleInstancePage({ params }: EditModuleInstancePageProps) {
	const { id } = await params;
	const [instanceResult, moduleTypesResult] = await Promise.all([getModuleInstanceByIdAction(id), getModuleTypesAction({ page: 1, pageSize: 1000 })]);

	if (!instanceResult.success || !instanceResult.data) {
		return notFound();
	}

	const instance = instanceResult.data as any;
	const moduleTypes = (moduleTypesResult.data as any)?.moduleTypes || [];

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={instance.entityName}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>

				<EditModuleInstanceForm
					instance={instance}
					moduleTypes={moduleTypes}
				/>
			</>
		</Suspense>
	);
}
