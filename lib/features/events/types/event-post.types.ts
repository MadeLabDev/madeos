export interface EventPostRelation {
	eventId: string;
	postId: string;
	assignedAt: Date;
	assignedBy?: string;
	post: {
		id: string;
		title: string;
		content: string;
		excerpt?: string;
		thumbnail?: string;
		type: string;
		visibility: string;
		isPublished: boolean;
		publishedAt?: Date;
		createdAt: Date;
		updatedAt: Date;
	};
}

export interface CreateEventPostInput {
	eventId: string;
	postId: string;
}

export interface EventPostListParams {
	eventId: string;
	page?: number;
	limit?: number;
}
