import { prisma, SeederResult } from "../seeder-utils";

/**
 * Seed module instances with sample data for each module type
 * Each instance represents metadata for a specific entity (blog post, product, order, etc.)
 */
export async function seedModuleInstances(): Promise<SeederResult> {
	// Get all module types
	const moduleTypes = await prisma.moduleType.findMany();

	if (moduleTypes.length === 0) {
		console.warn("⚠️  No module types found. Skipping module instances seed.");
		return { success: false, message: "No module types found. Skipping module instances seed.", count: 0 };
	}

	// Find specific module types
	const blogType = moduleTypes.find((mt) => mt.key === "blog");
	const knowngleType = moduleTypes.find((mt) => mt.key === "knowngle");
	const productType = moduleTypes.find((mt) => mt.key === "product");
	// Order module type removed from demo data seeding; keep variable if needed for future
	// const orderType = moduleTypes.find((mt) => mt.key === "order");
	const profileType = moduleTypes.find((mt) => mt.key === "profile");

	const instances = [];

	// ============================================
	// Blog Meta Instances
	// ============================================
	if (blogType) {
		console.log("Creating blog meta instances...");

		const blogInstances = await Promise.all([
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: blogType.id,
					entityId: "blog-post-001",
					entityName: "blog_post",
					fieldValues: {
						metaTitle: "Getting Started with Business Management Software - Complete Guide",
						metaDescription: "Learn the basics of business management software with our comprehensive guide. Discover features, setup, and best practices for new users.",
						metaKeywords: "business management, software guide, beginners guide, business tools",
						ogImage: "https://example.com/images/business-management-guide.jpg",
						canonicalUrl: "https://example.com/blog/business-management-guide",
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: blogType.id,
					entityId: "blog-post-002",
					entityName: "blog_post",
					fieldValues: {
						metaTitle: "Advanced Customer Relationship Management Techniques",
						metaDescription: "Master advanced CRM techniques for better customer engagement. Learn how to build lasting relationships and improve customer satisfaction.",
						metaKeywords: "CRM, customer management, relationship building, business tools",
						ogImage: "https://example.com/images/crm-advanced.jpg",
						canonicalUrl: "https://example.com/blog/crm-techniques",
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: blogType.id,
					entityId: "blog-post-003",
					entityName: "blog_post",
					fieldValues: {
						metaTitle: "System Maintenance: Tips to Keep Your Business Software Running Smoothly",
						metaDescription: "Proper system maintenance is crucial for business continuity. Learn cleaning techniques, backup methods, and preventive care tips.",
						metaKeywords: "system maintenance, software care, backups, business continuity",
						ogImage: null,
						canonicalUrl: "https://example.com/blog/system-maintenance",
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: blogType.id,
					entityId: "blog-post-004",
					entityName: "blog_post",
					fieldValues: {
						metaTitle: "Troubleshooting Common Business Software Problems",
						metaDescription: "Encountering software issues? This guide covers common problems and their solutions including data sync and user access issues.",
						metaKeywords: "troubleshooting, software problems, solutions, technical support",
						ogImage: "https://example.com/images/troubleshooting.jpg",
						canonicalUrl: "https://example.com/blog/troubleshooting-software",
					},
					isActive: true,
				},
			}),
		]);

		instances.push(...blogInstances);
	}

	// ============================================
	// Knowledge Base (Knowngle) Meta Instances
	// ============================================
	if (knowngleType) {
		console.log("Creating knowngle meta instances...");

		const knowngleInstances = await Promise.all([
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: knowngleType.id,
					entityId: "knowngle-001",
					entityName: "knowngle_article",
					fieldValues: {
						metaTitle: "What is Business Management Software?",
						metaDescription: "A comprehensive explanation of business management software and its benefits",
						difficultyLevel: "beginner",
						readTime: 5,
						relatedArticles: "knowngle-002, knowngle-003",
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: knowngleType.id,
					entityId: "knowngle-002",
					entityName: "knowngle_article",
					fieldValues: {
						metaTitle: "Understanding User Roles and Permissions",
						metaDescription: "Deep dive into user management and access control in business software",
						difficultyLevel: "intermediate",
						readTime: 10,
						relatedArticles: "knowngle-001, knowngle-004",
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: knowngleType.id,
					entityId: "knowngle-003",
					entityName: "knowngle_article",
					fieldValues: {
						metaTitle: "Advanced Customer Data Management",
						metaDescription: "Advanced techniques for managing customer information and relationships",
						difficultyLevel: "advanced",
						readTime: 15,
						relatedArticles: "knowngle-002, knowngle-005",
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: knowngleType.id,
					entityId: "knowngle-004",
					entityName: "knowngle_article",
					fieldValues: {
						metaTitle: "System Configuration and Setup",
						metaDescription: "Setting up your system and configuring for optimal performance",
						difficultyLevel: "intermediate",
						readTime: 12,
						relatedArticles: null,
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: knowngleType.id,
					entityId: "knowngle-005",
					entityName: "knowngle_article",
					fieldValues: {
						metaTitle: "Data Security and Compliance",
						metaDescription: "Best practices for data security and regulatory compliance",
						difficultyLevel: "advanced",
						readTime: 14,
						relatedArticles: null,
					},
					isActive: true,
				},
			}),
		]);

		instances.push(...knowngleInstances);
	}

	// ============================================
	// Product Meta Instances
	// ============================================
	if (productType) {
		console.log("Creating product meta instances...");

		const productInstances = await Promise.all([
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: productType.id,
					entityId: "product-office-suite-001",
					entityName: "product",
					fieldValues: {
						metaTitle: "Premium Office Management Suite - Complete Solution",
						metaDescription: "High-quality office management software perfect for business operations. Includes user management, reporting, and automation features.",
						sku: "OFFICE-SUITE-001",
						stockStatus: "in-stock",
						manufacturer: "BusinessSoft",
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: productType.id,
					entityId: "product-crm-pro-001",
					entityName: "product",
					fieldValues: {
						metaTitle: "CRM Pro - Advanced Customer Relationship Management",
						metaDescription: "Ultra-powerful CRM system with excellent customer tracking and analytics capabilities.",
						sku: "CRM-PRO-001",
						stockStatus: "low-stock",
						manufacturer: "RelationSoft",
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: productType.id,
					entityId: "product-analytics-basic-001",
					entityName: "product",
					fieldValues: {
						metaTitle: "Analytics Basic - Essential Business Intelligence",
						metaDescription: "Affordable business intelligence solution for data analysis and reporting.",
						sku: "ANALYTICS-BASIC-001",
						stockStatus: "out-of-stock",
						manufacturer: "DataCorp",
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: productType.id,
					entityId: "product-communication-hub-001",
					entityName: "product",
					fieldValues: {
						metaTitle: "Communication Hub - Team Collaboration Platform",
						metaDescription: "Complete team communication solution for modern business collaboration.",
						sku: "COMM-HUB-001",
						stockStatus: "in-stock",
						manufacturer: "TeamConnect",
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: productType.id,
					entityId: "product-workflow-automation-001",
					entityName: "product",
					fieldValues: {
						metaTitle: "Workflow Automation Suite - Process Optimization",
						metaDescription: "Multi-tool workflow automation platform for streamlining business processes.",
						sku: "WORKFLOW-AUTO-001",
						stockStatus: "pre-order",
						manufacturer: "ProcessFlow",
					},
					isActive: true,
				},
			}),
		]);

		instances.push(...productInstances);
	}

	// ============================================
	// Order Meta Instances (removed)
	// ============================================
	// Order demo instances removed per request — no demo orders are seeded now.

	// ============================================
	// Profile Meta Instances
	// ============================================
	if (profileType) {
		console.log("Creating profile meta instances...");

		const profileInstances = await Promise.all([
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: profileType.id,
					entityId: "profile-user-001",
					entityName: "UserProfile",
					fieldValues: {
						fullName: "John Anderson",
						bio: "Experienced business operations specialist with 10+ years in management. Passionate about process optimization and team productivity.",
						avatarUrl: "https://example.com/avatars/john-anderson.jpg",
						phone: "+1 (555) 123-4567",
						location: "New York, USA",
						company: "BusinessCorp",
						jobTitle: "Operations Manager",
						website: "https://example.com/john-anderson",
						socialMedia: '{"twitter": "https://twitter.com/john", "linkedin": "https://linkedin.com/in/john"}',
						preferences: '{"theme": "dark", "notifications": true, "emailDigest": "weekly"}',
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: profileType.id,
					entityId: "profile-user-002",
					entityName: "UserProfile",
					fieldValues: {
						fullName: "Sarah Chen",
						bio: "Customer success specialist and relationship manager. Expert in client engagement and retention strategies.",
						avatarUrl: "https://example.com/avatars/sarah-chen.jpg",
						phone: "+1 (555) 234-5678",
						location: "San Francisco, USA",
						company: "BusinessCorp",
						jobTitle: "Customer Success Manager",
						website: "https://example.com/sarah-chen",
						socialMedia: '{"linkedin": "https://linkedin.com/in/sarah-chen", "instagram": "https://instagram.com/sarahsuccess"}',
						preferences: '{"theme": "light", "notifications": true, "emailDigest": "daily"}',
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: profileType.id,
					entityId: "profile-user-003",
					entityName: "UserProfile",
					fieldValues: {
						fullName: "Michael Rodriguez",
						bio: "Data analyst ensuring accurate reporting and insights for business decision making.",
						avatarUrl: null,
						phone: "+1 (555) 345-6789",
						location: "Los Angeles, USA",
						company: "BusinessCorp",
						jobTitle: "Data Analyst",
						website: null,
						socialMedia: null,
						preferences: '{"theme": "dark", "notifications": false, "emailDigest": "none"}',
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: profileType.id,
					entityId: "profile-user-004",
					entityName: "UserProfile",
					fieldValues: {
						fullName: "Emily Thompson",
						bio: "Sales director focused on revenue growth and client acquisition strategies.",
						avatarUrl: "https://example.com/avatars/emily-thompson.jpg",
						phone: "+1 (555) 456-7890",
						location: "Chicago, USA",
						company: "BusinessCorp",
						jobTitle: "Sales Director",
						website: "https://example.com/emily-thompson",
						socialMedia: '{"linkedin": "https://linkedin.com/in/emily-thompson", "twitter": "https://twitter.com/emily"}',
						preferences: '{"theme": "light", "notifications": true, "emailDigest": "weekly"}',
					},
					isActive: true,
				},
			}),
			prisma.moduleInstance.create({
				data: {
					moduleTypeId: profileType.id,
					entityId: "profile-user-005",
					entityName: "UserProfile",
					fieldValues: {
						fullName: "David Martinez",
						bio: "IT administrator managing software systems and technical infrastructure.",
						avatarUrl: "https://example.com/avatars/david-martinez.jpg",
						phone: "+1 (555) 567-8901",
						location: "Houston, USA",
						company: "BusinessCorp",
						jobTitle: "IT Administrator",
						website: null,
						socialMedia: '{"linkedin": "https://linkedin.com/in/david-martinez"}',
						preferences: '{"theme": "dark", "notifications": true, "emailDigest": "none"}',
					},
					isActive: true,
				},
			}),
		]);

		instances.push(...profileInstances);
	}

	console.log(`✅ Created ${instances.length} module instances`);

	return {
		success: true,
		message: "Module instances seeded successfully",
		count: instances.length,
		data: instances,
	};
}
