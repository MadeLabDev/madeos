import { Badge } from "@/components/ui/badge";
import type { AssessmentType } from "@/generated/prisma/enums";

interface AssessmentTypeBadgeProps {
	type: AssessmentType;
}

export function AssessmentTypeBadge({ type }: AssessmentTypeBadgeProps) {
	const typeConfig: Record<AssessmentType, { label: string; variant: "default" | "secondary" | "outline" }> = {
		QUIZ: { label: "Quiz", variant: "secondary" },
		PRACTICAL: { label: "Practical", variant: "secondary" },
		CERTIFICATION: { label: "Certification", variant: "secondary" },
		SURVEY: { label: "Survey", variant: "secondary" },
		SELF_ASSESSMENT: { label: "Self Assessment", variant: "secondary" },
	};

	const config = typeConfig[type];

	return <Badge variant={config.variant}>{config.label}</Badge>;
}
