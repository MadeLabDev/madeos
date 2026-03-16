/**
 * Ticket Actions
 * Server actions for Ticket management
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";

import { TicketService } from "../services";

/**
 * Get ticket by QR code (for check-in)
 */
export async function getTicketByQrCodeAction(qrCode: string) {
	try {
		const ticket = await TicketService.getTicketByQrCode(qrCode);
		if (!ticket) {
			return {
				success: false,
				message: "Ticket not found",
			};
		}

		return {
			success: true,
			data: ticket,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to get ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Purchase ticket
 */
export async function purchaseTicketAction(data: { ticketTypeId: string; userId: string; paymentId?: string }) {
	try {
		await requirePermission("events", "create");

		const result = await TicketService.purchaseTicket(data);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to purchase ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Purchase multiple tickets
 */
export async function purchaseTicketsBatchAction(data: { ticketTypeId: string; userId: string; quantity: number; paymentId?: string }) {
	try {
		await requirePermission("events", "create");

		const result = await TicketService.purchaseTicketsBatch(data);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to purchase tickets: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Use ticket (mark as used during check-in)
 */
export async function markTicketAsUsedAction(qrCode: string) {
	try {
		await requirePermission("events", "update");

		const result = await TicketService.markTicketAsUsed(qrCode);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to use ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Refund ticket
 */
export async function refundTicketAction(id: string) {
	try {
		await requirePermission("events", "delete");

		const result = await TicketService.refundTicket(id);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to refund ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Cancel ticket
 */
export async function cancelTicketAction(id: string) {
	try {
		await requirePermission("events", "delete");

		const result = await TicketService.cancelTicket(id);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to cancel ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get ticket availability
 */
export async function getTicketAvailabilityAction(ticketTypeId: string) {
	try {
		const result = await TicketService.getTicketAvailability(ticketTypeId);
		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to get ticket availability: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
