// Define local types for models not exported by @prisma/client
type UserGroup = {
	id: string;
	name: string;
	description?: string | null;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	members: UserGroupMember[];
	assignedKnowledge: any[];
};

type UserGroupMember = {
	id: string;
	userId: string;
	groupId: string;
	assignedAt: Date;
	assignedBy?: string | null;
	group: UserGroup;
	user: any; // User relation
};

// Base types from Prisma
export type UserGroupWithMembers = {
	id: string;
	name: string;
	description?: string | null;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	members: {
		id: string;
		userId: string;
		groupId: string;
		assignedAt: Date;
		assignedBy?: string | null;
		user: any;
	}[];
};

export type UserGroupMemberWithDetails = UserGroupMember & {
	user: any;
	group: UserGroup;
};

// Form types
export interface CreateUserGroupInput {
	name: string;
	description?: string;
}

export interface UpdateUserGroupInput {
	name?: string;
	description?: string;
}

export interface AssignUsersToGroupInput {
	groupId: string;
	userEmails: string[];
}

// ActionResult is now imported from @/lib/types
