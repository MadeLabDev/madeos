import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getProductDesignById } from "@/lib/features/design/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { ProductDesignDetail } from "../../components";

export const metadata = generateCrudMetadata("Product Designs");

export default async function ProductDesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getProductDesignById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const design = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<SetBreadcrumb
				segment={id}
				label={design.name || `Design ${id}`}
			/>
			<ProductDesignDetail designId={id} />
		</Suspense>
	);
}
