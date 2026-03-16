import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";

import SignOutContent from "./signout-content";

export const dynamic = "force-dynamic";
import { generateAuthMetadata } from "@/lib/utils/metadata";

export const metadata = generateAuthMetadata("Signout");

export const revalidate = 0;

export default function SignOutPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<SignOutContent />
		</Suspense>
	);
}
