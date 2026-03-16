"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, TestTube } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TEST_STATUS_OPTIONS } from "@/lib/config/module-types";
import { bulkCreateTests, getSamples, getTestOrders, getTestSuites } from "@/lib/features/testing/actions";

// Define TestStatus enum locally to avoid importing from Prisma types
enum TestStatus {
	PENDING = "PENDING",
	IN_PROGRESS = "IN_PROGRESS",
	PASSED = "PASSED",
	FAILED = "FAILED",
	SKIPPED = "SKIPPED",
}

const bulkTestSchema = z.object({
	testOrderId: z.string().min(1, "Test order is required"),
	sampleId: z.string().optional(),
	testSuiteIds: z.array(z.string()).min(1, "At least one test suite must be selected"),
	name: z.string().min(1, "Test name is required"),
	description: z.string().optional(),
	method: z.string().optional(),
	expectedResult: z.string().optional(),
	actualResult: z.string().optional(),
	status: z.nativeEnum(TestStatus),
	performedBy: z.string().optional(),
	notes: z.string().optional(),
});

type BulkTestFormData = z.infer<typeof bulkTestSchema>;

interface BulkTestCreateFormProps {
	testOrderId?: string;
	sampleId?: string;
}

export function BulkTestCreateForm({ testOrderId, sampleId }: BulkTestCreateFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [testOrders, setTestOrders] = useState<any[]>([]);
	const [testSuites, setTestSuites] = useState<any[]>([]);
	const [samples, setSamples] = useState<any[]>([]);
	const [selectedSuites, setSelectedSuites] = useState<string[]>([]);

	const form = useForm<BulkTestFormData>({
		resolver: zodResolver(bulkTestSchema),
		defaultValues: {
			testOrderId: testOrderId || "",
			sampleId: sampleId || "",
			testSuiteIds: [],
			name: "",
			description: "",
			method: "",
			expectedResult: "",
			actualResult: "",
			status: TestStatus.PENDING,
			performedBy: "",
			notes: "",
		},
	});

	const loadTestOrders = async () => {
		try {
			const result = await getTestOrders({}, { take: 100 });
			if (result.success && result.data) {
				setTestOrders(result.data);
			}
		} catch (error) {
			console.error("Failed to load test orders:", error);
		}
	};

	const loadTestSuites = async () => {
		try {
			const result = await getTestSuites({ isActive: true }, { take: 100 });
			if (result.success && result.data) {
				setTestSuites(result.data);
			}
		} catch (error) {
			console.error("Failed to load test suites:", error);
		}
	};

	const loadSamples = async () => {
		try {
			const result = await getSamples({}, { take: 100 });
			if (result.success && result.data) {
				setSamples(result.data);
			}
		} catch (error) {
			console.error("Failed to load samples:", error);
		}
	};

	useEffect(() => {
		loadTestOrders();
		loadTestSuites();
		loadSamples();

		// Set initial values from props
		if (testOrderId) {
			form.setValue("testOrderId", testOrderId);
		}
		if (sampleId) {
			form.setValue("sampleId", sampleId);
		}
	}, [testOrderId, sampleId, form]);

	const handleSuiteToggle = (suiteId: string, checked: boolean) => {
		const newSelected = checked ? [...selectedSuites, suiteId] : selectedSuites.filter((id) => id !== suiteId);

		setSelectedSuites(newSelected);
		form.setValue("testSuiteIds", newSelected);
	};

	const onSubmit = async (data: BulkTestFormData) => {
		try {
			setLoading(true);

			const result = await bulkCreateTests({
				testOrderId: data.testOrderId,
				sampleId: data.sampleId || undefined,
				testSuiteIds: data.testSuiteIds,
				name: data.name,
				description: data.description || undefined,
				method: data.method || undefined,
				expectedResult: data.expectedResult || undefined,
				actualResult: data.actualResult || undefined,
				status: data.status,
				performedBy: data.performedBy || undefined,
				notes: data.notes || undefined,
			});

			if (result.success) {
				toast.success(result.message || `Successfully created ${data.testSuiteIds.length} tests`);
				router.push(`/test-management/${data.testOrderId}`);
			} else {
				toast.error(result.message || "Failed to create tests");
			}
		} catch (error) {
			toast.error("Failed to create tests");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Bulk Create Tests</h1>
					<p className="text-muted-foreground">Create multiple tests for different test suites at once</p>
				</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						type="submit"
						form="bulk-test-form"
						disabled={loading || selectedSuites.length === 0}>
						{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						<Plus className="mr-2 h-4 w-4" />
						Create {selectedSuites.length || 0} Test{selectedSuites.length !== 1 ? "s" : ""}
					</Button>
				</div>
			</div>

			{/* Form */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<TestTube className="mr-2 h-5 w-5" />
						Test Configuration
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6">
							{/* Sample Selection */}
							<FormField
								control={form.control}
								name="sampleId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sample</FormLabel>
										<Select
											onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
											value={field.value || "none"}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a sample (optional)" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="none">No Sample</SelectItem>
												{samples.map((sample) => (
													<SelectItem
														key={sample.id}
														value={sample.id}>
														{sample.name} ({sample.id.slice(-8)})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="testOrderId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Test Order *</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a test order" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{testOrders.map((order) => (
													<SelectItem
														key={order.id}
														value={order.id}>
														{order.title} ({order.id.slice(-8)})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							{/* Test Suites Selection */}
							<FormField
								control={form.control}
								name="testSuiteIds"
								render={() => (
									<FormItem>
										<div className="mb-4">
											<FormLabel className="text-base">Test Suites *</FormLabel>
											<FormDescription>Select one or more test suites to create tests for. Each selected suite will get its own test with the same configuration.</FormDescription>
										</div>
										<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
											{testSuites.map((suite) => (
												<div
													key={suite.id}
													className="flex items-center space-x-2 rounded-lg border p-3">
													<Checkbox
														id={suite.id}
														checked={selectedSuites.includes(suite.id)}
														onCheckedChange={(checked) => handleSuiteToggle(suite.id, checked as boolean)}
													/>
													<div className="flex-1">
														<label
															htmlFor={suite.id}
															className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
															{suite.name}
														</label>
														{suite.description && <p className="text-muted-foreground mt-1 text-xs">{suite.description.length > 50 ? `${suite.description.substring(0, 50)}...` : suite.description}</p>}
													</div>
												</div>
											))}
										</div>
										{selectedSuites.length > 0 && (
											<p className="text-muted-foreground mt-2 text-sm">
												{selectedSuites.length} suite(s) selected - {selectedSuites.length} test(s) will be created
											</p>
										)}
									</FormItem>
								)}
							/>

							{/* Test Details */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Test Details</h3>
								<p className="text-muted-foreground text-sm">These details will be applied to all tests created.</p>

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
												<FormDescription>This name will be used for all tests. You can modify individual tests later.</FormDescription>
											</FormItem>
										)}
									/>

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
								</div>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Enter test description"
													className="min-h-20"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="method"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Test Method</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Enter test method"
													className="min-h-20"
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
														className="min-h-20"
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
														className="min-h-20"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="performedBy"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Performed By</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter performer ID or name"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Notes</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Enter additional notes"
													className="min-h-20"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
