import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function createTestPostModuleType() {
	try {
		// Check existing
		const existing = await prisma.moduleType.findMany();
		console.log("All existing module types:", existing.map(mt => ({ key: mt.key, system: mt.system })));

		if (existing.find(mt => mt.key === "blog-post")) {
			console.log("blog-post module type already exists");
		} else {
			const moduleType = await prisma.moduleType.create({
				data: {
					key: "blog-post",
					system: "post",
					name: "Blog Post",
					description: "Additional fields for blog posts",
					fieldSchema: {
						fields: [
							{
								id: "seo_title",
								name: "seo_title",
								label: "SEO Title",
								type: "text",
								required: false,
								placeholder: "SEO optimized title",
								order: 1,
							},
							{
								id: "seo_description",
								name: "seo_description",
								label: "SEO Description",
								type: "textarea",
								required: false,
								placeholder: "SEO meta description",
								order: 2,
							},
							{
								id: "featured",
								name: "featured",
								label: "Featured Post",
								type: "boolean",
								required: false,
								order: 3,
							},
						],
					},
					lockedFields: {},
					isEnabled: true,
					order: 1,
				},
			});

			console.log("Created module type:", moduleType);
		}
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await prisma.$disconnect();
	}
}

createTestPostModuleType();