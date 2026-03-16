import { prisma } from "@/lib/prisma";

export async function seedPricingPlans() {
	console.log("   🏷️  Seeding pricing plans...");

	const plans = [
		{
			name: "free",
			slug: "free",
			displayName: "Free",
			description: "Perfect for getting started",
			icon: "zap",
			monthlyPrice: 0,
			annualPrice: 0,
			currency: "USD",
			features: JSON.stringify(["Up to 3 projects", "5 team members", "Basic support", "1 GB storage"]),
			limitations: JSON.stringify(["No API access", "No custom domain", "Community support only"]),
			tier: "free",
			order: 1,
			isActive: true,
			isFeatured: false,
			billingCycle: "monthly",
			trialDays: 0,
			metadata: {
				maxProjects: 3,
				maxTeamMembers: 5,
				storageGb: 1,
				apiAccess: false,
			},
		},
		{
			name: "starter",
			slug: "starter",
			displayName: "Starter",
			description: "Great for small teams",
			icon: "rocket",
			monthlyPrice: 39,
			annualPrice: 390,
			currency: "USD",
			features: JSON.stringify(["Unlimited projects", "Up to 20 team members", "Email support", "10 GB storage", "Custom branding", "API access"]),
			limitations: JSON.stringify(["Limited integrations", "Community support"]),
			tier: "basic",
			order: 2,
			isActive: true,
			isFeatured: true,
			billingCycle: "monthly",
			trialDays: 14,
			metadata: {
				maxProjects: -1,
				maxTeamMembers: 20,
				storageGb: 10,
				apiAccess: true,
				customBranding: true,
			},
		},
		{
			name: "professional",
			slug: "professional",
			displayName: "Professional",
			description: "For growing businesses",
			icon: "briefcase",
			monthlyPrice: 69,
			annualPrice: 690,
			currency: "USD",
			features: JSON.stringify(["Unlimited projects", "Unlimited team members", "Priority support", "100 GB storage", "Advanced analytics", "Webhooks & integrations", "SSO (Single Sign-On)", "Advanced security"]),
			limitations: JSON.stringify(["Limited custom workflows"]),
			tier: "pro",
			order: 3,
			isActive: true,
			isFeatured: false,
			billingCycle: "monthly",
			trialDays: 30,
			metadata: {
				maxProjects: -1,
				maxTeamMembers: -1,
				storageGb: 100,
				apiAccess: true,
				customBranding: true,
				sso: true,
				advancedSecurity: true,
			},
		},
		{
			name: "enterprise",
			slug: "enterprise",
			displayName: "Enterprise",
			description: "For large organizations",
			icon: "crown",
			monthlyPrice: 299,
			annualPrice: 2990,
			currency: "USD",
			features: JSON.stringify(["Everything in Professional", "Unlimited storage", "Dedicated account manager", "Custom integrations", "Advanced workflows", "Audit logs & compliance", "On-premise deployment", "24/7 phone support", "SLA guarantee"]),
			limitations: JSON.stringify([]),
			tier: "enterprise",
			order: 4,
			isActive: true,
			isFeatured: false,
			billingCycle: "monthly",
			trialDays: 30,
			metadata: {
				maxProjects: -1,
				maxTeamMembers: -1,
				storageGb: -1,
				apiAccess: true,
				customBranding: true,
				sso: true,
				advancedSecurity: true,
				customIntegrations: true,
				dedicatedSupport: true,
			},
		},
	];

	// Delete existing plans
	await prisma.pricingPlan.deleteMany({});

	// Create new plans
	const createdPlans = await Promise.all(
		plans.map((plan) =>
			prisma.pricingPlan.create({
				data: plan,
			}),
		),
	);

	console.log(`   ✅ Created ${createdPlans.length} pricing plans`);
	return {
		success: true,
		message: `Created ${createdPlans.length} pricing plans`,
		count: createdPlans.length,
	};
}
