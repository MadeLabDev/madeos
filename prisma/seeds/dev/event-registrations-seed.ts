import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma, SeederResult } from "../seeder-utils";

export async function seedEventRegistrations(): Promise<SeederResult> {
	// Get admin user for check-in operations
	const adminUser = await prisma.user.findFirst({
		where: { email: "baonguyenyam@gmail.com" },
	});

	if (!adminUser) {
		console.log("❌ Admin user not found, skipping event registrations seed");
		return { success: false, message: "Admin user not found, skipping event registrations seed", count: 0 };
	}

	// Get existing events
	const events = await prisma.event.findMany({
		where: { status: "PUBLISHED" },
		include: { ticketTypes: true },
	});

	if (events.length === 0) {
		console.log("❌ No published events found, skipping registrations seed");
		return { success: false, message: "No published events found, skipping registrations seed", count: 0 };
	}

	// Create test users for event registrations
	const testUsers = [
		{
			email: "attendee1@madelab.io",
			name: "John Smith",
			username: "johnsmith",
		},
		{
			email: "attendee2@madelab.io",
			name: "Sarah Johnson",
			username: "sarahjohnson",
		},
		{
			email: "attendee3@madelab.io",
			name: "Mike Chen",
			username: "mikechen",
		},
		{
			email: "attendee4@madelab.io",
			name: "Emma Davis",
			username: "emmadavis",
		},
		{
			email: "attendee5@madelab.io",
			name: "Alex Rodriguez",
			username: "alexrodriguez",
		},
	];

	const hashedPassword = await bcrypt.hash("password123", 10);

	// Get user role for attendees
	const userRole = await prisma.role.findFirst({
		where: { name: "user" },
	});

	if (!userRole) {
		console.log("❌ User role not found, skipping test user creation");
		return { success: false, message: "User role not found, skipping test user creation", count: 0 };
	}

	const createdUsers = [];

	for (const userData of testUsers) {
		let user = await prisma.user.findFirst({
			where: { email: userData.email },
		});

		if (!user) {
			user = await prisma.user.create({
				data: {
					email: userData.email,
					username: userData.username,
					name: userData.name,
					password: hashedPassword,
					emailVerified: new Date(),
					isActive: true,
				},
			});

			// Assign user role
			await prisma.userRole.create({
				data: {
					userId: user.id,
					roleId: userRole.id,
				},
			});

			// Create user profile
			await prisma.userProfile.upsert({
				where: { userId: user.id },
				update: {},
				create: {
					userId: user.id,
					metaData: JSON.stringify({}),
					isPublic: false,
				},
			});
			console.log(`✅ Created test user: ${user.name} (${user.email})`);
		}

		createdUsers.push(user);
	}

	// Create registrations and tickets for each event
	for (const event of events) {
		if (event.ticketingMode === "INTERNAL" || event.ticketingMode === "HYBRID") {
			console.log(`📝 Creating registrations for event: ${event.title}`);

			// Get ticket types for this event
			const ticketTypes = await prisma.ticketType.findMany({
				where: { eventId: event.id, isActive: true },
			});

			if (ticketTypes.length === 0) {
				console.log(`   ⚠️  No active ticket types found for ${event.title}, skipping`);
				continue;
			}

			// Create registrations for a subset of users (not all users register for all events)
			const usersToRegister = createdUsers.slice(0, Math.min(createdUsers.length, 3)); // Register first 3 users per event

			for (const user of usersToRegister) {
				// Check if user is already registered
				const existingRegistration = await prisma.registration.findFirst({
					where: {
						eventId: event.id,
						userId: user.id,
					},
				});

				if (existingRegistration) {
					console.log(`   User ${user.name} already registered for ${event.title}`);
					continue;
				}

				// Select a random ticket type (safe since we checked ticketTypes.length > 0)
				const randomTicketType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)]!;

				// Create registration
				const registration = await prisma.registration.create({
					data: {
						eventId: event.id,
						userId: user.id,
						status: "CONFIRMED", // All test registrations are confirmed
						ticketSource: "INTERNAL",
						registeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
					},
				});

				// Create ticket
				const qrCode = crypto.randomUUID();
				await prisma.ticket.create({
					data: {
						ticketTypeId: randomTicketType.id,
						userId: user.id,
						qrCode,
						status: "SOLD",
						registrationId: registration.id,
					},
				});

				// Randomly check in some users (30% chance)
				if (Math.random() < 0.3 && event.enableCheckIn) {
					await prisma.registration.update({
						where: { id: registration.id },
						data: {
							status: "CHECKED_IN",
							checkedInAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random check-in within last 7 days
							checkedInById: adminUser.id,
						},
					});

					// Create check-in record
					await prisma.checkIn.create({
						data: {
							registrationId: registration.id,
							checkedInById: adminUser.id,
							location: "Main Entrance",
						},
					});

					console.log(`   ✅ ${user.name} registered and checked in for ${event.title}`);
				} else {
					console.log(`   ✅ ${user.name} registered for ${event.title}`);
				}
			}
		}
	}

	console.log("✅ Event registrations seeding completed");

	return {
		success: true,
		message: "Event registrations seeded successfully",
		count: 5, // 5 test users created
	};
}
