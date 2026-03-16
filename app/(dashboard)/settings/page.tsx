import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { getSettingsAction } from "@/lib/features/settings/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { SettingsContent } from "./components/settings-content";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Settings");

export const revalidate = 0;

async function LoadSettings() {
	const result = await getSettingsAction();
	const initialSettings = (result.success && result.data ? result.data : {}) as Record<string, string>;

	return <SettingsContent initialSettings={initialSettings} />;
}

export default function SettingsPage({}: { searchParams?: Promise<Record<string, string>> }) {
	return (
		<div className="space-y-6">
			{/* Settings Content */}
			<Suspense fallback={<PageLoading />}>
				<LoadSettings />
			</Suspense>
		</div>
	);
}
