import type { FieldSchema } from "@/lib/features/meta";

import { prisma, SeederResult } from "../seeder-utils";

export async function seedModuleTypes(): Promise<SeederResult> {
	// Blog Meta Schema
	const blogFieldSchema: FieldSchema = {
		fields: [
			{
				id: "blog-meta-title",
				name: "metaTitle",
				label: "Meta Title",
				type: "text",
				required: true,
				placeholder: "Enter meta title (50-60 characters)",
				order: 1,
			},
			{
				id: "blog-meta-description",
				name: "metaDescription",
				label: "Meta Description",
				type: "textarea",
				required: true,
				placeholder: "Enter meta description (150-160 characters)",
				order: 2,
			},
			{
				id: "blog-meta-keywords",
				name: "metaKeywords",
				label: "Meta Keywords",
				type: "text",
				required: false,
				placeholder: "Enter keywords separated by commas",
				order: 3,
			},
			{
				id: "blog-og-image",
				name: "ogImage",
				label: "OG Image URL",
				type: "url",
				required: false,
				placeholder: "https://example.com/image.jpg",
				order: 4,
			},
		],
	};

	// Knowledge Base (Knowngle) Meta Schema
	const knowngleFieldSchema: FieldSchema = {
		fields: [
			{
				id: "knowngle-meta-title",
				name: "metaTitle",
				label: "Meta Title",
				type: "text",
				required: true,
				placeholder: "Enter meta title",
				order: 1,
			},
			{
				id: "knowngle-meta-description",
				name: "metaDescription",
				label: "Meta Description",
				type: "textarea",
				required: true,
				placeholder: "Enter meta description",
				order: 2,
			},
		],
	};

	// Product Meta Schema
	const productFieldSchema: FieldSchema = {
		fields: [
			{
				id: "product-meta-title",
				name: "metaTitle",
				label: "Meta Title",
				type: "text",
				required: true,
				placeholder: "Enter product meta title",
				order: 1,
			},
			{
				id: "product-meta-description",
				name: "metaDescription",
				label: "Meta Description",
				type: "textarea",
				required: true,
				placeholder: "Enter product meta description",
				order: 2,
			},
			{
				id: "product-sku",
				name: "sku",
				label: "Product SKU",
				type: "text",
				required: true,
				placeholder: "PROD-001",
				order: 3,
			},
		],
	};

	// Order Meta Schema
	const orderFieldSchema: FieldSchema = {
		fields: [
			{
				id: "order-priority",
				name: "priority",
				label: "Order Priority",
				type: "select",
				required: true,
				order: 1,
				options: [
					{ value: "low", label: "Low" },
					{ value: "normal", label: "Normal" },
					{ value: "high", label: "High" },
					{ value: "urgent", label: "Urgent" },
				],
			},
			{
				id: "order-notes",
				name: "internalNotes",
				label: "Internal Notes",
				type: "textarea",
				required: false,
				placeholder: "Internal notes for staff",
				order: 2,
			},
		],
	};

	// Profile Meta Schema
	const profileFieldSchema: FieldSchema = {
		fields: [
			{
				id: "profile-full-name",
				name: "fullName",
				label: "Full Name",
				type: "text",
				required: true,
				placeholder: "Enter full name",
				order: 1,
			},
			{
				id: "profile-bio",
				name: "bio",
				label: "Bio",
				type: "richtext",
				required: false,
				placeholder: "Brief biography or description",
				order: 2,
			},
			{
				id: "profile-avatar-url",
				name: "avatarUrl",
				label: "Avatar URL",
				type: "image",
				required: false,
				placeholder: "Upload Image",
				order: 3,
			},
			{
				id: "profile-cover-url",
				name: "coverURL",
				label: "Cover URL",
				type: "image",
				required: false,
				placeholder: "Upload Image",
				order: 4,
			},
			{
				id: "profile-phone",
				name: "phone",
				label: "Phone Number",
				type: "text",
				required: false,
				placeholder: "+1 (555) 000-0000",
				order: 5,
			},
			{
				id: "profile-location",
				name: "location",
				label: "Location",
				type: "text",
				required: false,
				placeholder: "City, Country",
				order: 6,
			},
			{
				id: "profile-company",
				name: "company",
				label: "Company Name",
				type: "text",
				required: false,
				placeholder: "Company or organization name",
				order: 7,
			},
			{
				id: "profile-website",
				name: "website",
				label: "Website/Portfolio",
				type: "url",
				required: false,
				placeholder: "https://example.com",
				order: 8,
			},
			{
				id: "profile-social-media",
				name: "socialMedia",
				label: "Social Media Links",
				type: "textarea",
				required: false,
				placeholder: "",
				order: 9,
			},
			{
				id: "profile-preferences",
				name: "preferences",
				label: "User Preferences",
				type: "tags",
				required: false,
				placeholder: "",
				order: 10,
			},
		],
	};

	// Profile Addons (Optional SEO & Social Meta Fields)
	const profileAddonsFieldSchema: FieldSchema = {
		fields: [
			{
				id: "profile-meta-title",
				name: "metaTitle",
				label: "Profile Meta Title",
				type: "text",
				required: false,
				placeholder: "SEO meta title (50-60 characters)",
				order: 1,
			},
			{
				id: "profile-meta-description",
				name: "metaDescription",
				label: "Profile Meta Description",
				type: "textarea",
				required: false,
				placeholder: "SEO meta description (150-160 characters)",
				order: 2,
			},
			{
				id: "profile-meta-keywords",
				name: "metaKeywords",
				label: "Meta Keywords",
				type: "text",
				required: false,
				placeholder: "Keywords separated by commas",
				order: 3,
			},
			{
				id: "profile-og-image",
				name: "ogImage",
				label: "OG Image URL",
				type: "url",
				required: false,
				placeholder: "https://example.com/image.jpg",
				order: 4,
			},
			{
				id: "profile-twitter-handle",
				name: "twitterHandle",
				label: "Twitter Handle",
				type: "text",
				required: false,
				placeholder: "@yourhandle",
				order: 5,
			},
			{
				id: "profile-github-url",
				name: "githubUrl",
				label: "GitHub Profile",
				type: "url",
				required: false,
				placeholder: "https://github.com/username",
				order: 6,
			},
			{
				id: "profile-linkedin-url",
				name: "linkedinUrl",
				label: "LinkedIn Profile",
				type: "url",
				required: false,
				placeholder: "https://linkedin.com/in/username",
				order: 7,
			},
		],
	};

	// Event Meta Schema
	const eventFieldSchema: FieldSchema = {
		fields: [
			{
				id: "event-contact-email",
				name: "contactEmail",
				label: "Contact Email",
				type: "email",
				required: false,
				placeholder: "event@company.com",
				order: 1,
			},
			{
				id: "event-contact-phone",
				name: "contactPhone",
				label: "Contact Phone",
				type: "text",
				required: false,
				placeholder: "+1 (555) 000-0000",
				order: 2,
			},
			{
				id: "event-website",
				name: "website",
				label: "Event Website",
				type: "url",
				required: false,
				placeholder: "https://event-website.com",
				order: 3,
			},
			{
				id: "event-hashtags",
				name: "hashtags",
				label: "Event Hashtags",
				type: "text",
				required: false,
				placeholder: "#Event2025 #TechConference",
				order: 4,
			},
			{
				id: "event-target-audience",
				name: "targetAudience",
				label: "Target Audience",
				type: "textarea",
				required: false,
				placeholder: "Describe the target audience",
				order: 5,
			},
			{
				id: "event-learning-objectives",
				name: "learningObjectives",
				label: "Learning Objectives",
				type: "textarea",
				required: false,
				placeholder: "What will attendees learn?",
				order: 6,
			},
		],
	};

	// Create module types
	const moduleTypes = await Promise.all([
		prisma.moduleType.upsert({
			where: { key: "blog" },
			update: {
				system: "blog",
				name: "Blog Meta",
				description: "Metadata schema for blog posts",
				fieldSchema: blogFieldSchema as any,
				lockedFields: ["blog-meta-title", "blog-meta-description", "blog-meta-keywords", "blog-og-image"],
				isEnabled: true,
				order: 1,
			},
			create: {
				key: "blog",
				system: "blog",
				name: "Blog Meta",
				description: "Metadata schema for blog posts",
				fieldSchema: blogFieldSchema as any,
				lockedFields: ["blog-meta-title", "blog-meta-description", "blog-meta-keywords", "blog-og-image"],
				isEnabled: true,
				order: 1,
			},
		}),
		prisma.moduleType.upsert({
			where: { key: "knowngle" },
			update: {
				system: "knowngle",
				name: "Knowledge Meta",
				description: "Metadata schema for knowledge base articles",
				fieldSchema: knowngleFieldSchema as any,
				lockedFields: ["knowngle-meta-title", "knowngle-meta-description"],
				isEnabled: true,
				order: 2,
			},
			create: {
				key: "knowngle",
				system: "knowngle",
				name: "Knowledge Meta",
				description: "Metadata schema for knowledge base articles",
				fieldSchema: knowngleFieldSchema as any,
				lockedFields: ["knowngle-meta-title", "knowngle-meta-description"],
				isEnabled: true,
				order: 2,
			},
		}),
		prisma.moduleType.upsert({
			where: { key: "product" },
			update: {
				system: "product",
				name: "Product Meta",
				description: "Metadata schema for product catalog",
				fieldSchema: productFieldSchema as any,
				lockedFields: ["product-meta-title", "product-sku", "product-meta-description"],
				isEnabled: true,
				order: 3,
			},
			create: {
				key: "product",
				system: "product",
				name: "Product Meta",
				description: "Metadata schema for product catalog",
				fieldSchema: productFieldSchema as any,
				lockedFields: ["product-meta-title", "product-sku", "product-meta-description"],
				isEnabled: true,
				order: 3,
			},
		}),
		prisma.moduleType.upsert({
			where: { key: "order" },
			update: {
				system: "order",
				name: "Order Meta",
				description: "Metadata schema for orders",
				fieldSchema: orderFieldSchema as any,
				lockedFields: ["order-priority", "order-notes"],
				isEnabled: true,
				order: 4,
			},
			create: {
				key: "order",
				system: "order",
				name: "Order Meta",
				description: "Metadata schema for orders",
				fieldSchema: orderFieldSchema as any,
				lockedFields: ["order-priority", "order-notes"],
				isEnabled: true,
				order: 4,
			},
		}),
		prisma.moduleType.upsert({
			where: { key: "meta" },
			update: {
				system: "meta",
				name: "Profile Meta",
				description: "Metadata schema for profile",
				fieldSchema: profileFieldSchema as any,
				lockedFields: ["profile-full-name", "profile-bio", "profile-avatar-url", "profile-cover-url", "profile-phone", "profile-location", "profile-company", "profile-website", "profile-social-media", "profile-preferences"],
				isEnabled: true,
				order: 5,
			},
			create: {
				key: "meta",
				system: "meta",
				name: "Profile Meta",
				description: "Metadata schema for profile",
				fieldSchema: profileFieldSchema as any,
				lockedFields: ["profile-full-name", "profile-bio", "profile-avatar-url", "profile-cover-url", "profile-phone", "profile-location", "profile-company", "profile-website", "profile-social-media", "profile-preferences"],
				isEnabled: true,
				order: 5,
			},
		}),
		prisma.moduleType.upsert({
			where: { key: "profile-addons" },
			update: {
				system: "meta",
				name: "Profile Addons",
				description: "Optional SEO and social media fields for profile",
				fieldSchema: profileAddonsFieldSchema as any,
				lockedFields: [],
				isEnabled: true,
				order: 6,
			},
			create: {
				key: "profile-addons",
				system: "meta",
				name: "Profile Addons",
				description: "Optional SEO and social media fields for profile",
				fieldSchema: profileAddonsFieldSchema as any,
				lockedFields: [],
				isEnabled: true,
				order: 6,
			},
		}),
		prisma.moduleType.upsert({
			where: { key: "event" },
			update: {
				system: "event",
				name: "Event Meta",
				description: "Metadata schema for events",
				fieldSchema: eventFieldSchema as any,
				lockedFields: [],
				isEnabled: true,
				order: 7,
			},
			create: {
				key: "event",
				system: "event",
				name: "Event Meta",
				description: "Metadata schema for events",
				fieldSchema: eventFieldSchema as any,
				lockedFields: [],
				isEnabled: true,
				order: 7,
			},
		}),
	]);

	console.log(`✅ Created ${moduleTypes.length} module types`);

	return {
		success: true,
		message: "Module types seeded successfully",
		count: moduleTypes.length,
		data: moduleTypes,
	};
}
