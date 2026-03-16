import { prisma, SeederResult } from "../seeder-utils";

export async function seedDesignData(): Promise<SeederResult> {
	// Get existing customers
	const customers = await prisma.customer.findMany({
		where: { type: { in: ["customer", "partner"] } },
		take: 3,
	});

	if (customers.length < 2) {
		console.log("⚠️  Not enough customers found, skipping Design data seed");
		return { success: true, message: "Design x Development data seeded successfully", count: 13 };
	}

	const customer1 = customers[0]!;
	const customer2 = customers[1]!;

	// Get existing users for assignments
	const users = await prisma.user.findMany({ take: 3 });
	const user1 = users[0]?.id || "user-1";
	const user2 = users[1]?.id || "user-2";

	// Seed Design Engagements
	console.log("Creating design engagements...");
	const designEngagements = await Promise.all([
		prisma.engagement.create({
			data: {
				customerId: customer1.id,
				title: "Brand Identity Design - MADE Lab",
				type: "DESIGN",
				status: "ACTIVE",
				priority: "HIGH",
				startDate: new Date("2025-11-01"),
				dueDate: new Date("2025-12-20"),
				budget: 25000,
				description: "Complete brand identity design including logo, color palette, and brand guidelines",
				assignedTo: user1,
				metaData: {
					designType: "Brand Identity",
					deliverables: ["Logo Design", "Brand Guidelines", "Color Palette", "Typography"],
					brandElements: ["Primary Logo", "Secondary Logo", "Icon Set"],
				},
			},
		}),
		prisma.engagement.create({
			data: {
				customerId: customer2.id,
				title: "Product Packaging Design",
				type: "DESIGN",
				status: "ACTIVE",
				priority: "MEDIUM",
				startDate: new Date("2025-11-15"),
				dueDate: new Date("2026-01-15"),
				budget: 35000,
				description: "Design packaging for new product line including labels, boxes, and retail displays",
				assignedTo: user2,
				metaData: {
					designType: "Packaging",
					deliverables: ["Product Labels", "Box Design", "Retail Display", "Mockups"],
					productTypes: ["Primary Packaging", "Secondary Packaging", "Display Units"],
				},
			},
		}),
	]);

	// Seed Design Projects
	console.log("Creating design projects...");
	const designProjects = await Promise.all([
		prisma.designProject.create({
			data: {
				engagementId: designEngagements[0].id,
				customerId: customer1.id,
				title: "MADE Lab Brand Identity System",
				description: "Comprehensive brand identity design for MADE Laboratory including logo, color system, typography, and brand guidelines",
				status: "IN_PROGRESS",
				priority: "HIGH",
				requestedBy: user1,
				assignedTo: user1,
				startDate: new Date("2025-11-01"),
				dueDate: new Date("2025-12-10"),
				budget: 25000,
				metaData: {
					brandValues: ["Innovation", "Quality", "Collaboration"],
					targetAudience: "Tech companies, research institutions",
					competitors: ["IDEO", "frog design", "Pentagram"],
				},
			},
		}),
		prisma.designProject.create({
			data: {
				engagementId: designEngagements[1].id,
				customerId: customer2.id,
				title: "Eco-Friendly Product Packaging Suite",
				description: "Sustainable packaging design for new eco-friendly product line with recyclable materials and minimal environmental impact",
				status: "INTAKE",
				priority: "MEDIUM",
				requestedBy: user2,
				assignedTo: user2,
				startDate: new Date("2025-11-15"),
				dueDate: new Date("2025-12-30"),
				budget: 35000,
				metaData: {
					sustainabilityFocus: true,
					materials: ["Recycled Cardboard", "Soy-based Ink", "Biodegradable Plastics"],
					certifications: ["FSC Certified", "Cradle to Cradle"],
				},
			},
		}),
	]);

	// Seed Design Briefs
	console.log("Creating design briefs...");
	const designBriefs = await Promise.all([
		prisma.designBrief.create({
			data: {
				designProjectId: designProjects[0].id,
				brandAssets: "Existing: MADE Lab logo (needs refresh), Color: Blue (#0066CC), Typography: System fonts",
				targetAudience: "Tech companies, research institutions, B2B clients aged 30-55, decision-makers in product development",
				constraints: "Must work in both digital and print formats, scalable for various sizes, accessible color contrast",
				inspirations: "Clean, modern tech brands like Stripe, Slack, and Figma. Emphasis on innovation and collaboration.",
				deliverables: "Primary logo, secondary logo, icon set, color palette, typography guidelines, usage examples",
				budget: 25000,
				timeline: "6 weeks total - 2 weeks research, 2 weeks concepts, 1 week refinements, 1 week final delivery",
				notes: "Client wants to emphasize 'laboratory' aspect while maintaining modern, approachable feel. Open to exploring scientific motifs.",
				status: "APPROVED",
				approvedAt: new Date("2025-11-05"),
				approvedBy: user1,
				metaData: {
					researchCompleted: true,
					competitorAnalysis: ["Stripe", "Figma", "Notion"],
					moodBoard: "Modern, clean, scientific, collaborative",
				},
			},
		}),
		prisma.designBrief.create({
			data: {
				designProjectId: designProjects[1].id,
				brandAssets: "Brand colors: Green (#4CAF50), Earth tones, Nature-inspired palette",
				targetAudience: "Eco-conscious consumers, aged 25-45, environmentally aware millennials and Gen Z",
				constraints: "Must use sustainable materials, minimal plastic, recyclable components, cost-effective production",
				inspirations: "Patagonia, Apple (sustainability focus), Innocent Drinks, sustainable packaging trends",
				deliverables: "Product labels, shipping boxes, retail display units, digital mockups, material specifications",
				budget: 35000,
				timeline: "8 weeks - including material sourcing and prototyping",
				notes: "Focus on storytelling through packaging - each element should communicate sustainability story",
				status: "SUBMITTED",
				metaData: {
					sustainabilityMetrics: "80% recycled materials, carbon neutral shipping",
					productionConstraints: "Local manufacturing preferred",
				},
			},
		}),
	]);

	// Seed Product Designs
	console.log("Creating product designs...");
	const productDesigns = await Promise.all([
		// Brand Identity Designs
		prisma.productDesign.create({
			data: {
				designProjectId: designProjects[0].id,
				name: "Primary Logo Design",
				description: "Main MADE Lab logo for primary brand identification",
				designType: "LOGO",
				productType: "Brand Asset",
				mockupUrl: "/mockups/logo-primary.png",
				graphicSpecsFile: "/specs/logo-primary.ai",
				layerInfo: {
					background: "Transparent",
					elements: ["MADE Text", "Lab Icon", "Connecting Element"],
				},
				colorSeparations: "CMYK: C100 M70 Y0 K0 (Blue), C0 M0 Y0 K100 (Black)",
				status: "APPROVED",
				feasibilityNotes: "Scalable from 16px to 10ft, works in all media",
				compatibilityCheck: true,
				decorationDetails: {
					minSize: "16px",
					maxSize: "Unlimited",
					fileFormats: ["AI", "EPS", "SVG", "PNG", "JPG"],
				},
				version: 3,
				assignedTo: user1,
				startedAt: new Date("2025-11-01"),
				completedAt: new Date("2025-11-15"),
				metaData: {
					iterations: 3,
					revisions: 2,
					clientFeedback: "Perfect balance of modern and scientific",
				},
			},
		}),
		prisma.productDesign.create({
			data: {
				designProjectId: designProjects[0].id,
				name: "Brand Color Palette",
				description: "Complete color system including primary, secondary, and accent colors",
				designType: "BRAND_COLORS",
				productType: "Brand Asset",
				colorSeparations: "Primary: #0066CC, Secondary: #00A3CC, Accent: #FF6B35, Neutral: #F8F9FA",
				status: "APPROVED",
				feasibilityNotes: "All colors meet WCAG AA accessibility standards",
				compatibilityCheck: true,
				version: 2,
				assignedTo: user1,
				startedAt: new Date("2025-11-03"),
				completedAt: new Date("2025-11-10"),
				metaData: {
					colorTheory: "Blue represents trust and innovation",
					accessibility: "All combinations pass contrast ratios",
				},
			},
		}),
		// Packaging Designs
		prisma.productDesign.create({
			data: {
				designProjectId: designProjects[1].id,
				name: "Product Box Design - Primary",
				description: "Main product packaging box with sustainable materials",
				designType: "PACKAGING",
				productType: "Secondary Packaging",
				mockupUrl: "/mockups/box-primary.png",
				graphicSpecsFile: "/specs/box-primary.ai",
				status: "REVIEW",
				feasibilityNotes: "Uses 80% recycled cardboard, soy-based inks",
				compatibilityCheck: true,
				decorationDetails: {
					material: "Recycled Cardboard 300gsm",
					printing: "Soy-based inks, UV spot gloss",
					dimensions: "200x150x50mm",
				},
				version: 2,
				assignedTo: user2,
				startedAt: new Date("2025-11-20"),
				metaData: {
					sustainability: "FSC certified, carbon neutral",
					printingMethod: "Offset printing",
				},
			},
		}),
		prisma.productDesign.create({
			data: {
				designProjectId: designProjects[1].id,
				name: "Product Label Design",
				description: "Front and back product labels with ingredient and care information",
				designType: "LABEL",
				productType: "Primary Packaging",
				mockupUrl: "/mockups/label-product.png",
				status: "IN_PROGRESS",
				feasibilityNotes: "Meets FDA labeling requirements, barcode integration ready",
				decorationDetails: {
					material: "Recycled paper 120gsm",
					finishing: "Matte laminate",
					size: "100x50mm",
				},
				version: 1,
				assignedTo: user2,
				startedAt: new Date("2025-11-25"),
				metaData: {
					regulatory: "FDA compliant, UPC barcode included",
					languages: ["English", "Spanish"],
				},
			},
		}),
	]);

	// Seed Tech Packs
	console.log("Creating tech packs...");
	const techPacks = await Promise.all([
		prisma.techPack.create({
			data: {
				productDesignId: productDesigns[0].id,
				name: "MADE Lab Logo Tech Pack",
				description: "Manufacturing specifications for MADE Lab primary logo",
				sizing: {
					minSize: "16px (digital)",
					maxSize: "10ft (billboard)",
					aspectRatio: "3.2:1",
				},
				materials: {
					primary: "Digital vector format",
					alternatives: ["Offset printing", "Screen printing", "Embroidery"],
				},
				colors: {
					primary: "#0066CC (CMYK: 100, 70, 0, 0)",
					secondary: "#00A3CC (CMYK: 70, 20, 0, 0)",
				},
				decorationMethod: "Digital Print",
				productionNotes: "Vector format ensures scalability. Provide 1 inch safety area around logo.",
				qualitySpecs: {
					resolution: "300 DPI minimum",
					colorAccuracy: "Pantone matching within 5%",
					bleed: "1/8 inch",
				},
				outputFiles: "/techpacks/logo-v3-final.zip",
				status: "APPROVED",
				approvedAt: new Date("2025-11-18"),
				approvedBy: user1,
				metaData: {
					fileFormats: ["AI", "EPS", "SVG", "PDF"],
					colorProfiles: ["CMYK", "RGB", "Pantone"],
				},
			},
		}),
	]);

	// Seed Design Decks
	console.log("Creating design decks...");
	const designDecks = await Promise.all([
		prisma.designDeck.create({
			data: {
				designProjectId: designProjects[0].id,
				title: "MADE Lab Brand Identity Presentation",
				description: "Complete brand identity presentation including logo, colors, typography, and usage guidelines",
				coverUrl: "/decks/brand-identity-cover.png",
				designIds: JSON.stringify([productDesigns[0].id, productDesigns[1].id]),
				deckUrl: "/decks/brand-identity-final.pdf",
				status: "PUBLISHED",
				publishedAt: new Date("2025-11-20"),
				publishedBy: user1,
				version: 1,
				notes: "Final presentation approved by client for brand rollout",
				metaData: {
					slides: 24,
					sections: ["Logo", "Colors", "Typography", "Usage Guidelines", "Examples"],
					clientFeedback: "Excellent work, ready for implementation",
				},
			},
		}),
		prisma.designDeck.create({
			data: {
				designProjectId: designProjects[1].id,
				title: "Sustainable Packaging Design Concepts",
				description: "Presentation of sustainable packaging design concepts and material specifications",
				status: "REVIEW",
				version: 1,
				notes: "Awaiting client feedback on material choices",
				metaData: {
					concepts: 3,
					focus: "Sustainability and user experience",
				},
			},
		}),
	]);

	// Seed Design Reviews
	console.log("Creating design reviews...");
	await Promise.all([
		// Reviews for Brand Identity Project
		prisma.designReview.create({
			data: {
				productDesignId: productDesigns[0].id,
				designProjectId: designProjects[0].id,
				reviewerName: "John Smith",
				reviewerEmail: "john.smith@customer1.com",
				feedback: "Love the clean, modern look. The scientific elements are subtle but effective. Great work on scalability.",
				approvalStatus: "APPROVED",
				approvedAt: new Date("2025-11-16"),
				approvedBy: user1,
				requestedAt: new Date("2025-11-15"),
				requestedBy: user1,
				notes: "Approved for production use across all brand materials",
				metaData: {
					reviewType: "Client Review",
					rating: 5,
				},
			},
		}),
		prisma.designReview.create({
			data: {
				designProjectId: designProjects[0].id,
				reviewerName: "Sarah Johnson",
				reviewerEmail: "sarah.johnson@customer1.com",
				feedback: "Color palette works well for both digital and print. Good accessibility considerations.",
				approvalStatus: "APPROVED",
				approvedAt: new Date("2025-11-17"),
				approvedBy: user1,
				requestedAt: new Date("2025-11-15"),
				requestedBy: user1,
				metaData: {
					reviewType: "Internal Review",
					department: "Marketing",
				},
			},
		}),
		// Reviews for Packaging Project
		prisma.designReview.create({
			data: {
				productDesignId: productDesigns[2].id,
				designProjectId: designProjects[1].id,
				reviewerName: "Mike Davis",
				reviewerEmail: "mike.davis@customer2.com",
				feedback: "Like the sustainable approach. Can we explore more recycled material options for the box?",
				approvalStatus: "REVISION_REQUESTED",
				requestedAt: new Date("2025-11-28"),
				requestedBy: user2,
				notes: "Client wants to explore additional sustainable material options",
				metaData: {
					reviewType: "Client Review",
					concerns: ["Material sourcing", "Cost implications"],
				},
			},
		}),
		prisma.designReview.create({
			data: {
				designProjectId: designProjects[1].id,
				reviewerName: "Design Team Lead",
				reviewerEmail: "design@madeapp.com",
				feedback: "Strong concepts overall. The eco-friendly messaging is clear. Need to ensure barcode placement doesn't interfere with design elements.",
				approvalStatus: "DRAFT",
				requestedAt: new Date("2025-11-25"),
				requestedBy: user2,
				metaData: {
					reviewType: "Internal Review",
					team: "Design Team",
				},
			},
		}),
	]);

	// Seed Tasks for Design Projects
	console.log("Creating design-related tasks...");
	await Promise.all([
		prisma.task.create({
			data: {
				title: "Logo Concept Development",
				description: "Develop initial logo concepts incorporating scientific and modern elements",
				entityType: "ENGAGEMENT",
				entityId: designEngagements[0].id,
				status: "COMPLETED",
				priority: "HIGH",
				assignedTo: user1,
				dueDate: new Date("2025-11-08"),
				taskType: "DESIGN_CONCEPT",
				category: "Creative",
				tags: JSON.stringify(["logo", "branding", "concept"]),
				completedAt: new Date("2025-11-07"),
				metaData: {
					conceptsDeveloped: 5,
					clientPresentations: 3,
				},
			},
		}),
		prisma.task.create({
			data: {
				title: "Sustainable Material Research",
				description: "Research and source sustainable materials for packaging",
				entityType: "ENGAGEMENT",
				entityId: designEngagements[1].id,
				status: "IN_PROGRESS",
				priority: "MEDIUM",
				assignedTo: user2,
				dueDate: new Date("2025-12-05"),
				taskType: "RESEARCH",
				category: "Research",
				tags: JSON.stringify(["sustainability", "materials", "research"]),
				metaData: {
					materials: ["Recycled cardboard", "Soy ink", "Biodegradable plastics"],
					suppliers: ["EcoMaterials Inc", "GreenPrint Co"],
				},
			},
		}),
		prisma.task.create({
			data: {
				title: "Brand Guidelines Documentation",
				description: "Create comprehensive brand guidelines document",
				entityType: "ENGAGEMENT",
				entityId: designEngagements[0].id,
				status: "TODO",
				priority: "MEDIUM",
				assignedTo: user1,
				dueDate: new Date("2025-12-01"),
				taskType: "DOCUMENTATION",
				category: "Documentation",
				tags: JSON.stringify(["guidelines", "documentation", "brand"]),
				metaData: {
					sections: ["Logo Usage", "Color Palette", "Typography", "Imagery"],
				},
			},
		}),
	]);

	console.log(`✅ Created Design x Development seed data:`);
	console.log(`   - ${designEngagements.length} design engagements`);
	console.log(`   - ${designProjects.length} design projects`);
	console.log(`   - ${designBriefs.length} design briefs`);
	console.log(`   - ${productDesigns.length} product designs`);
	console.log(`   - ${techPacks.length} tech packs`);
	console.log(`   - ${designDecks.length} design decks`);
	console.log(`   - Design reviews and tasks created`);

	return {
		success: true,
		message: "Design x Development data seeded successfully",
		count: designEngagements.length + designProjects.length + designBriefs.length + productDesigns.length + techPacks.length + designDecks.length,
	};
}
