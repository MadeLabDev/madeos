import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { HelpContent } from "./components/help-content";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Help & FAQ");

export const revalidate = 0;

export default async function HelpPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Help & FAQ"
				description="Find answers to common questions about MADE Laboratory"
				searchPlaceholder="Search questions..."
				search={search}
				clearHref={search ? "/help" : undefined}
			/>

			{/* Help Content */}
			<Suspense fallback={<PageLoading />}>
				<HelpContent searchQuery={search} />
			</Suspense>
		</div>
	);
}
