import type { CreatePricingPlanInput, UpdatePricingPlanInput } from "@/lib/features/pricing/types";
import { prisma } from "@/lib/prisma";

export class PricingPlanRepository {
	/**
	 * Get all pricing plans
	 */
	static async getAllPlans() {
		return prisma.pricingPlan.findMany({
			orderBy: [{ order: "asc" }, { createdAt: "desc" }],
		});
	}

	/**
	 * Get active pricing plans only
	 */
	static async getActivePlans() {
		return prisma.pricingPlan.findMany({
			where: { isActive: true },
			orderBy: [{ order: "asc" }],
		});
	}

	/**
	 * Get plan by ID
	 */
	static async getPlanById(id: string) {
		return prisma.pricingPlan.findUnique({
			where: { id },
		});
	}

	/**
	 * Get plan by slug
	 */
	static async getPlanBySlug(slug: string) {
		return prisma.pricingPlan.findUnique({
			where: { slug },
		});
	}

	/**
	 * Get plans by IDs
	 */
	static async getPlansByIds(ids: string[]) {
		if (ids.length === 0) return [];
		return prisma.pricingPlan.findMany({
			where: {
				id: { in: ids },
			},
		});
	}

	/**
	 * Create a new pricing plan
	 */
	static async createPlan(data: CreatePricingPlanInput) {
		return prisma.pricingPlan.create({
			data: {
				...data,
				features: data.features ? JSON.stringify(data.features) : null,
				limitations: data.limitations ? JSON.stringify(data.limitations) : null,
			},
		});
	}

	/**
	 * Update pricing plan
	 */
	static async updatePlan(id: string, data: UpdatePricingPlanInput) {
		return prisma.pricingPlan.update({
			where: { id },
			data: {
				...data,
				features: data.features ? JSON.stringify(data.features) : undefined,
				limitations: data.limitations ? JSON.stringify(data.limitations) : undefined,
			},
		});
	}

	/**
	 * Delete pricing plan
	 */
	static async deletePlan(id: string) {
		return prisma.pricingPlan.delete({
			where: { id },
		});
	}

	/**
	 * Check if plan exists
	 */
	static async planExists(id: string) {
		const plan = await prisma.pricingPlan.findUnique({
			where: { id },
		});
		return !!plan;
	}
}
