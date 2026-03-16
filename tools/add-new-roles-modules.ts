import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
const isProduction = process.env.NODE_ENV === "production";

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
	{ name: "testing", displayName: "Testing Management", description: "Manage testing orders, samples, test suites, and reports" },
	{ name: "design", displayName: "Design Management", description: "Manage design projects, briefs, and reviews" },
	{ name: "backup", displayName: "Backup Management", description: "Database backup and restore operations" },
	{ name: "finance", displayName: "Finance Management", description: "Financial operations and accounting tasks" },
	{ name: "marketing", displayName: "Marketing Management", description: "Marketing campaigns and promotional activities" },
	{ name: "customer_support", displayName: "Customer Support Management", description: "Customer support and service operations" },
	{ name: "attendee", displayName: "Attendee Management", description: "Event attendee management" },
	{ name: "lead", displayName: "Leadership Management", description: "Vertical-specific leadership and management" },
	{ name: "ops", displayName: "Ops Management", description: "Operations administration and oversight" },
] as const;

async function addNewRolesAndModules() {
	console.log("🔄 Adding complete roles and modules system to database...");

	try {
		// Create Permissions if they don't exist
		console.log("Ensuring permissions exist...");
		const permissions = await Promise.all([
			prisma.permission.upsert({
				where: { action: "read" },
				update: {},
				create: { action: "read", displayName: "View", description: "Can view records" },
			}),
			prisma.permission.upsert({
				where: { action: "create" },
				update: {},
				create: { action: "create", displayName: "Create", description: "Can create new records" },
			}),
			prisma.permission.upsert({
				where: { action: "update" },
				update: {},
				create: { action: "update", displayName: "Edit", description: "Can edit existing records" },
			}),
			prisma.permission.upsert({
				where: { action: "delete" },
				update: {},
				create: { action: "delete", displayName: "Delete", description: "Can delete records" },
			}),
			prisma.permission.upsert({
				where: { action: "approve" },
				update: {},
				create: { action: "approve", displayName: "Approve", description: "Can approve/reject records" },
			}),
		]);

		const [readPerm, createPerm, updatePerm, deletePerm, approvePerm] = permissions;

		// Create all Modules
		console.log("Creating all modules...");
		const allModuleDefinitions = [...SYSTEM_MODULES, ...DEFAULT_POST_TYPES];
		const modules = await Promise.all(
			allModuleDefinitions.map((moduleDef) =>
				prisma.module.upsert({
					where: { name: moduleDef.name },
					update: {},
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
		const knowledgeModule = moduleMap.get("knowledge")!;
		const eventsModule = moduleMap.get("events")!;
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
		const testingModule = moduleMap.get("testing")!;
		const trainingModule = moduleMap.get("training")!;

		// Create Roles
		console.log("Creating all roles...");

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
			{ name: "design", displayName: "Design Lead", description: "Design team lead with full design access", isCore: false },
			{ name: "testing", displayName: "Testing Lead", description: "Testing team lead with full testing access", isCore: false },
			{ name: "training", displayName: "Training Lead", description: "Training team lead with full training access", isCore: false },
		];

		// Create all roles
		const roles = await Promise.all(
			roleConfigs.map(config =>
				prisma.role.upsert({
					where: { name: config.name },
					update: {},
					create: {
						name: config.name,
						displayName: config.displayName,
						description: config.description,
					},
				})
			)
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
		const opsAdminRole = roleMap.get("ops")!;
		const verticalLeadRole = roleMap.get("lead")!;
		const financeRole = roleMap.get("finance")!;
		const marketingRole = roleMap.get("marketing")!;
		const customerRole = roleMap.get("customer_support")!;
		const eventAttendeeRole = roleMap.get("attendee")!;
		const sponsorRole = roleMap.get("sponsor")!;
		const partnerRole = roleMap.get("partner")!;
		const designRole = roleMap.get("design")!;
		const testingRole = roleMap.get("testing")!;
		const trainingRole = roleMap.get("training")!;

		let mediaManagerRole;
		if (!isProduction) {
			console.log("📝 Development mode: Creating additional roles...");
			mediaManagerRole = await prisma.role.upsert({
				where: { name: "media_manager" },
				update: {},
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
				permissions: [{ modules: modules, perms: permissions }]
			},
			// Manager role - full access to most modules (except roles and meta)
			{
				role: managerRole,
				permissions: [{
					modules: [
						usersModule,
						customersModule,
						reportsModule,
						settingsModule,
						mediaModule,
						knowledgeModule,
						eventsModule,
						designModule,
						backupModule,
						financeOperationsModule,
						marketingCampaignsModule,
						customerSupportModule,
						eventManagementModule,
						sponsorModule,
						businessPartnershipsModule,
						verticalLeadershipModule,
						operationsAdminModule,
						testingModule,
						trainingModule,
						// Include all post type modules
						...DEFAULT_POST_TYPES.map((pt) => moduleMap.get(pt.name)!).filter(Boolean),
					], perms: managerPermissions
				}]
			},
			// Ops Admin role - full access to existing modules
			{
				role: opsAdminRole,
				permissions: [
					{ modules: [usersModule, customersModule, reportsModule, settingsModule, mediaModule, knowledgeModule, eventsModule, backupModule], perms: managerPermissions },
					{ modules: [operationsAdminModule], perms: managerPermissions }
				]
			},
			// Vertical Lead role - access to customers, reports, and vertical leadership
			{
				role: verticalLeadRole,
				permissions: [
					{ modules: [customersModule, reportsModule], perms: managerPermissions },
					{ modules: [verticalLeadershipModule], perms: managerPermissions }
				]
			},
			// Finance role - mixed access levels
			{
				role: financeRole,
				permissions: [
					{ modules: [reportsModule], perms: [readPerm, updatePerm] },
					{ modules: [customersModule], perms: [readPerm] },
					{ modules: [financeOperationsModule], perms: managerPermissions }
				]
			},
			// Marketing role - mixed access levels
			{
				role: marketingRole,
				permissions: [
					{ modules: [customersModule], perms: [readPerm, updatePerm] },
					{ modules: [mediaModule], perms: [readPerm, createPerm, updatePerm] },
					{ modules: [marketingCampaignsModule], perms: managerPermissions },
					{ modules: [sponsorModule], perms: managerPermissions }
				]
			},
			// Customer Support role - read access
			{
				role: customerRole,
				permissions: [
					{ modules: [customerSupportModule], perms: [readPerm] }
				]
			},
			// Event Attendee role - read access
			{
				role: eventAttendeeRole,
				permissions: [
					{ modules: [knowledgeModule, eventManagementModule], perms: [readPerm] }
				]
			},
			// Sponsor role - mixed access
			{
				role: sponsorRole,
				permissions: [
					{ modules: [customersModule, reportsModule], perms: [readPerm] },
					{ modules: [sponsorModule], perms: [readPerm, updatePerm] }
				]
			},
			// Partner role - mixed access
			{
				role: partnerRole,
				permissions: [
					{ modules: [customersModule, knowledgeModule], perms: [readPerm] },
					{ modules: [businessPartnershipsModule], perms: [readPerm, createPerm, updatePerm] }
				]
			},
			// Design role - full access to design and related modules
			{
				role: designRole,
				permissions: [
					{ modules: [customersModule, reportsModule], perms: [readPerm, updatePerm] },
					{ modules: [designModule], perms: managerPermissions }
				]
			},
			// Testing role - full access to testing and related modules
			{
				role: testingRole,
				permissions: [
					{ modules: [customersModule, reportsModule], perms: [readPerm, updatePerm] },
					{ modules: [testingModule], perms: managerPermissions }
				]
			},
			// Training role - full access to training and related modules
			{
				role: trainingRole,
				permissions: [
					{ modules: [customersModule, reportsModule], perms: [readPerm, updatePerm] },
					{ modules: [trainingModule], perms: managerPermissions }
				]
			}
		];

		// Assign permissions based on configurations
		for (const config of rolePermissionConfigs) {
			if (!config.role) {
				console.warn(`Skipping permissions for undefined role`);
				continue;
			}
			for (const permGroup of config.permissions) {
				for (const moduleRecord of permGroup.modules) {
					if (!moduleRecord) {
						console.warn(`Skipping permissions for undefined module`);
						continue;
					}
					for (const permission of permGroup.perms) {
						await prisma.rolePermission.upsert({
							where: {
								roleId_moduleId_permissionId: {
									roleId: config.role.id,
									moduleId: module.id,
									permissionId: permission.id,
								}
							},
							update: {},
							create: {
								roleId: config.role.id,
								moduleId: module.id,
								permissionId: permission.id,
							},
						});
					}
				}
			}
		}

		// Media Manager role (dev only) - full access to media
		if (!isProduction && mediaManagerRole) {
			const mediaManagerPermissions = [readPerm, createPerm, updatePerm, deletePerm];
			for (const permission of mediaManagerPermissions) {
				await prisma.rolePermission.upsert({
					where: {
						roleId_moduleId_permissionId: {
							roleId: mediaManagerRole.id,
							moduleId: mediaModule.id,
							permissionId: permission.id,
						}
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

		console.log("✅ Successfully added complete roles and modules system to the database!");
	} catch (error) {
		console.error("❌ Error adding roles and modules:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run the script
addNewRolesAndModules()
	.then(() => {
		console.log("🎉 Script completed successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Script failed:", error);
		process.exit(1);
	});