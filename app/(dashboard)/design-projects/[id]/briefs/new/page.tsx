import { DesignBriefForm } from "../../../components";

interface NewDesignBriefPageProps {
	params: Promise<{ id: string }>;
}

export const metadata = {
	title: "New Design Brief",
	description: "Create a new design brief",
};

export default async function NewDesignBriefPage({ params }: NewDesignBriefPageProps) {
	const { id } = await params;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Create Design Brief</h1>
				<p className="text-muted-foreground mt-2">Define the creative requirements and objectives for this project.</p>
			</div>

			<div className="max-w-2xl">
				<DesignBriefForm designProjectId={id} />
			</div>
		</div>
	);
}
