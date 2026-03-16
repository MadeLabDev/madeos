import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { FormDataPageClient } from "./components/form-data-page-client";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Form Data");

export const revalidate = 0;

export default function FormDataPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<FormDataPageClient />
		</Suspense>
	);
}
