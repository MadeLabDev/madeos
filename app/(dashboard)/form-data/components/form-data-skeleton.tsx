import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FormDataListSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-32" />
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className="flex items-center gap-4 border-b pb-4 last:border-0">
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-1/3" />
								<Skeleton className="h-3 w-1/2" />
								<Skeleton className="h-3 w-2/5" />
							</div>
							<Skeleton className="h-8 w-20" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
