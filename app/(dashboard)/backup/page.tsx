import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { getBackupStatsAction } from "@/lib/features/backup";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { BackupContent } from "./components/backup-content";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Backup Management");

export const revalidate = 0;

async function LoadBackupContent() {
	const result = await getBackupStatsAction();
	const initialStats =
		result.success && result.data
			? result.data
			: {
					totalBackups: 0,
					successfulBackups: 0,
					failedBackups: 0,
					totalSize: 0,
					lastBackupDate: undefined,
				};

	return <BackupContent initialStats={initialStats} />;
}

export default function BackupPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Backup Management"
				description="Create and manage database backups stored in Cloudflare R2"
			/>

			{/* Backup Content */}
			<Suspense fallback={<PageLoading />}>
				<LoadBackupContent />
			</Suspense>
		</div>
	);
}
