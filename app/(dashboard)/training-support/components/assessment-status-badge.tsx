import { Badge } from "@/components/ui/badge";
import type { AssessmentStatus } from "@/generated/prisma/enums";

interface AssessmentStatusBadgeProps {
	status: AssessmentStatus;
}

export function AssessmentStatusBadge({ status }: AssessmentStatusBadgeProps) {
	const statusConfig: Record<AssessmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
		PENDING: { label: "Pending", variant: "outline" },
		IN_PROGRESS: { label: "In Progress", variant: "secondary" },
		COMPLETED: { label: "Completed", variant: "default" },
		FAILED: { label: "Failed", variant: "destructive" },
		PASSED: { label: "Passed", variant: "default" },
	};

	const config = statusConfig[status];

	return <Badge variant={config.variant}>{config.label}</Badge>;
}
