"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { AlertCircle, Calendar, FileText, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { getDesignBriefById } from "@/lib/features/design/actions";
import { DesignBriefWithRelations } from "@/lib/features/design/types";

interface DesignBriefDetailProps {
	briefId: string;
}

export function DesignBriefDetail({ briefId }: DesignBriefDetailProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [brief, setBrief] = useState<DesignBriefWithRelations | null>(null);

	const loadBriefData = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getDesignBriefById(briefId);
			if (result.success && result.data) {
				setBrief(result.data);
				// Set breadcrumb
				// Note: SetBreadcrumb is already handled in the page component
			} else {
				toast.error("Failed to load design brief");
				router.push("/design-projects/briefs");
				return;
			}
		} catch (error) {
			toast.error("Failed to load design brief data");
		} finally {
			setLoading(false);
		}
	}, [briefId, router]);

	useEffect(() => {
		loadBriefData();
	}, [briefId, loadBriefData]);

	if (loading) {
		return <Loader />;
	}

	if (!brief) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-center">
					<AlertCircle className="text-muted-foreground mx-auto h-12 w-12" />
					<h3 className="text-muted-foreground mt-2 text-sm font-semibold">Design Brief Not Found</h3>
					<p className="text-muted-foreground mt-1 text-sm">The design brief you're looking for doesn't exist.</p>
					<div className="mt-6">
						<Button onClick={() => router.push("/design-projects/briefs")}>Back to Design Briefs</Button>
					</div>
				</div>
			</div>
		);
	}

	const briefData = brief as any;

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Design Brief</h1>
					<p className="text-muted-foreground">Design brief details and requirements</p>
				</div>
				<Button onClick={() => router.push(`/design-projects/briefs/${briefId}/edit`)}>
					<Pencil className="mr-2 h-4 w-4" />
					Edit Brief
				</Button>
			</div>

			{/* Status and Basic Info */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Brief Details
						</CardTitle>
						<Badge variant={briefData.status === "APPROVED" ? "default" : briefData.status === "REJECTED" ? "destructive" : briefData.status === "DRAFT" ? "secondary" : briefData.status === "SUBMITTED" ? "outline" : briefData.status === "REVISION_REQUESTED" ? "secondary" : "outline"}>{(briefData.status || "DRAFT").replace("_", " ")}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<label className="text-muted-foreground text-sm font-medium">Design Project</label>
							<p className="mt-1 text-sm">{briefData.designProject?.title || `Project ${briefData.designProjectId}`}</p>
						</div>
						<div>
							<label className="text-muted-foreground text-sm font-medium">Timeline</label>
							<p className="mt-1 text-sm">{briefData.timeline || "Not specified"}</p>
						</div>
						<div>
							<label className="text-muted-foreground text-sm font-medium">Budget</label>
							<p className="mt-1 text-sm">{briefData.budget ? `$${briefData.budget.toLocaleString()}` : "Not specified"}</p>
						</div>
						<div>
							<label className="text-muted-foreground text-sm font-medium">Created</label>
							<p className="mt-1 flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4" />
								{format(new Date(briefData.createdAt), "PPP")}
							</p>
						</div>
					</div>

					<Separator />

					{/* Content Sections */}
					{briefData.brandAssets && (
						<div>
							<label className="text-muted-foreground text-sm font-medium">Brand Assets</label>
							<p className="mt-1 text-sm whitespace-pre-wrap">{briefData.brandAssets}</p>
						</div>
					)}

					{briefData.targetAudience && (
						<div>
							<label className="text-muted-foreground text-sm font-medium">Target Audience</label>
							<p className="mt-1 text-sm whitespace-pre-wrap">{briefData.targetAudience}</p>
						</div>
					)}

					{briefData.constraints && (
						<div>
							<label className="text-muted-foreground text-sm font-medium">Constraints</label>
							<p className="mt-1 text-sm whitespace-pre-wrap">{briefData.constraints}</p>
						</div>
					)}

					{briefData.inspirations && (
						<div>
							<label className="text-muted-foreground text-sm font-medium">Inspirations</label>
							<p className="mt-1 text-sm whitespace-pre-wrap">{briefData.inspirations}</p>
						</div>
					)}

					{briefData.deliverables && (
						<div>
							<label className="text-muted-foreground text-sm font-medium">Deliverables</label>
							<p className="mt-1 text-sm whitespace-pre-wrap">{briefData.deliverables}</p>
						</div>
					)}

					{briefData.notes && (
						<div>
							<label className="text-muted-foreground text-sm font-medium">Notes</label>
							<p className="mt-1 text-sm whitespace-pre-wrap">{briefData.notes}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
