"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsProps } from "@/lib/features/form-data/types";

/**
 * Detect and render statistics for survey/rating data
 */
export function FormDataStatistics({ data }: StatisticsProps) {
	const statistics = useMemo(() => {
		if (!data || data.length === 0) return null;

		const firstItem = data[0];
		if (!firstItem) return null;

		// Check if it's survey format: [firstName, lastName, email, surveyArray]
		if (Array.isArray(firstItem.data) && (firstItem.data as any).length >= 4) {
			const surveyArray = (firstItem.data as any)[3];
			if (!Array.isArray(surveyArray)) return null;

			const stats: Record<string, any> = {};

			// Analyze each survey question
			surveyArray.forEach((question: any) => {
				const questionId = question.id;

				// Only analyze rating questions
				if (question?.rating) {
					const ratings: { [key in 1 | 2 | 3 | 4 | 5]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
					let totalRating = 0;
					let ratingCount = 0;

					// Count ratings across all responses
					data.forEach((item) => {
						if (Array.isArray(item.data)) {
							const itemSurveyArray = (item.data as any)?.[3];
							const itemQuestion = Array.isArray(itemSurveyArray) ? itemSurveyArray.find((q: any) => q?.id === questionId) : null;

							if (itemQuestion?.range) {
								const ratingValue = Array.isArray(itemQuestion.range) ? parseInt(itemQuestion.range[0]) : parseInt(itemQuestion.range);

								if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
									const ratingKey = ratingValue as 1 | 2 | 3 | 4 | 5;
									ratings[ratingKey]++;
									totalRating += ratingValue;
									ratingCount++;
								}
							}
						}
					});

					if (ratingCount > 0) {
						stats[questionId] = {
							label: questionId.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
							ratings,
							average: (totalRating / ratingCount).toFixed(2),
							total: ratingCount,
						};
					}
				}
			});

			return Object.keys(stats).length > 0 ? stats : null;
		}

		return null;
	}, [data]);

	if (!statistics) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Response Statistics</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Object.entries(statistics).map(([questionId, stat]: [string, any]) => (
						<div
							key={questionId}
							className="space-y-3">
							<div className="text-sm font-semibold">{stat.label}</div>
							<div className="space-y-2 text-sm">
								{[1, 2, 3, 4, 5].map((rating) => (
									<div
										key={rating}
										className="flex items-center justify-between">
										<span className="text-muted-foreground">
											{rating} star{rating !== 1 ? "s" : ""}
										</span>
										<Badge
											variant="outline"
											className="font-mono">
											{stat.ratings[rating]} ({((stat.ratings[rating] / stat.total) * 100).toFixed(0)}%)
										</Badge>
									</div>
								))}
							</div>
							<div className="border-t pt-3">
								<div className="flex items-center justify-between font-semibold">
									<span>Average Rating</span>
									<span className="text-primary text-lg">{stat.average}</span>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Total Responses */}
				<div className="mt-6 border-t pt-6">
					<div className="flex items-center justify-between">
						<span className="font-semibold">Total Responses</span>
						<Badge
							variant="secondary"
							className="text-lg">
							{data.length}
						</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
