import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TestOrderDetail } from "../components";

interface TestOrderPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TestOrderPageProps) {
	const { id } = await params;
	return generateCrudMetadata(`Test Order ${id}`);
}

export default async function TestOrderPage({ params }: TestOrderPageProps) {
	const { id } = await params;

	if (!id) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<Suspense fallback={<PageLoading />}>
				<TestOrderDetail testOrderId={id} />
			</Suspense>
		</div>
	);
}
