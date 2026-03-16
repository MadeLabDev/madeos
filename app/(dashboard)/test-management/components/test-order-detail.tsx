"use client";

import { useCallback, useEffect, useState } from "react";

import { ArrowLeft, Eye, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteTestOrder, getTestOrderById } from "@/lib/features/testing/actions";
import { assignTestSuiteToOrder, getTestSuites, removeTestSuiteFromOrder } from "@/lib/features/testing/actions";
import { TestOrderWithRelations } from "@/lib/features/testing/types";
import { formatDate } from "@/lib/utils";

import { SectionHeader } from "./section-header";

interface TestOrderDetailProps {
	testOrderId: string;
}

export function TestOrderDetail({ testOrderId }: TestOrderDetailProps) {
	const router = useRouter();
	const [testOrder, setTestOrder] = useState<TestOrderWithRelations | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [availableSuites, setAvailableSuites] = useState<any[]>([]);
	const [assigningSuite, setAssigningSuite] = useState(false);
	const loadTestOrder = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getTestOrderById(testOrderId);
			if (result.success && result.data) {
				setTestOrder(result.data);
			} else {
				toast.error("Failed to load test order");
				router.push("/testing");
			}
		} catch (error) {
			toast.error("Failed to load test order");
			router.push("/testing");
		} finally {
			setLoading(false);
		}
	}, [testOrderId, router]);

	const loadAvailableSuites = async () => {
		try {
			const result = await getTestSuites({ isActive: true }, { take: 100 });
			if (result.success && result.data) {
				setAvailableSuites(result.data);
			}
		} catch (error) {
			console.error("Failed to load test suites:", error);
		}
	};

	const handleAssignSuite = async (suiteId: string) => {
		if (!testOrder) return;

		setAssigningSuite(true);
		try {
			const result = await assignTestSuiteToOrder({
				testOrderId: testOrder.id,
				testSuiteId: suiteId,
			});

			if (result.success) {
				toast.success("Test suite assigned successfully");
				loadTestOrder(); // Reload to show updated suites
			} else {
				toast.error(result.message || "Failed to assign test suite");
			}
		} catch (error) {
			toast.error("Failed to assign test suite");
		} finally {
			setAssigningSuite(false);
		}
	};

	useEffect(() => {
		loadTestOrder();
		loadAvailableSuites();
	}, [testOrderId, loadTestOrder]);

	const handleRemoveSuite = async (suiteId: string) => {
		if (!testOrder) return;

		try {
			const result = await removeTestSuiteFromOrder(testOrder.id, suiteId);

			if (result.success) {
				toast.success("Test suite removed successfully");
				loadTestOrder(); // Reload to show updated suites
			} else {
				toast.error(result.message || "Failed to remove test suite");
			}
		} catch (error) {
			toast.error("Failed to remove test suite");
		}
	};

	const handleDelete = async () => {
		if (!testOrder) return;

		setDeleting(true);
		try {
			const result = await deleteTestOrder(testOrder.id);
			if (result.success) {
				toast.success("Test order deleted successfully");
				router.push("/testing");
			} else {
				toast.error(result.message || "Failed to delete test order");
			}
		} catch (error) {
			toast.error("Failed to delete test order");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "DRAFT":
				return "secondary";
			case "ACTIVE":
				return "default";
			case "COMPLETED":
				return "default";
			case "CANCELLED":
				return "destructive";
			default:
				return "secondary";
		}
	};

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader size="lg" />
			</div>
		);
	}

	if (!testOrder) {
		return (
			<div className="py-12 text-center">
				<h2 className="mb-2 text-xl font-semibold">Test Order Not Found</h2>
				<p className="text-muted-foreground mb-4">The test order you're looking for doesn't exist.</p>
				<Button onClick={() => router.push("/testing")}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Testing
				</Button>
			</div>
		);
	}

	return (
		<>
			<SetBreadcrumb
				segment={testOrderId}
				label={testOrder.title}
			/>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-2xl font-bold">{testOrder.title}</h1>
						<p className="text-muted-foreground">{testOrder.description}</p>
						<div className="mt-2 flex items-center gap-2">
							<Badge variant={getStatusColor(testOrder.status)}>{testOrder.status}</Badge>
							<Badge variant="outline">{testOrder.priority}</Badge>
						</div>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="icon">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem asChild>
								<Link href={`/test-management/${testOrder.id}/edit`}>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => setDeleteDialogOpen(true)}
								className="text-destructive focus:text-destructive">
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Details Cards */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium">Engagement</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">{testOrder.engagement?.title || "No engagement linked"}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium">Timeline</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-1">
								<p className="text-sm">
									<span className="font-medium">Start:</span> {testOrder.startDate ? formatDate(testOrder.startDate) : "Not set"}
								</p>
								<p className="text-sm">
									<span className="font-medium">Due:</span> {testOrder.dueDate ? formatDate(testOrder.dueDate) : "Not set"}
								</p>
								{testOrder.completedAt && (
									<p className="text-sm">
										<span className="font-medium">Completed:</span> {formatDate(testOrder.completedAt)}
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium">Budget</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm">{testOrder.budget ? `$${testOrder.budget.toLocaleString()}` : "Not set"}</p>
						</CardContent>
					</Card>
				</div>

				{/* Tabs for different sections */}
				<Tabs
					defaultValue="overview"
					className="space-y-6">
					<TabsList>
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="interactions">Interactions</TabsTrigger>
						<TabsTrigger value="suites">Test Suites</TabsTrigger>
						<TabsTrigger value="samples">Samples</TabsTrigger>
						<TabsTrigger value="tests">Tests</TabsTrigger>
						<TabsTrigger value="reports">Reports</TabsTrigger>
					</TabsList>

					<TabsContent
						value="overview"
						className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Notes</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm">{testOrder.notes || "No notes available."}</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent
						value="interactions"
						className="space-y-6">
						<SectionHeader title="Interactions">
							<Button
								size="sm"
								onClick={() => router.push(`/interactions/new?testOrderId=${testOrder.id}`)}>
								<Plus className="mr-2 h-4 w-4" />
								Add Interaction
							</Button>
						</SectionHeader>
						<Card>
							<CardContent className="pt-6">
								{testOrder.interactions && testOrder.interactions.length > 0 ? (
									<div className="space-y-3">
										{testOrder.interactions.map((interaction: any) => (
											<div
												key={interaction.id}
												className="flex items-center justify-between rounded-lg border p-4">
												<div className="flex-1">
													<h4 className="font-medium">{interaction.subject}</h4>
													{interaction.description && <p className="text-muted-foreground mt-1 text-sm">{interaction.description.length > 100 ? `${interaction.description.substring(0, 100)}...` : interaction.description}</p>}
													<div className="mt-2 flex items-center gap-2">
														<Badge
															variant="outline"
															className="text-xs">
															{interaction.type}
														</Badge>
														<span className="text-muted-foreground text-xs">{formatDate(interaction.date)}</span>
														{interaction.duration && <span className="text-muted-foreground text-xs">{interaction.duration} min</span>}
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => router.push(`/interactions/${interaction.id}`)}>
														<Eye className="mr-2 h-4 w-4" />
														View
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-muted-foreground py-8 text-center text-sm">No interactions logged yet.</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent
						value="suites"
						className="space-y-6">
						<SectionHeader title="Test Suites">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										size="sm"
										disabled={assigningSuite}>
										<Plus className="mr-2 h-4 w-4" />
										Assign Suite
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-64">
									<DropdownMenuLabel>Available Test Suites</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{availableSuites
										.filter((suite) => !testOrder.testSuites?.some((ts) => ts.testSuiteId === suite.id))
										.map((suite) => (
											<DropdownMenuItem
												key={suite.id}
												onClick={() => handleAssignSuite(suite.id)}
												disabled={assigningSuite}>
												<div className="flex flex-col">
													<span className="font-medium">{suite.name}</span>
													{suite.description && <span className="text-muted-foreground text-xs">{suite.description}</span>}
												</div>
											</DropdownMenuItem>
										))}
									{availableSuites.filter((suite) => !testOrder.testSuites?.some((ts) => ts.testSuiteId === suite.id)).length === 0 && <DropdownMenuItem disabled>No available test suites</DropdownMenuItem>}
								</DropdownMenuContent>
							</DropdownMenu>
						</SectionHeader>
						<Card>
							<CardContent className="pt-6">
								{testOrder.testSuites && testOrder.testSuites.length > 0 ? (
									<div className="space-y-3">
										{testOrder.testSuites.map((suiteOnOrder) => (
											<div
												key={suiteOnOrder.id}
												className="flex items-center justify-between rounded-lg border p-4">
												<div className="flex-1">
													<h4 className="font-medium">{suiteOnOrder.testSuite.name}</h4>
													{suiteOnOrder.testSuite.description && <p className="text-muted-foreground mt-1 text-sm">{suiteOnOrder.testSuite.description}</p>}
													<div className="mt-2 flex items-center gap-2">
														{suiteOnOrder.testSuite.isActive ? (
															<Badge
																variant="default"
																className="text-xs">
																Active
															</Badge>
														) : (
															<Badge
																variant="secondary"
																className="text-xs">
																Inactive
															</Badge>
														)}
														{suiteOnOrder.testSuite.category && (
															<Badge
																variant="outline"
																className="text-xs">
																{suiteOnOrder.testSuite.category}
															</Badge>
														)}
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => router.push(`/test-management/suites/${suiteOnOrder.testSuiteId}`)}>
														<Eye className="mr-2 h-4 w-4" />
														View Suite
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleRemoveSuite(suiteOnOrder.testSuiteId)}>
														<X className="mr-2 h-4 w-4" />
														Remove
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-muted-foreground py-8 text-center text-sm">No test suites assigned yet.</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent
						value="samples"
						className="space-y-6">
						<SectionHeader title="Samples">
							<Button
								size="sm"
								onClick={() => router.push(`/test-management/samples/new?testOrderId=${testOrder.id}`)}>
								<Plus className="mr-2 h-4 w-4" />
								Add Sample
							</Button>
						</SectionHeader>
						<Card>
							<CardContent className="pt-6">
								{testOrder.samples && testOrder.samples.length > 0 ? (
									<div className="space-y-3">
										{testOrder.samples.map((sample) => (
											<div
												key={sample.id}
												className="flex items-center justify-between rounded-lg border p-4">
												<div className="flex-1">
													<h4 className="font-medium">{sample.name}</h4>
													{sample.description && <p className="text-muted-foreground mt-1 text-sm">{sample.description}</p>}
													<div className="mt-2 flex items-center gap-2">
														<Badge
															variant="outline"
															className="text-xs">
															{sample.type}
														</Badge>
														<Badge
															variant={sample.status === "RECEIVED" ? "default" : "secondary"}
															className="text-xs">
															{sample.status}
														</Badge>
														{sample.quantity && <span className="text-muted-foreground text-xs">Qty: {sample.quantity}</span>}
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => router.push(`/test-management/samples/${sample.id}`)}>
														<Eye className="mr-2 h-4 w-4" />
														View Sample
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-muted-foreground py-8 text-center text-sm">No samples added yet.</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent
						value="tests"
						className="space-y-6">
						<SectionHeader title="Tests">
							<div className="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => router.push(`/test-management/tests/bulk-create?testOrderId=${testOrder.id}`)}>
									<Plus className="mr-2 h-4 w-4" />
									Bulk Create Tests
								</Button>
								<Button
									size="sm"
									onClick={() => router.push(`/test-management/tests/new?testOrderId=${testOrder.id}`)}>
									<Plus className="mr-2 h-4 w-4" />
									Add Test
								</Button>
							</div>
						</SectionHeader>
						<Card>
							<CardContent className="pt-6">
								{testOrder.tests && testOrder.tests.length > 0 ? (
									<div className="space-y-3">
										{testOrder.tests.map((test) => (
											<div
												key={test.id}
												className="flex items-center justify-between rounded-lg border p-4">
												<div className="flex-1">
													<h4 className="font-medium">{test.name}</h4>
													{test.description && <p className="text-muted-foreground mt-1 text-sm">{test.description}</p>}
													<div className="mt-2 flex items-center gap-2">
														<Badge
															variant={test.status === "COMPLETED" ? "default" : test.status === "FAILED" ? "destructive" : test.status === "IN_PROGRESS" ? "secondary" : "outline"}
															className="text-xs">
															{test.status}
														</Badge>
														{test.testSuiteId && (
															<Badge
																variant="outline"
																className="text-xs">
																Has Test Suite
															</Badge>
														)}
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => router.push(`/test-management/tests/${test.id}`)}>
														<Eye className="mr-2 h-4 w-4" />
														View Test
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-muted-foreground py-8 text-center text-sm">No tests added yet.</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent
						value="reports"
						className="space-y-6">
						<SectionHeader title="Reports">
							<Button
								size="sm"
								onClick={() => router.push(`/test-management/reports/new?testOrderId=${testOrder.id}`)}>
								<Plus className="mr-2 h-4 w-4" />
								Generate Report
							</Button>
						</SectionHeader>
						<Card>
							<CardContent className="pt-6">
								{testOrder.reports && testOrder.reports.length > 0 ? (
									<div className="space-y-3">
										{testOrder.reports.map((report) => (
											<div
												key={report.id}
												className="flex items-center justify-between rounded-lg border p-4">
												<div className="flex-1">
													<h4 className="font-medium">{report.title}</h4>
													{report.summary && <p className="text-muted-foreground mt-1 text-sm">{report.summary.length > 100 ? `${report.summary.substring(0, 100)}...` : report.summary}</p>}
													<div className="mt-2 flex items-center gap-2">
														<Badge
															variant={report.status === "PUBLISHED" ? "default" : report.status === "DRAFT" ? "secondary" : "outline"}
															className="text-xs">
															{report.status}
														</Badge>
														{report.version && <span className="text-muted-foreground text-xs">v{report.version}</span>}
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => router.push(`/test-management/reports/${report.id}`)}>
														<Eye className="mr-2 h-4 w-4" />
														View Report
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-muted-foreground py-8 text-center text-sm">No reports generated yet.</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<DeleteDialog
					open={deleteDialogOpen}
					onOpenChange={setDeleteDialogOpen}
					title="Delete Test Order"
					description={`Are you sure you want to delete "${testOrder.title}"? This action cannot be undone.`}
					onConfirm={handleDelete}
					isDeleting={deleting}
				/>
			</div>
		</>
	);
}
