import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTechPackById } from "@/lib/features/design/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditTechPackForm } from "./edit-tech-pack-form";

export const metadata = generateCrudMetadata("Tech Packs");

export default async function EditTechPackPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getTechPackById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const techPack = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={techPack.name || `Tech Pack ${id}`}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditTechPackForm id={id} />
			</>
		</Suspense>
	);
}
