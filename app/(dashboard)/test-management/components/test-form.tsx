"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AsyncSearchSelect } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TestStatus } from "@/generated/prisma/enums";
import { TEST_STATUS_OPTIONS } from "@/lib/config/module-types";
import { createTest, getTestById, updateTest } from "@/lib/features/testing/actions";
import { searchTestOrders, searchTestSuites, searchUsers } from "@/lib/features/testing/actions/search.actions";

const testSchema = z
	.object({
		testOrderId: z.string().optional(),
		sampleId: z.string().optional(),
		testSuiteId: z.string().optional(),
		name: z.string().min(1, "Name is required"),
		description: z.string().optional(),
		method: z.string().optional(),
		expectedResult: z.string().optional(),
		actualResult: z.string().optional(),
		status: z.nativeEnum(TestStatus as any),
		startedAt: z.date().optional(),
		completedAt: z.date().optional(),
		performedBy: z.string().optional(),
		notes: z.string().optional(),
	})
	.refine(
		(data) => {
			// Either testOrderId, sampleId, or testSuiteId must be provided
			// If sampleId or testSuiteId is provided, testOrderId is optional
			// If none are provided, testOrderId is required
			if (data.sampleId?.trim() || data.testSuiteId?.trim()) {
				return true; // sampleId or testSuiteId provided, so testOrderId is optional
			}
			return !!data.testOrderId?.trim(); // testOrderId is required when neither sampleId nor testSuiteId is provided
		},
		{
			message: "Test order is required when not creating for a sample or test suite",
			path: ["testOrderId"], // This will show the error on the testOrderId field
		},
	);

type TestFormData = z.infer<typeof testSchema>;

interface TestFormProps {
	testId?: string;
	testOrderId?: string;
	sampleId?: string;
	testSuiteId?: string;
	hideButtons?: boolean;
	hideHeader?: boolean;
}

