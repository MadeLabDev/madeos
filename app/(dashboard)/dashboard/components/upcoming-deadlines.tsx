import { Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UpcomingDeadline {
	id: string;
	title: string;
	dueDate: Date;
	priority: "low" | "medium" | "high";
}

interface UpcomingDeadlinesProps {
	deadlines: UpcomingDeadline[];
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					Upcoming Deadlines
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{deadlines.map((deadline) => (
					<div
						key={deadline.id}
						className="flex items-start space-x-3">
						<div className={`mt-2 h-2 w-2 rounded-full ${deadline.priority === "high" ? "bg-red-500" : deadline.priority === "medium" ? "bg-yellow-500" : "bg-green-500"}`}></div>
						<div className="flex-1">
							<p className="text-sm font-medium">{deadline.title}</p>
							<p className="text-muted-foreground text-xs">Due {new Date(deadline.dueDate).toLocaleDateString()}</p>
						</div>
					</div>
				))}

				{deadlines.length === 0 && (
					<div className="py-6 text-center">
						<Clock className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
						<p className="text-muted-foreground text-sm">No upcoming deadlines</p>
						<p className="text-muted-foreground mt-1 text-xs italic">Upcoming deadlines - Working</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
