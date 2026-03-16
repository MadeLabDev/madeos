import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";

import AccessDeniedContent from "./access-denied-content";

export const dynamic = "force-dynamic";
import { generatePageMetadata } from "@/lib/utils/metadata";

export const metadata = generatePageMetadata("Page");

export const revalidate = 0;

export default function AccessDeniedPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<AccessDeniedContent />
		</Suspense>
	);
}
