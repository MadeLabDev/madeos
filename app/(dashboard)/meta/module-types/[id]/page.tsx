import { Suspense } from "react";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getModuleTypeByIdAction } from "@/lib/features/meta";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Module Type");

export const revalidate = 0;

export default async function ModuleTypeDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const result = await getModuleTypeByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const moduleType = result.data as any;
	const fieldSchema = moduleType.fieldSchema?.fields || [];

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={moduleType.name}
				/>

				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold">{moduleType.name}</h1>
							<div className="mt-2 flex items-center gap-2">
								<Badge variant={moduleType.isEnabled ? "default" : "secondary"}>{moduleType.isEnabled ? "Enabled" : "Disabled"}</Badge>
								<Badge variant="outline">{fieldSchema.length} fields</Badge>
							</div>
						</div>
						<div className="flex gap-2">
							<Link href={`/meta/module-types/${id}/edit`}>
								<Button>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Button>
							</Link>
						</div>
					</div>

					{/* Basic Information */}
					<Card className="p-6">
						<h2 className="mb-4 text-lg font-semibold">Information</h2>
						<div className="grid grid-cols-2 gap-4 space-y-4">
							<div>
								<p className="text-muted-foreground text-sm">Key</p>
								<p className="font-mono text-sm font-medium">{moduleType.key}</p>
							</div>
							{moduleType.description && (
								<div>
									<p className="text-muted-foreground text-sm">Description</p>
									<p className="font-medium">{moduleType.description}</p>
								</div>
							)}
							<div>
								<p className="text-muted-foreground text-sm">Created</p>
								<p className="font-medium">{moduleType.createdAt ? new Date(moduleType.createdAt).toLocaleDateString() : "-"}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Updated</p>
								<p className="font-medium">{moduleType.updatedAt ? new Date(moduleType.updatedAt).toLocaleDateString() : "-"}</p>
							</div>
						</div>
					</Card>

					{/* Field Schema */}
					<Card className="p-6">
						<h2 className="mb-4 text-lg font-semibold">Fields ({fieldSchema.length})</h2>
						{fieldSchema.length === 0 ? (
							<p className="text-muted-foreground text-sm">No fields defined</p>
						) : (
							<div className="space-y-3">
								{fieldSchema.map((field: any, index: number) => (
									<div
										key={field.id || index}
										className="bg-muted/50 flex items-start justify-between rounded-lg border p-3">
										<div className="flex-1">
											<div className="mb-1 flex items-center gap-2">
												<span className="font-medium">{field.label}</span>
												<Badge
													variant="secondary"
													className="text-xs">
													{field.type}
												</Badge>
												{field.required && (
													<Badge
														variant="destructive"
														className="text-xs">
														Required
													</Badge>
												)}
											</div>
											<p className="text-muted-foreground font-mono text-xs">{field.name}</p>
											{field.placeholder && <p className="text-muted-foreground mt-1 text-xs">Placeholder: {field.placeholder}</p>}
										</div>
										<div className="text-muted-foreground ml-4 text-xs">#{index + 1}</div>
									</div>
								))}
							</div>
						)}
					</Card>
				</div>
			</>
		</Suspense>
	);
}
