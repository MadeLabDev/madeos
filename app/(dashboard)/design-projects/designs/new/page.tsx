import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewProductDesignForm } from "./new-product-design-form";

export const metadata = generateCrudMetadata("Product Designs");

export default function NewProductDesignPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="New Product Design"
				/>
				<NewProductDesignForm />
			</>
		</Suspense>
	);
}
