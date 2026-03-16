import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SOPLibraryWithRelations } from "@/lib/features/training/types";
import { formatDate } from "@/lib/utils";

const SOPStatusOptions = {
	DRAFT: "DRAFT",
	REVIEW: "REVIEW",
	APPROVED: "APPROVED",
	ARCHIVED: "ARCHIVED",
} as const;

interface SOPLibraryListItemProps {
	sop: SOPLibraryWithRelations;
}

export function SOPLibraryListItem({ sop }: SOPLibraryListItemProps) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case SOPStatusOptions.DRAFT:
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			case SOPStatusOptions.REVIEW:
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case SOPStatusOptions.APPROVED:
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case SOPStatusOptions.ARCHIVED:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	return (
		<Link href={`/training-support/sop-library/${sop.id}`}>
			<Card className="cursor-pointer transition-shadow hover:shadow-md">
				<CardContent className="p-6">
					<div className="flex items-start justify-between">
						<div className="min-w-0 flex-1">
							<div className="mb-2 flex items-center gap-3">
								<h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">{sop.title}</h3>
								<div className="flex gap-2">
									<Badge className={getStatusColor(sop.status)}>{sop.status}</Badge>
									{sop.category && <Badge variant="outline">{sop.category}</Badge>}
								</div>
							</div>

							{sop.description && <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{sop.description}</p>}

							<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
								<span>Version: {sop.version}</span>
								{sop.effectiveDate && <span>Effective: {formatDate(sop.effectiveDate)}</span>}
								{sop.lastReviewedAt && <span>Reviewed: {formatDate(sop.lastReviewedAt)}</span>}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
