import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { getDesignProjectAction } from "@/lib/features/design";

import { DesignProjectDetail } from "../../components";

interface DesignProjectDetailPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DesignProjectDetailPageProps) {
	const { id } = await params;
	const result = await getDesignProjectAction(id);

	const projectData = result.success && result.data ? result.data : null;

	return {
		title: (projectData as any)?.title || "Design Project",
		description: (projectData as any)?.description || "View design project details",
	};
}

async function ProjectContent({ projectId }: { projectId: string }) {
	const result = await getDesignProjectAction(projectId);

	if (!result.success || !result.data) {
		return (
			<div className="py-12 text-center">
				<h2 className="text-xl font-semibold">Project not found</h2>
			</div>
		);
	}

	return <DesignProjectDetail designProjectId={projectId} />;
}

export default async function DesignProjectDetailPage({ params }: DesignProjectDetailPageProps) {
	const { id } = await params;

	return (
		<Suspense fallback={<PageLoading />}>
			<ProjectContent projectId={id} />
		</Suspense>
	);
}
