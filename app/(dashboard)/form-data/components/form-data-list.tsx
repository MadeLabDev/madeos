"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { Pagination } from "@/components/pagination/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getFormDataAction } from "@/lib/features/form-data/actions";
import { FormDataListWithKeyProps, FormDataResponse } from "@/lib/features/form-data/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

import { DynamicTable } from "./dynamic-table";
import { FormDataStatistics } from "./form-data-statistics";

export function FormDataList({ page, keyFilter, pageSize, selectedKey }: FormDataListWithKeyProps) {
	const [response, setResponse] = useState<FormDataResponse | null>(null);
	const [loading, setLoading] = useState(true);

	const activeKeyFilter = selectedKey || keyFilter;

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getFormDataAction({
				keyFilter: activeKeyFilter,
				page,
				pageSize,
			});
			if (result.success) {
				setResponse(result);
			} else {
				toast.error(result.message || "Failed to load form data");
			}
		} catch (error) {
			toast.error("Failed to load form data");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [activeKeyFilter, page, pageSize]);

	usePusher();

	const handleFormDataUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;
			if (data.action === "form_data_created" || data.action === "form_data_updated" || data.action === "form_data_deleted") {
				loadData();
			}
		},
		[loadData],
	);

	useChannelEvent("private-global", "form_data_update", handleFormDataUpdate);

	useEffect(() => {
		loadData();
	}, [loadData]);

	if (loading) {
		return <PageLoading />;
	}

	const data = response?.data || [];
	const total = response?.total || 0;

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{activeKeyFilter ? `Submissions for "${activeKeyFilter}"` : "Submissions"}</CardTitle>
					<CardDescription>
						Showing {data.length} of {total} submissions
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{data.length === 0 ? (
						<div className="text-muted-foreground py-8 text-center">
							No form submissions found
							{activeKeyFilter && ` for form key "${activeKeyFilter}"`}
						</div>
					) : (
						<>
							<DynamicTable data={data} />

							{total > 0 && (
								<div className="pt-4">
									<Pagination
										page={page}
										total={total}
										pageSize={pageSize}
										search={activeKeyFilter}
										baseUrl="/form-data"
										itemName="submissions"
									/>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{data.length > 0 && <FormDataStatistics data={data} />}
		</div>
	);
}
