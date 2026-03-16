import "dotenv/config";

import { seedModuleTypes } from "./system/meta-seed";
import { seedProfileModuleTypes } from "./system/profile-module-types-seed";
import { seedCRMTestingData, seedCustomers, seedDesignData, seedEventRegistrations, seedEvents, seedKnowledgeData, seedModuleInstances, seedPostData, seedPricingPlans, seedTraining, seedTrainingRegistrations } from "./dev";
import { clearDevelopmentData, disconnect, isProduction, runSeeder } from "./seeder-utils";
import { seedSystemData } from "./system";

async function main() {
	console.log("🌱 Starting seed...");
	console.log(`📍 Environment: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"}`);

	try {
		// ===== SYSTEM DATA (Always seeded) =====
		await runSeeder("system data (users, roles, permissions)", seedSystemData);
		await runSeeder("module types", seedModuleTypes);
		await runSeeder("profile module types", seedProfileModuleTypes);

		// ===== DEVELOPMENT ONLY =====
		if (!isProduction) {
			console.log("\n✨ Running DEVELOPMENT seed data...");

			// Clear existing development data first
			await clearDevelopmentData();

			// Seed in logical order (dependencies)
			await runSeeder("customers", seedCustomers);
			await runSeeder("knowledge base data", seedKnowledgeData);
			await runSeeder("post data", seedPostData);
			await runSeeder("events", seedEvents);
			await runSeeder("event registrations", seedEventRegistrations);
			await runSeeder("training engagements", seedTraining);
			await runSeeder("training registrations", seedTrainingRegistrations);
			await runSeeder("CRM and Testing data", seedCRMTestingData);
			await runSeeder("Design x Development data", seedDesignData);
			await runSeeder("pricing plans", seedPricingPlans);

			const instancesResult = await runSeeder("module instances", seedModuleInstances);
			if (instancesResult?.count) {
				console.log(`   📊 Created ${instancesResult.count} module instances`);
			}
		} else {
			console.log("\n⚠️  PRODUCTION MODE: Only system data seeded. No demo data.");
			console.log("✅ System users, roles, and permissions created.");
		}

		console.log("\n🎉 All seed data has been created successfully!");
	} catch (error) {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	} finally {
		await disconnect();
	}
}

main();
