import { prisma, SeederResult } from "../seeder-utils";

export async function seedKnowledgeData(): Promise<SeederResult> {
	// 1. Create categories
	const categories = await Promise.all([
		prisma.knowledgeCategory.create({
			data: {
				name: "Getting Started",
				slug: "getting-started",
				description: "Basic concepts and setup for new users",
				color: "#3178C6",
				order: 1,
			},
		}),
		prisma.knowledgeCategory.create({
			data: {
				name: "User Management",
				slug: "user-management",
				description: "Managing users, roles, and permissions",
				color: "#336791",
				order: 2,
			},
		}),
		prisma.knowledgeCategory.create({
			data: {
				name: "Customer Relations",
				slug: "customer-relations",
				description: "Customer management and communication best practices",
				color: "#FF6B6B",
				order: 3,
			},
		}),
		prisma.knowledgeCategory.create({
			data: {
				name: "Business Operations",
				slug: "business-operations",
				description: "Operational procedures and business processes",
				color: "#4CAF50",
				order: 5,
			},
		}),
		prisma.knowledgeCategory.create({
			data: {
				name: "System Administration",
				slug: "system-administration",
				description: "System configuration, maintenance, and administration",
				color: "#FF9800",
				order: 4,
			},
		}),
	]);

	console.log(`  ✅ Created ${categories.length} knowledge categories`);

	// 2. Create Tags
	const tags = await Promise.all([
		prisma.knowledgeTag.create({
			data: {
				name: "Tutorial",
				slug: "tutorial",
				color: "#10B981",
			},
		}),
		prisma.knowledgeTag.create({
			data: {
				name: "Guide",
				slug: "guide",
				color: "#3B82F6",
			},
		}),
		prisma.knowledgeTag.create({
			data: {
				name: "Best Practices",
				slug: "best-practices",
				color: "#8B5CF6",
			},
		}),
		prisma.knowledgeTag.create({
			data: {
				name: "Troubleshooting",
				slug: "troubleshooting",
				color: "#F59E0B",
			},
		}),
		prisma.knowledgeTag.create({
			data: {
				name: "Administration",
				slug: "administration",
				color: "#EF4444",
			},
		}),
	]);

	console.log(`  ✅ Created ${tags.length} knowledge tags`);

	// 3. Create Sample Articles
	const articles = [
		{
			title: "Welcome to the Business Management System",
			slug: "welcome-business-management-system",
			excerpt: "Get started with your new business management platform and learn the basics.",
			content: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Welcome to your comprehensive business management system! This platform helps you streamline operations, manage customers, and grow your business efficiently.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Key features include user management, customer relations, system administration, and operational workflow tools.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
			type: "knowledge",
			isPublished: true,
			publishedAt: new Date(),
			categoryId: 0, // Getting Started
		},
		{
			title: "Managing Users and Permissions",
			slug: "managing-users-permissions",
			excerpt: "Learn how to create user accounts and assign appropriate permissions.",
			content: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"User management is crucial for maintaining security and ensuring team members have appropriate access to system features.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Create roles with specific permissions and assign them to users based on their responsibilities and access needs.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
			type: "knowledge",
			isPublished: true,
			publishedAt: new Date(),
			categoryId: 1, // User Management
		},
		{
			title: "Customer Relationship Best Practices",
			slug: "customer-relationship-best-practices",
			excerpt: "Build strong customer relationships with effective communication and management strategies.",
			content: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Strong customer relationships are the foundation of successful business operations.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Use the CRM features to track interactions, preferences, and maintain detailed customer profiles for personalized service.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
			type: "knowledge",
			isPublished: true,
			publishedAt: new Date(),
			categoryId: 2, // Customer Relations
		},
		{
			title: "System Administration Guide",
			slug: "system-administration-guide",
			excerpt: "Learn how to configure and maintain your business management system.",
			content: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"System administration involves configuring settings, managing users, and ensuring system reliability.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Regular maintenance, backups, and security updates are essential for smooth business operations.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
			type: "knowledge",
			isPublished: true,
			publishedAt: new Date(),
			categoryId: 4, // System Administration
		},
		{
			title: "Optimizing Business Operations",
			slug: "optimizing-business-operations",
			excerpt: "Streamline your business processes for improved efficiency and productivity.",
			content: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Efficient business operations are key to profitability and customer satisfaction.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Use workflow tools to standardize processes, track progress, and identify areas for improvement.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
			type: "knowledge",
			isPublished: false, // Draft
			categoryId: 3, // Business Operations
		},
	];

	const createdArticles = await Promise.all(
		articles.map((articleData) => {
			const { categoryId, ...articleWithoutCategoryId } = articleData;
			return prisma.knowledge.create({
				data: articleWithoutCategoryId,
			});
		}),
	);

	// Link articles with categories
	for (let i = 0; i < createdArticles.length; i++) {
		if (articles[i] && articles[i]!.categoryId !== undefined) {
			await prisma.knowledgeCategoriesOnKnowledge.create({
				data: {
					knowledgeId: createdArticles[i]!.id,
					categoryId: categories[articles[i]!.categoryId!]!.id,
				},
			});
		}
	}

	console.log(`  ✅ Created ${createdArticles.length} knowledge articles`);

	// 4. Link articles with tags (sample tagging)
	const tagLinks = [
		{ articleIndex: 0, tagIndex: 0 }, // Welcome -> Tutorial
		{ articleIndex: 0, tagIndex: 1 }, // Welcome -> Guide
		{ articleIndex: 1, tagIndex: 1 }, // User Management -> Guide
		{ articleIndex: 1, tagIndex: 4 }, // User Management -> Administration
		{ articleIndex: 2, tagIndex: 1 }, // Customer Relations -> Guide
		{ articleIndex: 2, tagIndex: 2 }, // Customer Relations -> Best Practices
		{ articleIndex: 3, tagIndex: 1 }, // System Admin -> Guide
		{ articleIndex: 3, tagIndex: 3 }, // System Admin -> Troubleshooting
		{ articleIndex: 3, tagIndex: 4 }, // System Admin -> Administration
		{ articleIndex: 4, tagIndex: 1 }, // Business Operations -> Guide
		{ articleIndex: 4, tagIndex: 2 }, // Business Operations -> Best Practices
	];

	for (const link of tagLinks) {
		const article = createdArticles[link.articleIndex];
		const tag = tags[link.tagIndex];

		if (!article || !tag) continue;

		await prisma.knowledgeTagsOnKnowledge.create({
			data: {
				knowledgeId: article.id,
				tagId: tag.id,
			},
		});
	}

	console.log(`  ✅ Created ${tagLinks.length} tag-article links`);

	// 5. Link articles with events (sample event associations)
	// Get existing events
	const existingEvents = await prisma.event.findMany({
		select: { id: true, title: true },
	});

	if (existingEvents.length > 0) {
		const eventLinks = [
			{ articleIndex: 0, eventIndex: 0 }, // Welcome -> Tech Conference 2025
			{ articleIndex: 1, eventIndex: 1 }, // User Management -> Design Workshop
			{ articleIndex: 2, eventIndex: 0 }, // Customer Relations -> Tech Conference 2025
			{ articleIndex: 3, eventIndex: 1 }, // System Admin -> Design Workshop
		];

		for (const link of eventLinks) {
			const article = createdArticles[link.articleIndex];
			const event = existingEvents[link.eventIndex];

			if (!article || !event) continue;

			await prisma.knowledgeEventsOnKnowledge.create({
				data: {
					knowledgeId: article.id,
					eventId: event.id,
				},
			});
		}

		console.log(`  ✅ Created ${eventLinks.length} event-article links`);
	} else {
		console.log("  ⚠️  No events found, skipping event-article links");
	}

	console.log("✅ Knowledge Base seeding complete!");

	return {
		success: true,
		message: "Knowledge Base data seeded successfully",
		count: categories.length + tags.length + createdArticles.length,
		data: { categories, tags, articles: createdArticles },
	};
}
