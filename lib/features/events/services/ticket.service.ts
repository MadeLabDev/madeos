/**
 * Ticket Service
 * Business logic for Tickets
 */

import type { ActionResult } from "@/lib/types";

import { TicketRepository } from "../repositories";
import type { TicketWithRelations } from "../repositories/ticket.repository";

export class TicketService {
	/**
	 * Get ticket by ID
	 */
	static async getTicketById(id: string): Promise<TicketWithRelations | null> {
		try {
			return await TicketRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch ticket: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get ticket by QR code
	 */
	static async getTicketByQrCode(qrCode: string): Promise<TicketWithRelations | null> {
		try {
			return await TicketRepository.findByQrCode(qrCode);
		} catch (error) {
			throw new Error(`Failed to fetch ticket: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get tickets by user
	 */
	static async getTicketsByUser(userId: string, options: { skip?: number; take?: number } = {}): Promise<TicketWithRelations[]> {
		try {
			return await TicketRepository.findByUserId(userId, options);
		} catch (error) {
			throw new Error(`Failed to fetch tickets: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get tickets by event
	 */
	static async getTicketsByEvent(eventId: string, options: { skip?: number; take?: number } = {}): Promise<TicketWithRelations[]> {
		try {
			return await TicketRepository.findByEventId(eventId, options);
		} catch (error) {
			throw new Error(`Failed to fetch tickets: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get tickets by ticket type
	 */
	static async getTicketsByTicketType(ticketTypeId: string, options: { skip?: number; take?: number } = {}): Promise<TicketWithRelations[]> {
		try {
			return await TicketRepository.findByTicketTypeId(ticketTypeId, options);
		} catch (error) {
			throw new Error(`Failed to fetch tickets: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Purchase ticket
	 */
	static async purchaseTicket(data: { ticketTypeId: string; userId: string; paymentId?: string }): Promise<ActionResult<TicketWithRelations>> {
		try {
			const qrCode = crypto.randomUUID(); // Generate unique QR code identifier

			const ticket = await TicketRepository.create({
				ticketTypeId: data.ticketTypeId,
				userId: data.userId,
				qrCode,
				paymentId: data.paymentId,
			});

			return {
				success: true,
				data: ticket,
				message: "Ticket purchased successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to purchase ticket",
			};
		}
	}

	/**
	 * Create multiple tickets (batch)
	 */
	static async purchaseTicketsBatch(data: { ticketTypeId: string; userId: string; quantity: number; paymentId?: string }): Promise<ActionResult<TicketWithRelations[]>> {
		try {
			const tickets: TicketWithRelations[] = [];

			for (let i = 0; i < data.quantity; i++) {
				const qrCode = crypto.randomUUID(); // Generate unique QR code identifier
				const ticket = await TicketRepository.create({
					ticketTypeId: data.ticketTypeId,
					userId: data.userId,
					qrCode,
					paymentId: data.paymentId,
				});
				tickets.push(ticket);
			}

			return {
				success: true,
				data: tickets,
				message: `${data.quantity} tickets purchased successfully`,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to purchase tickets",
			};
		}
	}

	/**
	 * Mark ticket as used
	 */
	static async markTicketAsUsed(qrCode: string): Promise<ActionResult<TicketWithRelations>> {
		try {
			const ticket = await TicketRepository.markAsUsed(qrCode);

			return {
				success: true,
				data: ticket,
				message: "Ticket used successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to use ticket",
			};
		}
	}

	/**
	 * Refund ticket
	 */
	static async refundTicket(id: string): Promise<ActionResult<TicketWithRelations>> {
		try {
			const ticket = await TicketRepository.update(id, {
				status: "REFUNDED",
			});

			return {
				success: true,
				data: ticket,
				message: "Ticket refunded successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to refund ticket",
			};
		}
	}

	/**
	 * Cancel ticket
	 */
	static async cancelTicket(id: string): Promise<ActionResult<TicketWithRelations>> {
		try {
			const ticket = await TicketRepository.update(id, {
				status: "CANCELLED",
			});

			return {
				success: true,
				data: ticket,
				message: "Ticket cancelled successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to cancel ticket",
			};
		}
	}

	/**
	 * Get ticket availability
	 */
	static async getTicketAvailability(ticketTypeId: string): Promise<
		ActionResult<{
			total: number;
			sold: number;
			used: number;
			remaining: number;
		}>
	> {
		try {
			const total = await TicketRepository.countByTicketType(ticketTypeId);
			const sold = await TicketRepository.countSoldByTicketType(ticketTypeId);
			const used = await TicketRepository.countUsedByTicketType(ticketTypeId);

			return {
				success: true,
				message: "Ticket availability retrieved successfully",
				data: {
					total,
					sold,
					used,
					remaining: total - sold,
				},
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get ticket availability",
			};
		}
	}
}
