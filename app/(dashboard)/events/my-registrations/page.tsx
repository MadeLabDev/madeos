import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { UserEventCheckIn } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("My Event Registrations");

export const revalidate = 0;

export default function MyRegistrationsPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<UserEventCheckIn />
		</Suspense>
	);
}
