/**
 * Ticket Repository
 * Database operations for Tickets
 */

import { prisma } from "@/lib/prisma";

/**
 * Ticket Types
 */
export type TicketType = {
	id: string;
	eventId: string;
	name: string;
	description?: string | null;
	price: number;
	quantity: number;
	maxPerUser: number;
	saleStart?: Date | null;
	saleEnd?: Date | null;
	isActive: boolean;
	isExternal: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type Ticket = {
	id: string;
	ticketTypeId: string;
	userId: string;
	qrCode: string;
	status: string;
	purchasedAt: Date;
	usedAt?: Date | null;
	paymentId?: string | null;
	registrationId?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type Payment = {
	id: string;
	userId: string;
	amount: number;
	currency: string;
	status: string;
	paymentMethod?: string | null;
	paymentId?: string | null;
	description?: string | null;
	metadata?: any;
	createdAt: Date;
	updatedAt: Date;
};

export interface TicketWithRelations extends Ticket {
	ticketType: TicketType & { event: any };
	user?: any;
	payment?: Payment | null;
}

export class TicketRepository {
	/**
	 * Find ticket by ID with relations
	 */
	static async findById(id: string): Promise<TicketWithRelations | null> {
		return prisma.ticket.findUnique({
			where: { id },
			include: {
				ticketType: {
					include: {
						event: true,
					},
				},
				user: true,
				payment: true,
			},
		});
	}

	/**
	 * Find ticket by QR code
	 */
	static async findByQrCode(qrCode: string): Promise<TicketWithRelations | null> {
		return prisma.ticket.findUnique({
			where: { qrCode },
			include: {
				ticketType: {
					include: {
						event: true,
					},
				},
				user: true,
				payment: true,
			},
		});
	}

	/**
	 * Find tickets by user ID
	 */
	static async findByUserId(userId: string, options: { skip?: number; take?: number } = {}): Promise<TicketWithRelations[]> {
		return prisma.ticket.findMany({
			where: { userId },
			include: {
				ticketType: {
					include: {
						event: true,
					},
				},
				user: true,
				payment: true,
			},
			orderBy: { purchasedAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Find tickets by event ID
	 */
	static async findByEventId(eventId: string, options: { skip?: number; take?: number } = {}): Promise<TicketWithRelations[]> {
		return prisma.ticket.findMany({
			where: {
				ticketType: {
					eventId,
				},
			},
			include: {
				ticketType: {
					include: {
						event: true,
					},
				},
				user: true,
				payment: true,
			},
			orderBy: { purchasedAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Find tickets by ticket type ID
	 */
	static async findByTicketTypeId(ticketTypeId: string, options: { skip?: number; take?: number } = {}): Promise<TicketWithRelations[]> {
		return prisma.ticket.findMany({
			where: { ticketTypeId },
			include: {
				ticketType: {
					include: {
						event: true,
					},
				},
				user: true,
				payment: true,
			},
			orderBy: { purchasedAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Create new ticket
	 */
	static async create(data: { ticketTypeId: string; userId: string; qrCode: string; paymentId?: string; registrationId?: string }): Promise<TicketWithRelations> {
		return prisma.ticket.create({
			data,
			include: {
				ticketType: {
					include: {
						event: true,
					},
				},
				user: true,
				payment: true,
			},
		});
	}

	/**
	 * Update ticket
	 */
	static async update(
		id: string,
		data: Partial<{
			status: any;
			usedAt: Date;
			paymentId: string;
			registrationId: string;
		}>,
	): Promise<TicketWithRelations> {
		return prisma.ticket.update({
			where: { id },
			data,
			include: {
				ticketType: {
					include: {
						event: true,
					},
				},
				user: true,
				payment: true,
			},
		});
	}

	/**
	 * Delete ticket
	 */
	static async delete(id: string): Promise<TicketWithRelations> {
		return prisma.ticket.delete({
			where: { id },
			include: {
				ticketType: {
					include: {
						event: true,
					},
				},
				user: true,
				payment: true,
			},
		});
	}

	/**
	 * Count tickets by ticket type
	 */
	static async countByTicketType(ticketTypeId: string): Promise<number> {
		return prisma.ticket.count({
			where: { ticketTypeId },
		});
	}

	/**
	 * Count sold tickets by ticket type
	 */
	static async countSoldByTicketType(ticketTypeId: string): Promise<number> {
		return prisma.ticket.count({
			where: {
				ticketTypeId,
				status: "SOLD",
			},
		});
	}

	/**
	 * Count used tickets by ticket type
	 */
	static async countUsedByTicketType(ticketTypeId: string): Promise<number> {
		return prisma.ticket.count({
			where: {
				ticketTypeId,
				status: "USED",
			},
		});
	}

	/**
	 * Get ticket by QR code and mark as used
	 */
	static async markAsUsed(qrCode: string, usedAt: Date = new Date()): Promise<TicketWithRelations> {
		return prisma.ticket.update({
			where: { qrCode },
			data: {
				status: "USED",
				usedAt,
			},
			include: {
				ticketType: {
					include: {
						event: true,
					},
				},
				user: true,
				payment: true,
			},
		});
	}

	/**
	 * Refund tickets by payment ID
	 */
	static async refundByPaymentId(paymentId: string): Promise<void> {
		await prisma.ticket.updateMany({
			where: { paymentId },
			data: {
				status: "REFUNDED",
			},
		});
	}
}
