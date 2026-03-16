import { prisma } from "@/lib/prisma";

class EventPostRepository {
	async getPostById(postId: string) {
		return prisma.post.findUnique({
			where: { id: postId },
		});
	}

	async getEventById(eventId: string) {
		return prisma.event.findUnique({
			where: { id: eventId },
		});
	}

	async getEventSpeakerByIds(eventId: string, postId: string) {
		return prisma.eventSpeakersOnPosts.findUnique({
			where: {
				eventId_postId: {
					eventId,
					postId,
				},
			},
		});
	}

	async getEventSponsorByIds(eventId: string, postId: string) {
		return prisma.eventSponsorsOnPosts.findUnique({
			where: {
				eventId_postId: {
					eventId,
					postId,
				},
			},
		});
	}

	async addSpeakerToEvent(eventId: string, postId: string) {
		return prisma.eventSpeakersOnPosts.create({
			data: {
				eventId,
				postId,
			},
		});
	}

	async removeSpeakerFromEvent(eventId: string, postId: string) {
		return prisma.eventSpeakersOnPosts.delete({
			where: {
				eventId_postId: {
					eventId,
					postId,
				},
			},
		});
	}

	async addSponsorToEvent(eventId: string, postId: string) {
		return prisma.eventSponsorsOnPosts.create({
			data: {
				eventId,
				postId,
			},
		});
	}

	async removeSponsorFromEvent(eventId: string, postId: string) {
		return prisma.eventSponsorsOnPosts.delete({
			where: {
				eventId_postId: {
					eventId,
					postId,
				},
			},
		});
	}

	async getEventSpeakers(eventId: string) {
		console.log("Repository: Getting speakers for eventId:", eventId);
		try {
			const result = prisma.eventSpeakersOnPosts.findMany({
				where: { eventId },
				include: {
					post: true,
				},
				orderBy: { assignedAt: "asc" },
			});
			console.log("Repository: Query result:", result);
			return result;
		} catch (error) {
			console.error("Repository: Error getting speakers:", error);
			throw error;
		}
	}

	async getEventSponsors(eventId: string) {
		console.log("Repository: Getting sponsors for eventId:", eventId);
		try {
			const result = prisma.eventSponsorsOnPosts.findMany({
				where: { eventId },
				include: {
					post: true,
				},
				orderBy: { assignedAt: "asc" },
			});
			console.log("Repository: Query result:", result);
			return result;
		} catch (error) {
			console.error("Repository: Error getting sponsors:", error);
			throw error;
		}
	}
}

export const eventPostRepository = new EventPostRepository();
