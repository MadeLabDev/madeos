import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessOperationsProps {
	activeEngagements: number;
	pendingTasks: number;
	monthlyRevenue: number;
}

export function BusinessOperations({ activeEngagements, pendingTasks, monthlyRevenue }: BusinessOperationsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					Business Operations
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">Active Engagements</span>
					<Badge variant="secondary">{activeEngagements}</Badge>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">Pending Tasks</span>
					<Badge variant="outline">{pendingTasks}</Badge>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">This Month's Revenue</span>
					<span className="text-sm font-bold">${monthlyRevenue.toLocaleString()}</span>
				</div>
			</CardContent>
		</Card>
	);
}
