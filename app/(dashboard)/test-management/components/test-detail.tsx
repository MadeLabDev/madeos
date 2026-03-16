"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, FileText, Pencil, TestTube } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { getTestById } from "@/lib/features/testing/actions";
import { TestWithRelations } from "@/lib/features/testing/types";

interface TestDetailProps {
	testId: string;
}

export function TestDetail({ testId }: TestDetailProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [test, setTest] = useState<TestWithRelations | null>(null);

	const loadTestData = useCallback(async () => {
		try {
			setLoading(true);

			// Load test details
			const testResult = await getTestById(testId);
			if (testResult.success && testResult.data) {
				setTest(testResult.data);
			} else {
				toast.error("Failed to load test");
				router.push("/testing");
				return;
			}

			// Note: Reports are not directly linked to tests, only through test orders
		} catch (error) {
			toast.error("Failed to load test data");
		} finally {
			setLoading(false);
		}
	}, [testId, router]);

	useEffect(() => {
		loadTestData();
	}, [testId, loadTestData]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "PLANNED":
				return "bg-blue-100 text-blue-800";
			case "IN_PROGRESS":
				return "bg-yellow-100 text-yellow-800";
			case "COMPLETED":
				return "bg-green-100 text-green-800";
			case "FAILED":
				return "bg-red-100 text-red-800";
			case "CANCELLED":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader size="lg" />
			</div>
		);
	}

	if (!test) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<AlertCircle className="text-muted-foreground mx-auto h-12 w-12" />
					<p className="text-muted-foreground mt-2 text-sm">Test not found</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<SetBreadcrumb
				segment={testId}
				label={`Test ${test.id}`}
			/>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">{test.name}</h1>
						<p className="text-muted-foreground">Test ID: {test.id}</p>
					</div>
					<div className="flex space-x-2">
						<Button
							variant="outline"
							onClick={() => router.push(`/test-management/tests/${testId}/edit`)}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit Test
						</Button>
						<Button onClick={() => router.push(`/test-management/tests/${testId}/reports/new`)}>
							<FileText className="mr-2 h-4 w-4" />
							Create Report
						</Button>
					</div>
				</div>

				{/* Test Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<TestTube className="mr-2 h-5 w-5" />
							Test Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-6">
							<div className="space-y-4">
								<div>
									<label className="text-muted-foreground text-sm font-medium">Name</label>
									<p className="text-sm">{test.name}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Description</label>
									<p className="text-sm">{test.description || "No description"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Test Suite</label>
									<p className="text-sm">{test.testSuite?.name || "No suite assigned"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Sample</label>
									<p className="text-sm">{test.sample?.name || "No sample assigned"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Status</label>
									<div className="mt-1">
										<Badge className={getStatusColor(test.status)}>{test.status}</Badge>
									</div>
								</div>
							</div>
							<div className="space-y-4">
								<div>
									<label className="text-muted-foreground text-sm font-medium">Started At</label>
									<p className="flex items-center text-sm">
										<Calendar className="mr-1 h-4 w-4" />
										{test.startedAt ? format(new Date(test.startedAt), "PPP") : "Not started"}
									</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Completed At</label>
									<p className="flex items-center text-sm">
										<CheckCircle className="mr-1 h-4 w-4" />
										{test.completedAt ? format(new Date(test.completedAt), "PPP") : "Not completed"}
									</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Performed By</label>
									<p className="text-sm">{test.performedBy || "Not assigned"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Test Order</label>
									<p className="text-sm">{test.testOrder?.title || "N/A"}</p>
								</div>
							</div>
						</div>

						{/* Test Method */}
						{test.method && (
							<>
								<Separator className="my-4" />
								<div>
									<label className="text-muted-foreground text-sm font-medium">Test Method</label>
									<p className="mt-1 text-sm">{test.method}</p>
								</div>
							</>
						)}

						{/* Expected vs Actual Results */}
						{(test.expectedResult || test.actualResult) && (
							<>
								<Separator className="my-4" />
								<div>
									<label className="text-muted-foreground flex items-center text-sm font-medium">
										<CheckCircle className="mr-1 h-4 w-4" />
										Results
									</label>
									<div className="mt-2 space-y-2">
										{test.expectedResult && (
											<div>
												<span className="text-muted-foreground text-xs font-medium">Expected:</span>
												<p className="text-sm">{test.expectedResult}</p>
											</div>
										)}
										{test.actualResult && (
											<div>
												<span className="text-muted-foreground text-xs font-medium">Actual:</span>
												<p className="text-sm">{test.actualResult}</p>
											</div>
										)}
									</div>
								</div>
							</>
						)}

						{/* Notes */}
						{test.notes && (
							<>
								<Separator className="my-4" />
								<div>
									<label className="text-muted-foreground text-sm font-medium">Notes</label>
									<p className="mt-1 text-sm whitespace-pre-wrap">{test.notes}</p>
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
