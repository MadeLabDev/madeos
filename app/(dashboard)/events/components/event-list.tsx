"use client";

import { useCallback, useEffect, useState } from "react";

import { Calendar, Eye, MoreHorizontal, Pencil, Pin, Plus, Ticket, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageLoading } from "@/components/ui/page-loading";
import { EVENT_STATUSES, EVENT_TYPES, TICKETING_MODES } from "@/lib/config/module-types";
import { bulkDeleteEventsAction, deleteEventAction, getEventsList } from "@/lib/features/events/actions/event.actions";
import { EventStatus, EventType, EventWithRelations, TicketingMode } from "@/lib/features/events/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";
import { formatDate } from "@/lib/utils";

interface EventListProps {
	search?: string;
	statusFilter?: string;
	typeFilter?: string;
	page?: number;
	pageSize?: number;
}

export function EventList({ search = "", statusFilter = "ALL", typeFilter = "ALL", page = 1, pageSize = 20 }: EventListProps) {
	const [events, setEvents] = useState<EventWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [eventToDelete, setEventToDelete] = useState<EventWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Checkbox selection state
	const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load events function
	const loadEvents = useCallback(async () => {
		setLoading(true);
		try {
			const filters = {
				...(statusFilter !== "ALL" && { status: statusFilter as EventStatus }),
				...(typeFilter !== "ALL" && { eventType: typeFilter as EventType }),
			};
			const result = await getEventsList(filters);
			if (result.success && result.data) {
				let filteredEvents = result.data;

				// Client-side search filtering
				if (search) {
					filteredEvents = filteredEvents.filter((event) => event.title.toLowerCase().includes(search.toLowerCase()) || event.description.toLowerCase().includes(search.toLowerCase()));
				}

				// Set total for pagination
				setTotal(filteredEvents.length);

				// Client-side pagination
				const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

				setEvents(paginatedEvents);
			} else {
				console.error("Failed to load events:", result.message);
				setEvents([]);
				setTotal(0);
			}
		} catch (error) {
			console.error("Failed to load events:", error);
			setEvents([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, typeFilter, page, pageSize]);

	useEffect(() => {
		loadEvents();
	}, [loadEvents]);

	// Reset selected events when page changes
	useEffect(() => {
		setSelectedEventIds([]);
	}, [page]);

	// Real-time updates
	usePusher();
	useChannelEvent("private-global", "event-created", () => {
		loadEvents();
	});
	useChannelEvent("private-global", "event-updated", () => {
		loadEvents();
	});
	useChannelEvent("private-global", "event-deleted", () => {
		loadEvents();
	});

	const handleDelete = async (event: EventWithRelations) => {
		setEventToDelete(event);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!eventToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteEventAction(eventToDelete.id);
			if (result.success) {
				toast.success("Event deleted successfully");
				loadEvents();
				setSelectedEventIds((prev) => prev.filter((id) => id !== eventToDelete.id));
			} else {
				toast.error(result.message || "Failed to delete event");
			}
		} catch (error) {
			toast.error("Failed to delete event");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setEventToDelete(null);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedEventIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteEventsAction(selectedEventIds);
			if (result.success) {
				toast.success(`${selectedEventIds.length} events deleted successfully`);
				loadEvents();
				setSelectedEventIds([]);
			} else {
				toast.error(result.message || "Failed to delete events");
			}
		} catch (error) {
			toast.error("Failed to delete events");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleSelectEvent = (eventId: string, checked: boolean) => {
		if (checked) {
			setSelectedEventIds((prev) => [...prev, eventId]);
		} else {
			setSelectedEventIds((prev) => prev.filter((id) => id !== eventId));
		}
	};

	const getStatusBadge = (status: EventStatus) => {
		const statusConfig = EVENT_STATUSES.find((s) => s.value === status);
		if (statusConfig) {
			return <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>;
		}
		return <Badge variant="outline">{status}</Badge>;
	};

	const getTypeBadge = (type: EventType) => {
		const typeConfig = EVENT_TYPES.find((t) => t.value === type);
		if (typeConfig) {
			return <Badge variant={typeConfig.badgeVariant}>{typeConfig.label}</Badge>;
		}
		return <Badge variant="outline">{type}</Badge>;
	};

	const getTicketingBadge = (mode: TicketingMode) => {
		const modeConfig = TICKETING_MODES.find((m) => m.value === mode);
		if (modeConfig) {
			return <Badge variant={modeConfig.badgeVariant}>{modeConfig.label}</Badge>;
		}
		return <Badge variant="outline">{mode}</Badge>;
	};

	if (loading) {
		return <PageLoading />;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions */}
			{selectedEventIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedEventIds.length}
					itemName="event"
					isLoading={bulkActionLoading}
					onClear={() => setSelectedEventIds([])}
					actions={[
						{
							label: "Delete Selected",
							onClick: handleBulkDelete,
							variant: "destructive" as const,
						},
					]}
				/>
			)}

			{/* Events Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{events.map((event) => (
					<Card
						key={event.id}
						className="relative gap-0 transition-shadow hover:shadow-lg">
						{/* Bulk Selection Checkbox */}
						<div className="absolute top-3 left-3 z-10">
							<Checkbox
								checked={selectedEventIds.includes(event.id)}
								onCheckedChange={(checked) => handleSelectEvent(event.id, checked as boolean)}
								className="border-2 bg-white"
							/>
						</div>

						{/* Actions Menu */}
						<div className="absolute top-3 right-3 z-10">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 bg-white p-0 hover:bg-gray-50">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem asChild>
										<Link href={`/events/${event.id}`}>
											<Eye className="mr-2 h-4 w-4" />
											View
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href={`/events/${event.id}/edit`}>
											<Pencil className="mr-2 h-4 w-4" />
											Edit
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => handleDelete(event)}
										className="text-destructive">
										<Trash2 className="mr-2 h-4 w-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<CardHeader className="pb-4">
							<div className="flex items-start justify-between pt-8">
								<CardTitle className="line-clamp-2 pr-8 text-lg">{event.title}</CardTitle>
							</div>
							<div className="mt-2 flex flex-wrap gap-2">
								{getStatusBadge(event.status)}
								{getTypeBadge(event.eventType)}
								{getTicketingBadge(event.ticketingMode)}
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4 line-clamp-3 text-sm">{event.description}</p>

							<div className="space-y-2 text-sm">
								<div className="flex items-center gap-2">
									<Calendar className="text-muted-foreground h-4 w-4" />
									<span>
										{formatDate(event.startDate)} - {formatDate(event.endDate)}
									</span>
								</div>

								{event.location && (
									<div className="flex items-center gap-2">
										<Pin className="text-muted-foreground h-4 w-4" />
										<span>{event.location}</span>
									</div>
								)}

								<div className="flex items-center gap-4">
									<div className="flex items-center gap-1">
										<Users className="text-muted-foreground h-4 w-4" />
										<span>{event.registrations?.length || 0} registered</span>
									</div>
									<div className="flex items-center gap-1">
										<Ticket className="text-muted-foreground h-4 w-4" />
										<span>{event.ticketTypes?.length || 0} types</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="events"
					baseUrl="/events"
					type={typeFilter !== "ALL" ? typeFilter : undefined}
				/>
			)}

			{/* No Events */}
			{events.length === 0 && (
				<NoItemFound
					icon={<Calendar className="h-12 w-12" />}
					title="No events found"
					description={search || statusFilter !== "ALL" || typeFilter !== "ALL" ? "Try adjusting your filters" : "Create your first event to get started"}
					action={
						<Button asChild>
							<Link href="/events/new">
								<Plus className="h-4 w-4" />
								Create Event
							</Link>
						</Button>
					}
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Event"
				description={`Are you sure you want to delete "${eventToDelete?.title}"? This action cannot be undone.`}
				onConfirm={confirmDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
