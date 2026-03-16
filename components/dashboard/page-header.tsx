"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	badges?: ReactNode;
	actions?: ReactNode;
}

export function PageHeader({ title, subtitle, badges, actions }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0 flex-1">
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				{subtitle && <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>}
				{badges && <div className="mt-2 flex items-center gap-2">{badges}</div>}
			</div>
			{actions && (
				<div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
					<div className="flex gap-2">{actions}</div>
				</div>
			)}
		</div>
	);
}
