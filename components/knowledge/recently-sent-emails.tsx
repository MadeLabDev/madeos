"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Local type definition since KnowledgeEmailLog model doesn't exist in Prisma schema yet
type KnowledgeEmailLog = {
	id: string;
	sentAt: Date;
	status: string;
	recipient_email: string;
};

interface EmailLogWithRecipient extends KnowledgeEmailLog {
	recipient: {
		id: string;
		email: string;
		name: string | null;
	} | null;
}

interface RecentlysentEmailsProps {
	emailLogs?: EmailLogWithRecipient[];
}

export function RecentlySentEmails({ emailLogs = [] }: RecentlysentEmailsProps) {
	const [displayLogs, setDisplayLogs] = useState<EmailLogWithRecipient[]>(emailLogs);

	useEffect(() => {
		setDisplayLogs(emailLogs);
	}, [emailLogs]);

	if (displayLogs.length === 0) {
		return null;
	}

	// Group by sent date
	const groupedByDate = displayLogs.reduce(
		(acc, log) => {
			const date = new Date(log.sentAt).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
			if (!acc[date]) acc[date] = [];
			acc[date].push(log);
			return acc;
		},
		{} as Record<string, EmailLogWithRecipient[]>,
	);

	return (
		<Card className="mt-6 border-blue-200 bg-blue-50">
			<CardHeader>
				<CardTitle className="text-lg">📧 Assignment Email History</CardTitle>
				<CardDescription>{displayLogs.length} email(s) sent for this article</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{Object.entries(groupedByDate).map(([date, logs]) => (
					<div key={date}>
						<h4 className="mb-2 text-sm font-semibold text-gray-700">{date}</h4>
						<div className="space-y-2">
							{logs.map((log) => (
								<div
									key={log.id}
									className="flex items-center justify-between rounded-md border border-blue-100 bg-white p-3">
									<div className="flex-1">
										<p className="text-sm font-medium text-gray-900">{log.recipient?.name || log.recipient?.email || log.recipient_email}</p>
										<p className="text-xs text-gray-500">{log.recipient?.email || log.recipient_email}</p>
									</div>
									<div className="ml-4 flex items-center gap-2">
										<Badge
											variant={log.status === "sent" ? "default" : "destructive"}
											className="whitespace-nowrap">
											{log.status === "sent" ? "✓ Sent" : "✗ Failed"}
										</Badge>
										<span className="text-xs whitespace-nowrap text-gray-500">
											{new Date(log.sentAt).toLocaleTimeString("en-US", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
