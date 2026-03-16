"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar, Clock, Edit, MoreHorizontal, Plus, Trash2, Users, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { type CompetencyLevel, DELIVERY_METHODS, type DeliveryMethod, SESSION_STATUSES } from "@/lib/config/module-types";
import { createTrainingSession, deleteTrainingSession, getTrainingSessions, updateTrainingSession } from "@/lib/features/training/actions/training-session.actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

// Define enums locally to avoid importing from Prisma
enum SessionStatus {
	PLANNED = "PLANNED",
	SCHEDULED = "SCHEDULED",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
}

// Define types locally
type TrainingSessionWithRelations = any;

const sessionFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	sessionNumber: z.number().min(1, "Session number must be at least 1"),
	deliveryMethod: z.string().min(1, "Delivery method is required"),
	duration: z.number().min(1, "Duration must be at least 1 minute"),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	maxCapacity: z.number().optional(),
	instructorId: z.string().optional(),
	contentUrl: z.string().optional(),
	location: z.string().optional(),
	hasPreAssessment: z.boolean(),
	hasPostAssessment: z.boolean(),
	preRequisiteLevel: z.string().optional(),
	sopLibraryIds: z.string().optional(),
});

interface SessionFormDataExplicit {
	title: string;
	description?: string;
	sessionNumber: number;
	deliveryMethod: string;
	duration: number;
	startDate: string;
	endDate: string;
	maxCapacity?: number;
	instructorId?: string;
	contentUrl?: string;
	location?: string;
	hasPreAssessment: boolean;
	hasPostAssessment: boolean;
	preRequisiteLevel?: string;
	sopLibraryIds?: string;
}

interface TrainingSessionListProps {
	engagementId?: string;
	pageSize?: number;
	page?: number;
	search?: string;
	statusFilter?: string;
}

