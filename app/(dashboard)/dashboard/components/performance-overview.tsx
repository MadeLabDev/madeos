import { BarChart3, Target, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
	conversionRate: number;
	activeEngagements: number;
	pendingTasks: number;
	monthlyRevenue: number;
	revenueGrowth: number;
	contactGrowth: number;
}

interface PerformanceOverviewProps {
	stats: DashboardStats;
}

export function PerformanceOverview({ stats }: PerformanceOverviewProps) {
	const kpis = [
		{
			label: "Conversion Rate",
			value: `${stats.conversionRate}%`,
			target: "25%",
			status: stats.conversionRate >= 25 ? "good" : stats.conversionRate >= 15 ? "warning" : "poor",
			icon: Target,
		},
		{
			label: "Monthly Growth",
			value: `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth}%`,
			target: "+10%",
			status: stats.revenueGrowth >= 10 ? "good" : stats.revenueGrowth >= 0 ? "warning" : "poor",
			icon: TrendingUp,
		},
		{
			label: "Active Projects",
			value: stats.activeEngagements.toString(),
			target: "15+",
			status: stats.activeEngagements >= 15 ? "good" : stats.activeEngagements >= 10 ? "warning" : "poor",
			icon: BarChart3,
		},
		{
			label: "Task Efficiency",
			value: stats.pendingTasks > 0 ? `${Math.round((stats.pendingTasks / (stats.pendingTasks + 5)) * 100)}%` : "95%",
			target: "90%",
			status: stats.pendingTasks <= 2 ? "good" : stats.pendingTasks <= 5 ? "warning" : "poor",
			icon: Users,
		},
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "good":
				return "text-green-600 bg-green-50 border-green-200";
			case "warning":
				return "text-yellow-600 bg-yellow-50 border-yellow-200";
			case "poor":
				return "text-red-600 bg-red-50 border-red-200";
			default:
				return "text-gray-600 bg-gray-50 border-gray-200";
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5" />
					Performance Overview
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					{kpis.map((kpi) => (
						<div
							key={kpi.label}
							className="flex items-center justify-between rounded-lg border p-4">
							<div className="flex items-center space-x-3">
								<kpi.icon className="text-muted-foreground h-5 w-5" />
								<div>
									<p className="text-sm font-medium">{kpi.label}</p>
									<p className="text-muted-foreground text-xs">Target: {kpi.target}</p>
								</div>
							</div>
							<Badge
								variant="outline"
								className={getStatusColor(kpi.status)}>
								{kpi.value}
							</Badge>
						</div>
					))}
				</div>

				<div className="mt-6 border-t pt-4">
					<h4 className="mb-3 text-sm font-medium">Quick Insights</h4>
					<div className="text-muted-foreground space-y-2 text-sm">
						{stats.revenueGrowth >= 10 && <p className="text-green-600">Revenue is growing strongly this month!</p>}
						{stats.conversionRate >= 25 && <p className="text-green-600">Excellent conversion rate - sales team performing well!</p>}
						{stats.contactGrowth > 0 && <p className="text-blue-600">Customer base expanding - good lead generation!</p>}
						{stats.pendingTasks > 10 && <p className="text-yellow-600">High number of pending tasks - consider task prioritization.</p>}
						{stats.activeEngagements < 5 && <p className="text-orange-600">Low active engagements - opportunity to increase project load.</p>}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
