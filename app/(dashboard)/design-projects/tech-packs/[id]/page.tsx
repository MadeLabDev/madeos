import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTechPackById } from "@/lib/features/design/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TechPackDetail } from "../../components";

export const metadata = generateCrudMetadata("Tech Packs");

export default async function TechPackDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getTechPackById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const techPack = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<SetBreadcrumb
				segment={id}
				label={techPack.name || `Tech Pack ${id}`}
			/>
			<TechPackDetail techPackId={id} />
		</Suspense>
	);
}
