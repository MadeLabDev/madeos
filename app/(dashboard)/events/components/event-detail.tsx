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
import { EVENT_STATUSES, EVENT_TYPES, TICKETING_MODES } from "@/lib/config/module-types";
import { useBreadcrumb } from "@/lib/contexts/breadcrumb-context";
import { deleteEvent, getEventById, updateEventStatus } from "@/lib/features/events/actions";
import { EventStatus, EventWithRelations } from "@/lib/features/events/types";
import { formatDate } from "@/lib/utils";

import { EventKnowledge } from "./event-knowledge";
import { EventRegistrations } from "./event-registrations";
import { EventSessions } from "./event-sessions";
import { EventSpeakers } from "./event-speakers";
import { EventSponsors } from "./event-sponsors";
import { EventTicketTypes } from "./event-ticket-types";

interface EventDetailProps {
	eventId: string;
	pageSize?: number;
}

export function EventDetail({ eventId, pageSize }: EventDetailProps) {
	const router = useRouter();
	const { setOverride } = useBreadcrumb();
	const [event, setEvent] = useState<EventWithRelations | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("registrations");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadEvent = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await getEventById(eventId);
			if (result.success && result.data) {
				setEvent(result.data);
				setOverride(eventId, result.data.title);
			} else {
				setError(result.message || "Event not found");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load event");
		} finally {
			setLoading(false);
		}
	}, [eventId, setLoading, setError, setEvent, setOverride]);

	const handleStatusChange = async (newStatus: EventStatus) => {
		if (!event) return;

		try {
			const result = await updateEventStatus(event.id, newStatus);
			if (result.success) {
				setEvent({ ...event, status: newStatus });
			} else {
				console.error("Failed to update event status:", result.message);
			}
		} catch (error) {
			console.error("Failed to update event status:", error);
		}
	};

	useEffect(() => {
		loadEvent();
	}, [eventId, loadEvent]);

	const handleDelete = async () => {
		if (!event) return;

		try {
			setIsDeleting(true);
			const result = await deleteEvent(event.id);
			if (result.success) {
				router.push("/events");
			} else {
				console.error("Failed to delete event:", result.message);
			}
		} catch (error) {
			console.error("Failed to delete event:", error);
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
		}
	};

	if (loading) {
		return <Loader size="lg" />;
	}

	if (error || !event) {
		return (
			<div className="py-8 text-center">
				<div className="mb-4 text-red-500">{error || "Event not found"}</div>
				<Button onClick={() => router.push("/events")}>
					<ArrowLeft className="h-4 w-4" />
					Back to Events
				</Button>
			</div>
		);
	}

	const getStatusBadge = (status: EventStatus) => {
		const statusConfig = EVENT_STATUSES.find((s) => s.value === status);
		if (statusConfig) {
			return <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>;
		}
		return <Badge variant="outline">{status}</Badge>;
	};

	const getTypeBadge = (type: string) => {
		const typeConfig = EVENT_TYPES.find((t) => t.value === type);
		if (typeConfig) {
			return <Badge variant={typeConfig.badgeVariant}>{typeConfig.label}</Badge>;
		}
		return <Badge variant="outline">{type}</Badge>;
	};

	const getTicketingBadge = (mode: string) => {
		const modeConfig = TICKETING_MODES.find((m) => m.value === mode);
		if (modeConfig) {
			return <Badge variant={modeConfig.badgeVariant}>{modeConfig.label}</Badge>;
		}
		return <Badge variant="outline">{mode}</Badge>;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col justify-between gap-4 lg:flex-row">
				<div>
					<h1 className="text-3xl font-bold">{event.title}</h1>
					<p className="text-muted-foreground">{event.description}</p>
				</div>

				<div className="flex items-center gap-2">
					<div className="mr-2 flex gap-2">
						{getStatusBadge(event.status)}
						{getTypeBadge(event.eventType)}
						{getTicketingBadge(event.ticketingMode)}
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
								<Link href={`/events/${event.id}/edit`}>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Link>
							</DropdownMenuItem>

							{event.status === "DRAFT" && (
								<DropdownMenuItem onClick={() => handleStatusChange("PUBLISHED")}>
									<Eye className="mr-2 h-4 w-4" />
									Publish
								</DropdownMenuItem>
							)}

							{event.status === "PUBLISHED" && (
								<DropdownMenuItem onClick={() => handleStatusChange("DRAFT")}>
									<EyeOff className="mr-2 h-4 w-4" />
									Unpublish
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
						<div className="text-2xl font-bold">{formatDate(event.startDate)}</div>
						<p className="text-muted-foreground text-xs">to {formatDate(event.endDate)}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Registrations</CardTitle>
						<Users className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{event.registrations?.length || 0}</div>
						<p className="text-muted-foreground text-xs">{event.capacity ? `${event.capacity - (event.registrations?.length || 0)} spots left` : "Unlimited"}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Ticket Types</CardTitle>
						<Ticket className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{event.ticketTypes?.length || 0}</div>
						<p className="text-muted-foreground text-xs">Active tickets</p>
					</CardContent>
				</Card>
			</div>

			{/* Location */}
			{event.location && (
				<Card className="gap-0">
					<CardContent className="flex items-center space-x-3 py-0">
						<div className="flex items-center space-x-1 font-bold">
							<MapPin className="h-5 w-5" />
							<span>Location:</span>
						</div>
						<div>{event.location}</div>
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
					<TabsTrigger value="knowledge">Knowledge</TabsTrigger>
					<TabsTrigger value="sponsors">Sponsors</TabsTrigger>
					<TabsTrigger value="speakers">Speakers</TabsTrigger>
					{event.eventType === "WITH_SESSIONS" && <TabsTrigger value="sessions">Sessions</TabsTrigger>}
					{event.ticketingMode !== "EXTERNAL" && <TabsTrigger value="tickets">Tickets</TabsTrigger>}
					<TabsTrigger value="registrations">Registrations</TabsTrigger>
				</TabsList>

				<TabsContent
					value="overview"
					className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Event Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm font-medium">Slug</label>
								<p className="text-muted-foreground text-sm">/{event.slug}</p>
							</div>

							{event.externalTicketUrl && (
								<div>
									<label className="text-sm font-medium">External Ticket URL</label>
									<p className="text-muted-foreground text-sm">
										<a
											href={event.externalTicketUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline">
											{event.externalTicketUrl}
										</a>
									</p>
								</div>
							)}

							{event.externalTicketProvider && (
								<div>
									<label className="text-sm font-medium">External Provider</label>
									<p className="text-muted-foreground text-sm">{event.externalTicketProvider}</p>
								</div>
							)}

							<div>
								<label className="text-sm font-medium">Check-in Enabled</label>
								<p className="text-muted-foreground text-sm">{event.enableCheckIn ? "Yes" : "No"}</p>
							</div>

							{event.metaData && (
								<div>
									<label className="text-sm font-medium">Additional Data</label>
									<pre className="text-muted-foreground bg-muted mt-1 rounded p-2 text-xs">{JSON.stringify(event.metaData, null, 2)}</pre>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					value="sponsors"
					className="space-y-4">
					<EventSponsors eventId={event.id} />
				</TabsContent>

				<TabsContent
					value="speakers"
					className="space-y-4">
					<EventSpeakers eventId={event.id} />
				</TabsContent>

				{activeTab === "knowledge" && (
					<TabsContent value="knowledge">
						<EventKnowledge eventId={event.id} />
					</TabsContent>
				)}

				{event.eventType === "WITH_SESSIONS" && activeTab === "sessions" && (
					<TabsContent value="sessions">
						<EventSessions
							eventId={event.id}
							eventData={event}
						/>
					</TabsContent>
				)}

				{event.ticketingMode !== "EXTERNAL" && activeTab === "tickets" && (
					<TabsContent value="tickets">
						<EventTicketTypes
							eventId={event.id}
							eventData={event}
						/>
					</TabsContent>
				)}

				{activeTab === "registrations" && (
					<TabsContent value="registrations">
						<EventRegistrations
							eventId={event.id}
							pageSize={pageSize}
						/>
					</TabsContent>
				)}
			</Tabs>

			{/* Delete Confirmation Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Event"
				description={`Are you sure you want to delete "${event.title}"? This action cannot be undone. All registrations and related data will be permanently removed.`}
				isDeleting={isDeleting}
				onConfirm={handleDelete}
			/>
		</div>
	);
}
