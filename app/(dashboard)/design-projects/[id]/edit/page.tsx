import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { getDesignProjectAction } from "@/lib/features/design";

import { DesignProjectForm } from "../../components";

interface EditDesignProjectPageProps {
	params: Promise<{ id: string }>;
}

async function EditContent({ projectId }: { projectId: string }) {
	const result = await getDesignProjectAction(projectId);

	if (!result.success || !result.data) {
		return (
			<div className="py-12 text-center">
				<h2 className="text-xl font-semibold">Project not found</h2>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Edit Design Project</h1>
				<p className="text-muted-foreground mt-2">Update project details and information.</p>
			</div>

			<div className="max-w-2xl">
				<DesignProjectForm designProjectId={projectId} />
			</div>
		</div>
	);
}

export default async function EditDesignProjectPage({ params }: EditDesignProjectPageProps) {
	const { id } = await params;

	return (
		<Suspense fallback={<PageLoading />}>
			<EditContent projectId={id} />
		</Suspense>
	);
}
