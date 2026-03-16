import { ArrowRight, BookOpen, Calendar, FileText, Plus, Settings, Target, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					Quick Actions
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Primary Actions */}
				<div className="grid grid-cols-2 gap-3">
					<Link href="/contacts/new">
						<Button
							variant="outline"
							className="h-auto w-full justify-start p-3 hover:border-blue-200 hover:bg-blue-50">
							<Users className="mr-2 h-4 w-4 text-blue-600" />
							<span className="text-sm">New Contact</span>
						</Button>
					</Link>
					<Link href="/opportunities/new">
						<Button
							variant="outline"
							className="h-auto w-full justify-start p-3 hover:border-green-200 hover:bg-green-50">
							<Target className="mr-2 h-4 w-4 text-green-600" />
							<span className="text-sm">New Opportunity</span>
						</Button>
					</Link>
					<Link href="/events/new">
						<Button
							variant="outline"
							className="h-auto w-full justify-start p-3 hover:border-purple-200 hover:bg-purple-50">
							<Calendar className="mr-2 h-4 w-4 text-purple-600" />
							<span className="text-sm">Schedule Event</span>
						</Button>
					</Link>
					<Link href="/knowledge/new">
						<Button
							variant="outline"
							className="h-auto w-full justify-start p-3 hover:border-orange-200 hover:bg-orange-50">
							<BookOpen className="mr-2 h-4 w-4 text-orange-600" />
							<span className="text-sm">Add Knowledge</span>
						</Button>
					</Link>
				</div>

				{/* Secondary Actions */}
				<div className="space-y-2">
					<Link href="/training-support/sop-library/new">
						<Button
							variant="ghost"
							className="w-full justify-between hover:bg-gray-50">
							<span className="flex items-center">
								<FileText className="mr-2 h-4 w-4 text-gray-600" />
								Create SOP
							</span>
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
					<Link href="/training-support/assessments/new">
						<Button
							variant="ghost"
							className="w-full justify-between hover:bg-gray-50">
							<span className="flex items-center">
								<Plus className="mr-2 h-4 w-4 text-gray-600" />
								New Assessment
							</span>
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>

				{/* Settings */}
				<div className="border-t pt-3">
					<Link href="/settings">
						<Button
							variant="ghost"
							className="w-full justify-between hover:bg-gray-50">
							<span className="flex items-center">
								<Settings className="mr-2 h-4 w-4" />
								System Settings
							</span>
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
