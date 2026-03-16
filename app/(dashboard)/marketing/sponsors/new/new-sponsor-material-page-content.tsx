"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { NewSponsorMaterialForm } from "./new-sponsor-material-form";
import { SelectEventForSponsor } from "./select-event-for-sponsor";

interface NewSponsorMaterialPageContentProps {
	initialEventId?: string;
}

export function NewSponsorMaterialPageContent({ initialEventId }: NewSponsorMaterialPageContentProps) {
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
		return <NewSponsorMaterialForm event={eventData} />;
	}

	return <SelectEventForSponsor onEventSelected={handleEventSelected} />;
}
