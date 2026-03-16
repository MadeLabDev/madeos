"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CheckCircle, Download, Filter, Phone, Plus, Search, Users, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Pagination } from "@/components/pagination/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { BULK_ACTION_OPTIONS, CHECK_IN_STATUS_OPTIONS, REGISTRATION_STATUSES } from "@/lib/config/module-types";
import { checkInAttendeeAction } from "@/lib/features/events/actions/checkin.actions";
import { getEventById } from "@/lib/features/events/actions/event.actions";
import { createManualRegistration, getEventRegistrations, updateRegistrationStatus } from "@/lib/features/events/actions/registration.actions";

// Define enums locally to avoid importing from Prisma
enum RegistrationStatus {
	PENDING = "PENDING",
	CONFIRMED = "CONFIRMED",
	CANCELLED = "CANCELLED",
	REFUNDED = "REFUNDED",
}

enum CheckInStatus {
	NOT_CHECKED_IN = "NOT_CHECKED_IN",
	CHECKED_IN = "CHECKED_IN",
}

// Define types locally
type Ticket = any;
type TicketType = any;
type RegistrationWithRelations = any;
type EventWithRelations = any;

const bulkActionSchema = z.object({
	action: z.enum(["check_in", "cancel", "refund"]),
	reason: z.string().optional(),
});

const manualRegistrationSchema = z.object({
	email: z.string().email("Invalid email address"),
	name: z.string().min(1, "Name is required"),
	ticketTypeId: z.string().min(1, "Ticket type is required"),
	quantity: z.number().min(1, "Quantity must be at least 1"),
	externalTicketId: z.string().optional(),
});

type BulkActionFormData = z.infer<typeof bulkActionSchema>;
type ManualRegistrationFormData = z.infer<typeof manualRegistrationSchema>;

interface EventRegistrationsProps {
	eventId: string;
	pageSize?: number;
	page?: number;
}

