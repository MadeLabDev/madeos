"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartDataPoint {
	month?: string;
	day?: string;
	revenue?: number;
	interactions?: number;
}

interface ActivityChartProps {
	data: ChartDataPoint[];
}

export function ActivityChart({ data }: ActivityChartProps) {
	const hasData = data.some((d) => (d.interactions || 0) > 0);

	if (!hasData) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-green-500"></div>
						Weekly Activity (7 Days)
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center">
						<div className="text-muted-foreground mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
							<div className="h-3 w-3 rounded-full bg-green-500"></div>
						</div>
						<p className="text-muted-foreground text-sm">No activity data available</p>
						<p className="text-muted-foreground mt-1 text-xs italic">Activity chart - Working</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<div className="h-3 w-3 rounded-full bg-green-500"></div>
					Weekly Activity (7 Days)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[300px]">
					<ResponsiveContainer
						width="100%"
						height="100%">
						<BarChart data={data}>
							<XAxis
								dataKey="day"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#6b7280" }}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#6b7280" }}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#ffffff",
									border: "1px solid #e5e7eb",
									borderRadius: "8px",
									boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
								}}
								formatter={(value: number | undefined) => [value || 0, "Interactions"]}
								labelStyle={{ color: "#374151" }}
							/>
							<Bar
								dataKey="interactions"
								fill="#10b981"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
