import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrainingPhase, TrainingStatus } from "@/generated/prisma/enums";
import { TrainingEngagementWithRelations } from "@/lib/features/training/types";
import { formatDate } from "@/lib/utils";

interface TrainingEngagementListItemProps {
	engagement: TrainingEngagementWithRelations;
}

export function TrainingEngagementListItem({ engagement }: TrainingEngagementListItemProps) {
	const getStatusColor = (status: TrainingStatus) => {
		switch (status) {
			case "PLANNING":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "DISCOVERY":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
			case "IN_PROGRESS":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "COMPLETED":
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
			case "ON_HOLD":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			case "CANCELLED":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	const getPhaseColor = (phase: TrainingPhase) => {
		switch (phase) {
			case "DISCOVERY":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "DESIGN":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
			case "DEVELOPMENT":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
			case "DELIVERY":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "ASSESSMENT":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			case "SUPPORT":
				return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	return (
		<Link href={`/training-support/${engagement.id}`}>
			<Card className="cursor-pointer transition-shadow hover:shadow-md">
				<CardContent className="p-6">
					<div className="flex items-start justify-between">
						<div className="min-w-0 flex-1">
							<div className="mb-2 flex items-center gap-3">
								<h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">{engagement.title}</h3>
								<div className="flex gap-2">
									<Badge className={getStatusColor(engagement.status)}>{engagement.status.replace("_", " ")}</Badge>
									<Badge
										variant="outline"
										className={getPhaseColor(engagement.phase)}>
										{engagement.phase}
									</Badge>
								</div>
							</div>

							{engagement.description && <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{engagement.description}</p>}

							<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
								{engagement.customer && <span>Customer: {engagement.customer.name}</span>}
								{engagement.startDate && <span>Start: {formatDate(engagement.startDate)}</span>}
								{engagement.endDate && <span>End: {formatDate(engagement.endDate)}</span>}
								{engagement.sessions && <span>{engagement.sessions.length} sessions</span>}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
