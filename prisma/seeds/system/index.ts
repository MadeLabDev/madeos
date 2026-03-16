import bcrypt from "bcryptjs";

import { isProduction, prisma, SeederResult } from "../seeder-utils";

// Define default post types that should have modules
const DEFAULT_POST_TYPES = [
	{ name: "blog", displayName: "Blog Management", description: "Manage blog posts and articles" },
	{ name: "sponsor", displayName: "Sponsorship Management", description: "Sponsorship and partnership management" },
	{ name: "speaker", displayName: "Speaker Management", description: "Speaker management" },
	{ name: "partner", displayName: "Partnerships Management", description: "Business partnerships and collaborations" },
] as const;

// Define other system modules
const SYSTEM_MODULES = [
	{ name: "users", displayName: "User Management", description: "Manage system users" },
	{ name: "customers", displayName: "Customer Management", description: "Manage customers" },
	{ name: "reports", displayName: "Reports Management", description: "View and export reports" },
	{ name: "settings", displayName: "Settings Management", description: "System settings" },
	{ name: "media", displayName: "Media Management", description: "Manage media files, uploads" },
	{ name: "meta", displayName: "Meta Management", description: "Manage meta configurations and module types" },
	{ name: "roles", displayName: "Roles Management", description: "Manage user roles and permissions" },
	{ name: "knowledge", displayName: "Knowledge Base Management", description: "Manage knowledge articles and documentation" },
	{ name: "events", displayName: "Events Management", description: "Manage events, registrations, tickets, and check-ins" },
	{ name: "training", displayName: "Training Management", description: "Manage training engagements, sessions, and registrations" },
	{ name: "testing", displayName: "Testing Management", description: "Manage testing orders, samples, and reports" },
	{ name: "design", displayName: "Design Management", description: "Manage design projects, briefs, and reviews" },
	{ name: "backup", displayName: "Backup Management", description: "Database backup and restore operations" },
	{ name: "finance", displayName: "Finance Management", description: "Financial operations and accounting tasks" },
	{ name: "marketing", displayName: "Marketing Management", description: "Marketing campaigns and promotional activities" },
	{ name: "customer_support", displayName: "Customer Support Management", description: "Customer support and service operations" },
	{ name: "attendee", displayName: "Attendee Management", description: "Event attendee management" },
	{ name: "lead", displayName: "Leadership Management", description: "Vertical-specific leadership and management" },
	{ name: "ops", displayName: "Ops Management", description: "Operations administration and oversight" },
] as const;

/**
 * Helper: To add a new post type, simply add it to the DEFAULT_POST_TYPES array above.
 * The system will automatically create the module and assign appropriate permissions.
 * Example: { name: 'news', displayName: 'News Management', description: 'Manage news articles' }
 */

