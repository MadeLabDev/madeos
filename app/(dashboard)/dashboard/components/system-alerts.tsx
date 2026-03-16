import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SystemAlert {
	id: string;
	type: "info" | "warning" | "error" | "success";
	title: string;
	message: string;
	timestamp: Date;
}

interface SystemAlertsProps {
	alerts?: SystemAlert[];
}

// Mock alerts for demonstration - defined outside component to avoid impure function calls
const mockAlerts: SystemAlert[] = [
	{
		id: "1",
		type: "success",
		title: "System Update Complete",
		message: "All systems are running optimally",
		timestamp: new Date(), // Current time
	},
	{
		id: "2",
		type: "info",
		title: "New Features Available",
		message: "Check out the latest dashboard improvements",
		timestamp: new Date("2026-01-12T10:00:00"), // Fixed date for demo
	},
	{
		id: "3",
		type: "warning",
		title: "Storage Space",
		message: "80% of storage capacity used",
		timestamp: new Date("2026-01-11T12:00:00"), // Fixed date for demo
	},
];

export function SystemAlerts({ alerts = [] }: SystemAlertsProps) {
	const displayAlerts = alerts.length > 0 ? alerts : mockAlerts.slice(0, 3);

	const getAlertIcon = (type: string) => {
		switch (type) {
			case "success":
				return CheckCircle;
			case "warning":
				return AlertTriangle;
			case "error":
				return XCircle;
			default:
				return Info;
		}
	};

	const getAlertColor = (type: string) => {
		switch (type) {
			case "success":
				return "text-green-600";
			case "warning":
				return "text-yellow-600";
			case "error":
				return "text-red-600";
			default:
				return "text-blue-600";
		}
	};

	const getAlertBadgeVariant = (type: string) => {
		switch (type) {
			case "success":
				return "default";
			case "warning":
				return "secondary";
			case "error":
				return "destructive";
			default:
				return "outline";
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Info className="h-5 w-5" />
					System Alerts
				</CardTitle>
			</CardHeader>
			<CardContent>
				{displayAlerts.length > 0 ? (
					<div className="space-y-4">
						{displayAlerts.map((alert) => {
							const IconComponent = getAlertIcon(alert.type);
							const iconColor = getAlertColor(alert.type);

							return (
								<div
									key={alert.id}
									className="border-border flex items-start space-x-3 border-b pb-3 last:border-0">
									<div className={`mt-0.5 ${iconColor}`}>
										<IconComponent className="h-4 w-4" />
									</div>
									<div className="flex-1 space-y-1">
										<div className="flex items-center justify-between">
											<p className="text-sm font-medium">{alert.title}</p>
											<Badge
												variant={getAlertBadgeVariant(alert.type) as any}
												className="text-xs">
												{alert.type}
											</Badge>
										</div>
										<p className="text-muted-foreground text-xs">{alert.message}</p>
										<p className="text-muted-foreground text-xs">
											{alert.timestamp.toLocaleDateString()} at {alert.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="py-8 text-center">
						<CheckCircle className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
						<p className="text-muted-foreground text-sm">All systems operational</p>
						<p className="text-muted-foreground mt-1 text-xs">No alerts at this time</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
