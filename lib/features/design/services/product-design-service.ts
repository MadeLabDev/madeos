import { z } from "zod";

import { ProductDesignRepository } from "../repositories/product-design.repository";
import type { CreateProductDesignInput, ProductDesignListParams, UpdateProductDesignInput } from "../types";

const createProductDesignSchema = z.object({
	designProjectId: z.string().min(1, "Design project ID required"),
	name: z.string().min(1, "Name required").max(255),
	description: z.string().optional(),
	designType: z.enum(["PRODUCT", "PACKAGING", "LABEL", "COLLATERAL"]),
	status: z.enum(["DRAFT", "IN_PROGRESS", "IN_REVIEW", "APPROVED", "REJECTED"]).optional(),
	mediaIds: z.array(z.string()).optional(),
	version: z.number().positive().optional(),
});

const updateProductDesignSchema = createProductDesignSchema.partial();

export async function getProductDesignsService(params: ProductDesignListParams) {
	try {
		return await ProductDesignRepository.findMany(params);
	} catch (error) {
		throw new Error(`Failed to fetch product designs: ${error}`);
	}
}

export async function getProductDesignByIdService(id: string) {
	if (!id) throw new Error("Product design ID required");

	const design = await ProductDesignRepository.findById(id);
	if (!design) throw new Error("Product design not found");

	return design;
}

export async function createProductDesignService(data: CreateProductDesignInput) {
	const validated = createProductDesignSchema.parse(data);
	return ProductDesignRepository.create(validated as CreateProductDesignInput & { createdBy: string });
}

export async function updateProductDesignService(id: string, data: UpdateProductDesignInput) {
	if (!id) throw new Error("Product design ID required");

	const design = await ProductDesignRepository.findById(id);
	if (!design) throw new Error("Product design not found");

	const validated = updateProductDesignSchema.parse(data);
	return ProductDesignRepository.update(id, validated as UpdateProductDesignInput & { updatedBy: string });
}

export async function deleteProductDesignService(id: string) {
	if (!id) throw new Error("Product design ID required");

	const design = await ProductDesignRepository.findById(id);
	if (!design) throw new Error("Product design not found");

	return ProductDesignRepository.delete(id);
}

export async function getProductDesignsByProjectService(designProjectId: string) {
	if (!designProjectId) throw new Error("Design project ID required");
	return ProductDesignRepository.findMany({ designProjectId });
}

export async function incrementProductDesignVersionService(id: string) {
	if (!id) throw new Error("Product design ID required");

	const design = await ProductDesignRepository.findById(id);
	if (!design) throw new Error("Product design not found");

	// TODO: Implement version increment when backend supports it
	return design;
}