async function seedSystemData(): Promise<SeederResult> {
	// Create permissions
	console.log("Creating permissions...");
	const permissions = await Promise.all([
		prisma.permission.upsert({
			where: { action: "read" },
			update: { displayName: "Read", description: "Can view records" },
			create: { action: "read", displayName: "Read", description: "Can view records" },
		}),
		prisma.permission.upsert({
			where: { action: "create" },
			update: { displayName: "Create", description: "Can create new records" },
			create: { action: "create", displayName: "Create", description: "Can create new records" },
		}),
		prisma.permission.upsert({
			where: { action: "update" },
			update: { displayName: "Update", description: "Can modify existing records" },
			create: { action: "update", displayName: "Update", description: "Can modify existing records" },
		}),
		prisma.permission.upsert({
			where: { action: "delete" },
			update: { displayName: "Delete", description: "Can delete records" },
			create: { action: "delete", displayName: "Delete", description: "Can delete records" },
		}),
		prisma.permission.upsert({
			where: { action: "approve" },
			update: { displayName: "Approve", description: "Can approve records" },
			create: { action: "approve", displayName: "Approve", description: "Can approve records" },
		}),
	]);

	const [readPerm, createPerm, updatePerm, deletePerm, approvePerm] = permissions;

	// Create Modules - Combine system modules and post type modules
	console.log("Creating modules...");
	const allModuleDefinitions = [...SYSTEM_MODULES, ...DEFAULT_POST_TYPES];
	const modules = await Promise.all(
		allModuleDefinitions.map((moduleDef) =>
			prisma.module.upsert({
				where: { name: moduleDef.name },
				update: {
					displayName: moduleDef.displayName,
					description: moduleDef.description,
				},
				create: {
					name: moduleDef.name,
					displayName: moduleDef.displayName,
					description: moduleDef.description,
				},
			}),
		),
	);

	// Create a module map for easy access
	const moduleMap = new Map<string, any>();
	modules.forEach((module, index) => {
		const def = allModuleDefinitions[index];
		if (def) {
			moduleMap.set(def.name, module);
		}
	});

	// Extract specific modules for role assignments
	const usersModule = moduleMap.get("users")!;
	const customersModule = moduleMap.get("customers")!;
	const reportsModule = moduleMap.get("reports")!;
	const settingsModule = moduleMap.get("settings")!;
	const mediaModule = moduleMap.get("media")!;
	// metaModule and rolesModule are intentionally not used - managers don't get access to these
	const knowledgeModule = moduleMap.get("knowledge")!;
	const eventsModule = moduleMap.get("events")!;
	const trainingModule = moduleMap.get("training")!;
	const testingModule = moduleMap.get("testing")!;
	const designModule = moduleMap.get("design")!;
	const backupModule = moduleMap.get("backup")!;
	const financeOperationsModule = moduleMap.get("finance")!;
	const marketingCampaignsModule = moduleMap.get("marketing")!;
	const customerSupportModule = moduleMap.get("customer_support")!;
	const eventManagementModule = moduleMap.get("attendee")!;
	const sponsorModule = moduleMap.get("sponsor")!;
	const businessPartnershipsModule = moduleMap.get("partner")!;
	const verticalLeadershipModule = moduleMap.get("lead")!;
	const operationsAdminModule = moduleMap.get("ops")!;

	// Create Roles
	console.log("Creating roles...");

	// Define role configurations
	const roleConfigs = [
		// Core roles (always created)
		{ name: "admin", displayName: "Administrator", description: "Full system access", isCore: true },
		{ name: "manager", displayName: "Manager", description: "Manage multiple departments", isCore: true },
		{ name: "user", displayName: "User", description: "Limited access - can only login and change password", isCore: true },

		// Additional roles
		{ name: "ops", displayName: "Ops Admin", description: "Operations Administrator with elevated access", isCore: false },
		{ name: "lead", displayName: "Vertical Lead", description: "Lead for specific business verticals", isCore: false },
		{ name: "finance", displayName: "Finance", description: "Finance team member with access to financial reports", isCore: false },
		{ name: "marketing", displayName: "Marketing", description: "Marketing team member with access to customer and media data", isCore: false },
		{ name: "customer_support", displayName: "Customer Support", description: "Customer support", isCore: false },
		{ name: "attendee", displayName: "Event Attendee", description: "Event attendee with basic access", isCore: false },
		{ name: "sponsor", displayName: "Sponsor", description: "Sponsor with enhanced access", isCore: false },
		{ name: "partner", displayName: "Partner", description: "Business partner with specific access", isCore: false },
	];

	// Create all roles
	const roles = await Promise.all(
		roleConfigs.map((config) =>
			prisma.role.upsert({
				where: { name: config.name },
				update: {
					displayName: config.displayName,
					description: config.description,
				},
				create: {
					name: config.name,
					displayName: config.displayName,
					description: config.description,
				},
			}),
		),
	);

	// Create role map for easy access
	const roleMap = new Map<string, any>();
	roles.forEach((role, index) => {
		const config = roleConfigs[index];
		if (config) {
			roleMap.set(config.name, role);
		}
	});

	// Extract specific roles
	const adminRole = roleMap.get("admin")!;
	const managerRole = roleMap.get("manager")!;
	const userRole = roleMap.get("user")!;
	const opsAdminRole = roleMap.get("ops")!;
	const verticalLeadRole = roleMap.get("lead")!;
	const financeRole = roleMap.get("finance")!;
	const marketingRole = roleMap.get("marketing")!;
	const customerRole = roleMap.get("customer_support")!;
	const eventAttendeeRole = roleMap.get("attendee")!;
	const sponsorRole = roleMap.get("sponsor")!;
	const partnerRole = roleMap.get("partner")!;

	let mediaManagerRole;
	if (!isProduction) {
		console.log("📝 Development mode: Creating additional roles...");
		mediaManagerRole = await prisma.role.upsert({
			where: { name: "media_manager" },
			update: { displayName: "Media Manager", description: "Manage and organize media files" },
			create: { name: "media_manager", displayName: "Media Manager", description: "Manage and organize media files" },
		});
	} else {
		console.log("🔒 Production mode: Only core roles created");
	}

	// Assign permissions to roles
	console.log("Assigning permissions to roles...");

	const managerPermissions = [readPerm, createPerm, updatePerm, deletePerm, approvePerm];

	// Define role permission configurations
	const rolePermissionConfigs = [
		// Admin role - full access to all modules
		{
			role: adminRole,
			permissions: [{ modules: modules, perms: permissions }],
		},
		// Manager role - full access to most modules (except roles and meta)
		{
			role: managerRole,
			permissions: [
				{
					modules: [
						usersModule,
						customersModule,
						reportsModule,
						settingsModule,
						mediaModule,
						knowledgeModule,
						eventsModule,
						trainingModule,
						testingModule,
						designModule,
						// Include all post type modules
						...DEFAULT_POST_TYPES.map((pt) => moduleMap.get(pt.name)!).filter(Boolean),
					],
					perms: managerPermissions,
				},
			],
		},
		// Ops Admin role - full access to existing modules
		{
			role: opsAdminRole,
			permissions: [
				{ modules: [usersModule, customersModule, reportsModule, settingsModule, mediaModule, knowledgeModule, backupModule], perms: managerPermissions },
				{ modules: [operationsAdminModule], perms: managerPermissions },
			],
		},
		// Vertical Lead role - access to customers, reports, and vertical leadership
		{
			role: verticalLeadRole,
			permissions: [
				{ modules: [customersModule, reportsModule], perms: managerPermissions },
				{ modules: [verticalLeadershipModule], perms: managerPermissions },
			],
		},
		// Finance role - mixed access levels
		{
			role: financeRole,
			permissions: [
				{ modules: [reportsModule], perms: [readPerm, updatePerm] },
				{ modules: [customersModule], perms: [readPerm] },
				{ modules: [financeOperationsModule], perms: managerPermissions },
			],
		},
		// Marketing role - mixed access levels
		{
			role: marketingRole,
			permissions: [
				{ modules: [customersModule], perms: [readPerm, updatePerm] },
				{ modules: [mediaModule], perms: [readPerm, createPerm, updatePerm] },
				{ modules: [marketingCampaignsModule], perms: managerPermissions },
			],
		},
		// Customer role - read access
		{
			role: customerRole,
			permissions: [{ modules: [customersModule, customerSupportModule], perms: [readPerm] }],
		},
		// Event Attendee role - read access
		{
			role: eventAttendeeRole,
			permissions: [{ modules: [knowledgeModule, eventManagementModule], perms: [readPerm] }],
		},
		// Sponsor role - mixed access
		{
			role: sponsorRole,
			permissions: [
				{ modules: [customersModule, reportsModule], perms: [readPerm] },
				{ modules: [sponsorModule], perms: [readPerm, updatePerm] },
			],
		},
		// Partner role - mixed access
		{
			role: partnerRole,
			permissions: [
				{ modules: [customersModule, knowledgeModule], perms: [readPerm] },
				{ modules: [businessPartnershipsModule], perms: [readPerm, createPerm, updatePerm] },
			],
		},
	];

	// Assign permissions based on configurations
	for (const config of rolePermissionConfigs) {
		for (const permGroup of config.permissions) {
			for (const moduleRecord of permGroup.modules) {
				for (const permission of permGroup.perms) {
					await prisma.rolePermission.upsert({
						where: {
							roleId_moduleId_permissionId: {
								roleId: config.role.id,
								moduleId: moduleRecord.id,
								permissionId: permission.id,
							},
						},
						update: {},
						create: {
							roleId: config.role.id,
							moduleId: moduleRecord.id,
							permissionId: permission.id,
						},
					});
				}
			}
		}
	}

	// Development only: Media Manager role permissions
	if (!isProduction && mediaManagerRole) {
		console.log("Assigning permissions to Media Manager role...");
		const mediaManagerPermissions = [readPerm, createPerm, updatePerm, deletePerm];
		for (const permission of mediaManagerPermissions) {
			await prisma.rolePermission.upsert({
				where: {
					roleId_moduleId_permissionId: {
						roleId: mediaManagerRole.id,
						moduleId: mediaModule.id,
						permissionId: permission.id,
					},
				},
				update: {},
				create: {
					roleId: mediaManagerRole.id,
					moduleId: mediaModule.id,
					permissionId: permission.id,
				},
			});
		}
	}

	// User role gets NO permissions (by design)

	// Create demo users
	console.log("Creating demo users...");
	const hashedPassword = await bcrypt.hash("password123", 10);

	const adminUser = await prisma.user.upsert({
		where: { email: "baonguyenyam@gmail.com" },
		update: {
			username: "admin",
			name: "Admin User",
			password: hashedPassword,
			emailVerified: new Date(),
			isActive: true,
		},
		create: {
			email: "baonguyenyam@gmail.com",
			username: "admin",
			name: "Admin User",
			password: hashedPassword,
			emailVerified: new Date(),
			isActive: true,
		},
	});

	const managerUser = await prisma.user.upsert({
		where: { email: "manager@madelab.io" },
		update: {
			username: "manager",
			name: "Manager User",
			password: hashedPassword,
			emailVerified: new Date(),
			isActive: true,
		},
		create: {
			email: "manager@madelab.io",
			username: "manager",
			name: "Manager User",
			password: hashedPassword,
			emailVerified: new Date(),
			isActive: true,
		},
	});

	const testUser = await prisma.user.upsert({
		where: { email: "test@madelab.io" },
		update: {
			username: "testuser",
			name: "Test User",
			password: hashedPassword,
			emailVerified: new Date(),
			isActive: true,
		},
		create: {
			email: "test@madelab.io",
			username: "testuser",
			name: "Test User",
			password: hashedPassword,
			emailVerified: new Date(),
			isActive: true,
		},
	});

	// Development only: Create additional demo users
	let multiRoleUser: any = null;
	const opsUser: any = null;
	const financeUser: any = null;
	const marketingUser: any = null;
	const customerUser: any = null;

	// Assign roles to required users
	console.log("Assigning roles to users...");
	const requiredRoleAssignments = [
		{ userId: adminUser.id, roleId: adminRole.id },
		{ userId: managerUser.id, roleId: managerRole.id },
		// Limited access user (can only login and change password)
		{ userId: testUser.id, roleId: userRole.id },
	];

	if (!isProduction) {
		// User with multiple roles (example for testing)
		multiRoleUser = await prisma.user.upsert({
			where: { email: "multi@madelab.io" },
			update: {
				username: "multirole",
				name: "Multi-Role User",
				password: hashedPassword,
				emailVerified: new Date(),
				isActive: true,
			},
			create: {
				email: "multi@madelab.io",
				username: "multirole",
				name: "Multi-Role User",
				password: hashedPassword,
				emailVerified: new Date(),
				isActive: true,
			},
		});

		// Add optional user role assignments for dev mode
		requiredRoleAssignments.push(
			// Multi-role user example
			{ userId: multiRoleUser!.id, roleId: managerRole.id },
			// Assign new roles to existing users for testing
			{ userId: adminUser.id, roleId: opsAdminRole.id },
			{ userId: managerUser.id, roleId: verticalLeadRole.id },
			{ userId: testUser.id, roleId: financeRole.id },
		);

		// Create additional demo users with new roles
		const opsUser = await prisma.user.upsert({
			where: { email: "ops@madelab.io" },
			update: {
				username: "ops",
				name: "Ops Admin User",
				password: hashedPassword,
				emailVerified: new Date(),
				isActive: true,
			},
			create: {
				email: "ops@madelab.io",
				username: "ops",
				name: "Ops Admin User",
				password: hashedPassword,
				emailVerified: new Date(),
				isActive: true,
			},
		});

		const financeUser = await prisma.user.upsert({
			where: { email: "finance@madelab.io" },
			update: {
				username: "finance",
				name: "Finance User",
				password: hashedPassword,
				emailVerified: new Date(),
				isActive: true,
			},
			create: {
				email: "finance@madelab.io",
				username: "finance",
				name: "Finance User",
				password: hashedPassword,
				emailVerified: new Date(),
				isActive: true,
			},
		});

		const marketingUser = await prisma.user.upsert({
			where: { email: "marketing@madelab.io" },
			update: {
				username: "marketing",
				name: "Marketing User",
				password: hashedPassword,
				emailVerified: new Date(),
				isActive: true,
			},
			create: {
				email: "marketing@madelab.io",
				username: "marketing",
				name: "Marketing User",
				password: hashedPassword,
				emailVerified: new Date(),
				isActive: true,
			},
		});

		const customerUser = await prisma.user.upsert({
			where: { email: "customer@madelab.io" },
			update: {
				username: "customer",
				name: "Customer User",
				password: hashedPassword,
				emailVerified: new Date(),
				isActive: true,
			},
			create: {
				email: "customer@madelab.io",
				username: "customer",
				name: "Customer User",
				password: hashedPassword,
				emailVerified: new Date(),
				isActive: true,
			},
		});

		// Assign roles to new users
		requiredRoleAssignments.push({ userId: opsUser.id, roleId: opsAdminRole.id }, { userId: financeUser.id, roleId: financeRole.id }, { userId: marketingUser.id, roleId: marketingRole.id }, { userId: customerUser.id, roleId: customerRole.id });
	}

	// Assign roles with upsert to handle existing assignments
	for (const assignment of requiredRoleAssignments) {
		await prisma.userRole.upsert({
			where: {
				userId_roleId: {
					userId: assignment.userId,
					roleId: assignment.roleId,
				},
			},
			update: {},
			create: assignment,
		});
	}

	// Create default settings
	console.log("Creating default settings...");
	await Promise.all([
		prisma.settings.upsert({
			where: { key: "company_name" },
			update: { value: "MADE Laboratory", description: "Company Name" },
			create: { key: "company_name", value: "MADE Laboratory", description: "Company Name" },
		}),
		prisma.settings.upsert({
			where: { key: "company_address" },
			update: { value: "123 Main Street, City, Country", description: "Company Address" },
			create: { key: "company_address", value: "123 Main Street, City, Country", description: "Company Address" },
		}),
		prisma.settings.upsert({
			where: { key: "company_phone" },
			update: { value: "+1-234-567-8900", description: "Company Phone Number" },
			create: { key: "company_phone", value: "+1-234-567-8900", description: "Company Phone Number" },
		}),
		prisma.settings.upsert({
			where: { key: "company_email" },
			update: { value: "info@madelab.io", description: "Company Email Address" },
			create: { key: "company_email", value: "info@madelab.io", description: "Company Email Address" },
		}),
		prisma.settings.upsert({
			where: { key: "pagesize" },
			update: { value: "20", description: "Default page size for lists and tables" },
			create: { key: "pagesize", value: "20", description: "Default page size for lists and tables" },
		}),
		prisma.settings.upsert({
			where: { key: "media_pagesize" },
			update: { value: "12", description: "Page size for media gallery" },
			create: { key: "media_pagesize", value: "12", description: "Page size for media gallery" },
		}),
		prisma.settings.upsert({
			where: { key: "datetime_format" },
			update: { value: "DD/MM/YYYY HH:mm:ss", description: "Date and time format (e.g., DD/MM/YYYY HH:mm:ss)" },
			create: { key: "datetime_format", value: "DD/MM/YYYY HH:mm:ss", description: "Date and time format (e.g., DD/MM/YYYY HH:mm:ss)" },
		}),
		prisma.settings.upsert({
			where: { key: "media_max_file_size_mb" },
			update: { value: "10", description: "Maximum file size for uploads in MB" },
			create: { key: "media_max_file_size_mb", value: "10", description: "Maximum file size for uploads in MB" },
		}),
		prisma.settings.upsert({
			where: { key: "media_allowed_types" },
			update: { value: "images,documents,videos,archives", description: "Allowed file types for uploads (comma-separated)" },
			create: { key: "media_allowed_types", value: "images,documents,videos,archives", description: "Allowed file types for uploads (comma-separated)" },
		}),
		prisma.settings.upsert({
			where: { key: "rag_enabled" },
			update: { value: "false", description: "Enable/disable RAG features (vector search, embeddings, LLM). When false, all AI features are disabled." },
			create: { key: "rag_enabled", value: "false", description: "Enable/disable RAG features (vector search, embeddings, LLM). When false, all AI features are disabled." },
		}),
		prisma.settings.upsert({
			where: { key: "payment_provider" },
			update: { value: "stripe", description: "Active payment provider" },
			create: { key: "payment_provider", value: "stripe", description: "Active payment provider" },
		}),
		prisma.settings.upsert({
			where: { key: "payment_currency" },
			update: { value: "USD", description: "Default payment currency" },
			create: { key: "payment_currency", value: "USD", description: "Default payment currency" },
		}),
	]);

	// Create profiles for all users (so they can access /profile/builder)
	console.log("Creating user profiles...");

	const allUsers = [adminUser, managerUser, testUser, ...(multiRoleUser ? [multiRoleUser] : []), ...(opsUser ? [opsUser] : []), ...(financeUser ? [financeUser] : []), ...(marketingUser ? [marketingUser] : []), ...(customerUser ? [customerUser] : [])];

	await Promise.all(
		allUsers.map((user) =>
			prisma.userProfile.upsert({
				where: { userId: user.id },
				update: {},
				create: {
					userId: user.id,
					metaData: JSON.stringify({}),
					isPublic: false,
				},
			}),
		),
	);

	return {
		success: true,
		message: "system data (users, roles, permissions) seeding completed",
		count: 7, // 7 module types created
	};
}

export { seedSystemData };
