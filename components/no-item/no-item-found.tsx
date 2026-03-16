"use client";

import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export function NoItemFound({ text }: any) {
	return (
		<Empty className="border-border bg-muted text-foreground border">
			<EmptyHeader>
				<EmptyTitle>{text}</EmptyTitle>
			</EmptyHeader>
		</Empty>
	);
}
