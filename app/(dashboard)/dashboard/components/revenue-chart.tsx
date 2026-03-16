"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartDataPoint {
	month?: string;
	day?: string;
	revenue?: number;
	interactions?: number;
}

interface RevenueChartProps {
	data: ChartDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
	const hasData = data.some((d) => (d.revenue || 0) > 0);

	if (!hasData) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-blue-500"></div>
						Revenue Trend (6 Months)
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center">
						<div className="text-muted-foreground mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
							<div className="h-3 w-3 rounded-full bg-blue-500"></div>
						</div>
						<p className="text-muted-foreground text-sm">No revenue data available</p>
						<p className="text-muted-foreground mt-1 text-xs italic">Revenue chart - Working</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<div className="h-3 w-3 rounded-full bg-blue-500"></div>
					Revenue Trend (6 Months)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[300px]">
					<ResponsiveContainer
						width="100%"
						height="100%">
						<AreaChart data={data}>
							<defs>
								<linearGradient
									id="revenueGradient"
									x1="0"
									y1="0"
									x2="0"
									y2="1">
									<stop
										offset="5%"
										stopColor="#3b82f6"
										stopOpacity={0.3}
									/>
									<stop
										offset="95%"
										stopColor="#3b82f6"
										stopOpacity={0}
									/>
								</linearGradient>
							</defs>
							<XAxis
								dataKey="month"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#6b7280" }}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#6b7280" }}
								tickFormatter={(value) => `$${value.toLocaleString()}`}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#ffffff",
									border: "1px solid #e5e7eb",
									borderRadius: "8px",
									boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
								}}
								formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString()}`, "Revenue"]}
								labelStyle={{ color: "#374151" }}
							/>
							<Area
								type="monotone"
								dataKey="revenue"
								stroke="#3b82f6"
								strokeWidth={2}
								fill="url(#revenueGradient)"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
