import { prisma, SeederResult } from "../seeder-utils";

export async function seedEvents(): Promise<SeederResult> {
	// Get admin user for createdBy/updatedBy
	const adminUser = await prisma.user.findFirst({
		where: { email: "baonguyenyam@gmail.com" },
	});

	if (!adminUser) {
		console.log("❌ Admin user not found, skipping events seed");
		return { success: false, message: "Admin user not found, skipping events seed", count: 0 };
	}

	// Create sample events
	const events = [
		{
			title: "Tech Conference 2025",
			slug: "tech-conference-2025",
			description: "Annual technology conference featuring the latest in AI, web development, and digital innovation.",
			startDate: new Date("2025-03-15T09:00:00Z"),
			endDate: new Date("2025-03-17T18:00:00Z"),
			location: "San Francisco Convention Center",
			capacity: 500,
			status: "PUBLISHED" as const,
			eventType: "WITH_SESSIONS" as const,
			ticketingMode: "INTERNAL" as const,
			enableCheckIn: true,
			createdById: adminUser.id,
			updatedById: adminUser.id,
		},
		{
			title: "Design Workshop",
			slug: "design-workshop-2025",
			description: "Hands-on workshop covering modern design principles and tools.",
			startDate: new Date("2025-02-20T10:00:00Z"),
			endDate: new Date("2025-02-20T16:00:00Z"),
			location: "Online",
			capacity: 50,
			status: "PUBLISHED" as const,
			eventType: "WITH_SESSIONS" as const,
			ticketingMode: "INTERNAL" as const,
			enableCheckIn: false,
			createdById: adminUser.id,
			updatedById: adminUser.id,
		},
		{
			title: "Startup Pitch Night",
			slug: "startup-pitch-night",
			description: "Monthly event where local startups present their ideas to investors and the community.",
			startDate: new Date("2025-01-25T18:00:00Z"),
			endDate: new Date("2025-01-25T21:00:00Z"),
			location: "Innovation Hub",
			capacity: 100,
			status: "DRAFT" as const,
			eventType: "LANDING_ONLY" as const,
			ticketingMode: "EXTERNAL" as const,
			externalTicketUrl: "https://eventbrite.com/example",
			externalTicketProvider: "Eventbrite",
			enableCheckIn: true,
			createdById: adminUser.id,
			updatedById: adminUser.id,
		},
	];

	for (const eventData of events) {
		const event = await prisma.event.upsert({
			where: { slug: eventData.slug },
			update: eventData,
			create: eventData,
		});

		console.log(`✅ Created/Updated event: ${event.title}`);

		// Create ticket types for internal events
		if (event.ticketingMode === "INTERNAL" || event.ticketingMode === "HYBRID") {
			const ticketTypes = [
				{
					eventId: event.id,
					name: "Early Bird",
					description: "Limited early bird tickets",
					price: 50.0,
					quantity: 100,
					maxPerUser: 2,
					saleStart: new Date("2024-12-01"),
					saleEnd: new Date("2025-01-31"),
					isActive: true,
				},
				{
					eventId: event.id,
					name: "Regular",
					description: "Standard admission",
					price: 75.0,
					quantity: 300,
					maxPerUser: 2,
					saleStart: new Date("2025-02-01"),
					saleEnd: event.startDate,
					isActive: true,
				},
				{
					eventId: event.id,
					name: "VIP",
					description: "VIP access with networking dinner",
					price: 150.0,
					quantity: 50,
					maxPerUser: 1,
					saleStart: new Date("2024-12-01"),
					saleEnd: event.startDate,
					isActive: true,
				},
			];

			for (const ticketTypeData of ticketTypes) {
				try {
					await prisma.ticketType.create({
						data: ticketTypeData,
					});
				} catch (error) {
					// Skip if already exists
					console.log(`   Ticket type ${ticketTypeData.name} already exists`);
				}
			}

			console.log(`   📝 Created ticket types for ${event.title}`);
		}

		// Create sessions for WITH_SESSIONS events
		if (event.eventType === "WITH_SESSIONS") {
			const sessions = [
				{
					eventId: event.id,
					title: "Opening Keynote",
					description: "Welcome and overview of the event",
					startTime: new Date(event.startDate.getTime() + 9 * 60 * 60 * 1000), // 9 AM
					endTime: new Date(event.startDate.getTime() + 10 * 60 * 60 * 1000), // 10 AM
					speaker: "Dr. Jane Smith",
					capacity: event.capacity,
					room: "Main Hall",
				},
				{
					eventId: event.id,
					title: "AI & Machine Learning Workshop",
					description: "Hands-on session with the latest ML tools",
					startTime: new Date(event.startDate.getTime() + 11 * 60 * 60 * 1000), // 11 AM
					endTime: new Date(event.startDate.getTime() + 13 * 60 * 60 * 1000), // 1 PM
					speaker: "Prof. John Doe",
					capacity: 100,
					room: "Workshop Room A",
				},
				{
					eventId: event.id,
					title: "Networking Lunch",
					description: "Connect with fellow attendees",
					startTime: new Date(event.startDate.getTime() + 13 * 60 * 60 * 1000), // 1 PM
					endTime: new Date(event.startDate.getTime() + 15 * 60 * 60 * 1000), // 3 PM
					capacity: event.capacity,
					room: "Dining Area",
				},
			];

			for (const sessionData of sessions) {
				try {
					await prisma.eventSession.create({
						data: sessionData,
					});
				} catch (error) {
					// Skip if already exists
					console.log(`   Session ${sessionData.title} already exists`);
				}
			}

			console.log(`   📅 Created sessions for ${event.title}`);
		}
	}

	console.log("✅ Events seeding completed");

	return {
		success: true,
		message: "Events seeded successfully",
		count: events.length,
	};
}
