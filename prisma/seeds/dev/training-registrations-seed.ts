import bcrypt from "bcryptjs";

import { prisma, SeederResult } from "../seeder-utils";

export async function seedTrainingRegistrations(): Promise<SeederResult> {
	// Get admin user for check-in operations
	const adminUser = await prisma.user.findFirst({
		where: { email: "baonguyenyam@gmail.com" },
	});

	if (!adminUser) {
		console.log("❌ Admin user not found, skipping training registrations seed");
		return { success: false, message: "Admin user not found, skipping training registrations seed", count: 0 };
	}

	// Get existing training engagements
	const trainingEngagements = await prisma.trainingEngagement.findMany({
		where: {
			status: {
				in: ["DRAFT", "INTAKE", "IN_PROGRESS", "ACTIVE"],
			},
		},
		include: {
			customer: {
				include: {
					contacts: true,
				},
			},
		},
	});

	if (trainingEngagements.length === 0) {
		console.log("❌ No active training engagements found, skipping registrations seed");
		return { success: false, message: "No active training engagements found, skipping registrations seed", count: 0 };
	}

	// Create test users for training registrations
	const testUsers = [
		{
			email: "trainee1@madelab.io",
			name: "Alex Johnson",
			username: "alexjohnson",
		},
		{
			email: "trainee2@madelab.io",
			name: "Maria Garcia",
			username: "mariagarcia",
		},
		{
			email: "trainee3@madelab.io",
			name: "David Chen",
			username: "davidchen",
		},
		{
			email: "trainee4@madelab.io",
			name: "Sarah Wilson",
			username: "sarahwilson",
		},
		{
			email: "trainee5@madelab.io",
			name: "James Brown",
			username: "jamesbrown",
		},
		{
			email: "trainee6@madelab.io",
			name: "Lisa Davis",
			username: "lisadavis",
		},
		{
			email: "trainee7@madelab.io",
			name: "Michael Rodriguez",
			username: "michaelrodriguez",
		},
		{
			email: "trainee8@madelab.io",
			name: "Emma Taylor",
			username: "emmataylor",
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
					metaData: {
						jobTitle: "Software Developer",
						company: "Tech Corp",
						experience: "3 years",
					},
				},
			});

			createdUsers.push(user);
			console.log(`✅ Created test user: ${user.name}`);
		} else {
			createdUsers.push(user);
		}
	}

	let registrationCount = 0;
	let checkInCount = 0;

	// Create registrations for each training engagement
	for (const training of trainingEngagements) {
		const numRegistrations = Math.min(6, createdUsers.length); // Register up to 6 users per training
		const selectedUsers = createdUsers.slice(0, numRegistrations);

		for (let i = 0; i < selectedUsers.length; i++) {
			const user = selectedUsers[i];
			if (!user) continue; // Skip if user is undefined

			const status = i < 4 ? "CONFIRMED" : i < 5 ? "PENDING" : "CANCELLED"; // Mix of statuses

			try {
				const registration = await prisma.trainingRegistration.upsert({
					where: {
						trainingEngagementId_userId: {
							trainingEngagementId: training.id,
							userId: user.id,
						},
					},
					update: {
						status: status as any,
						updatedAt: new Date(),
					},
					create: {
						trainingEngagementId: training.id,
						userId: user.id,
						status: status as any,
						registrationSource: "INTERNAL",
						customData: {
							jobTitle: "Software Developer",
							expectations: "Learn advanced development techniques",
							experience: "Intermediate",
						},
					},
				});

				console.log(`✅ Created/Updated registration: ${user.name} for ${training.title} (${status})`);
				registrationCount++;

				// Create check-ins for confirmed registrations that have started
				if (status === "CONFIRMED" && training.startDate && training.startDate <= new Date()) {
					const shouldCheckIn = Math.random() > 0.3; // 70% chance of check-in

					if (shouldCheckIn) {
						// Create check-in record
						await prisma.trainingCheckIn.create({
							data: {
								trainingRegistrationId: registration.id,
								checkedInById: adminUser.id,
								checkedInAt: new Date(training.startDate.getTime() + Math.random() * 2 * 60 * 60 * 1000), // Random time within 2 hours of start
								location: "Main Conference Room",
								deviceInfo: {
									userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
									ipAddress: "192.168.1.100",
								},
							},
						});

						// Update registration with check-in time
						await prisma.trainingRegistration.update({
							where: { id: registration.id },
							data: {
								checkedInAt: new Date(),
								checkedInById: adminUser.id,
								status: "CHECKED_IN",
							},
						});

						checkInCount++;
						console.log(`   ✅ Checked in: ${user.name}`);
					}
				}
			} catch (error) {
				console.error(`❌ Failed to create registration for ${user.name}:`, error);
			}
		}
	}

	// Create some contact-based registrations (external attendees)
	for (const training of trainingEngagements.slice(0, 2)) {
		// Only for first 2 trainings
		if (training.customer?.contacts && training.customer.contacts.length > 0) {
			const contact = training.customer.contacts[0];
			if (!contact) continue; // Skip if contact is undefined

			try {
				const registration = await prisma.trainingRegistration.upsert({
					where: {
						trainingEngagementId_contactId: {
							trainingEngagementId: training.id,
							contactId: contact.id,
						},
					},
					update: {
						status: "CONFIRMED",
						updatedAt: new Date(),
					},
					create: {
						trainingEngagementId: training.id,
						contactId: contact.id,
						status: "CONFIRMED",
						registrationSource: "EXTERNAL",
						customData: {
							company: training.customer?.companyName,
							jobTitle: contact.title || "Manager",
							phone: contact.phone,
						},
					},
				});

				console.log(`✅ Created contact registration: ${contact.firstName} ${contact.lastName} for ${training.title}`);
				registrationCount++;

				// Check in the contact if training has started
				if (training.startDate && training.startDate <= new Date()) {
					await prisma.trainingCheckIn.create({
						data: {
							trainingRegistrationId: registration.id,
							checkedInById: adminUser.id,
							checkedInAt: new Date(training.startDate.getTime() + 30 * 60 * 1000), // 30 minutes after start
							location: "Main Conference Room",
						},
					});

					await prisma.trainingRegistration.update({
						where: { id: registration.id },
						data: {
							checkedInAt: new Date(),
							checkedInById: adminUser.id,
							status: "CHECKED_IN",
						},
					});

					checkInCount++;
					console.log(`   ✅ Checked in contact: ${contact.firstName} ${contact.lastName}`);
				}
			} catch (error) {
				console.error(`❌ Failed to create contact registration:`, error);
			}
		}
	}

	return {
		success: true,
		message: `Training registrations seeded successfully (${registrationCount} registrations, ${checkInCount} check-ins)`,
		count: registrationCount,
		data: { registrations: registrationCount, checkIns: checkInCount },
	};
}
