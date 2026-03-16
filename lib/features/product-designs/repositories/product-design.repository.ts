import { prisma } from "@/lib/prisma";

import type { CreateProductDesignInput, GetProductDesignsOptions, ProductDesignStatus, ProductDesignWithRelations, UpdateProductDesignInput } from "../types/product-design.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * ProductDesign Repository
 * Direct database operations for product designs
 */

export class ProductDesignRepository {
	/**
	 * Get all product designs with filters and pagination
	 */
	static async getAllProductDesigns(options: GetProductDesignsOptions = {}) {
		const { page = 1, pageSize = 10, designProjectId, status, designType, assignedTo, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (designProjectId) {
			where.designProjectId = designProjectId;
		}

		if (status) {
			where.status = status;
		}

		if (designType) {
			where.designType = { contains: designType, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) };
		}

		if (assignedTo) {
			where.assignedTo = assignedTo;
		}

		if (search) {
			where.OR = [{ name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { feasibilityNotes: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [productDesigns, total] = await Promise.all([
			prisma.productDesign.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					designProject: {
						select: {
							id: true,
							title: true,
							status: true,
						},
					},
					parentDesign: {
						select: {
							id: true,
							name: true,
							version: true,
						},
					},
					techPack: {
						select: {
							id: true,
							name: true,
							status: true,
						},
					},
					_count: {
						select: {
							versions: true,
							reviews: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.productDesign.count({ where }),
		]);

		return {
			productDesigns,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get product design by ID
	 */
	static async getProductDesignById(id: string): Promise<ProductDesignWithRelations | null> {
		return prisma.productDesign.findUnique({
			where: { id },
			include: {
				designProject: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				parentDesign: {
					select: {
						id: true,
						name: true,
						version: true,
					},
				},
				techPack: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
				_count: {
					select: {
						versions: true,
						reviews: true,
					},
				},
			},
		});
	}

	/**
	 * Get product designs by project
	 */
	static async getProductDesignsByProject(designProjectId: string): Promise<ProductDesignWithRelations[]> {
		return prisma.productDesign.findMany({
			where: { designProjectId },
			include: {
				parentDesign: {
					select: {
						id: true,
						name: true,
						version: true,
					},
				},
				techPack: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
				_count: {
					select: {
						versions: true,
						reviews: true,
					},
				},
			},
			orderBy: { version: "desc" },
		});
	}

	/**
	 * Create a new product design
	 */
	static async createProductDesign(data: CreateProductDesignInput, userId?: string): Promise<ProductDesignWithRelations> {
		return prisma.productDesign.create({
			data: {
				...data,
				createdBy: userId,
			},
			include: {
				designProject: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				parentDesign: {
					select: {
						id: true,
						name: true,
						version: true,
					},
				},
				techPack: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
				_count: {
					select: {
						versions: true,
						reviews: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing product design
	 */
	static async updateProductDesign(id: string, data: UpdateProductDesignInput, userId?: string): Promise<ProductDesignWithRelations> {
		return prisma.productDesign.update({
			where: { id },
			data: {
				...data,
				updatedBy: userId,
			},
			include: {
				designProject: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				parentDesign: {
					select: {
						id: true,
						name: true,
						version: true,
					},
				},
				techPack: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
				_count: {
					select: {
						versions: true,
						reviews: true,
					},
				},
			},
		});
	}

	/**
	 * Delete a product design
	 */
	static async deleteProductDesign(id: string): Promise<ProductDesignWithRelations> {
		return prisma.productDesign.delete({
			where: { id },
			include: {
				designProject: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Get count of product designs by status
	 */
	static async getProductDesignCountByStatus(): Promise<Record<ProductDesignStatus, number>> {
		const counts = await prisma.productDesign.groupBy({
			by: ["status"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.status] = item._count.id;
		});

		return result as Record<ProductDesignStatus, number>;
	}
}
