import Pusher from "pusher";

// Initialize Pusher server
const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID || "",
	key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
	secret: process.env.PUSHER_SECRET || "",
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
	useTLS: true,
});

/**
 * Get Pusher instance
 */
export function getPusher() {
	return pusher;
}

/**
 * Broadcast order update to all clients watching this order
 * Channel: order-{orderId}
 */
export async function broadcastOrderUpdate(
	orderId: string,
	data: {
		stage?: string;
		status?: string;
		updatedBy?: string;
		[key: string]: any;
	},
) {
	try {
		await pusher.trigger(`order-${orderId}`, "order:updated", {
			orderId,
			data,
			timestamp: new Date().toISOString(),
		});
		console.log(`📢 [Pusher] Order update broadcasted: order-${orderId}`);
	} catch (error) {
		console.error(`❌ [Pusher] Error broadcasting order:`, error);
		throw error;
	}
}

/**
 * Broadcast to department channel
 * Channel: department-{departmentId}
 */
export async function broadcastToDepartment(departmentId: string, event: string, data: any) {
	try {
		await pusher.trigger(`department-${departmentId}`, event, {
			data,
			timestamp: new Date().toISOString(),
		});
		console.log(`📢 [Pusher] Department update broadcasted: department-${departmentId}`);
	} catch (error) {
		console.error(`❌ [Pusher] Error broadcasting to department:`, error);
		throw error;
	}
}

/**
 * Broadcast to all users (via private channel)
 */
export async function broadcastToAll(event: string, data: any) {
	try {
		await pusher.trigger("private-global", event, {
			data,
			timestamp: new Date().toISOString(),
		});
		console.log(`📢 [Pusher] Global broadcast: ${event}`);
	} catch (error) {
		console.error(`❌ [Pusher] Error broadcasting globally:`, error);
		throw error;
	}
}

/**
 * Authenticate private channel subscription
 * Required for private-{*} and presence-{*} channels
 */
export function authenticateChannel(socketId: string, channel: string, userId?: string) {
	try {
		if (channel.startsWith("presence-")) {
			// For presence channels
			const auth = pusher.authenticateUser(socketId, {
				id: userId || "unknown",
				userInfo: {
					name: `User ${userId || "unknown"}`,
				},
			});
			return auth;
		} else if (channel.startsWith("private-")) {
			// For private channels
			const auth = pusher.authorizeChannel(socketId, channel);
			return auth;
		}
		throw new Error("Invalid channel");
	} catch (error) {
		console.error(`❌ [Pusher] Authentication error:`, error);
		throw error;
	}
}

/**
 * Emit event to specific order channel
 */
export async function emitToOrder(orderId: string, event: string, data: any) {
	try {
		await pusher.trigger(`order-${orderId}`, event, {
			orderId,
			data,
			timestamp: new Date().toISOString(),
		});
		console.log(`📢 [Pusher] Event ${event} sent to order-${orderId}`);
	} catch (error) {
		console.error(`❌ [Pusher] Error emitting to order:`, error);
		throw error;
	}
}

/**
 * Get online users count (Pusher metrics)
 */
export async function getOnlineCount() {
	try {
		// Note: This requires Pusher to be configured with proper permissions
		const channels = await pusher.get({
			path: "/channels",
		});
		return channels;
	} catch (error) {
		console.error(`❌ [Pusher] Error getting online count:`, error);
		return null;
	}
}

/**
 * Channel names used in the app
 */
export const CHANNELS = {
	order: (orderId: string) => `order-${orderId}`,
	department: (deptId: string) => `department-${deptId}`,
	global: "private-global",
	presence: (deptId: string) => `presence-department-${deptId}`,
} as const;

/**
 * Event names
 */
export const EVENTS = {
	ORDER_UPDATED: "order:updated",
	ORDER_CREATED: "order:created",
	ORDER_DELETED: "order:deleted",
	DEPARTMENT_UPDATE: "department:update",
	TASK_ASSIGNED: "task:assigned",
	STATUS_CHANGED: "status:changed",
	USER_TYPING: "user:typing",
} as const;
