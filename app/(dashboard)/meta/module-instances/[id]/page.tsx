import { Link, Pencil } from "lucide-react";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getModuleInstanceByIdAction } from "@/lib/features/meta";
import type { ModuleInstanceDetailPageProps } from "@/lib/features/meta/types";

export const dynamic = "force-dynamic";
import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const metadata = generateCrudMetadata("Meta");

export const revalidate = 0;

export default async function ModuleInstanceDetailPage({ params }: ModuleInstanceDetailPageProps) {
	const { id } = await params;
	const result = await getModuleInstanceByIdAction(id);

	if (!result.success || !result.data) {
		return notFound();
	}

	const instance = result.data as any;
	const createdDate = new Date(instance.createdAt).toLocaleDateString();
	const updatedDate = new Date(instance.updatedAt).toLocaleDateString();

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={instance.entityName}
				/>

				<div className="space-y-6">
					{/* Header with title and edit button */}
					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">{instance.entityName}</h1>
							<p className="text-muted-foreground">{instance.moduleType?.name || "Unknown Module Type"}</p>
						</div>
						<Button asChild>
							<a href={`/meta/module-instances/${id}/edit`}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit Instance
							</a>
						</Button>
					</div>

					{/* Main Information Card */}
					<Card>
						<CardHeader>
							<CardTitle>Instance Information</CardTitle>
							<CardDescription>Details about this module instance</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								{/* Entity ID */}
								<div>
									<p className="text-muted-foreground text-sm">Entity ID</p>
									<p className="font-mono text-sm">{instance.entityId}</p>
								</div>

								{/* Entity Name */}
								<div>
									<p className="text-muted-foreground text-sm">Entity Name</p>
									<p className="text-sm">{instance.entityName}</p>
								</div>

								{/* Module Type */}
								<div>
									<p className="text-muted-foreground text-sm">Module Type</p>
									<p className="text-sm">{instance.moduleType?.name || "Unknown"}</p>
								</div>

								{/* Status */}
								<div>
									<p className="text-muted-foreground text-sm">Status</p>
									<div className="flex items-center gap-2">
										<Badge variant={instance.isActive ? "default" : "secondary"}>{instance.isActive ? "Active" : "Inactive"}</Badge>
									</div>
								</div>

								{/* Created Date */}
								<div>
									<p className="text-muted-foreground text-sm">Created</p>
									<p className="text-sm">{createdDate}</p>
								</div>

								{/* Updated Date */}
								<div>
									<p className="text-muted-foreground text-sm">Last Updated</p>
									<p className="text-sm">{updatedDate}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Field Values Card */}
					{instance.moduleType?.fieldSchema?.fields && instance.moduleType.fieldSchema.fields.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Field Values</CardTitle>
								<CardDescription>Custom field values for this instance</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{instance.moduleType.fieldSchema.fields.map((field: any) => (
										<div
											key={field.id}
											className="border-t pt-4 first:border-t-0 first:pt-0">
											<p className="text-muted-foreground text-sm">{field.label}</p>
											<div className="mt-1">{renderFieldValue(instance.fieldValues[field.name], field.type)}</div>
											{field.placeholder && <p className="text-muted-foreground mt-1 text-xs">{field.placeholder}</p>}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Meta Information Card */}
					<Card>
						<CardHeader>
							<CardTitle>Meta Information</CardTitle>
							<CardDescription>System information</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div>
								<p className="text-muted-foreground">Instance ID</p>
								<p className="font-mono text-xs break-all">{instance.id}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Module Type ID</p>
								<p className="font-mono text-xs break-all">{instance.moduleTypeId}</p>
							</div>
							{instance.createdBy && (
								<div>
									<p className="text-muted-foreground">Created By</p>
									<p className="text-sm">{instance.createdBy}</p>
								</div>
							)}
							{instance.updatedBy && (
								<div>
									<p className="text-muted-foreground">Updated By</p>
									<p className="text-sm">{instance.updatedBy}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</>
		</Suspense>
	);
}

// Helper function to render field values
function renderFieldValue(value: any, type: string): React.ReactNode {
	if (value === null || value === undefined || value === "") {
		return <span className="text-muted-foreground italic">—</span>;
	}

	switch (type) {
		case "boolean":
			return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>;

		case "date":
			try {
				return new Date(value).toLocaleDateString();
			} catch {
				return value;
			}

		case "number":
			return <span className="font-mono">{value}</span>;

		case "email":
			return (
				<a
					href={`mailto:${value}`}
					className="text-blue-600 hover:underline">
					{value}
				</a>
			);

		case "url":
			return (
				<a
					href={value}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1 text-blue-600 hover:underline">
					{value}
					<Link className="h-3 w-3" />
				</a>
			);

		case "textarea":
			return <p className="text-sm whitespace-pre-wrap">{value}</p>;

		default:
			return <span className="text-sm">{value}</span>;
	}
}
