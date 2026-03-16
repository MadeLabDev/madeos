import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { ContactContent } from "./components/contact-content";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Contact Us");

export const revalidate = 0;

export default function ContactPage() {
	return (
		<div className="container mx-auto max-w-6xl px-4 py-4 lg:px-6 lg:py-8">
			<div className="space-y-4">
				{/* Contact Content */}
				<Suspense fallback={<PageLoading />}>
					<ContactContent />
				</Suspense>
			</div>
		</div>
	);
}
