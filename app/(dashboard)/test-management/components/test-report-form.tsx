"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, FileText, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AsyncSearchSelect } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createTestReport, getTestById, getTestReportById, updateTestReport } from "@/lib/features/testing/actions";
import { searchTestOrders } from "@/lib/features/testing/actions/search.actions";
import { cn } from "@/lib/utils";

const testReportSchema = z.object({
	testOrderId: z.string().min(1, "Test order is required"),
	title: z.string().min(1, "Title is required"),
	summary: z.string().optional(),
	findings: z.string().optional(),
	recommendations: z.string().optional(),
	approvedBy: z.string().optional(),
	approvedAt: z.date().optional(),
});

type TestReportFormData = z.infer<typeof testReportSchema>;

interface TestReportFormProps {
	reportId?: string;
	testOrderId?: string;
	testId?: string;
	hideButtons?: boolean;
	hideHeader?: boolean;
}

export function TestReportForm({ reportId, testOrderId, testId, hideButtons = false, hideHeader = false }: TestReportFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	// Wrapper function for AsyncSearchSelect
	const fetchTestOrders = async (query: string) => {
		const result = await searchTestOrders(query);
		return result.success ? result.data : [];
	};

	const form = useForm<TestReportFormData>({
		resolver: zodResolver(testReportSchema),
		defaultValues: {
			testOrderId: testOrderId || "",
			title: "",
			summary: "",
			findings: "",
			recommendations: "",
			approvedBy: "",
			approvedAt: undefined,
		},
	});
	const loadTest = useCallback(async () => {
		try {
			const result = await getTestById(testId!);
			if (result.success && result.data) {
				form.setValue("testOrderId", result.data.testOrderId || "");
			} else {
				toast.error("Failed to load test");
				router.back();
			}
		} catch (error) {
			toast.error("Failed to load test");
			router.back();
		}
	}, [testId, form, router]);

	const loadReport = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getTestReportById(reportId!);
			if (result.success && result.data) {
				form.reset({
					testOrderId: result.data.testOrderId,
					title: result.data.title,
					summary: result.data.summary || "",
					findings: result.data.findings || "",
					recommendations: result.data.recommendations || "",
					approvedBy: result.data.approvedBy || "",
					approvedAt: result.data.approvedAt ? new Date(result.data.approvedAt) : undefined,
				});
			} else {
				toast.error("Failed to load report");
				router.back();
			}
		} catch (error) {
			toast.error("Failed to load report");
			router.back();
		} finally {
			setLoading(false);
		}
	}, [reportId, form, router]);

	useEffect(() => {
		if (reportId) {
			loadReport();
		} else if (testId) {
			loadTest();
		}
	}, [reportId, testId, loadReport, loadTest]);

	const onSubmit = async (data: TestReportFormData) => {
		try {
			setLoading(true);

			// Ensure testOrderId is set from props if not in form data
			const submitData = {
				...data,
				testOrderId: testOrderId || data.testOrderId,
			};

			if (reportId) {
				// Update existing report
				const result = await updateTestReport(reportId, submitData);
				if (result.success) {
					toast.success("Report updated successfully");
					router.back();
				} else {
					toast.error(result.message || "Failed to update report");
				}
			} else {
				// Create new report
				const result = await createTestReport(submitData);
				if (result.success) {
					toast.success("Report created successfully");
					router.back();
				} else {
					toast.error(result.message || "Failed to create report");
				}
			}
		} catch (error) {
			toast.error("Failed to save report");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			{!hideHeader && (
				<CardHeader>
					<CardTitle className="flex items-center">
						<FileText className="mr-2 h-5 w-5" />
						{reportId ? "Edit Test Report" : "Create Test Report"}
					</CardTitle>
				</CardHeader>
			)}
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
						data-test-report-form>
						{/* Hidden fields */}
						{testOrderId && (
							<input
								type="hidden"
								{...form.register("testOrderId")}
								value={testOrderId}
							/>
						)}

						{/* Basic Information */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Report Title *</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter report title"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Test Order Selection - only show if not provided via props */}
							{!testOrderId && (
								<FormField
									control={form.control}
									name="testOrderId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Test Order *</FormLabel>
											<FormControl>
												<AsyncSearchSelect
													value={field.value}
													onValueChange={field.onChange}
													fetchOptions={fetchTestOrders}
													placeholder="Search and select a test order"
													searchPlaceholder="Search test orders..."
													emptyMessage="No test orders found."
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							)}
						</div>

						{/* Summary */}
						<FormField
							control={form.control}
							name="summary"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Executive Summary</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter executive summary of the test results"
											className="min-h-20"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Findings */}
						<FormField
							control={form.control}
							name="findings"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Test Findings</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter detailed test findings"
											className="min-h-32"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Recommendations */}
						<FormField
							control={form.control}
							name="recommendations"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Recommendations</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter recommendations based on findings"
											className="min-h-24"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Approval Date */}
						<FormField
							control={form.control}
							name="approvedAt"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Approval Date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
													{field.value ? format(field.value, "PPP") : <span>Pick approval date</span>}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0"
											align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												disabled={(date) => date > new Date()}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
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
									{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
									{reportId ? "Update Report" : "Create Report"}
								</Button>
							</div>
						)}

						{hideButtons && (
							<Button
								type="submit"
								className="hidden"
								disabled={loading}>
								{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
								{reportId ? "Update Report" : "Create Report"}
							</Button>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
