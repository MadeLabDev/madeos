import { Badge } from "@/components/ui/badge";
import type { SOPStatus } from "@/generated/prisma/enums";

interface SOPStatusBadgeProps {
	status: SOPStatus;
}

export function SOPStatusBadge({ status }: SOPStatusBadgeProps) {
	const statusConfig: Record<SOPStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
		DRAFT: { label: "Draft", variant: "outline" },
		PUBLISHED: { label: "Published", variant: "default" },
		ARCHIVED: { label: "Archived", variant: "destructive" },
	};

	const config = statusConfig[status];

	return <Badge variant={config.variant}>{config.label}</Badge>;
}
