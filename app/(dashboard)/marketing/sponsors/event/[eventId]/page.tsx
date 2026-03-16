import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SponsorMaterialsByEvent } from "@/app/(dashboard)/marketing/components";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const revalidate = 0;

interface SponsorMaterialsByEventPageProps {
	params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: SponsorMaterialsByEventPageProps) {
	const { eventId } = await params;
	return generateCrudMetadata(`Sponsor Materials - Event ${eventId}`);
}

export default async function SponsorMaterialsByEventPage({ params }: SponsorMaterialsByEventPageProps) {
	const { eventId } = await params;

	if (!eventId) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<Suspense fallback={<PageLoading />}>
				<SponsorMaterialsByEvent eventId={eventId} />
			</Suspense>
		</div>
	);
}
