import { Award, CheckCircle2, Star, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentAchievement {
	id: string;
	title: string;
	description: string;
	date: Date;
	type?: "testing" | "training" | "sales" | "content";
	metric?: string;
}

interface RecentAchievementsProps {
	achievements: RecentAchievement[];
}

const getAchievementIcon = (type?: string) => {
	switch (type) {
		case "testing":
			return CheckCircle2;
		case "training":
			return Award;
		case "sales":
			return Trophy;
		case "content":
			return Star;
		default:
			return CheckCircle2;
	}
};

const getAchievementColor = (type?: string) => {
	switch (type) {
		case "testing":
			return "text-green-600";
		case "training":
			return "text-blue-600";
		case "sales":
			return "text-yellow-600";
		case "content":
			return "text-purple-600";
		default:
			return "text-green-600";
	}
};

const getTypeLabel = (type?: string) => {
	switch (type) {
		case "testing":
			return "Testing";
		case "training":
			return "Training";
		case "sales":
			return "Sales";
		case "content":
			return "Content";
		default:
			return "Achievement";
	}
};

export function RecentAchievements({ achievements }: RecentAchievementsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Trophy className="h-5 w-5" />
					Recent Achievements
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{achievements.map((achievement) => {
					const IconComponent = getAchievementIcon(achievement.type);
					const iconColor = getAchievementColor(achievement.type);

					return (
						<div
							key={achievement.id}
							className="bg-card/50 flex items-start space-x-3 rounded-lg border p-3">
							<div className={`mt-0.5 ${iconColor}`}>
								<IconComponent className="h-5 w-5" />
							</div>
							<div className="flex-1">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<p className="text-sm font-medium">{achievement.title}</p>
										<p className="text-muted-foreground mt-1 text-xs">{achievement.description}</p>
									</div>
									<div className="ml-3 flex flex-col items-end space-y-1">
										<Badge
											variant="secondary"
											className="text-xs">
											{getTypeLabel(achievement.type)}
										</Badge>
										{achievement.metric && <span className="text-xs font-bold text-green-600">{achievement.metric}</span>}
									</div>
								</div>
								<div className="mt-2 flex items-center justify-between">
									<span className="text-muted-foreground text-xs">
										{new Date(achievement.date).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})}
									</span>
									<span className="text-muted-foreground text-xs">
										{new Date(achievement.date).toLocaleTimeString("en-US", {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
							</div>
						</div>
					);
				})}

				{achievements.length === 0 && (
					<div className="py-8 text-center">
						<Trophy className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
						<p className="text-muted-foreground text-sm">No recent achievements</p>
						<p className="text-muted-foreground mt-1 text-xs">Achievements will appear here as your team completes goals</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
