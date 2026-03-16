"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, TestTube, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTestSuite, getTestSuiteById, updateTestSuite } from "@/lib/features/testing/actions";

const testSuiteSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	category: z.string().optional(),
	estimatedHours: z.number().min(0).optional(),
	metaData: z.any().optional(),
});

type TestSuiteFormData = z.infer<typeof testSuiteSchema>;

interface TestSuiteFormProps {
	suiteId?: string;
	hideButtons?: boolean;
	hideHeader?: boolean;
}

export function TestSuiteForm({ suiteId, hideButtons = false, hideHeader = false }: TestSuiteFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const form = useForm<TestSuiteFormData>({
		resolver: zodResolver(testSuiteSchema),
		defaultValues: {
			name: "",
			description: "",
			category: "",
			estimatedHours: 0,
			metaData: {},
		},
	});

	const loadSuite = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getTestSuiteById(suiteId!);
			if (result.success && result.data) {
				form.reset({
					name: result.data.name,
					description: result.data.description || "",
					category: result.data.category || "",
					estimatedHours: result.data.estimatedHours || 0,
					metaData: result.data.metaData || {},
				});
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
	}, [suiteId, form, router]);

	useEffect(() => {
		if (suiteId) {
			loadSuite();
		}
	}, [suiteId, loadSuite]);

	const onSubmit = async (data: TestSuiteFormData) => {
		try {
			setLoading(true);

			if (suiteId) {
				// Update existing suite
				const result = await updateTestSuite(suiteId, data);
				if (result.success) {
					toast.success("Test suite updated successfully");
					router.back();
				} else {
					toast.error(result.message || "Failed to update test suite");
				}
			} else {
				// Create new suite
				const result = await createTestSuite(data);
				if (result.success) {
					toast.success("Test suite created successfully");
					router.back();
				} else {
					toast.error(result.message || "Failed to create test suite");
				}
			}
		} catch (error) {
			toast.error("Failed to save test suite");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			{!hideHeader && (
				<CardHeader>
					<CardTitle className="flex items-center">
						<TestTube className="mr-2 h-5 w-5" />
						{suiteId ? "Edit Test Suite" : "Create Test Suite"}
					</CardTitle>
				</CardHeader>
			)}
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
						data-test-suite-form>
						{/* Basic Information */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Test Suite Name *</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter test suite name"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., Performance, Functional, Security"
												{...field}
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
											placeholder="Describe what this test suite covers"
											className="min-h-20"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Estimated Hours */}
						<FormField
							control={form.control}
							name="estimatedHours"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Estimated Hours</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="Estimated time to complete this test suite"
											{...field}
											onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
											value={field.value || ""}
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
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{suiteId ? "Update Suite" : "Create Suite"}
								</Button>
							</div>
						)}

						{hideButtons && (
							<div className="hidden">
								<Button
									type="submit"
									disabled={loading}>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{suiteId ? "Update Suite" : "Create Suite"}
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
