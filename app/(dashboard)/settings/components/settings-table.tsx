"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SettingsTableProps } from "@/lib/features/settings/types";

export function SettingsTable({ data }: SettingsTableProps) {
	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Settings</CardTitle>
					<CardDescription>No settings configured</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Settings</CardTitle>
				<CardDescription>Current system settings and configuration</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[25%]">Key</TableHead>
							<TableHead>Value</TableHead>
							<TableHead className="text-muted-foreground w-[20%] text-xs">Last Updated</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((setting) => (
							<TableRow key={setting.id}>
								<TableCell className="font-medium">{setting.key.replace(/_/g, " ").toUpperCase()}</TableCell>
								<TableCell className="max-w-sm break-words">{setting.value || "-"}</TableCell>
								<TableCell className="text-muted-foreground text-xs">{new Date(setting.updatedAt).toLocaleString()}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
