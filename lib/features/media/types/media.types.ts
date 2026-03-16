type Media = {
	id: string;
	name: string;
	url: string;
	type: string;
	size: number;
	visibility: string;
	uploadedById: string;
	createdAt: Date;
	updatedAt: Date;
	entityType?: string | null;
	entityId?: string | null;
};

export type MediaWithUploader = Media & {
	uploadedBy?: {
		id: string;
		name: string | null;
		email: string;
	};
};

export type MediaListResponse = {
	items: MediaWithUploader[];
	total: number;
	pageCount: number;
	currentPage: number;
};

export type CreateMediaInput = {
	name: string;
	url: string;
	type: string;
	size: number;
	visibility: "PUBLIC" | "PRIVATE";
	uploadedById: string;
};

export type UpdateMediaVisibilityInput = {
	id: string;
	visibility: "PUBLIC" | "PRIVATE";
};