export function TrainingSessionList({ engagementId, pageSize: propPageSize = 20, page: propPage = 1, search: propSearch, statusFilter: propStatusFilter }: TrainingSessionListProps) {
	const searchParams = useSearchParams();
	const page = propPage > 0 ? propPage : parseInt(searchParams.get("page") || "1");
	const effectivePageSize = propPageSize > 0 ? propPageSize : parseInt(searchParams.get("pageSize") || "20");
	const search = propSearch !== undefined ? propSearch : searchParams.get("search") || "";
	const statusFilter = propStatusFilter !== undefined ? propStatusFilter : searchParams.get("status") || "all";

	const [sessions, setSessions] = useState<TrainingSessionWithRelations[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingSession, setEditingSession] = useState<TrainingSessionWithRelations | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [sessionToDelete, setSessionToDelete] = useState<TrainingSessionWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Checkbox selection state
	const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	const form = useForm<SessionFormDataExplicit>({
		resolver: zodResolver(sessionFormSchema),
		defaultValues: {
			title: "",
			description: "",
			sessionNumber: 1,
			deliveryMethod: "",
			duration: 60,
			startDate: "",
			endDate: "",
			maxCapacity: undefined,
			instructorId: "",
			contentUrl: "",
			location: "",
			hasPreAssessment: false,
			hasPostAssessment: false,
			preRequisiteLevel: "",
			sopLibraryIds: "",
		},
	});

	const loadSessions = useCallback(
		async (currentSearch?: string, currentStatus?: string) => {
			try {
				setLoading(true);
				const skip = (page - 1) * effectivePageSize;
				const filters: any = {};
				if (engagementId) filters.trainingEngagementId = engagementId;
				if (currentSearch) filters.search = currentSearch;
				if (currentStatus) filters.status = currentStatus;

				const result = await getTrainingSessions(filters, { skip, take: effectivePageSize });
				if (result.success && result.data) {
					setSessions(result.data);
					setTotal(result.data.length); // For now, assuming no pagination in service
				} else {
					console.error("Failed to load sessions:", result.message);
					setSessions([]);
					setTotal(0);
				}
			} catch (error) {
				console.error("Failed to load sessions:", error);
				setSessions([]);
				setTotal(0);
			} finally {
				setLoading(false);
			}
		},
		[page, effectivePageSize, engagementId],
	);

	useEffect(() => {
		loadSessions(search, statusFilter !== "all" ? statusFilter : undefined);
	}, [engagementId, page, effectivePageSize, search, statusFilter, loadSessions]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleTrainingSessionUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "training_session_created" || data.action === "training_session_updated" || data.action === "training_session_deleted") {
				loadSessions(search, statusFilter !== "all" ? statusFilter : undefined);
			}
		},
		[search, statusFilter, loadSessions],
	);

	// Listen for training session update events
	useChannelEvent("private-global", "training_session_update", handleTrainingSessionUpdate);

	// Bulk selection functions
	const toggleSelectAll = () => {
		if (selectedSessionIds.length === sessions.length) {
			setSelectedSessionIds([]);
		} else {
			setSelectedSessionIds(sessions.map((session) => session.id));
		}
	};

	const toggleSelectSession = (sessionId: string) => {
		setSelectedSessionIds((prev) => (prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]));
	};

	const handleBulkDelete = async () => {
		if (selectedSessionIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			for (const sessionId of selectedSessionIds) {
				const result = await deleteTrainingSession(sessionId);
				if (!result.success) {
					console.error(`Failed to delete session ${sessionId}:`, result.message);
				}
			}
			setSelectedSessionIds([]);
			await loadSessions();
		} catch (error) {
			console.error("Failed to delete sessions:", error);
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleCreateSession = async (data: SessionFormDataExplicit) => {
		try {
			setIsSubmitting(true);
			const sessionData = {
				...data,
				trainingEngagementId: engagementId || "",
				startDate: new Date(data.startDate),
				endDate: new Date(data.endDate),
				deliveryMethod: data.deliveryMethod as DeliveryMethod,
				preRequisiteLevel: data.preRequisiteLevel as CompetencyLevel | undefined,
			};

			const result = await createTrainingSession(sessionData);
			if (result.success) {
				setDialogOpen(false);
				form.reset();
				await loadSessions();
			} else {
				console.error("Failed to create session:", result.message);
			}
		} catch (error) {
			console.error("Failed to create session:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateSession = async (data: SessionFormDataExplicit) => {
		if (!editingSession) return;

		try {
			setIsSubmitting(true);
			const sessionData = {
				...data,
				startDate: new Date(data.startDate),
				endDate: new Date(data.endDate),
				deliveryMethod: data.deliveryMethod as DeliveryMethod,
				preRequisiteLevel: data.preRequisiteLevel as CompetencyLevel | undefined,
			};

			const result = await updateTrainingSession(editingSession.id, sessionData);
			if (result.success) {
				setDialogOpen(false);
				setEditingSession(null);
				form.reset();
				await loadSessions();
			} else {
				console.error("Failed to update session:", result.message);
			}
		} catch (error) {
			console.error("Failed to update session:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteSession = (session: TrainingSessionWithRelations) => {
		setSessionToDelete(session);
		setDeleteDialogOpen(true);
	};

	const confirmDeleteSession = async () => {
		if (!sessionToDelete) return;

		try {
			setDeleting(true);
			const result = await deleteTrainingSession(sessionToDelete.id);
			if (result.success) {
				setDeleteDialogOpen(false);
				setSessionToDelete(null);
				await loadSessions();
			} else {
				console.error("Failed to delete session:", result.message);
			}
		} catch (error) {
			console.error("Failed to delete session:", error);
		} finally {
			setDeleting(false);
		}
	};

	const openCreateDialog = () => {
		setEditingSession(null);
		form.reset({
			title: "",
			description: "",
			sessionNumber: sessions.length + 1,
			deliveryMethod: "",
			duration: 60,
			startDate: "",
			endDate: "",
			maxCapacity: undefined,
			instructorId: "",
			contentUrl: "",
			location: "",
			hasPreAssessment: false,
			hasPostAssessment: false,
			preRequisiteLevel: "",
			sopLibraryIds: "",
		});
		setDialogOpen(true);
	};

	const openEditDialog = (session: TrainingSessionWithRelations) => {
		setEditingSession(session);
		form.reset({
			title: session.title,
			description: session.description || "",
			sessionNumber: session.sessionNumber,
			deliveryMethod: session.deliveryMethod,
			duration: session.duration,
			startDate: session.startDate ? format(new Date(session.startDate), "yyyy-MM-dd'T'HH:mm") : "",
			endDate: session.endDate ? format(new Date(session.endDate), "yyyy-MM-dd'T'HH:mm") : "",
			maxCapacity: session.maxCapacity || undefined,
			instructorId: session.instructorId || "",
			contentUrl: session.contentUrl || "",
			location: session.location || "",
			hasPreAssessment: session.hasPreAssessment ?? false,
			hasPostAssessment: session.hasPostAssessment ?? false,
			preRequisiteLevel: session.preRequisiteLevel || "",
			sopLibraryIds: session.sopLibraryIds || "",
		});
		setDialogOpen(true);
	};

	const getStatusBadge = (status: SessionStatus) => {
		const statusConfig = SESSION_STATUSES.find((s) => s.value === status);
		if (statusConfig) {
			return <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>;
		}
		return <Badge variant="outline">{status}</Badge>;
	};

	if (loading) {
		return <Loader size="lg" />;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions Bar */}
			{selectedSessionIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedSessionIds.length}
					itemName="session"
					isLoading={bulkActionLoading}
					onClear={() => setSelectedSessionIds([])}
					actions={[
						{
							label: "Delete Selected",
							onClick: handleBulkDelete,
							variant: "destructive" as const,
						},
					]}
				/>
			)}
			{/* Table */}
			{loading ? (
				<Loader />
			) : sessions.length === 0 ? (
				<NoItemFound
					title="No training sessions found"
					description={search || statusFilter !== "all" ? "Try adjusting your search or filters." : "Get started by creating your first training session."}
					action={
						<Button onClick={openCreateDialog}>
							<Plus className="mr-2 h-4 w-4" />
							Create Training Session
						</Button>
					}
				/>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[50px]">
									<Checkbox
										checked={selectedSessionIds.length === sessions.length}
										onCheckedChange={toggleSelectAll}
										aria-label="Select all"
									/>
								</TableHead>
								<TableHead>Session</TableHead>
								<TableHead>Schedule</TableHead>
								<TableHead>Duration</TableHead>
								<TableHead>Capacity</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sessions.map((session) => (
								<TableRow key={session.id}>
									<TableCell>
										<Checkbox
											checked={selectedSessionIds.includes(session.id)}
											onCheckedChange={() => toggleSelectSession(session.id)}
											aria-label={`Select ${session.title}`}
										/>
									</TableCell>
									<TableCell>
										<div>
											<p className="font-medium">{session.title}</p>
											<p className="text-muted-foreground text-sm">Session #{session.sessionNumber}</p>
											{session.description && <p className="text-muted-foreground max-w-xs truncate text-sm">{session.description}</p>}
										</div>
									</TableCell>
									<TableCell>
										<div className="text-sm">
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{format(new Date(session.startDate), "MMM dd, yyyy")}
											</div>
											<div className="text-muted-foreground flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{format(new Date(session.startDate), "HH:mm")} - {format(new Date(session.endDate), "HH:mm")}
											</div>
											{session.location && <div className="text-muted-foreground">{session.location}</div>}
										</div>
									</TableCell>
									<TableCell>
										<div className="text-sm">{session.duration} min</div>
										<div className="text-muted-foreground text-xs">{session.deliveryMethod.replace("_", " ")}</div>
									</TableCell>
									<TableCell>
										{session.maxCapacity ? (
											<div className="flex items-center gap-1">
												<Users className="h-3 w-3" />
												{session.maxCapacity}
											</div>
										) : (
											<span className="text-muted-foreground">Unlimited</span>
										)}
									</TableCell>
									<TableCell>{getStatusBadge(session.status)}</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem onClick={() => openEditDialog(session)}>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => handleDeleteSession(session)}>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}{" "}
			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={effectivePageSize}
					search={search}
					itemName="sessions"
					baseUrl="/training-support/sessions"
					type={statusFilter !== "all" ? statusFilter : undefined}
				/>
			)}
			<Dialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}>
				<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{editingSession ? "Edit Session" : "Create New Session"}</DialogTitle>
					</DialogHeader>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(editingSession ? handleUpdateSession : handleCreateSession)}
							className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input
													placeholder="Session title"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="sessionNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Session Number</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={1}
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Session description"
												rows={3}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="deliveryMethod"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Delivery Method</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select delivery method" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{DELIVERY_METHODS.map((method) => (
														<SelectItem
															key={method.value}
															value={method.value}>
															{method.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="duration"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Duration (minutes)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={1}
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Start Date & Time</FormLabel>
											<FormControl>
												<Input
													type="datetime-local"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="endDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>End Date & Time</FormLabel>
											<FormControl>
												<Input
													type="datetime-local"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Location</FormLabel>
											<FormControl>
												<Input
													placeholder="Physical location or virtual link"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="maxCapacity"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Max Capacity</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={1}
													placeholder="Leave empty for unlimited"
													{...field}
													onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="flex justify-end gap-4 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setDialogOpen(false)}>
									<X className="h-4 w-4" />
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}>
									{editingSession ? "Update Session" : "Create Session"}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Training Session"
				description={`Are you sure you want to delete "${sessionToDelete?.title}"? This action cannot be undone.`}
				onConfirm={confirmDeleteSession}
				isDeleting={deleting}
			/>
		</div>
	);
}
