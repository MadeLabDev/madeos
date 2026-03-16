import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { UserTrainingCheckIn } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("My Training Registrations");

export const revalidate = 0;

export default function MyRegistrationsPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<UserTrainingCheckIn />
		</Suspense>
	);
}
