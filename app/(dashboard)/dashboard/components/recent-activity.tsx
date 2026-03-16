import { Activity, Calendar, FileText, Mail, Phone, Target, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentActivityProps {
	activities: any[]; // Using any for now since it's from Prisma with includes
}

const getActivityIcon = (type: string) => {
	switch (type?.toLowerCase()) {
		case "meeting":
			return Calendar;
		case "call":
			return Phone;
		case "email":
			return Mail;
		case "note":
			return FileText;
		default:
			return Activity;
	}
};

const getActivityColor = (type: string) => {
	switch (type?.toLowerCase()) {
		case "meeting":
			return "text-blue-500";
		case "call":
			return "text-green-500";
		case "email":
			return "text-purple-500";
		case "note":
			return "text-orange-500";
		default:
			return "text-gray-500";
	}
};

export function RecentActivity({ activities }: RecentActivityProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="h-5 w-5" />
					Recent Activity
				</CardTitle>
			</CardHeader>
			<CardContent>
				{activities.length > 0 ? (
					<div className="space-y-4">
						{activities.map((activity: any) => {
							const IconComponent = getActivityIcon(activity.type);
							const iconColor = getActivityColor(activity.type);

							return (
								<div
									key={activity.id}
									className="border-border flex items-start space-x-3 border-b pb-4 last:border-0">
									<div className={`mt-1 ${iconColor}`}>
										<IconComponent className="h-4 w-4" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<p className="truncate text-sm font-medium">{activity.subject}</p>
												<div className="mt-1 flex items-center space-x-2">
													{activity.contact && (
														<div className="flex items-center space-x-1">
															<User className="text-muted-foreground h-3 w-3" />
															<span className="text-muted-foreground text-xs">
																{activity.contact.firstName} {activity.contact.lastName}
															</span>
														</div>
													)}
													{activity.opportunity && (
														<div className="flex items-center space-x-1">
															<Target className="text-muted-foreground h-3 w-3" />
															<span className="text-muted-foreground truncate text-xs">{activity.opportunity.title}</span>
														</div>
													)}
												</div>
											</div>
											<div className="flex flex-col items-end space-y-1">
												<Badge
													variant="outline"
													className="text-xs">
													{activity.type}
												</Badge>
												<span className="text-muted-foreground text-xs">{new Date(activity.createdAt).toLocaleDateString()}</span>
											</div>
										</div>
										{activity.description && <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">{activity.description}</p>}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="py-8 text-center">
						<Activity className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
						<p className="text-muted-foreground text-sm">No recent activity to display</p>
						<p className="text-muted-foreground mt-1 text-xs">Activities will appear here as you interact with contacts and opportunities</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
