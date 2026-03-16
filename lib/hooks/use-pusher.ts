"use client";

import { useEffect, useState } from "react";

import Pusher from "pusher-js";

// Global Pusher instance
let pusherInstance: Pusher | null = null;

/**
 * Initialize Pusher client instance
 */
function getPusherClient(): Pusher {
	if (!pusherInstance) {
		pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
			cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
			authEndpoint: "/api/realtime/pusher-auth",
			auth: {
				headers: {
					"Content-Type": "application/json",
				},
			},
		});

		// Global connection listeners
		pusherInstance.connection.bind("connected", () => {
			console.log("✅ [Pusher] Connected to Pusher");
		});

		pusherInstance.connection.bind("disconnected", () => {
			console.log("❌ [Pusher] Disconnected from Pusher");
		});

		pusherInstance.connection.bind("error", (error: any) => {
			console.error("[Pusher] Connection error:", error);
		});
	}

	return pusherInstance;
}

/**
 * Hook to manage Pusher connection
 */
export function usePusher() {
	const [isConnected, setIsConnected] = useState(false);
	const [socketId, setSocketId] = useState<string | null>(null);

	useEffect(() => {
		const pusher = getPusherClient();

		const handleConnect = () => {
			setIsConnected(true);
			setSocketId(pusher.connection.socket_id);
			console.log("✅ Pusher connected:", pusher.connection.socket_id);
		};

		const handleDisconnect = () => {
			setIsConnected(false);
			setSocketId(null);
			console.log("❌ Pusher disconnected");
		};

		pusher.connection.bind("connected", handleConnect);
		pusher.connection.bind("disconnected", handleDisconnect);

		// Set initial state
		if (pusher.connection.state === "connected") {
			handleConnect();
		}

		return () => {
			pusher.connection.unbind("connected", handleConnect);
			pusher.connection.unbind("disconnected", handleDisconnect);
		};
	}, []);

	return { isConnected, socketId, pusher: getPusherClient() };
}

/**
 * Hook to subscribe to department updates
 * Channel: department-{departmentId}
 */
export function useDepartmentSubscription(departmentId: string | undefined, onUpdate?: (data: any) => void) {
	const pusher = getPusherClient();

	useEffect(() => {
		if (!departmentId) return;

		const channelName = `department-${departmentId}`;
		console.log(`👥 Subscribing to department channel: ${channelName}`);

		try {
			const channel = pusher.subscribe(channelName);

			const handleUpdate = (data: any) => {
				console.log(`📨 Department update:`, data);
				onUpdate?.(data);
			};

			// Bind all events from department
			channel.bind_global(handleUpdate);

			return () => {
				console.log(`👋 Unsubscribing from: ${channelName}`);
				channel.unbind_global(handleUpdate);
				pusher.unsubscribe(channelName);
			};
		} catch (error) {
			console.error(`❌ Error subscribing to ${channelName}:`, error);
		}
	}, [departmentId, pusher, onUpdate]);
}

/**
 * Hook for presence channel (tracking who's online)
 */
export function usePresence(departmentId: string | undefined, onMembersChange?: (members: any[]) => void) {
	const pusher = getPusherClient();

	useEffect(() => {
		if (!departmentId) return;

		const channelName = `presence-department-${departmentId}`;
		console.log(`👥 Subscribing to presence channel: ${channelName}`);

		try {
			const channel = pusher.subscribe(channelName) as any;

			const handleMembersChange = () => {
				const members = channel.members.getList();
				console.log(`👥 Presence members:`, members);
				onMembersChange?.(members);
			};

			channel.bind("pusher:subscription_succeeded", handleMembersChange);
			channel.bind("pusher:member_added", handleMembersChange);
			channel.bind("pusher:member_removed", handleMembersChange);

			return () => {
				console.log(`👋 Unsubscribing from presence: ${channelName}`);
				pusher.unsubscribe(channelName);
			};
		} catch (error) {
			console.error(`❌ Error with presence channel:`, error);
		}
	}, [departmentId, pusher, onMembersChange]);
}

/**
 * Hook to listen to custom events on a channel
 */
export function useChannelEvent(channelName: string | undefined, eventName: string, handler: (data: any) => void) {
	const pusher = getPusherClient();

	useEffect(() => {
		if (!channelName) return;

		try {
			const channel = pusher.subscribe(channelName);
			channel.bind(eventName, handler);

			return () => {
				channel.unbind(eventName, handler);
				pusher.unsubscribe(channelName);
			};
		} catch (error) {
			console.error(`❌ Error subscribing to ${eventName}:`, error);
		}
	}, [channelName, eventName, handler, pusher]);
}

/**
 * Hook to trigger client event on channel
 */
export function useTriggerEvent(channelName: string | undefined) {
	const pusher = getPusherClient();

	return (eventName: string, data: any) => {
		if (!channelName) {
			console.warn("Channel name not provided");
			return;
		}

		try {
			const channel = pusher.channel(channelName);
			if (channel) {
				channel.trigger(eventName, data);
				console.log(`✅ Client event triggered: ${eventName}`);
			}
		} catch (error) {
			console.error(`❌ Error triggering event:`, error);
		}
	};
}
