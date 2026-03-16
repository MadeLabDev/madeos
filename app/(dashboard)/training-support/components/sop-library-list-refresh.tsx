"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";

import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

const SOP_LIBRARY_EVENTS = ["sop_library_created", "sop_library_updated", "sop_library_deleted"];

export function SOPLibraryListRefresh() {
	const router = useRouter();

	const handleEvent = useCallback(
		(eventData: any) => {
			const data = eventData?.data || eventData;
			if (SOP_LIBRARY_EVENTS.includes(data?.action)) {
				router.refresh();
			}
		},
		[router],
	);

	usePusher();
	useChannelEvent("private-global", "sop_library_update", handleEvent);

	return null;
}
