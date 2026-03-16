import type { Interaction } from "@/lib/features/interactions/types/interaction.types";

export interface DashboardStats {
	contacts: number;
	opportunities: number;
	events: number;
	knowledgeArticles: number;
	users: number;
	activeOpportunities: number;
	wonOpportunities: number;
	totalRevenue: number;
	monthlyRevenue: number;
	conversionRate: number;
	activeEvents: number;
	upcomingEvents: number;
	recentInteractions: number;
	pendingTasks: number;
	completedTasks: number;
	contactGrowth: number;
	revenueGrowth: number;
	recentActivities: Interaction[];
	activeEngagements: number;
	upcomingDeadlines: UpcomingDeadline[];
	recentAchievements: RecentAchievement[];
	revenueChartData: ChartDataPoint[];
	activityChartData: ChartDataPoint[];
}

export interface UpcomingDeadline {
	id: string;
	title: string;
	dueDate: Date;
	priority: "low" | "medium" | "high";
	type?: "design" | "testing" | "training" | "sales";
}

export interface RecentAchievement {
	id: string;
	title: string;
	description: string;
	date: Date;
	type?: "testing" | "training" | "sales" | "content";
	metric?: string;
}

export interface ChartDataPoint {
	month?: string;
	day?: string;
	revenue?: number;
	interactions?: number;
}
