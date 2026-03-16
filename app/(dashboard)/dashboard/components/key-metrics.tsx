import { ArrowDown, ArrowUp, BookOpen, Calendar, Target, TrendingDown, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
	contacts: number;
	opportunities: number;
	events: number;
	knowledgeArticles: number;
	activeOpportunities: number;
	wonOpportunities: number;
	totalRevenue: number;
	monthlyRevenue: number;
	conversionRate: number;
	activeEvents: number;
	upcomingEvents: number;
	recentInteractions: number;
	contactGrowth: number;
	revenueGrowth: number;
	pendingTasks: number;
	completedTasks: number;
}

interface KeyMetricsProps {
	stats: DashboardStats;
}

export function KeyMetrics({ stats }: KeyMetricsProps) {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-muted-foreground text-sm font-medium">Total Contacts</CardTitle>
					<Users className="h-5 w-5" />
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{stats.contacts.toLocaleString()}</div>
					<div className="flex items-center space-x-2">
						{stats.contactGrowth >= 0 ? <ArrowUp className="h-4 w-4 text-green-500" /> : <ArrowDown className="h-4 w-4 text-red-500" />}
						<span className={`text-xs ${stats.contactGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
							{stats.contactGrowth >= 0 ? "+" : ""}
							{stats.contactGrowth}% from last month
						</span>
					</div>
					<p className="text-muted-foreground mt-1 text-xs">Customer relationships managed</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-muted-foreground text-sm font-medium">Sales Pipeline</CardTitle>
					<Target className="h-5 w-5" />
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{stats.opportunities}</div>
					<div className="mt-2 flex items-center justify-between">
						<Badge
							variant="secondary"
							className="text-xs">
							{stats.activeOpportunities} active
						</Badge>
						<Badge
							variant="outline"
							className="text-xs">
							{stats.conversionRate}% won
						</Badge>
					</div>
					<p className="text-muted-foreground mt-1 text-xs">Opportunities in pipeline</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-muted-foreground text-sm font-medium">Monthly Revenue</CardTitle>
					<TrendingUp className="h-5 w-5" />
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
					<div className="flex items-center space-x-2">
						{stats.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
						<span className={`text-xs ${stats.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
							{stats.revenueGrowth >= 0 ? "+" : ""}
							{stats.revenueGrowth}% vs last month
						</span>
					</div>
					<p className="text-muted-foreground mt-1 text-xs">Revenue this month</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-muted-foreground text-sm font-medium">Events & Training</CardTitle>
					<Calendar className="h-5 w-5" />
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{stats.events}</div>
					<div className="mt-2 flex items-center justify-between">
						<Badge
							variant="secondary"
							className="text-xs">
							{stats.upcomingEvents} upcoming
						</Badge>
						<Badge
							variant="outline"
							className="text-xs">
							{stats.activeEvents} active
						</Badge>
					</div>
					<p className="text-muted-foreground mt-1 text-xs">Scheduled events and sessions</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-muted-foreground text-sm font-medium">Knowledge Base</CardTitle>
					<BookOpen className="h-5 w-5" />
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{stats.knowledgeArticles}</div>
					<p className="text-muted-foreground mt-1 text-xs">Articles and resources available</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-muted-foreground text-sm font-medium">Team Activity</CardTitle>
					<Users className="h-5 w-5" />
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{stats.recentInteractions}</div>
					<p className="text-muted-foreground mt-1 text-xs">Interactions this week</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-muted-foreground text-sm font-medium">Task Completion</CardTitle>
					<Target className="h-5 w-5" />
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{stats.pendingTasks + stats.completedTasks > 0 ? Math.round((stats.completedTasks / (stats.pendingTasks + stats.completedTasks)) * 100) : 0}%</div>
					<div className="mt-2 flex items-center justify-between">
						<Badge
							variant="secondary"
							className="text-xs">
							{stats.completedTasks} done
						</Badge>
						<Badge
							variant="outline"
							className="text-xs">
							{stats.pendingTasks} pending
						</Badge>
					</div>
					<p className="text-muted-foreground mt-1 text-xs">Task completion rate</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-muted-foreground text-sm font-medium">Total Revenue</CardTitle>
					<TrendingUp className="h-5 w-5" />
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
					<p className="text-muted-foreground mt-1 text-xs">All-time revenue generated</p>
				</CardContent>
			</Card>
		</div>
	);
}
