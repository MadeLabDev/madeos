import { prisma, SeederResult } from "../seeder-utils";

export async function seedTraining(): Promise<SeederResult> {
	// Get admin user for createdBy/updatedBy
	const adminUser = await prisma.user.findFirst({
		where: { email: "baonguyenyam@gmail.com" },
	});

	if (!adminUser) {
		console.log("❌ Admin user not found, skipping training seed");
		return { success: false, message: "Admin user not found, skipping training seed", count: 0 };
	}

	// Get existing customers
	const customers = await prisma.customer.findMany({
		take: 3,
		include: {
			contacts: true,
		},
	});

	if (customers.length === 0) {
		console.log("❌ No customers found, skipping training seed");
		return { success: false, message: "No customers found, skipping training seed", count: 0 };
	}

	const firstCustomer = customers[0];
	if (!firstCustomer) {
		console.log("❌ First customer is undefined, skipping training seed");
		return { success: false, message: "First customer is undefined, skipping training seed", count: 0 };
	}

	const secondCustomer = customers[1];
	if (!secondCustomer) {
		console.log("❌ Second customer is undefined, skipping training seed");
		return { success: false, message: "Second customer is undefined, skipping training seed", count: 0 };
	}

	const thirdCustomer = customers[2];
	if (!thirdCustomer) {
		console.log("❌ Third customer is undefined, skipping training seed");
		return { success: false, message: "Third customer is undefined, skipping training seed", count: 0 };
	}

	// Get existing engagements
	const engagements = await prisma.engagement.findMany({
		where: { type: "TRAINING" },
		take: 2,
	});

	// Create sample training engagements
	const trainingEngagements = [
		{
			engagementId: engagements[0]?.id || "sample-engagement-1",
			customerId: firstCustomer.id,
			title: "Advanced React Development Workshop",
			description: "Comprehensive workshop covering advanced React patterns, performance optimization, and modern development practices.",
			trainingType: "INSTRUCTOR_LED" as const,
			deliveryMethod: "HYBRID" as const,
			startDate: new Date("2025-02-15T09:00:00Z"),
			endDate: new Date("2025-02-17T17:00:00Z"),
			totalDurationHours: 24,
			targetAudience: "Senior Frontend Developers",
			maxParticipants: 20,
			minParticipants: 8,
			status: "DRAFT" as const,
			phase: "DESIGN" as const,
			certificationLevel: "COMPLETION" as const,
			requestedBy: adminUser.id,
			instructorId: adminUser.id,
			coordinatorId: adminUser.id,
			contactId: firstCustomer.contacts?.[0]?.id,
			createdBy: adminUser.id,
			updatedBy: adminUser.id,
		},
		{
			engagementId: engagements[1]?.id || "sample-engagement-2",
			customerId: secondCustomer.id,
			title: "Node.js Backend Architecture",
			description: "Learn to build scalable Node.js applications with proper architecture patterns, security, and performance optimization.",
			trainingType: "BLENDED" as const,
			deliveryMethod: "ONLINE" as const,
			startDate: new Date("2025-03-10T10:00:00Z"),
			endDate: new Date("2025-03-14T16:00:00Z"),
			totalDurationHours: 32,
			targetAudience: "Backend Developers",
			maxParticipants: 15,
			minParticipants: 5,
			status: "INTAKE" as const,
			phase: "DISCOVERY" as const,
			certificationLevel: "COMPETENCY" as const,
			requestedBy: adminUser.id,
			instructorId: adminUser.id,
			coordinatorId: adminUser.id,
			contactId: secondCustomer.contacts?.[0]?.id,
			createdBy: adminUser.id,
			updatedBy: adminUser.id,
		},
		{
			engagementId: "sample-engagement-3",
			customerId: thirdCustomer.id,
			title: "DevOps Fundamentals",
			description: "Introduction to DevOps practices, CI/CD pipelines, containerization, and infrastructure as code.",
			trainingType: "SELF_PACED" as const,
			deliveryMethod: "ASYNCHRONOUS" as const,
			startDate: new Date("2025-01-20T00:00:00Z"),
			endDate: new Date("2025-02-20T23:59:59Z"),
			totalDurationHours: 40,
			targetAudience: "Developers and IT Operations",
			maxParticipants: 50,
			minParticipants: 1,
			status: "IN_PROGRESS" as const,
			phase: "DELIVERY" as const,
			certificationLevel: "NONE" as const,
			requestedBy: adminUser.id,
			instructorId: adminUser.id,
			coordinatorId: adminUser.id,
			contactId: thirdCustomer.contacts?.[0]?.id,
			createdBy: adminUser.id,
			updatedBy: adminUser.id,
		},
	];

	let createdCount = 0;

	for (const trainingData of trainingEngagements) {
		try {
			// Check if engagement exists
			const existingEngagement = await prisma.engagement.findUnique({
				where: { id: trainingData.engagementId },
			});

			let engagementId = trainingData.engagementId;

			// Create engagement if it doesn't exist
			if (!existingEngagement) {
				const engagement = await prisma.engagement.create({
					data: {
						customerId: trainingData.customerId,
						title: trainingData.title,
						type: "TRAINING",
						status: "ACTIVE",
						startDate: trainingData.startDate,
						dueDate: trainingData.endDate,
						assignedTo: adminUser.id,
						createdBy: adminUser.id,
						updatedBy: adminUser.id,
					},
				});
				engagementId = engagement.id;
			}

			const training = await prisma.trainingEngagement.upsert({
				where: {
					engagementId: engagementId,
				},
				update: {
					...trainingData,
					engagementId,
				},
				create: {
					...trainingData,
					engagementId,
				},
			});

			console.log(`✅ Created/Updated training engagement: ${training.title}`);

			// Create training sessions for instructor-led trainings
			if (training.trainingType === "INSTRUCTOR_LED") {
				const sessions = [
					{
						trainingEngagementId: training.id,
						title: "Introduction and Setup",
						description: "Course overview, environment setup, and prerequisites review.",
						sessionNumber: 1,
						deliveryMethod: "HYBRID" as const,
						duration: 4,
						startDate: new Date(training.startDate!.getTime() + 0 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
						endDate: new Date(training.startDate!.getTime() + 0 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000),
						instructorId: adminUser.id,
						maxCapacity: training.maxParticipants,
						status: "PLANNED" as const,
					},
					{
						trainingEngagementId: training.id,
						title: "Core Concepts",
						description: "Deep dive into the main concepts and practical applications.",
						sessionNumber: 2,
						deliveryMethod: "HYBRID" as const,
						duration: 8,
						startDate: new Date(training.startDate!.getTime() + 1 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
						endDate: new Date(training.startDate!.getTime() + 1 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
						instructorId: adminUser.id,
						maxCapacity: training.maxParticipants,
						status: "PLANNED" as const,
					},
					{
						trainingEngagementId: training.id,
						title: "Advanced Topics and Q&A",
						description: "Advanced concepts, troubleshooting, and open Q&A session.",
						sessionNumber: 3,
						deliveryMethod: "HYBRID" as const,
						duration: 6,
						startDate: new Date(training.startDate!.getTime() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
						endDate: new Date(training.startDate!.getTime() + 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
						instructorId: adminUser.id,
						maxCapacity: training.maxParticipants,
						status: "PLANNED" as const,
					},
				];

				for (const sessionData of sessions) {
					await prisma.trainingSession.upsert({
						where: {
							trainingEngagementId_sessionNumber: {
								trainingEngagementId: sessionData.trainingEngagementId,
								sessionNumber: sessionData.sessionNumber,
							},
						},
						update: sessionData,
						create: sessionData,
					});
				}

				console.log(`   📚 Created ${sessions.length} sessions for ${training.title}`);
			}

			createdCount++;
		} catch (error) {
			console.error(`❌ Failed to create training engagement: ${trainingData.title}`, error);
		}
	}

	return {
		success: true,
		message: `Training engagements seeded successfully`,
		count: createdCount,
	};
}
