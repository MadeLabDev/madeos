/**
 * User Profile Types
 * Types for User Profile feature with dragable/sortable modules
 */

// Re-export shared types for convenience

// ============================================================================
// MODULE TYPES
// ============================================================================

/**
 * ProfileModuleType - Define types of modules that can be added to profile
 * Examples: work_experience, education, skills, certification, project, etc.
 */
export interface ProfileModuleType {
	id: string;
	key: string; // Unique identifier: "work_experience", "education", "skills"
	name: string; // Display name: "Work Experience", "Education", "Skills"
	icon?: string; // Icon identifier for UI
	description?: string;
	fieldSchema: FieldSchema; // JSON schema defining module fields
	isEnabled: boolean;
	isMultiple: boolean; // Can user add multiple instances?
	order: number; // Display order in module list
	createdAt: Date;
	updatedAt: Date;
}

/**
 * FieldSchema - JSON schema defining fields for a module type
 */
export interface FieldSchema {
	fields: FieldDefinition[];
}

/**
 * FieldDefinition - Single field definition in a module
 */
export interface FieldDefinition {
	id: string; // Unique field ID
	name: string; // Database field name (snake_case)
	label: string; // Display label
	type: FieldType; // Input type
	required: boolean;
	placeholder?: string;
	order: number; // Display order within module
	options?: FieldOption[]; // For select, checkbox, radio, multi-select types
	validation?: FieldValidation;
	rows?: number; // For textarea: number of rows
	// File/Image upload settings
	acceptedFileTypes?: string; // MIME types or extensions: "image/*", ".pdf,.doc", etc.
	maxFileSize?: number; // Max file size in bytes
	maxFiles?: number; // Max number of files (for file-upload with multiple)
}

export type FieldType = "text" | "email" | "url" | "number" | "textarea" | "date" | "daterange" | "select" | "multiselect" | "checkbox" | "radio" | "boolean" | "richtext" | "tags" | "file" | "image";

/**
 * FieldOption - Option for select/checkbox/radio fields
 */
export interface FieldOption {
	value: string;
	label: string;
}

/**
 * FieldValidation - Validation rules for fields
 */
export interface FieldValidation {
	min?: number; // Minimum length or value
	max?: number; // Maximum length or value
	pattern?: string; // Regex pattern
	message?: string; // Custom error message
}

// ============================================================================
// USER PROFILE TYPES
// ============================================================================

/**
 * UserProfile - User's public/private profile
 */
export interface UserProfile {
	id: string;
	userId: string;
	displayName: string | null;
	headline: string | null; // Professional headline
	bio: string | null;
	avatarUrl: string | null;
	coverUrl: string | null;
	location: string | null;
	website: string | null;
	email: string | null;
	phone: string | null;
	isPublic: boolean;
	slug: string | null; // Public URL slug
	metaTitle: string | null;
	metaDescription: string | null;
	metaData: Record<string, any> | null; // Dynamic fields from Profile Meta Module Type (stored as JSON)
	viewCount: number;
	lastViewedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * UserProfileWithModules - Profile with all modules
 */
export interface UserProfileWithModules extends UserProfile {
	modules?: UserProfileModule[];
}

/**
 * UserProfileModule - Single module instance in profile
 */
export interface UserProfileModule {
	id: string;
	profileId: string;
	moduleTypeId: string | null;
	data: any; // Module content (flexible JSON - can be any type from Prisma)
	order: number; // Sorting order
	column: number; // 1 = left column, 2 = right column
	isVisible: boolean; // Show/hide toggle
	createdAt: Date;
	updatedAt: Date;
}

/**
 * UserProfileModuleWithType - Module with its type definition
 */
export interface UserProfileModuleWithType extends UserProfileModule {
	moduleType?: ProfileModuleType;
}

// ============================================================================
// MODULE DATA TYPES (Examples for different module types)
// ============================================================================

/**
 * WorkExperienceModule - Work experience module data
 */
export interface WorkExperienceData {
	company: string;
	role: string;
	startDate: string; // ISO date
	endDate?: string; // ISO date or null if still working
	location?: string;
	description?: string;
	isCurrentRole?: boolean;
	skills?: string[]; // Array of skill names
}

/**
 * EducationModule - Education module data
 */
export interface EducationData {
	school: string;
	degree: string; // Bachelor, Master, PhD
	field: string; // Field of study
	startDate: string; // ISO date
	endDate?: string; // ISO date
	grade?: string; // GPA or grade
	activities?: string; // Clubs, societies, etc.
	description?: string;
}

/**
 * SkillsModule - Skills module data
 */
export interface SkillsData {
	name: string;
	level?: string; // Beginner, Intermediate, Advanced, Expert
	endorsements?: number;
	yearsOfExperience?: number;
}

/**
 * CertificationModule - Certification module data
 */
export interface CertificationData {
	name: string;
	issuer: string;
	issueDate: string; // ISO date
	expiryDate?: string; // ISO date or null if no expiry
	credentialId?: string;
	credentialUrl?: string;
}

/**
 * ProjectModule - Project module data
 */
export interface ProjectData {
	name: string;
	description: string;
	url?: string;
	startDate?: string; // ISO date
	endDate?: string; // ISO date
	technologies?: string[]; // Array of tech names
	teamSize?: number;
	role?: string;
}

// ============================================================================
// ACTION RESPONSE TYPES
// ============================================================================

// ActionResult is now imported from @/lib/types

/**
 * CreateProfileInput - Input for creating new profile
 */
export interface CreateProfileInput {
	displayName?: string;
	headline?: string;
	bio?: string;
	location?: string;
	website?: string;
	isPublic?: boolean;
}

/**
 * UpdateProfileInput - Input for updating profile
 */
export interface UpdateProfileInput {
	displayName?: string;
	headline?: string;
	bio?: string;
	avatarUrl?: string;
	coverUrl?: string;
	location?: string;
	website?: string;
	email?: string;
	phone?: string;
	isPublic?: boolean;
	slug?: string;
	metaTitle?: string;
	metaDescription?: string;
	// Dynamic metadata fields from Profile Meta Module Type (stored as JSON)
	metaData?: Record<string, any>;
}

/**
 * AddModuleInput - Input for adding module to profile
 */
export interface AddModuleInput {
	moduleTypeId?: string;
	moduleTypeKey?: string;
	data: Record<string, any>;
	column?: number;
}

/**
 * UpdateModuleInput - Input for updating profile module
 */
export interface UpdateModuleInput {
	data?: Record<string, any>;
	order?: number;
	column?: number;
	isVisible?: boolean;
}

/**
 * ReorderModuleInput - Input for reordering modules
 */
export interface ReorderModuleInput {
	moduleId: string;
	newOrder: number;
	newColumn?: number;
}
