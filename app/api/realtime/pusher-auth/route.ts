import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { authenticateChannel } from "@/lib/realtime/pusher-handler";

/**
 * Pusher authentication endpoint for private/presence channels
 * POST /api/realtime/pusher-auth
 *
 * This endpoint is called by the Pusher JavaScript client when subscribing to
 * private-* or presence-* channels. It validates the user's session and returns
 * an authentication signature.
 */
async function handler(request: NextRequest) {
	try {
		if (request.method !== "POST") {
			return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
		}

		// Parse request body
		// Pusher sends data as application/x-www-form-urlencoded
		let socket_id: string | null = null;
		let channel_name: string | null = null;

		try {
			// Read raw body first
			const bodyText = await request.text();

			if (!bodyText) {
				return NextResponse.json({ error: "Empty request body" }, { status: 400 });
			}

			// Parse based on actual body format (not just content-type header)
			// Check if body looks like form-urlencoded first (most common for Pusher)
			if (bodyText.includes("=") && bodyText.includes("&")) {
				// Form-urlencoded format (default for Pusher)
				const params = new URLSearchParams(bodyText);
				socket_id = params.get("socket_id");
				channel_name = params.get("channel_name");
			} else if (bodyText.trim().startsWith("{")) {
				// JSON format
				const body = JSON.parse(bodyText);
				socket_id = body.socket_id;
				channel_name = body.channel_name;
			} else {
				// Try URLSearchParams as fallback
				console.log("� Trying URLSearchParams fallback");
				const params = new URLSearchParams(bodyText);
				socket_id = params.get("socket_id");
				channel_name = params.get("channel_name");
			}
		} catch (error) {
			console.error("❌ Failed to parse request body:", error);
			return NextResponse.json({ error: "Invalid request body - must be JSON or form-urlencoded" }, { status: 400 });
		}

		if (!socket_id || !channel_name) {
			return NextResponse.json({ error: "Missing required parameters: socket_id, channel_name" }, { status: 400 });
		}

		// Get authenticated user from session
		const session = await auth();

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized - user not authenticated" }, { status: 401 });
		}

		const userEmail = session.user.email;

		// Authenticate the channel
		const authData = authenticateChannel(socket_id, channel_name, userEmail);

		return NextResponse.json(authData);
	} catch (error) {
		console.error("❌ Pusher auth error:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Authentication failed" }, { status: 403 });
	}
}

export { handler as POST };
