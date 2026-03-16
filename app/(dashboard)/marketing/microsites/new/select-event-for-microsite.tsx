"use client";

import { useCallback, useEffect, useState } from "react";

import { Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { getEvents } from "@/lib/features/events/actions";
import type { Event } from "@/lib/features/events/types";
import { formatDate } from "@/lib/utils";

interface SelectEventForMicrositeProps {
	onEventSelected: (event: Event) => void;
}

export function SelectEventForMicrosite({ onEventSelected }: SelectEventForMicrositeProps) {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);

	const loadEvents = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getEvents({}, { take: 50 }); // Load events for selection
			if (result.success && result.data) {
				setEvents(result.data);
			} else {
				toast.error("Failed to load events");
			}
		} catch (error) {
			toast.error("An error occurred while loading events");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadEvents();
	}, [loadEvents]);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader size="lg" />
				<span className="ml-2">Loading events...</span>
			</div>
		);
	}

	if (events.length === 0) {
		return (
			<div className="py-12 text-center">
				<p className="text-muted-foreground mb-4">No events available. Please create an event first.</p>
				<Button onClick={() => (window.location.href = "/events")}>Go to Events</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Create Event Microsite</h1>
				<p className="text-muted-foreground">Select an event to create a public microsite for</p>
			</div>

			{/* Events Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{events.map((event) => (
					<Card
						key={event.id}
						className="cursor-pointer transition-shadow hover:shadow-md"
						onClick={() => onEventSelected(event)}>
						<CardHeader>
							<CardTitle className="text-lg">{event.title}</CardTitle>
							<CardDescription>
								<div className="flex items-center gap-1 text-sm">
									<Calendar className="h-4 w-4" />
									{formatDate(event.startDate)} - {formatDate(event.endDate)}
								</div>
								{event.location && (
									<div className="mt-1 flex items-center gap-1 text-sm">
										<MapPin className="h-4 w-4" />
										{event.location}
									</div>
								)}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full">Select This Event</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
