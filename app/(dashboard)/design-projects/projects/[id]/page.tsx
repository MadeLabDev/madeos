import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { DesignProjectDetail } from "../../components/design-project-detail";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const revalidate = 0;

interface DesignProjectPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DesignProjectPageProps) {
	const { id } = await params;
	return generateCrudMetadata(`Design Project ${id}`);
}

export default async function DesignProjectPage({ params }: DesignProjectPageProps) {
	const { id } = await params;

	if (!id) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<Suspense fallback={<PageLoading />}>
				<DesignProjectDetail designProjectId={id} />
			</Suspense>
		</div>
	);
}
