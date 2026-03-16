import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";

import "dotenv/config";

/**
 * Shared Prisma client for all seeders
 */
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

/**
 * Environment check
 */
export const isProduction = process.env.NODE_ENV === "production";

/**
 * Base seeder interface
 */
export interface SeederResult {
	success: boolean;
	message: string;
	count?: number;
	data?: any;
}

/**
 * Base seeder function wrapper with error handling and logging
 */
export async function runSeeder(name: string, seederFn: () => Promise<SeederResult | void>): Promise<SeederResult> {
	try {
		console.log(`🔄 Seeding ${name}...`);
		const result = await seederFn();

		if (result && result.success) {
			console.log(`✅ ${result.message}`);
			if (result.count !== undefined) {
				console.log(`   📊 Created ${result.count} ${name.toLowerCase()}`);
			}
		} else {
			console.log(`✅ ${name} seeding completed`);
		}

		return result || { success: true, message: `${name} seeded successfully` };
	} catch (error) {
		console.error(`❌ ${name} seeding failed:`, error);
		throw error;
	}
}

/**
 * Clear development data in correct order (respecting foreign keys)
 */
export async function clearDevelopmentData() {
	console.log("🧹 Clearing existing development data...");

	// Tables with foreign key dependencies (delete in reverse order)
	// NOTE: System data (users, roles, permissions, modules, settings) is NOT deleted
	// to preserve system integrity across seed runs
	const clearOrder = [
		// Design tables
		() => prisma.designReview.deleteMany(),
		() => prisma.designDeck.deleteMany(),
		() => prisma.techPack.deleteMany(),
		() => prisma.productDesign.deleteMany(),
		() => prisma.designBrief.deleteMany(),
		() => prisma.designProject.deleteMany(),

		// Testing tables
		() => prisma.testReport.deleteMany(),
		() => prisma.test.deleteMany(),
		() => prisma.sample.deleteMany(),
		() => prisma.testSuiteOnOrder.deleteMany(),
		() => prisma.testOrder.deleteMany(),
		() => prisma.testSuite.deleteMany(),

		// Training tables
		() => prisma.trainingCheckIn.deleteMany(),
		() => prisma.trainingRegistration.deleteMany(),
		() => prisma.trainingSession.deleteMany(),
		() => prisma.trainingEngagement.deleteMany(),

		// CRM tables
		() => prisma.task.deleteMany(),
		() => prisma.interaction.deleteMany(),
		() => prisma.engagement.deleteMany(),
		() => prisma.opportunity.deleteMany(),
		() => prisma.contact.deleteMany(),

		// Event tables
		() => prisma.checkIn.deleteMany(),
		() => prisma.registration.deleteMany(),
		() => prisma.ticket.deleteMany(),
		() => prisma.payment.deleteMany(),
		() => prisma.event.deleteMany(),

		// Knowledge tables
		() => prisma.media.deleteMany(),
		() => prisma.userGroupMember.deleteMany(),
		() => prisma.userGroup.deleteMany(),
		() => prisma.knowledgeAssignedUser.deleteMany(),
		() => prisma.knowledgeAssignedGroup.deleteMany(),
		() => prisma.knowledgeEmailLog.deleteMany(),
		() => prisma.knowledgeTagsOnKnowledge.deleteMany(),
		() => prisma.knowledgeCategoriesOnKnowledge.deleteMany(),
		() => prisma.knowledgeEventsOnKnowledge.deleteMany(),
		() => prisma.knowledge.deleteMany(),
		() => prisma.knowledgeTag.deleteMany(),
		() => prisma.knowledgeCategory.deleteMany(),

		// Module instances (but not module types or modules themselves)
		() => prisma.moduleInstance.deleteMany(),

		// Customer tables
		() => prisma.customer.deleteMany(),

		// Session/Account logs (safe to clear)
		() => prisma.activityLog.deleteMany(),
		() => prisma.session.deleteMany(),
		() => prisma.account.deleteMany(),
	];

	for (const clearFn of clearOrder) {
		await clearFn();
	}

	console.log("✅ Development data cleared");
}

/**
 * Disconnect Prisma client
 */
export async function disconnect() {
	await prisma.$disconnect();
}
