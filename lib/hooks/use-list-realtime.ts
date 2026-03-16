"use client";

import { useCallback } from "react";

import { useChannelEvent, usePusher } from "./use-pusher";

/**
 * Real-time update event structure
 */
export interface ListUpdateEvent {
	action: "created" | "updated" | "deleted" | "reload";
	itemId?: string;
	item?: any;
	data?: any;
}

/**
 * Callback function for handling list updates
 */
export type ListUpdateCallback = (event: ListUpdateEvent) => void;

/**
 * Generic hook for list real-time updates via Pusher
 * Handles creation, update, deletion, and reload events
 *
 * @param eventName - The event name to listen for (e.g., "user_update", "contact_update")
 * @param onUpdate - Callback function to handle updates
 *
 * @example
 * const handleUpdate = useCallback((event) => {
 *   if (event.action === "created") {
 *     setItems(prev => [event.item, ...prev]);
 *   } else if (event.action === "updated") {
 *     setItems(prev => prev.map(item => item.id === event.itemId ? event.item : item));
 *   } else if (event.action === "deleted") {
 *     setItems(prev => prev.filter(item => item.id !== event.itemId));
 *   }
 * }, []);
 *
 * useListRealtime("contact_update", handleUpdate);
 */
export function useListRealtime(eventName: string, onUpdate: ListUpdateCallback) {
	// Initialize Pusher connection
	usePusher();

	// Stable callback for handling Pusher events
	const handleChannelEvent = useCallback(
		(eventData: any) => {
			// Unwrap data from Pusher event structure: { data: {...}, timestamp: '...' }
			const data = eventData.data || eventData;

			// Normalize the event structure
			const normalizedEvent: ListUpdateEvent = {
				action: data.action || "reload",
				itemId: data.itemId || data.id,
				item: data.item || data,
				data: data,
			};

			// Call the handler
			onUpdate(normalizedEvent);
		},
		[onUpdate],
	);

	// Subscribe to channel event
	useChannelEvent("private-global", eventName, handleChannelEvent);
}

/**
 * Helper function to create a standardized update handler for list components
 *
 * @example
 * const handleTestOrderUpdate = createListUpdateHandler(
 *   setTestOrders,
 *   page,
 *   loadOrders
 * );
 *
 * useListRealtime("test_order_update", handleTestOrderUpdate);
 */
export function createListUpdateHandler<T extends { id: string }>(
	setState: (setter: (prev: T[]) => T[]) => void,
	currentPage: number,
	reloadFunction: () => void,
	options?: {
		// If true, only add new items on page 1
		newItemsOnFirstPageOnly?: boolean;
		// Custom handler for specific actions
		onCreated?: (item: T, page: number) => void;
		onUpdated?: (item: T) => void;
		onDeleted?: (itemId: string) => void;
	},
) {
	return (event: ListUpdateEvent) => {
		const { action, item, itemId } = event;
		const shouldAddNewItemsOnPageOne = options?.newItemsOnFirstPageOnly !== false;

		switch (action) {
			case "created":
				setState((prev) => {
					// Check if item already exists
					if (prev.find((p) => p.id === item.id)) {
						return prev;
					}

					// Only add new items on first page
					if (shouldAddNewItemsOnPageOne && currentPage === 1) {
						return [item, ...prev];
					}
					return prev;
				});
				options?.onCreated?.(item, currentPage);
				break;

			case "updated":
				setState((prev) =>
					prev.map((p) => {
						if (p.id === item.id) {
							return { ...p, ...item };
						}
						return p;
					}),
				);
				options?.onUpdated?.(item);
				break;

			case "deleted":
				setState((prev) => prev.filter((p) => p.id !== itemId));
				options?.onDeleted?.(itemId || "");
				break;

			case "reload":
			default:
				reloadFunction();
				break;
		}
	};
}
