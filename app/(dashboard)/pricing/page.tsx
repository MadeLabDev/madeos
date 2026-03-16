import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";

import { AvailablePlans } from "./components";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Pricing Plans",
	description: "Choose the perfect plan for your needs",
};

export const revalidate = 0;

export default function PricingPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Pricing Plans</h1>
				<p className="text-muted-foreground">Choose the perfect plan for your business needs</p>
			</div>

			{/* Available Plans */}
			<Suspense fallback={<PageLoading />}>
				<AvailablePlans />
			</Suspense>
		</div>
	);
}
