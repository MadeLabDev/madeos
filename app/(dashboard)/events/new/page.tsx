import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewEventForm } from "./new-event-form";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Events", "create");

export const revalidate = 0;

export default function NewEventPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<NewEventForm />
		</Suspense>
	);
}
