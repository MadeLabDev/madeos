/**
 * Dashboard Service - Business Logic for Dashboard Stats
 */

import { prisma } from "@/lib/prisma";

import type { DashboardStats } from "../types/dashboard.types";

export async function getDashboardStats(): Promise<DashboardStats> {
	const [contactsCount, opportunitiesCount, eventsCount, knowledgeArticlesCount, usersCount, activeOpportunitiesCount, wonOpportunitiesCount, totalRevenue, thisMonthRevenue, lastMonthRevenue, activeEventsCount, upcomingEventsCount, recentInteractionsCount, pendingTasksCount, completedTasksCount] = await Promise.all([
		prisma.contact.count(),
		prisma.opportunity.count(),
		prisma.event.count(),
		prisma.knowledge.count(),
		prisma.user.count(),
		prisma.opportunity.count({ where: { stage: "PROSPECTING" } }),
		prisma.opportunity.count({ where: { stage: "CLOSED_WON" } }),
		prisma.opportunity.aggregate({ _sum: { value: true }, where: { stage: "CLOSED_WON" } }),
		prisma.opportunity.aggregate({
			_sum: { value: true },
			where: {
				stage: "CLOSED_WON",
				updatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
			},
		}),
		prisma.opportunity.aggregate({
			_sum: { value: true },
			where: {
				stage: "CLOSED_WON",
				updatedAt: {
					gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
					lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
				},
			},
		}),
		prisma.event.count({ where: { startDate: { gte: new Date() } } }),
		prisma.event.count({ where: { startDate: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } } }),
		prisma.interaction.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
		prisma.task.count({ where: { status: { not: "COMPLETED" } } }),
		prisma.task.count({ where: { status: "COMPLETED" } }),
	]);

	// Get recent activities with more details
	const recentActivities = await prisma.interaction.findMany({
		take: 8,
		orderBy: { createdAt: "desc" },
	});

	// Calculate growth rates
	const contactGrowth = contactsCount > 0 ? Math.round((contactsCount / Math.max(contactsCount - 5, 1)) * 100 - 100) : 0;
	const revenueGrowth = lastMonthRevenue._sum.value && lastMonthRevenue._sum.value > 0 ? Math.round(((thisMonthRevenue._sum.value || 0) / lastMonthRevenue._sum.value) * 100 - 100) : 0;

	// Mock data for business operations (enhanced)
	const activeEngagements = activeOpportunitiesCount + activeEventsCount;
	const pendingTasks = pendingTasksCount;
	const monthlyRevenue = thisMonthRevenue._sum.value || 0;
	const conversionRate = opportunitiesCount > 0 ? Math.round((wonOpportunitiesCount / opportunitiesCount) * 100) : 0;

	// Get real upcoming deadlines from tasks
	const upcomingDeadlines = await prisma.task.findMany({
		where: {
			dueDate: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
			status: { not: "COMPLETED" },
		},
		take: 4,
		orderBy: { dueDate: "asc" },
	});

	// Transform tasks to deadline format
	const transformedUpcomingDeadlines = upcomingDeadlines.map((task) => ({
		id: task.id,
		title: task.title,
		dueDate: task.dueDate || new Date(),
		priority: (task.priority?.toLowerCase() === "high" ? "high" : task.priority?.toLowerCase() === "medium" ? "medium" : "low") as "low" | "medium" | "high",
		type: task.entityType?.toLowerCase() as "design" | "testing" | "training" | "sales" | undefined,
	}));

	// Get real recent achievements from completed tasks and interactions
	const recentCompletedTasks = await prisma.task.findMany({
		where: {
			status: "COMPLETED",
			updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
		},
		take: 4,
		orderBy: { updatedAt: "desc" },
	});

	// Transform completed tasks to achievements
	const transformedRecentAchievements = recentCompletedTasks.map((task) => ({
		id: task.id,
		title: `Completed: ${task.title}`,
		description: `Task completed in ${task.entityType || "General"} engagement`,
		date: task.updatedAt,
		type: task.entityType?.toLowerCase() as "testing" | "training" | "sales" | "content" | undefined,
		metric: task.entityType === "TESTING" ? "Task Done" : "Completed",
	}));

	// Get real revenue chart data (last 6 months)
	const sixMonthsAgo = new Date();
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

	const revenueData = await prisma.opportunity.groupBy({
		by: ["updatedAt"],
		where: {
			stage: "CLOSED_WON",
			updatedAt: { gte: sixMonthsAgo },
		},
		_sum: { value: true },
		orderBy: { updatedAt: "asc" },
	});

	// Group by month and calculate monthly totals
	const monthlyRevenueMap = new Map<string, number>();
	revenueData.forEach((item) => {
		const month = item.updatedAt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
		const current = monthlyRevenueMap.get(month) || 0;
		monthlyRevenueMap.set(month, current + (item._sum.value || 0));
	});

	// Create chart data for last 6 months
	const revenueChartData = [];
	const now = new Date();
	for (let i = 5; i >= 0; i--) {
		const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const monthKey = date.toLocaleDateString("en-US", { month: "short" });
		const revenue = monthlyRevenueMap.get(`${monthKey} ${date.getFullYear()}`) || 0;
		revenueChartData.push({ month: monthKey, revenue });
	}

	// Get real activity chart data (last 7 days)
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	const activityData = await prisma.interaction.groupBy({
		by: ["createdAt"],
		where: { createdAt: { gte: sevenDaysAgo } },
		_count: { id: true },
		orderBy: { createdAt: "asc" },
	});

	// Group by day
	const dailyActivityMap = new Map<string, number>();
	activityData.forEach((item) => {
		const day = item.createdAt.toLocaleDateString("en-US", { weekday: "short" });
		const current = dailyActivityMap.get(day) || 0;
		dailyActivityMap.set(day, current + item._count.id);
	});

	// Create chart data for last 7 days
	const activityChartData = [];
	const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const today = new Date().getDay();

	for (let i = 6; i >= 0; i--) {
		const dayIndex = (today - i + 7) % 7;
		const dayName = daysOfWeek[dayIndex]!;
		const interactions = dailyActivityMap.get(dayName) || 0;
		activityChartData.push({ day: dayName, interactions });
	}

	return {
		contacts: contactsCount,
		opportunities: opportunitiesCount,
		events: eventsCount,
		knowledgeArticles: knowledgeArticlesCount,
		users: usersCount,
		activeOpportunities: activeOpportunitiesCount,
		wonOpportunities: wonOpportunitiesCount,
		totalRevenue: totalRevenue._sum.value || 0,
		monthlyRevenue,
		conversionRate,
		activeEvents: activeEventsCount,
		upcomingEvents: upcomingEventsCount,
		recentInteractions: recentInteractionsCount,
		pendingTasks: pendingTasks,
		completedTasks: completedTasksCount,
		contactGrowth,
		revenueGrowth,
		recentActivities,
		activeEngagements,
		upcomingDeadlines: transformedUpcomingDeadlines,
		recentAchievements: transformedRecentAchievements,
		revenueChartData,
		activityChartData,
	};
}
