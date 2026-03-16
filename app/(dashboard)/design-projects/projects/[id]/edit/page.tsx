import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditDesignProjectForm } from "./edit-design-project-form";

interface EditDesignProjectPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditDesignProjectPageProps) {
	const { id } = await params;
	return generateCrudMetadata(`Edit Design Project ${id}`);
}

export default async function EditDesignProjectPage({ params }: EditDesignProjectPageProps) {
	const { id } = await params;

	return (
		<Suspense fallback={<PageLoading />}>
			<EditDesignProjectForm designProjectId={id} />
		</Suspense>
	);
}