export function EventRegistrations({ eventId, pageSize: propPageSize = 20, page: propPage = 1 }: EventRegistrationsProps) {
	const searchParams = useSearchParams();
	const page = propPage > 0 ? propPage : parseInt(searchParams.get("page") || "1");
	const effectivePageSize = propPageSize > 0 ? propPageSize : parseInt(searchParams.get("pageSize") || "20");
	const search = searchParams.get("search") || "";
	const statusFilter = searchParams.get("status") || "all";
	const { data: session } = useSession();

	const [registrations, setRegistrations] = useState<RegistrationWithRelations[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [searchTerm, setSearchTerm] = useState(search);
	const [searchInput, setSearchInput] = useState(search);
	const [statusFilterState, setStatusFilterState] = useState(statusFilter);
	const [event, setEvent] = useState<EventWithRelations | null>(null);
	const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
	const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
	const [manualDialogOpen, setManualDialogOpen] = useState(false);

	const bulkForm = useForm<BulkActionFormData>({
		resolver: zodResolver(bulkActionSchema),
		defaultValues: {
			action: "check_in",
			reason: "",
		},
	});

	const manualForm = useForm<ManualRegistrationFormData>({
		resolver: zodResolver(manualRegistrationSchema),
		defaultValues: {
			email: "",
			name: "",
			ticketTypeId: "",
			quantity: 1,
			externalTicketId: "",
		},
	});

	const loadEventData = useCallback(async () => {
		try {
			const result = await getEventById(eventId);
			if (result.success && result.data) {
				setEvent(result.data);
			}
		} catch (error) {
			console.error("Failed to load event data:", error);
		}
	}, [eventId, setEvent]);

	const loadRegistrations = useCallback(
		async (currentSearch?: string, currentStatus?: string) => {
			try {
				setLoading(true);
				const skip = (page - 1) * effectivePageSize;
				const result = await getEventRegistrations(eventId, { skip, take: effectivePageSize }, { search: currentSearch, status: currentStatus });
				if (result.success && result.data) {
					// Handle paginated response
					if (result.data && typeof result.data === "object" && "registrations" in result.data) {
						let paginatedData = result.data as { registrations: RegistrationWithRelations[]; total: number };
						setRegistrations(paginatedData.registrations);
						setTotal(paginatedData.total);
					} else {
						// Handle non-paginated response (fallback)
						let regs = result.data as RegistrationWithRelations[];
						setRegistrations(regs);
						setTotal(regs.length);
					}
				} else {
					console.error("Failed to load registrations:", result.message);
					setRegistrations([]);
					setTotal(0);
				}
			} catch (error) {
				console.error("Failed to load registrations:", error);
				setRegistrations([]);
				setTotal(0);
			} finally {
				setLoading(false);
			}
		},
		[page, effectivePageSize, eventId, setLoading, setRegistrations, setTotal],
	);

	useEffect(() => {
		loadEventData();
	}, [eventId, loadEventData]);

	useEffect(() => {
		loadRegistrations(searchTerm, statusFilterState !== "all" ? statusFilterState : undefined);
	}, [eventId, page, effectivePageSize, searchTerm, statusFilterState, loadRegistrations]);

	const handleStatusChange = async (registrationId: string, newStatus: RegistrationStatus) => {
		try {
			const result = await updateRegistrationStatus(registrationId, newStatus);
			if (result.success) {
				await loadRegistrations();
			} else {
				console.error("Failed to update registration status:", result.message);
			}
		} catch (error) {
			console.error("Failed to update registration status:", error);
		}
	};

	const handleCheckIn = async (registrationId: string) => {
		if (!session?.user?.id) {
			console.error("No user session found");
			return;
		}

		try {
			const result = await checkInAttendeeAction(registrationId, session.user.id);
			if (result.success) {
				await loadRegistrations();
			} else {
				console.error("Failed to check in attendee:", result.message);
			}
		} catch (error) {
			console.error("Failed to check in attendee:", error);
		}
	};

	const handleBulkAction = async (data: BulkActionFormData) => {
		if (!session?.user?.id) {
			console.error("No user session found");
			return;
		}

		try {
			for (const registrationId of selectedRegistrations) {
				switch (data.action) {
					case "check_in":
						await checkInAttendeeAction(registrationId, session.user.id);
						break;
					case "cancel":
						await updateRegistrationStatus(registrationId, RegistrationStatus.CANCELLED);
						break;
					case "refund":
						await updateRegistrationStatus(registrationId, RegistrationStatus.REFUNDED);
						break;
				}
			}
			setBulkDialogOpen(false);
			setSelectedRegistrations([]);
			await loadRegistrations();
		} catch (error) {
			console.error("Failed to perform bulk action:", error);
		}
	};

	const handleManualRegistration = async (data: ManualRegistrationFormData) => {
		try {
			const result = await createManualRegistration({
				...data,
				eventId,
			});

			if (result.success) {
				setManualDialogOpen(false);
				manualForm.reset();
				await loadRegistrations();
			} else {
				console.error("Failed to create manual registration:", result.message);
			}
		} catch (error) {
			console.error("Failed to create manual registration:", error);
		}
	};

	const handleStatusFilterChange = (value: string) => {
		setStatusFilterState(value);
		// Update URL params
		const url = new URL(window.location.href);
		if (value !== "all") {
			url.searchParams.set("status", value);
		} else {
			url.searchParams.delete("status");
		}
		window.history.pushState({}, "", url.toString());
	};

	const handleSearchChange = (value: string) => {
		setSearchInput(value);
	};

	const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			setSearchTerm(searchInput);
			// Update URL params
			const url = new URL(window.location.href);
			if (searchInput) {
				url.searchParams.set("search", searchInput);
			} else {
				url.searchParams.delete("search");
			}
			window.history.pushState({}, "", url.toString());
		}
	};

	const exportRegistrations = () => {
		const csvData = registrations.map((registration) => ({
			Name: registration.user?.name || "",
			Email: registration.user?.email || "",
			Phone: registration.user?.phone || "",
			TicketType: registration.tickets?.[0]?.ticketType?.name || "N/A",
			Quantity: registration.tickets?.length || 0,
			TotalAmount: registration.tickets?.reduce((total: number, ticket: Ticket & { ticketType: TicketType }) => total + ticket.ticketType.price, 0) || 0,
			Status: registration.status,
			CheckInStatus: registration.checkedInAt ? CheckInStatus.CHECKED_IN : CheckInStatus.NOT_CHECKED_IN,
			RegisteredAt: format(new Date(registration.createdAt), "yyyy-MM-dd HH:mm:ss"),
			CheckedInAt: registration.checkedInAt ? format(new Date(registration.checkedInAt), "yyyy-MM-dd HH:mm:ss") : "",
		}));

		if (csvData.length === 0) return;

		const csvString = [Object.keys(csvData[0]!).join(","), ...csvData.map((row) => Object.values(row).join(","))].join("\n");

		const blob = new Blob([csvString], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `event-registrations-${eventId}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const getStatusBadge = (status: RegistrationStatus) => {
		const statusConfig = REGISTRATION_STATUSES.find((s) => s.value === status);
		if (statusConfig) {
			return <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>;
		}
		return <Badge variant="outline">{status}</Badge>;
	};

	const getCheckInBadge = (status: CheckInStatus) => {
		const checkInConfig = CHECK_IN_STATUS_OPTIONS.find((option) => option.value === (status === CheckInStatus.CHECKED_IN ? "checked_in" : "not_checked_in"));
		if (checkInConfig) {
			return <Badge variant={checkInConfig.badgeVariant}>{checkInConfig.label}</Badge>;
		}
		return <Badge variant="outline">{status}</Badge>;
	};

	if (loading) {
		return <Loader size="lg" />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Event Registrations</h3>
				<div className="flex gap-2">
					<Button
						variant="default"
						onClick={() => setManualDialogOpen(true)}>
						<Users className="mr-2 h-4 w-4" />
						Add Manual Registration
					</Button>
					<Button
						variant="outline"
						onClick={exportRegistrations}>
						<Download className="mr-2 h-4 w-4" />
						Export CSV
					</Button>
					{selectedRegistrations.length > 0 && (
						<Button
							variant="outline"
							onClick={() => setBulkDialogOpen(true)}>
							<Users className="mr-2 h-4 w-4" />
							Bulk Actions ({selectedRegistrations.length})
						</Button>
					)}
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row">
						<div className="flex-1">
							<div className="relative">
								<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
								<Input
									placeholder="Search by name, email, or ticket type..."
									value={searchInput}
									onChange={(e) => handleSearchChange(e.target.value)}
									onKeyDown={handleSearchKeyDown}
									className="pl-10"
								/>
							</div>
						</div>
						<div className="flex gap-2">
							<Select
								value={statusFilterState}
								onValueChange={handleStatusFilterChange}>
								<SelectTrigger className="w-40">
									<Filter className="mr-2 h-4 w-4" />
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									{REGISTRATION_STATUSES.map((status) => (
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
					{registrations.length === 0 ? (
						<div className="py-8 text-center">
							<p className="text-muted-foreground">{registrations.length === 0 ? "No registrations yet." : "No registrations match your filters."}</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-12">
											<input
												type="checkbox"
												checked={selectedRegistrations.length === registrations.length}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedRegistrations(registrations.map((r) => r.id));
													} else {
														setSelectedRegistrations([]);
													}
												}}
											/>
										</TableHead>
										<TableHead>Attendee</TableHead>
										<TableHead>Ticket Type</TableHead>
										<TableHead>Quantity</TableHead>
										<TableHead>Total</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Check-in</TableHead>
										<TableHead>Registered</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{registrations.map((registration) => (
										<TableRow key={registration.id}>
											<TableCell>
												<input
													type="checkbox"
													checked={selectedRegistrations.includes(registration.id)}
													onChange={(e) => {
														if (e.target.checked) {
															setSelectedRegistrations([...selectedRegistrations, registration.id]);
														} else {
															setSelectedRegistrations(selectedRegistrations.filter((id) => id !== registration.id));
														}
													}}
												/>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar className="h-8 w-8">
														<AvatarImage src={registration.user?.avatar} />
														<AvatarFallback>{registration.user?.name?.charAt(0) || registration.user?.email?.charAt(0) || "?"}</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{registration.user?.name || "N/A"}</p>
														<p className="text-muted-foreground text-sm">{registration.user?.email || "N/A"}</p>
														{registration.user?.phone && (
															<p className="text-muted-foreground flex items-center gap-1 text-xs">
																<Phone className="h-3 w-3" />
																{registration.user.phone}
															</p>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>{registration.tickets?.[0]?.ticketType?.name || "N/A"}</TableCell>
											<TableCell>{registration.tickets?.length || 0}</TableCell>
											<TableCell>${registration.tickets?.reduce((total: number, ticket: Ticket & { ticketType: TicketType }) => total + ticket.ticketType.price, 0)?.toFixed(2) || "0.00"}</TableCell>
											<TableCell>{getStatusBadge(registration.status)}</TableCell>
											<TableCell>{getCheckInBadge(registration.checkedInAt ? CheckInStatus.CHECKED_IN : CheckInStatus.NOT_CHECKED_IN)}</TableCell>
											<TableCell>
												<div className="text-sm">{format(new Date(registration.createdAt), "MMM dd, yyyy")}</div>
												<div className="text-muted-foreground text-xs">{format(new Date(registration.createdAt), "HH:mm")}</div>
											</TableCell>
											<TableCell>
												<div className="flex gap-1">
													{registration.status === RegistrationStatus.CONFIRMED && !registration.checkedInAt && (
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleCheckIn(registration.id)}>
															<CheckCircle className="h-4 w-4" />
														</Button>
													)}
													<Select
														value={registration.status}
														onValueChange={(value) => handleStatusChange(registration.id, value as RegistrationStatus)}>
														<SelectTrigger className="w-32">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{REGISTRATION_STATUSES.filter((status) => status.value !== "REFUNDED").map((status) => (
																<SelectItem
																	key={status.value}
																	value={status.value}>
																	{status.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
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
					itemName="registrations"
					baseUrl={`/events/${eventId}`}
					type={statusFilterState !== "all" ? statusFilterState : undefined}
				/>
			)}

			<Dialog
				open={bulkDialogOpen}
				onOpenChange={setBulkDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Bulk Actions</DialogTitle>
					</DialogHeader>

					<Form {...bulkForm}>
						<form
							onSubmit={bulkForm.handleSubmit(handleBulkAction)}
							className="space-y-4">
							<FormField
								control={bulkForm.control}
								name="action"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Action</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select action" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{BULK_ACTION_OPTIONS.map((action) => (
													<SelectItem
														key={action.value}
														value={action.value}>
														{action.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							<FormField
								control={bulkForm.control}
								name="reason"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reason (Optional)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Reason for this bulk action"
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
									onClick={() => setBulkDialogOpen(false)}>
									<X className="h-4 w-4" />
									Cancel
								</Button>
								<Button type="submit">Apply to {selectedRegistrations.length} registrations</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={manualDialogOpen}
				onOpenChange={setManualDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Add Manual Registration</DialogTitle>
					</DialogHeader>

					<Form {...manualForm}>
						<form
							onSubmit={manualForm.handleSubmit(handleManualRegistration)}
							className="space-y-4">
							<FormField
								control={manualForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="user@example.com"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={manualForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Full name"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={manualForm.control}
								name="ticketTypeId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ticket Type</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select ticket type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{event?.ticketTypes?.map((ticketType: TicketType) => (
													<SelectItem
														key={ticketType.id}
														value={ticketType.id}>
														{ticketType.name} - ${ticketType.price}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							<FormField
								control={manualForm.control}
								name="quantity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Quantity</FormLabel>
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

							<FormField
								control={manualForm.control}
								name="externalTicketId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>External Ticket ID (Optional)</FormLabel>
										<FormControl>
											<Input
												placeholder="External reference"
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
									onClick={() => setManualDialogOpen(false)}>
									<X className="h-4 w-4" />
									Cancel
								</Button>
								<Button type="submit">
									<Plus className="h-4 w-4" />
									Add Registration
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
