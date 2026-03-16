"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { AlertCircle, Calendar, MapPin, Package, Pencil, Plus, Save, TestTube, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSampleById, getTestsBySampleId } from "@/lib/features/testing/actions";
import { SampleWithRelations, TestWithRelations } from "@/lib/features/testing/types";

interface SampleDetailProps {
	sampleId: string;
}

export function SampleDetail({ sampleId }: SampleDetailProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [sample, setSample] = useState<SampleWithRelations | null>(null);
	const [tests, setTests] = useState<TestWithRelations[]>([]);

	const loadSampleData = useCallback(async () => {
		try {
			setLoading(true);

			// Load sample details
			const sampleResult = await getSampleById(sampleId);
			if (sampleResult.success && sampleResult.data) {
				setSample(sampleResult.data);
			} else {
				toast.error("Failed to load sample");
				router.push("/testing");
				return;
			}

			// Load related tests
			const testsResult = await getTestsBySampleId(sampleId);
			if (testsResult.success) {
				setTests(testsResult.data || []);
			}

			// Note: Reports are not directly linked to samples, only through test orders
		} catch (error) {
			toast.error("Failed to load sample data");
		} finally {
			setLoading(false);
		}
	}, [sampleId, router]);

	useEffect(() => {
		loadSampleData();
	}, [sampleId, loadSampleData]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "RECEIVED":
				return "bg-blue-100 text-blue-800";
			case "IN_STORAGE":
				return "bg-green-100 text-green-800";
			case "IN_TESTING":
				return "bg-yellow-100 text-yellow-800";
			case "TESTED":
				return "bg-purple-100 text-purple-800";
			case "ARCHIVED":
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

	if (!sample) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<AlertCircle className="text-muted-foreground mx-auto h-12 w-12" />
					<p className="text-muted-foreground mt-2 text-sm">Sample not found</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<SetBreadcrumb
				segment={sampleId}
				label={sample.name}
			/>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">{sample.name}</h1>
						<p className="text-muted-foreground">Sample ID: {sample.id}</p>
					</div>
					<div className="flex space-x-2">
						<Button
							variant="outline"
							onClick={() => router.push(`/test-management/samples/${sampleId}/edit`)}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit Sample
						</Button>
						<Button onClick={() => router.push(`/test-management/samples/${sampleId}/tests/new`)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Test
						</Button>
					</div>
				</div>

				{/* Sample Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Package className="mr-2 h-5 w-5" />
							Sample Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-6">
							<div className="space-y-4">
								<div>
									<label className="text-muted-foreground text-sm font-medium">Name</label>
									<p className="text-sm">{sample.name}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Description</label>
									<p className="text-sm">{sample.description || "No description"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Type</label>
									<p className="text-sm">{sample.type || "Not specified"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Quantity</label>
									<p className="text-sm">{sample.quantity || "Not specified"}</p>
								</div>
							</div>
							<div className="space-y-4">
								<div>
									<label className="text-muted-foreground text-sm font-medium">Status</label>
									<div className="mt-1">
										<Badge className={getStatusColor(sample.status)}>{sample.status}</Badge>
									</div>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Received Date</label>
									<p className="flex items-center text-sm">
										<Calendar className="mr-1 h-4 w-4" />
										{sample.receivedDate ? format(new Date(sample.receivedDate), "PPP") : "Not specified"}
									</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Received From</label>
									<p className="flex items-center text-sm">
										<User className="mr-1 h-4 w-4" />
										{sample.receivedFrom || "Not specified"}
									</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Storage Location</label>
									<p className="flex items-center text-sm">
										<MapPin className="mr-1 h-4 w-4" />
										{sample.storageLocation || "Not specified"}
									</p>
								</div>
							</div>
						</div>

						{sample.condition && (
							<>
								<Separator className="my-4" />
								<div>
									<label className="text-muted-foreground text-sm font-medium">Condition</label>
									<p className="text-sm">{sample.condition}</p>
								</div>
							</>
						)}

						{sample.notes && (
							<>
								<Separator className="my-4" />
								<div>
									<label className="text-muted-foreground text-sm font-medium">Notes</label>
									<p className="text-sm">{sample.notes}</p>
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Tests and Reports */}
				<Tabs
					defaultValue="tests"
					className="w-full">
					<TabsList>
						<TabsTrigger
							value="tests"
							className="flex items-center">
							<TestTube className="mr-2 h-4 w-4" />
							Tests ({tests.length})
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value="tests"
						className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Tests</span>
									<Button
										size="sm"
										onClick={() => router.push(`/test-management/samples/${sampleId}/tests/new`)}>
										<Plus className="mr-2 h-4 w-4" />
										Add Test
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{tests.length === 0 ? (
									<div className="py-8 text-center">
										<TestTube className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
										<p className="text-muted-foreground">No tests found for this sample</p>
										<Button
											className="mt-4"
											onClick={() => router.push(`/test-management/samples/${sampleId}/tests/new`)}>
											<Save className="mr-2 h-4 w-4" />
											Create First Test
										</Button>
									</div>
								) : (
									<div className="space-y-4">
										{tests.map((test) => (
											<div
												key={test.id}
												className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-4"
												onClick={() => router.push(`/test-management/tests/${test.id}`)}>
												<div>
													<h4 className="font-medium">{test.name}</h4>
													<p className="text-muted-foreground text-sm">{test.description}</p>
													<div className="mt-2 flex items-center space-x-2">
														<Badge variant="outline">{test.status}</Badge>
														{test.testSuite && <Badge variant="secondary">{test.testSuite.name}</Badge>}
													</div>
												</div>
												<div className="text-right">
													<p className="text-muted-foreground text-sm">{test.createdAt ? format(new Date(test.createdAt), "MMM dd, yyyy") : ""}</p>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</>
	);
}
