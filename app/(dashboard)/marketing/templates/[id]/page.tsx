import { Suspense } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getCampaignTemplateByIdAction } from "@/lib/features/marketing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

interface TemplateDetailPageProps {
	params: Promise<{ id: string }>;
}

async function TemplateDetailContent({ id }: { id: string }) {
	const result = await getCampaignTemplateByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const template = result.data;

	const typeColors: Record<string, string> = {
		GENERAL: "bg-blue-100 text-blue-800",
		EVENT_INVITATION: "bg-purple-100 text-purple-800",
		EVENT_REMINDER: "bg-orange-100 text-orange-800",
		NEWSLETTER: "bg-green-100 text-green-800",
		SPONSOR_UPDATE: "bg-pink-100 text-pink-800",
	};

	return (
		<div className="space-y-6">
			<SetBreadcrumb
				segment={id}
				label={template.name}
			/>

			{/* Header */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">{template.name}</h1>
					<div className="mt-2 flex items-center gap-2">
						<Badge className={typeColors[template.type] || "bg-gray-100 text-gray-800"}>{template.type}</Badge>
						<Badge variant={template.isActive ? "default" : "secondary"}>{template.isActive ? "Active" : "Inactive"}</Badge>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						asChild
						variant="outline">
						<Link href={`/marketing/templates/${id}/edit`}>Edit Template</Link>
					</Button>
				</div>
			</div>

			{/* Template Details */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Main Content */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Template Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-muted-foreground text-sm font-medium">Subject</label>
								<p className="mt-1">{template.subject}</p>
							</div>
							<div>
								<label className="text-muted-foreground text-sm font-medium">Content</label>
								<div className="bg-muted/50 mt-1 rounded-md border p-3">
									<pre className="text-sm whitespace-pre-wrap">{template.content}</pre>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Template Stats</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Status</span>
									<Badge variant={template.isActive ? "default" : "secondary"}>{template.isActive ? "Active" : "Inactive"}</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Type</span>
									<span>{template.type}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Created</span>
									<span>{new Date(template.createdAt).toLocaleDateString()}</span>
								</div>
								{template.updatedAt && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Last Updated</span>
										<span>{new Date(template.updatedAt).toLocaleDateString()}</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export async function generateMetadata({ params }: TemplateDetailPageProps) {
	const { id } = await params;
	const result = await getCampaignTemplateByIdAction(id);
	const title = result.success && result.data ? result.data.name : `Template ${id}`;
	return generateCrudMetadata(title);
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
	const { id } = await params;

	return (
		<Suspense fallback={<PageLoading />}>
			<TemplateDetailContent id={id} />
		</Suspense>
	);
}
