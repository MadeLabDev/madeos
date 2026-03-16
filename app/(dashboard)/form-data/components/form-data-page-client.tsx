"use client";

import { Suspense, useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";

import { FormDataList } from "./form-data-list";
import { FormKeysList } from "./form-keys-list";

export function FormDataPageClient() {
	const [selectedKey, setSelectedKey] = useState<string | undefined>();
	const pageSize = SITE_CONFIG.pagination.getPageSize("pagesize");

	const handleClearSelection = () => {
		setSelectedKey(undefined);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Form Data</h1>
				<p className="text-muted-foreground">View and manage external form submissions</p>
			</div>

			{/* Keys List */}
			<Suspense fallback={<PageLoading />}>
				<FormKeysList
					onSelectKey={setSelectedKey}
					selectedKey={selectedKey}
				/>
			</Suspense>

			{/* Data List */}
			{selectedKey && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">
							Submissions: <span className="text-primary">{selectedKey}</span>
						</h2>
						<Button
							variant="outline"
							onClick={handleClearSelection}>
							<X className="h-4 w-4" />
							Clear Selection
						</Button>
					</div>

					<Suspense fallback={<PageLoading />}>
						<FormDataList
							page={1}
							keyFilter={selectedKey}
							pageSize={pageSize}
							selectedKey={selectedKey}
						/>
					</Suspense>
				</div>
			)}
		</div>
	);
}
