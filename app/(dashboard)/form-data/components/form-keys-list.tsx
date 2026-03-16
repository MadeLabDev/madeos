"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getFormKeysAction } from "@/lib/features/form-data/actions/form-keys.actions";
import { FormKeysListProps } from "@/lib/features/form-data/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function FormKeysList({ onSelectKey, selectedKey }: FormKeysListProps) {
	const [keys, setKeys] = useState<Array<{ key: string; count: number }>>([]);
	const [loading, setLoading] = useState(true);

	const loadKeys = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getFormKeysAction();
			if (result.success && result.data) {
				setKeys(result.data);
			} else {
				toast.error(result.message || "Failed to load form keys");
			}
		} catch (error) {
			toast.error("Failed to load form keys");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, []);

	usePusher();

	const handleFormDataUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;
			if (data.action === "form_data_created" || data.action === "form_data_deleted") {
				loadKeys();
			}
		},
		[loadKeys],
	);

	useChannelEvent("private-global", "form_data_update", handleFormDataUpdate);

	useEffect(() => {
		loadKeys();
	}, [loadKeys]);

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Form Keys</CardTitle>
					<CardDescription>Select a form to view submissions</CardDescription>
				</CardHeader>
				<CardContent>
					<PageLoading />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Form Keys</CardTitle>
				<CardDescription>
					{keys.length} form{keys.length !== 1 ? "s" : ""} available
				</CardDescription>
			</CardHeader>

			<CardContent>
				{keys.length === 0 ? (
					<div className="text-muted-foreground py-8 text-center">No form submissions yet</div>
				) : (
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
						{keys.map(({ key, count }) => (
							<button
								key={key}
								onClick={() => onSelectKey(key)}
								className={`hover:border-primary rounded-lg border-2 p-4 text-left transition-all ${selectedKey === key ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"}`}>
								<div className="space-y-2">
									<div className="font-mono text-sm font-semibold break-words">{key}</div>
									<div className="flex items-center gap-2">
										<Badge variant="secondary">{count}</Badge>
										<span className="text-muted-foreground text-xs">submission{count !== 1 ? "s" : ""}</span>
									</div>
								</div>
							</button>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
