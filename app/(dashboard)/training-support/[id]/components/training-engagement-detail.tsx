"use client";

import { useCallback, useEffect, useState } from "react";

import { ArrowLeft, Calendar, Eye, EyeOff, MapPin, MoreHorizontal, Pencil, Ticket, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumb } from "@/lib/contexts/breadcrumb-context";
import { deleteTrainingEngagement, getTrainingEngagementById } from "@/lib/features/training/actions";
import { TrainingEngagementWithRelations, TrainingPhase, TrainingStatus } from "@/lib/features/training/types";
import { formatDate } from "@/lib/utils";

import { TrainingAssessmentsList } from "../../components/training-assessments-list";
import { TrainingEngagementRegistrations } from "../../components/training-engagement-registrations";
import { TrainingSessionList } from "../../components/training-session-list";

interface TrainingEngagementDetailProps {
	engagementId: string;
	pageSize?: number;
}

export function TrainingEngagementDetail({ engagementId }: TrainingEngagementDetailProps) {
	const router = useRouter();
	const { setOverride } = useBreadcrumb();
	const [engagement, setEngagement] = useState<TrainingEngagementWithRelations | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("registrations");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadEngagement = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await getTrainingEngagementById(engagementId);
			if (result.success && result.data) {
				setEngagement(result.data);
				setOverride(engagementId, result.data.title);
			} else {
				setError(result.message || "Failed to load training engagement");
			}
		} catch (err) {
			setError("Failed to load training engagement");
		} finally {
			setLoading(false);
		}
	}, [engagementId, setOverride]);

	useEffect(() => {
		loadEngagement();
	}, [engagementId, loadEngagement]);

	const handleDelete = async () => {
		if (!engagement) return;

		setIsDeleting(true);
		try {
			const result = await deleteTrainingEngagement(engagement.id);
			if (result.success) {
				router.push("/training-support");
			} else {
				setError(result.message || "Failed to delete training engagement");
			}
		} catch (err) {
			setError("Failed to delete training engagement");
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
		}
	};

	const handleStatusChange = async (newStatus: TrainingStatus) => {
		if (!engagement) return;

		try {
			// For now, we'll just update the local state since we don't have an update action
			setEngagement({ ...engagement, status: newStatus });
		} catch (error) {
			console.error("Failed to update training status:", error);
		}
	};

	const getStatusBadge = (status: TrainingStatus) => {
		const statusLabels: Record<TrainingStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
			DRAFT: { label: "Draft", variant: "secondary" },
			INTAKE: { label: "Intake", variant: "default" },
			PLANNING: { label: "Planning", variant: "secondary" },
			DISCOVERY: { label: "Discovery", variant: "default" },
			DESIGN: { label: "Design", variant: "default" },
			SCHEDULED: { label: "Scheduled", variant: "default" },
			IN_PROGRESS: { label: "In Progress", variant: "default" },
			ACTIVE: { label: "Active", variant: "default" },
			COMPLETED: { label: "Completed", variant: "outline" },
			ON_HOLD: { label: "On Hold", variant: "secondary" },
			CANCELLED: { label: "Cancelled", variant: "destructive" },
		};
		const config = statusLabels[status] || { label: status, variant: "outline" as const };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	const getPhaseBadge = (phase: TrainingPhase) => {
		const phaseLabels: Record<TrainingPhase, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
			DISCOVERY: { label: "Discovery", variant: "secondary" },
			DESIGN: { label: "Design", variant: "default" },
			DEVELOPMENT: { label: "Development", variant: "default" },
			DELIVERY: { label: "Delivery", variant: "default" },
			ASSESSMENT: { label: "Assessment", variant: "outline" },
			SUPPORT: { label: "Support", variant: "outline" },
		};
		const config = phaseLabels[phase] || { label: phase, variant: "outline" as const };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	if (loading) {
		return <Loader />;
	}

	if (error || !engagement) {
		return (
			<div className="py-8 text-center">
				<div className="mb-4 text-red-500">{error || "Training engagement not found"}</div>
				<Button onClick={() => router.push("/training-support")}>
					<ArrowLeft className="h-4 w-4" />
					Back to Training Engagements
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col justify-between gap-4 lg:flex-row">
				<div>
					<h1 className="text-3xl font-bold">{engagement.title}</h1>
					<p className="text-muted-foreground">{engagement.description}</p>
				</div>

				<div className="flex items-center gap-2">
					<div className="mr-2 flex gap-2">
						{getStatusBadge(engagement.status)}
						{getPhaseBadge(engagement.phase)}
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="bg-muted h-8 w-8 rounded-full p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href={`/training-support/${engagement.id}/edit`}>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Link>
							</DropdownMenuItem>

							{engagement.status === "DRAFT" && (
								<DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
									<Eye className="mr-2 h-4 w-4" />
									Activate
								</DropdownMenuItem>
							)}

							{engagement.status === "ACTIVE" && (
								<DropdownMenuItem onClick={() => handleStatusChange("DRAFT")}>
									<EyeOff className="mr-2 h-4 w-4" />
									Deactivate
								</DropdownMenuItem>
							)}

							<DropdownMenuSeparator />

							<DropdownMenuItem
								className="text-destructive"
								onClick={() => setDeleteDialogOpen(true)}>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Event Info Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Date & Time</CardTitle>
						<Calendar className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{engagement.startDate ? formatDate(engagement.startDate) : "TBD"}</div>
						<p className="text-muted-foreground text-xs">{engagement.startDate && engagement.endDate ? `to ${formatDate(engagement.endDate)}` : "No dates set"}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Registrations</CardTitle>
						<Users className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{engagement.registrations?.length || 0}</div>
						<p className="text-muted-foreground text-xs">{engagement.maxParticipants ? `${engagement.maxParticipants - (engagement.registrations?.length || 0)} spots left` : "Unlimited"}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sessions</CardTitle>
						<Ticket className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{engagement.sessions?.length || 0}</div>
						<p className="text-muted-foreground text-xs">Scheduled sessions</p>
					</CardContent>
				</Card>
			</div>

			{/* Location */}
			{engagement.customer && (
				<Card className="gap-0">
					<CardContent className="flex items-center space-x-3 py-0">
						<div className="flex items-center space-x-1 font-bold">
							<MapPin className="h-5 w-5" />
							<span>Customer:</span>
						</div>
						<Link
							href={`/customers/${engagement.customer.id}`}
							className="text-blue-600 hover:underline">
							{engagement.customer.companyName}
						</Link>
					</CardContent>
				</Card>
			)}

			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="sessions">Sessions</TabsTrigger>
					<TabsTrigger value="assessments">Assessments</TabsTrigger>
					<TabsTrigger value="registrations">Registrations</TabsTrigger>
				</TabsList>

				<TabsContent
					value="overview"
					className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Training Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm font-medium">Training Type</label>
								<p className="text-muted-foreground text-sm">{engagement.trainingType.replace("_", " ")}</p>
							</div>

							<div>
								<label className="text-sm font-medium">Delivery Method</label>
								<p className="text-muted-foreground text-sm">{engagement.deliveryMethod.replace("_", " ")}</p>
							</div>

							<div>
								<label className="text-sm font-medium">Target Audience</label>
								<p className="text-muted-foreground text-sm">{engagement.targetAudience || "Not specified"}</p>
							</div>

							<div>
								<label className="text-sm font-medium">Total Duration</label>
								<p className="text-muted-foreground text-sm">{engagement.totalDurationHours ? `${engagement.totalDurationHours} hours` : "TBD"}</p>
							</div>

							{engagement.metaData && (
								<div>
									<label className="text-sm font-medium">Additional Data</label>
									<pre className="text-muted-foreground bg-muted mt-1 rounded p-2 text-xs">{JSON.stringify(engagement.metaData, null, 2)}</pre>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{activeTab === "sessions" && (
					<TabsContent value="sessions">
						<TrainingSessionList
							engagementId={engagementId}
							page={1}
							pageSize={20}
						/>
					</TabsContent>
				)}

				{activeTab === "assessments" && (
					<TabsContent value="assessments">
						<TrainingAssessmentsList
							engagementId={engagementId}
							page={1}
							pageSize={20}
						/>
					</TabsContent>
				)}

				{activeTab === "registrations" && (
					<TabsContent value="registrations">
						<TrainingEngagementRegistrations
							engagementId={engagementId}
							page={1}
							pageSize={20}
						/>
					</TabsContent>
				)}
			</Tabs>

			{/* Delete Confirmation Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Training Engagement"
				description={`Are you sure you want to delete "${engagement.title}"? This action cannot be undone. All related sessions, assessments, and attendee data will be permanently removed.`}
				isDeleting={isDeleting}
				onConfirm={handleDelete}
			/>
		</div>
	);
}
