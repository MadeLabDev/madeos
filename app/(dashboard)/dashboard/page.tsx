import { Suspense } from "react";

import { BarChart3 } from "lucide-react";

import { PageLoading } from "@/components/ui/page-loading";
import { getDashboardStats } from "@/lib/features/dashboard";
import { generateDashboardMetadata } from "@/lib/utils/metadata";

import { ActivityChart, BusinessOperations, KeyMetrics, PerformanceOverview, QuickActions, RecentAchievements, RecentActivity, RevenueChart, SystemAlerts, UpcomingDeadlines } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateDashboardMetadata("Dashboard", "Welcome to MADE Laboratory - your business management system");

export const revalidate = 0;

async function DashboardContent() {
	const stats = await getDashboardStats();

	return (
		<div className="space-y-8">
			{/* Welcome Header */}
			<div className="flex flex-col space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold tracking-tight">Welcome back!</h1>
						<p className="text-muted-foreground text-xl">Here's what's happening with your business today</p>
					</div>
					<div className="flex items-center space-x-2">
						<div className="flex items-center space-x-2 rounded-full border border-green-200 bg-green-50 px-3 py-1">
							<div className="h-2 w-2 rounded-full bg-green-500"></div>
							<span className="text-sm font-medium text-green-700">System Status: Operational</span>
						</div>
						<div className="flex items-center space-x-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1">
							<BarChart3 className="h-4 w-4 text-blue-600" />
							<span className="text-sm font-medium text-blue-700">All Systems Active</span>
						</div>
					</div>
				</div>
			</div>

			{/* Key Performance Indicators */}
			<KeyMetrics stats={stats} />

			{/* Charts and Analytics Section */}
			<div className="grid gap-6 lg:grid-cols-2">
				<RevenueChart data={stats.revenueChartData} />
				<ActivityChart data={stats.activityChartData} />
			</div>

			{/* Performance Overview */}
			<PerformanceOverview stats={stats} />

			{/* Business Operations Overview */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<BusinessOperations
					activeEngagements={stats.activeEngagements}
					pendingTasks={stats.pendingTasks}
					monthlyRevenue={stats.monthlyRevenue}
				/>
				<UpcomingDeadlines deadlines={stats.upcomingDeadlines} />
				<RecentAchievements achievements={stats.recentAchievements} />
				<SystemAlerts />
			</div>

			{/* Quick Actions & Recent Activity */}
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-1">
					<QuickActions />
				</div>
				<div className="lg:col-span-2">
					<RecentActivity activities={stats.recentActivities} />
				</div>
			</div>
		</div>
	);
}

export default function DashboardPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<DashboardContent />
		</Suspense>
	);
}
