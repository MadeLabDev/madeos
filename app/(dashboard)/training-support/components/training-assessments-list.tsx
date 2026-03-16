"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar, Edit, FileText, Filter, Plus, Search, Trash2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ASSESSMENT_STATUSES, ASSESSMENT_TYPES, type AssessmentStatus, type AssessmentType, COMPETENCY_LEVELS, type CompetencyLevel, TIMING_TYPES, type TimingType } from "@/lib/config/module-types";
import { createAssessment, deleteAssessment, getAssessments, updateAssessment } from "@/lib/features/training/actions/assessment.actions";
import { AssessmentWithRelations } from "@/lib/features/training/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

const assessmentFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	assessmentType: z.string().min(1, "Assessment type is required"),
	administrationTiming: z.string().min(1, "Timing is required"),
	dueDate: z.string().optional(),
	questions: z.string().optional(),
	passingScore: z.number().optional(),
	status: z.string().min(1, "Status is required"),
	score: z.number().optional(),
	competencyLevel: z.string().optional(),
	feedback: z.string().optional(),
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

interface TrainingAssessmentsListProps {
	engagementId?: string;
	sessionId?: string;
	pageSize?: number;
	page?: number;
}

export function TrainingAssessmentsList({ engagementId, sessionId, pageSize: propPageSize = 20, page: propPage = 1 }: TrainingAssessmentsListProps) {
	const searchParams = useSearchParams();
	const page = propPage > 0 ? propPage : parseInt(searchParams.get("page") || "1");
	const effectivePageSize = propPageSize > 0 ? propPageSize : parseInt(searchParams.get("pageSize") || "20");
	const search = searchParams.get("search") || "";
	const statusFilter = searchParams.get("status") || "all";
	const typeFilter = searchParams.get("type") || "all";

	const [assessments, setAssessments] = useState<AssessmentWithRelations[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [searchTerm, setSearchTerm] = useState(search);
	const [searchInput, setSearchInput] = useState(search);
	const [statusFilterState, setStatusFilterState] = useState(statusFilter);
	const [typeFilterState, setTypeFilterState] = useState(typeFilter);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingAssessment, setEditingAssessment] = useState<AssessmentWithRelations | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<AssessmentFormData>({
		resolver: zodResolver(assessmentFormSchema),
		defaultValues: {
			title: "",
			description: "",
			assessmentType: "",
			administrationTiming: "",
			dueDate: "",
			questions: "",
			passingScore: undefined,
			status: "PENDING",
			score: undefined,
			competencyLevel: "",
			feedback: "",
		},
	});

	usePusher();
	const loadAssessments = useCallback(
		async (currentSearch?: string, currentStatus?: string, currentType?: string) => {
			try {
				setLoading(true);
				const skip = (page - 1) * effectivePageSize;
				const filters: any = {};
				if (engagementId) filters.trainingEngagementId = engagementId;
				if (sessionId) filters.trainingSessionId = sessionId;
				if (currentSearch) filters.search = currentSearch;
				if (currentStatus) filters.status = currentStatus;
				if (currentType) filters.assessmentType = currentType;

				const result = await getAssessments(filters, { skip, take: effectivePageSize });
				if (result.success && result.data) {
					setAssessments(result.data);
					setTotal(result.data.length); // For now, assuming no pagination in service
				} else {
					console.error("Failed to load assessments:", result.message);
					setAssessments([]);
					setTotal(0);
				}
			} catch (error) {
				console.error("Failed to load assessments:", error);
				setAssessments([]);
				setTotal(0);
			} finally {
				setLoading(false);
			}
		},
		[page, effectivePageSize, engagementId, sessionId],
	);

	const handleAssessmentUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;
			if (data.action === "assessment_created" || data.action === "assessment_updated" || data.action === "assessment_deleted") {
				loadAssessments(searchTerm, statusFilterState !== "all" ? statusFilterState : undefined, typeFilterState !== "all" ? typeFilterState : undefined);
			}
		},
		[searchTerm, statusFilterState, typeFilterState, loadAssessments],
	);

	useChannelEvent("private-global", "assessment_update", handleAssessmentUpdate);

	useEffect(() => {
		loadAssessments(searchTerm, statusFilterState !== "all" ? statusFilterState : undefined, typeFilterState !== "all" ? typeFilterState : undefined);
	}, [engagementId, sessionId, page, effectivePageSize, searchTerm, statusFilterState, typeFilterState, loadAssessments]);

	const handleCreateAssessment = async (data: AssessmentFormData) => {
		try {
			setIsSubmitting(true);
			const assessmentData = {
				...data,
				trainingEngagementId: engagementId || "",
				trainingSessionId: sessionId || undefined,
				dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
				assessmentType: data.assessmentType as AssessmentType,
				administrationTiming: data.administrationTiming as TimingType,
				status: data.status as AssessmentStatus,
				competencyLevel: data.competencyLevel as CompetencyLevel | undefined,
			};

			const result = await createAssessment(assessmentData);
			if (result.success) {
				setDialogOpen(false);
				form.reset();
				await loadAssessments();
			} else {
				console.error("Failed to create assessment:", result.message);
			}
		} catch (error) {
			console.error("Failed to create assessment:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateAssessment = async (data: AssessmentFormData) => {
		if (!editingAssessment) return;

		try {
			setIsSubmitting(true);
			const assessmentData = {
				title: data.title,
				description: data.description,
				dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
				assessmentType: data.assessmentType as AssessmentType,
				administrationTiming: data.administrationTiming as TimingType,
				status: data.status as AssessmentStatus,
				competencyLevel: data.competencyLevel as CompetencyLevel | undefined,
				questions: data.questions,
				passingScore: data.passingScore,
				score: data.score,
				feedback: data.feedback,
			};

			const result = await updateAssessment(editingAssessment.id, assessmentData);
			if (result.success) {
				setDialogOpen(false);
				setEditingAssessment(null);
				form.reset();
				await loadAssessments();
			} else {
				console.error("Failed to update assessment:", result.message);
			}
		} catch (error) {
			console.error("Failed to update assessment:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteAssessment = async (assessmentId: string) => {
		if (!confirm("Are you sure you want to delete this assessment?")) return;

		try {
			const result = await deleteAssessment(assessmentId);
			if (result.success) {
				await loadAssessments();
			} else {
				console.error("Failed to delete assessment:", result.message);
			}
		} catch (error) {
			console.error("Failed to delete assessment:", error);
		}
	};

	const openCreateDialog = () => {
		setEditingAssessment(null);
		form.reset({
			title: "",
			description: "",
			assessmentType: "",
			administrationTiming: "",
			dueDate: "",
			questions: "",
			passingScore: undefined,
			status: "PENDING",
			score: undefined,
			competencyLevel: "",
			feedback: "",
		});
		setDialogOpen(true);
	};

	const openEditDialog = (assessment: AssessmentWithRelations) => {
		setEditingAssessment(assessment);
		form.reset({
			title: assessment.title,
			description: assessment.description || "",
			assessmentType: assessment.assessmentType,
			administrationTiming: assessment.administrationTiming,
			dueDate: assessment.dueDate ? format(new Date(assessment.dueDate), "yyyy-MM-dd") : "",
			questions: assessment.questions || "",
			passingScore: assessment.passingScore || undefined,
			status: assessment.status,
			score: assessment.score || undefined,
			competencyLevel: assessment.competencyLevel || "",
			feedback: assessment.feedback || "",
		});
		setDialogOpen(true);
	};

	const handleStatusFilterChange = (value: string) => {
		setStatusFilterState(value);
		const url = new URL(window.location.href);
		if (value !== "all") {
			url.searchParams.set("status", value);
		} else {
			url.searchParams.delete("status");
		}
		window.history.pushState({}, "", url.toString());
	};

	const handleTypeFilterChange = (value: string) => {
		setTypeFilterState(value);
		const url = new URL(window.location.href);
		if (value !== "all") {
			url.searchParams.set("type", value);
		} else {
			url.searchParams.delete("type");
		}
		window.history.pushState({}, "", url.toString());
	};

	const handleSearchChange = (value: string) => {
		setSearchInput(value);
	};

	const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			setSearchTerm(searchInput);
			const url = new URL(window.location.href);
			if (searchInput) {
				url.searchParams.set("search", searchInput);
			} else {
				url.searchParams.delete("search");
			}
			window.history.pushState({}, "", url.toString());
		}
	};

	const getStatusBadge = (status: AssessmentStatus) => {
		const statusConfig = ASSESSMENT_STATUSES.find((s) => s.value === status);
		if (statusConfig) {
			return <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>;
		}
		return <Badge variant="outline">{status}</Badge>;
	};

	const getTypeBadge = (type: string) => {
		const typeConfig = ASSESSMENT_TYPES.find((t) => t.value === type);
		if (typeConfig) {
			return <Badge variant="outline">{typeConfig.label}</Badge>;
		}
		return <Badge variant="outline">{type}</Badge>;
	};

	if (loading) {
		return <Loader size="lg" />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Assessments</h3>
				<Button
					variant="default"
					onClick={openCreateDialog}>
					<Plus className="mr-2 h-4 w-4" />
					Add Assessment
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row">
						<div className="flex-1">
							<div className="relative">
								<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
								<Input
									placeholder="Search assessments..."
									value={searchInput}
									onChange={(e) => handleSearchChange(e.target.value)}
									onKeyDown={handleSearchKeyDown}
									className="pl-10"
								/>
							</div>
						</div>
						<div className="flex gap-2">
							<Select
								value={typeFilterState}
								onValueChange={handleTypeFilterChange}>
								<SelectTrigger className="w-40">
									<FileText className="mr-2 h-4 w-4" />
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									{ASSESSMENT_TYPES.map((type) => (
										<SelectItem
											key={type.value}
											value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={statusFilterState}
								onValueChange={handleStatusFilterChange}>
								<SelectTrigger className="w-40">
									<Filter className="mr-2 h-4 w-4" />
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									{ASSESSMENT_STATUSES.map((status) => (
										<SelectItem
											key={status.value}
											value={status.value}>
											{status.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{assessments.length === 0 ? (
						<div className="py-8 text-center">
							<p className="text-muted-foreground">{assessments.length === 0 ? "No assessments yet." : "No assessments match your filters."}</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Assessment</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Timing</TableHead>
										<TableHead>Due Date</TableHead>
										<TableHead>Score</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{assessments.map((assessment) => (
										<TableRow key={assessment.id}>
											<TableCell>
												<div>
													<p className="font-medium">{assessment.title}</p>
													{assessment.description && <p className="text-muted-foreground max-w-xs truncate text-sm">{assessment.description}</p>}
												</div>
											</TableCell>
											<TableCell>{getTypeBadge(assessment.assessmentType)}</TableCell>
											<TableCell>
												<div className="text-sm">{assessment.administrationTiming.replace("_", " ")}</div>
											</TableCell>
											<TableCell>
												{assessment.dueDate ? (
													<div className="text-sm">
														<div className="flex items-center gap-1">
															<Calendar className="h-3 w-3" />
															{format(new Date(assessment.dueDate), "MMM dd, yyyy")}
														</div>
													</div>
												) : (
													<span className="text-muted-foreground">No due date</span>
												)}
											</TableCell>
											<TableCell>
												{assessment.score !== null && assessment.score !== undefined ? (
													<div className="text-sm">
														<div className="flex items-center gap-1">
															<span className="font-medium">{assessment.score}%</span>
															{assessment.passingScore && <span className={`text-xs ${assessment.score >= assessment.passingScore ? "text-green-600" : "text-red-600"}`}>({assessment.passingScore}% passing)</span>}
														</div>
													</div>
												) : (
													<span className="text-muted-foreground">Not scored</span>
												)}
											</TableCell>
											<TableCell>{getStatusBadge(assessment.status)}</TableCell>
											<TableCell>
												<div className="flex gap-1">
													<Button
														variant="outline"
														size="sm"
														onClick={() => openEditDialog(assessment)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDeleteAssessment(assessment.id)}>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Pagination */}
			{total > effectivePageSize && (
				<Pagination
					page={page}
					total={total}
					pageSize={effectivePageSize}
					search={search}
					itemName="assessments"
					baseUrl={engagementId ? `/training-support/${engagementId}` : "/training-support/assessments"}
					type={statusFilterState !== "all" ? statusFilterState : undefined}
				/>
			)}

			<Dialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}>
				<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{editingAssessment ? "Edit Assessment" : "Create New Assessment"}</DialogTitle>
					</DialogHeader>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(editingAssessment ? handleUpdateAssessment : handleCreateAssessment)}
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
													placeholder="Assessment title"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="assessmentType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Assessment Type</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{ASSESSMENT_TYPES.map((type) => (
														<SelectItem
															key={type.value}
															value={type.value}>
															{type.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
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
												placeholder="Assessment description"
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
									name="administrationTiming"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Timing</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select timing" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{TIMING_TYPES.map((timing) => (
														<SelectItem
															key={timing.value}
															value={timing.value}>
															{timing.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="dueDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Due Date</FormLabel>
											<FormControl>
												<Input
													type="date"
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
									name="passingScore"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Passing Score (%)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													max={100}
													placeholder="e.g. 70"
													{...field}
													onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Status</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select status" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{ASSESSMENT_STATUSES.map((status) => (
														<SelectItem
															key={status.value}
															value={status.value}>
															{status.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="score"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Score (%)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													max={100}
													placeholder="Actual score"
													{...field}
													onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="competencyLevel"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Competency Level</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select level" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{COMPETENCY_LEVELS.map((level) => (
														<SelectItem
															key={level.value}
															value={level.value}>
															{level.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="questions"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Questions/Content</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Assessment questions or content"
												rows={4}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="feedback"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Feedback</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Assessment feedback or notes"
												rows={3}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

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
									{editingAssessment ? "Update Assessment" : "Create Assessment"}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
