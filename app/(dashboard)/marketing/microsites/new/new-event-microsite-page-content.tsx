"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { NewEventMicrositeForm } from "./new-event-microsite-form";
import { SelectEventForMicrosite } from "./select-event-for-microsite";

interface NewEventMicrositePageContentProps {
	initialEventId?: string;
}

export function NewEventMicrositePageContent({ initialEventId }: NewEventMicrositePageContentProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [eventData, setEventData] = useState<any>(null);

	const selectedEventId = useMemo(() => {
		return searchParams.get("eventId") || initialEventId || null;
	}, [searchParams, initialEventId]);

	const handleEventSelected = (event: any) => {
		setEventData(event);
		// Update URL
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("eventId", event.id);
		router.replace(newUrl.toString());
	};

	if (selectedEventId && eventData) {
		return <NewEventMicrositeForm event={eventData} />;
	}

	return <SelectEventForMicrosite onEventSelected={handleEventSelected} />;
}