export function TestForm({ testId, testOrderId, sampleId, testSuiteId, hideButtons = false, hideHeader = false }: TestFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	// Wrapper functions for AsyncSearchSelect
	const fetchTestOrders = async (query: string) => {
		const result = await searchTestOrders(query);
		return result.success ? result.data : [];
	};

	const fetchTestSuites = async (query: string) => {
		const result = await searchTestSuites(query);
		return result.success ? result.data : [];
	};

	const fetchUsers = async (query: string) => {
		const result = await searchUsers(query);
		return result.success ? result.data : [];
	};

	const form = useForm<TestFormData>({
		resolver: zodResolver(testSchema),
		defaultValues: {
			testOrderId: testOrderId || undefined,
			sampleId: sampleId || "",
			testSuiteId: "",
			name: "",
			description: "",
			method: "",
			expectedResult: "",
			actualResult: "",
			status: TestStatus.PENDING,
			startedAt: undefined,
			completedAt: undefined,
			performedBy: "",
			notes: "",
		},
	});

	const loadTest = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getTestById(testId!);
			if (result.success && result.data) {
				form.reset({
					testOrderId: result.data.testOrderId || undefined,
					sampleId: result.data.sampleId || "",
					testSuiteId: result.data.testSuiteId || "",
					name: result.data.name,
					description: result.data.description || "",
					method: result.data.method || "",
					expectedResult: result.data.expectedResult || "",
					actualResult: result.data.actualResult || "",
					status: result.data.status,
					startedAt: result.data.startedAt ? new Date(result.data.startedAt) : undefined,
					completedAt: result.data.completedAt ? new Date(result.data.completedAt) : undefined,
					performedBy: result.data.performedBy || "",
					notes: result.data.notes || "",
				});
			} else {
				toast.error("Failed to load test");
				router.back();
			}
		} catch (error) {
			toast.error("Failed to load test");
			router.back();
		} finally {
			setLoading(false);
		}
	}, [testId, form, router]);

	useEffect(() => {
		if (testId) {
			loadTest();
		}

		// Set hidden field values
		if (testOrderId) {
			form.setValue("testOrderId", testOrderId);
		}
		if (sampleId) {
			form.setValue("sampleId", sampleId);
		}
		if (testSuiteId) {
			form.setValue("testSuiteId", testSuiteId);
		}
	}, [testId, testOrderId, sampleId, testSuiteId, form, loadTest]);

	const onSubmit = async (data: TestFormData) => {
		try {
			setLoading(true);

			// Clean up the data - convert empty strings to undefined for optional fields
			const cleanedData = {
				...data,
				testOrderId: data.testOrderId || undefined,
				testSuiteId: data.testSuiteId || undefined,
				description: data.description || undefined,
				method: data.method || undefined,
				expectedResult: data.expectedResult || undefined,
				actualResult: data.actualResult || undefined,
				performedBy: data.performedBy || undefined,
				notes: data.notes || undefined,
			};

			// For sample-based tests, remove testOrderId if it's not provided
			if (!testOrderId && !cleanedData.testOrderId) {
				delete (cleanedData as any).testOrderId;
			}

			if (testId) {
				// Update existing test
				const result = await updateTest(testId, cleanedData);
				if (result.success) {
					toast.success("Test updated successfully");
					router.back();
				} else {
					toast.error(result.message || "Failed to update test");
				}
			} else {
				// Create new test
				const result = await createTest(cleanedData);
				if (result.success) {
					toast.success("Test created successfully");
					router.back();
				} else {
					toast.error(result.message || "Failed to create test");
				}
			}
		} catch (error) {
			toast.error("Failed to save test");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			{!hideHeader && (
				<CardHeader>
					<CardTitle>{testId ? "Edit Test" : "Create Test"}</CardTitle>
				</CardHeader>
			)}
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
						data-test-form>
						{/* Hidden fields are set via useEffect */}

						{/* Test Order field - only show if not provided via props */}
						{!testOrderId && (
							<FormField
								control={form.control}
								name="testOrderId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Test Order (optional)</FormLabel>
										<FormControl>
											<AsyncSearchSelect
												value={field.value || ""}
												onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
												fetchOptions={async (query: string) => {
													const testOrders = await fetchTestOrders(query);
													return [{ value: "none", label: "No Test Order", description: "Create test without test order" }, ...testOrders];
												}}
												placeholder="Search and select a test order"
												searchPlaceholder="Search test orders..."
												emptyMessage="No test orders found."
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						)}

						{/* Basic Information */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Test Name *</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter test name"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="testSuiteId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Test Suite</FormLabel>
										<FormControl>
											<AsyncSearchSelect
												value={field.value || ""}
												onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
												fetchOptions={async (query: string) => {
													const testSuites = await fetchTestSuites(query);
													return [{ value: "none", label: "No Suite", description: "Create test without test suite" }, ...testSuites];
												}}
												placeholder="Search and select test suite"
												searchPlaceholder="Search test suites..."
												emptyMessage="No test suites found."
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						{/* Description */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter test description"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Test Method */}
						<FormField
							control={form.control}
							name="method"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Test Method</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter test method"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Expected vs Actual Results */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="expectedResult"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Expected Result</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter expected result"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="actualResult"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Actual Result</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter actual result"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						{/* Status and Performed By */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status *</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{TEST_STATUS_OPTIONS.map((option) => (
													<SelectItem
														key={option.value}
														value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="performedBy"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Performed By</FormLabel>
										<FormControl>
											<AsyncSearchSelect
												value={field.value || ""}
												onValueChange={field.onChange}
												fetchOptions={fetchUsers}
												placeholder="Search and select performer"
												searchPlaceholder="Search users..."
												emptyMessage="No users found."
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						{/* Notes */}
						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter test notes"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Submit Button */}
						{!hideButtons && (
							<div className="flex justify-end space-x-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}>
									<X className="mr-2 h-4 w-4" />
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={loading}>
									{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : testId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
									{testId ? "Update Test" : "Create Test"}
								</Button>
							</div>
						)}

						{hideButtons && (
							<div className="hidden">
								<Button
									type="submit"
									disabled={loading}>
									{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : testId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
									{testId ? "Update Test" : "Create Test"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}>
									<X className="mr-2 h-4 w-4" />
									Cancel
								</Button>
							</div>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
