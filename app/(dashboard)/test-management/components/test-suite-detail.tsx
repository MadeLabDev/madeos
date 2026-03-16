"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { ArrowLeft, CheckCircle, Clock, Eye, Pencil, Plus, TestTube, Trash2, User, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { deleteTestSuite, getTestSuiteById } from "@/lib/features/testing/actions";
import { getUsersAction } from "@/lib/features/users/actions";

interface TestSuiteDetailProps {
	suiteId: string;
}

export function TestSuiteDetail({ suiteId }: TestSuiteDetailProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [suite, setSuite] = useState<any>(null);
	const [users, setUsers] = useState<any[]>([]);
	const loadSuite = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getTestSuiteById(suiteId);
			if (result.success && result.data) {
				setSuite(result.data);
			} else {
				toast.error("Failed to load test suite");
				router.back();
			}
		} catch (error) {
			toast.error("Failed to load test suite");
			router.back();
		} finally {
			setLoading(false);
		}
	}, [suiteId, router]);

	useEffect(() => {
		loadSuite();
		loadUsers();
	}, [suiteId, loadSuite]);

	const loadUsers = async () => {
		try {
			const result = await getUsersAction({ pageSize: 100 });
			if (result.success && result.data) {
				setUsers((result.data as any).users || []);
			}
		} catch (error) {
			console.error("Failed to load users:", error);
		}
	};

	const handleDelete = async () => {
		try {
			const result = await deleteTestSuite(suiteId);
			if (result.success) {
				toast.success("Test suite deleted successfully");
				router.back();
			} else {
				toast.error(result.message || "Failed to delete test suite");
			}
		} catch (error) {
			toast.error("Failed to delete test suite");
		}
	};

	const getUserName = (userId: string) => {
		const user = users.find((u) => u.id === userId);
		return user ? user.name : "Unknown User";
	};

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader size="lg" />
			</div>
		);
	}

	if (!suite) {
		return (
			<div className="py-8 text-center">
				<TestTube className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
				<h3 className="text-lg font-medium">Test suite not found</h3>
				<p className="text-muted-foreground">The test suite you're looking for doesn't exist.</p>
				<Button
					onClick={() => router.back()}
					className="mt-4">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<>
			<SetBreadcrumb
				segment={suiteId}
				label={suite.name}
			/>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.back()}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
						<div>
							<h1 className="text-2xl font-bold">{suite.name}</h1>
							<div className="mt-1 flex items-center space-x-2">
								{suite.isActive ? (
									<Badge
										variant="default"
										className="bg-green-500">
										<CheckCircle className="mr-1 h-3 w-3" />
										Active
									</Badge>
								) : (
									<Badge variant="secondary">
										<XCircle className="mr-1 h-3 w-3" />
										Inactive
									</Badge>
								)}
								{suite.category && <Badge variant="outline">{suite.category}</Badge>}
								{suite.version && <span className="text-muted-foreground text-sm">v{suite.version}</span>}
							</div>
						</div>
					</div>
					<div className="flex space-x-2">
						<Button
							variant="outline"
							onClick={() => router.push(`/test-management/suites/${suiteId}/edit`)}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</Button>
						<Button onClick={() => router.push(`/test-management/suites/${suiteId}/tests/new`)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Test
						</Button>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Test Suite</AlertDialogTitle>
									<AlertDialogDescription>Are you sure you want to delete this test suite? This action cannot be undone and will affect all associated tests.</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDelete}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>

				{/* Suite Details */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Main Content */}
					<div className="space-y-6 lg:col-span-2">
						{/* Description */}
						{suite.description && (
							<Card>
								<CardHeader>
									<CardTitle>Description</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-relaxed">{suite.description}</p>
								</CardContent>
							</Card>
						)}

						{/* Prerequisites */}
						{suite.prerequisites && (
							<Card>
								<CardHeader>
									<CardTitle>Prerequisites</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="prose prose-sm max-w-none">
										<p className="whitespace-pre-wrap">{suite.prerequisites}</p>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Setup Instructions */}
						{suite.setupInstructions && (
							<Card>
								<CardHeader>
									<CardTitle>Setup Instructions</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="prose prose-sm max-w-none">
										<p className="whitespace-pre-wrap">{suite.setupInstructions}</p>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Cleanup Instructions */}
						{suite.cleanupInstructions && (
							<Card>
								<CardHeader>
									<CardTitle>Cleanup Instructions</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="prose prose-sm max-w-none">
										<p className="whitespace-pre-wrap">{suite.cleanupInstructions}</p>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Associated Tests */}
						<Card>
							<CardHeader>
								<CardTitle>Associated Tests</CardTitle>
							</CardHeader>
							<CardContent>
								{suite.tests && suite.tests.length > 0 ? (
									<div className="space-y-3">
										{suite.tests.map((test: any) => (
											<div
												key={test.id}
												className="flex items-center justify-between rounded-lg border p-3">
												<div>
													<p className="font-medium">{test.name}</p>
													<p className="text-muted-foreground text-sm">{test.description}</p>
												</div>
												<Button
													variant="outline"
													size="sm"
													onClick={() => router.push(`/test-management/tests/${test.id}`)}>
													<Eye className="mr-2 h-4 w-4" />
													View Test
												</Button>
											</div>
										))}
									</div>
								) : (
									<div className="py-4 text-center">
										<p className="text-muted-foreground">No tests associated with this suite yet.</p>
										<Button
											variant="outline"
											size="sm"
											className="mt-2"
											onClick={() => router.push(`/test-management/suites/${suiteId}/tests/new`)}>
											<Plus className="mr-2 h-4 w-4" />
											Add First Test
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Suite Information */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Suite Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center space-x-2">
									<Clock className="text-muted-foreground h-4 w-4" />
									<div>
										<p className="text-sm font-medium">Estimated Duration</p>
										<p className="text-muted-foreground text-sm">{suite.estimatedDuration ? `${suite.estimatedDuration} minutes` : "Not specified"}</p>
									</div>
								</div>

								{suite.createdAt && (
									<div>
										<p className="text-sm font-medium">Created</p>
										<p className="text-muted-foreground text-sm">{format(new Date(suite.createdAt), "PPP")}</p>
									</div>
								)}

								{suite.updatedAt && (
									<div>
										<p className="text-sm font-medium">Last Modified</p>
										<p className="text-muted-foreground text-sm">{format(new Date(suite.updatedAt), "PPP")}</p>
									</div>
								)}

								<Separator />

								{/* Personnel */}
								{suite.createdBy && (
									<div className="flex items-center space-x-2">
										<User className="text-muted-foreground h-4 w-4" />
										<div>
											<p className="text-sm font-medium">Created By</p>
											<p className="text-muted-foreground text-sm">{getUserName(suite.createdBy)}</p>
										</div>
									</div>
								)}

								{suite.lastModifiedBy && (
									<div className="flex items-center space-x-2">
										<User className="text-muted-foreground h-4 w-4" />
										<div>
											<p className="text-sm font-medium">Last Modified By</p>
											<p className="text-muted-foreground text-sm">{getUserName(suite.lastModifiedBy)}</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Statistics */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Statistics</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4 text-center">
									<div>
										<p className="text-primary text-2xl font-bold">{suite.tests?.length || 0}</p>
										<p className="text-muted-foreground text-sm">Tests</p>
									</div>
									<div>
										<p className="text-2xl font-bold text-green-500">{suite.tests?.filter((t: any) => t.status === "PASSED").length || 0}</p>
										<p className="text-muted-foreground text-sm">Passed</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}
