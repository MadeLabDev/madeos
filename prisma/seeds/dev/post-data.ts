import { prisma, SeederResult } from "../seeder-utils";

export async function seedPostData(): Promise<SeederResult> {
	// 1. Create categories
	const categories = await Promise.all([
		prisma.postCategory.create({
			data: {
				name: "Blog",
				slug: "blog",
				description: "General blog posts and articles",
				color: "#3178C6",
				order: 1,
			},
		}),
		prisma.postCategory.create({
			data: {
				name: "News",
				slug: "news",
				description: "Latest news and updates",
				color: "#336791",
				order: 2,
			},
		}),
		prisma.postCategory.create({
			data: {
				name: "Tutorials",
				slug: "tutorials",
				description: "Step-by-step guides and tutorials",
				color: "#FF6B6B",
				order: 3,
			},
		}),
		prisma.postCategory.create({
			data: {
				name: "Events",
				slug: "events",
				description: "Event announcements and coverage",
				color: "#4CAF50",
				order: 4,
			},
		}),
	]);

	console.log(`  ✅ Created ${categories.length} post categories`);

	// 2. Create Tags
	const tags = await Promise.all([
		prisma.postTag.create({
			data: {
				name: "Featured",
				slug: "featured",
				color: "#10B981",
			},
		}),
		prisma.postTag.create({
			data: {
				name: "Announcement",
				slug: "announcement",
				color: "#3B82F6",
			},
		}),
		prisma.postTag.create({
			data: {
				name: "Tips",
				slug: "tips",
				color: "#8B5CF6",
			},
		}),
		prisma.postTag.create({
			data: {
				name: "Update",
				slug: "update",
				color: "#F59E0B",
			},
		}),
	]);

	console.log(`  ✅ Created ${tags.length} post tags`);

	// 3. Create Sample Posts
	const posts = [
		{
			title: "Welcome to Our Blog",
			slug: "welcome-to-our-blog",
			excerpt: "Introducing our new blog platform and what to expect.",
			content: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Welcome to our blog! We're excited to share our thoughts, insights, and updates with you.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Stay tuned for regular posts about our industry, tips, and announcements.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`,
			type: "blog",
			categories: {
				create: [{ category: { connect: { id: categories[0].id } } }], // Blog
			},
			isPublished: true,
			publishedAt: new Date(),
			metaData: {},
		},
		{
			title: "Latest Platform Updates",
			slug: "latest-platform-updates",
			excerpt: "Check out the newest features and improvements we've added.",
			content: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"We've been working hard to improve our platform with new features and enhancements.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Read on to learn about the latest updates and how they benefit you.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`,
			type: "blog",
			categories: {
				create: [{ category: { connect: { id: categories[1].id } } }], // News
			},
			isPublished: true,
			publishedAt: new Date(),
			metaData: {},
		},
		{
			title: "TechCorp - Platinum Sponsor",
			slug: "techcorp-platinum-sponsor",
			excerpt: "Leading technology solutions provider and event sponsor.",
			content: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"TechCorp is a leading provider of innovative technology solutions, committed to supporting the tech community through sponsorship and collaboration.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`,
			type: "sponsor",
			categories: {
				create: [{ category: { connect: { id: categories[3].id } } }], // Events
			},
			isPublished: true,
			publishedAt: new Date(),
			metaData: {
				company: "TechCorp",
				website: "https://techcorp.com",
				sponsorLevel: "Platinum",
			},
		},
		{
			title: "InnovateLabs - Gold Sponsor",
			slug: "innovatelabs-gold-sponsor",
			excerpt: "Research and development company sponsoring innovation events.",
			content: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"InnovateLabs focuses on cutting-edge research and development, partnering with events to drive technological advancement.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`,
			type: "sponsor",
			categories: {
				create: [{ category: { connect: { id: categories[3].id } } }], // Events
			},
			isPublished: true,
			publishedAt: new Date(),
			metaData: {
				company: "InnovateLabs",
				website: "https://innovatelabs.com",
				sponsorLevel: "Gold",
			},
		},
		{
			title: "Dr. Sarah Johnson - Keynote Speaker",
			slug: "dr-sarah-johnson-keynote-speaker",
			excerpt: "AI researcher and keynote speaker at tech conferences.",
			content: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Dr. Sarah Johnson is a renowned AI researcher with over 15 years of experience in machine learning and artificial intelligence.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`,
			type: "speaker",
			categories: {
				create: [{ category: { connect: { id: categories[3].id } } }], // Events
			},
			isPublished: true,
			publishedAt: new Date(),
			metaData: {
				name: "Dr. Sarah Johnson",
				title: "Chief AI Researcher",
				company: "FutureTech Labs",
				topic: "The Future of AI",
			},
		},
		{
			title: "Prof. Michael Chen - Workshop Facilitator",
			slug: "prof-michael-chen-workshop-facilitator",
			excerpt: "Professor specializing in software engineering and workshop facilitation.",
			content: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Prof. Michael Chen is a professor of software engineering with extensive experience in conducting technical workshops and training sessions.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`,
			type: "speaker",
			categories: {
				create: [{ category: { connect: { id: categories[2].id } } }], // Tutorials
			},
			isPublished: true,
			publishedAt: new Date(),
			metaData: {
				name: "Prof. Michael Chen",
				title: "Professor of Software Engineering",
				company: "Tech University",
				topic: "Advanced Software Design Patterns",
			},
		},
	];

	const createdPosts = await Promise.all(
		posts.map((post) =>
			prisma.post.create({
				data: post,
				include: {
					categories: {
						include: { category: true },
					},
					tags: {
						include: { tag: true },
					},
				},
			}),
		),
	);

	console.log(`  ✅ Created ${createdPosts.length} posts`);

	// 4. Link posts with tags (sample tagging)
	const tagLinks = [
		{ postIndex: 0, tagIndex: 0 }, // Welcome -> Featured
		{ postIndex: 0, tagIndex: 1 }, // Welcome -> Announcement
		{ postIndex: 1, tagIndex: 3 }, // Updates -> Update
		{ postIndex: 2, tagIndex: 2 }, // Tutorial -> Tips
	];

	for (const link of tagLinks) {
		const post = createdPosts[link.postIndex];
		const tag = tags[link.tagIndex];

		if (!post || !tag) continue;

		await prisma.postTagsOnPost.create({
			data: {
				postId: post.id,
				tagId: tag.id,
			},
		});
	}

	console.log(`  ✅ Created ${tagLinks.length} tag-post links`);

	console.log("✅ Post seeding complete!");

	return {
		success: true,
		message: "Post data seeded successfully",
		count: categories.length + tags.length + createdPosts.length,
		data: { categories, tags, posts: createdPosts },
	};
}
