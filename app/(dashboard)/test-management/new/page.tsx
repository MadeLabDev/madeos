import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewTestOrderForm } from "./new-test-order-form";

export const metadata = generateCrudMetadata("Create Test Order");

export default function NewTestOrderPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<NewTestOrderForm />
		</Suspense>
	);
}
