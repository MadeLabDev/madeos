"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, Save, X } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SampleType } from "@/generated/prisma/enums";
import { createSample, getSampleById, updateSample } from "@/lib/features/testing/actions";
import { searchTestOrders } from "@/lib/features/testing/actions/search.actions";
import { cn } from "@/lib/utils";

const sampleSchema = z.object({
	testOrderId: z.string().min(1, "Test order is required"),
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	type: z.nativeEnum(SampleType as any).optional(),
	quantity: z.number().optional(),
	receivedDate: z.date().optional(),
	receivedFrom: z.string().optional(),
	storageLocation: z.string().optional(),
	condition: z.string().optional(),
	notes: z.string().optional(),
});

type SampleFormData = z.infer<typeof sampleSchema>;

interface SampleFormProps {
	sampleId?: string;
	testOrderId?: string;
	hideButtons?: boolean;
	hideHeader?: boolean;
}

export function SampleForm({ sampleId, testOrderId, hideButtons = false, hideHeader = false }: SampleFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	// Wrapper function for AsyncSearchSelect
	const fetchTestOrders = async (query: string) => {
		const result = await searchTestOrders(query);
		return result.success ? result.data : [];
	};

	const form = useForm<SampleFormData>({
		resolver: zodResolver(sampleSchema),
		defaultValues: {
			testOrderId: testOrderId || "",
			name: "",
			description: "",
			type: undefined,
			quantity: undefined,
			receivedDate: undefined,
			receivedFrom: "",
			storageLocation: "",
			condition: "",
			notes: "",
		},
	});

	const loadSample = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getSampleById(sampleId!);
			if (result.success && result.data) {
				form.reset({
					testOrderId: result.data.testOrderId,
					name: result.data.name,
					description: result.data.description || "",
					type: result.data.type || undefined,
					quantity: result.data.quantity || undefined,
					receivedDate: result.data.receivedDate ? new Date(result.data.receivedDate) : undefined,
					receivedFrom: result.data.receivedFrom || "",
					storageLocation: result.data.storageLocation || "",
					condition: result.data.condition || "",
					notes: result.data.notes || "",
				});
			} else {
				toast.error("Failed to load sample");
				router.back();
			}
		} catch (error) {
			toast.error("Failed to load sample");
			router.back();
		} finally {
			setLoading(false);
		}
	}, [sampleId, form, router]);

	useEffect(() => {
		if (sampleId) {
			loadSample();
		}
	}, [sampleId, loadSample]);

	const onSubmit = async (data: SampleFormData) => {
		try {
			setLoading(true);

			if (sampleId) {
				// Update existing sample
				const result = await updateSample(sampleId, data);
				if (result.success) {
					toast.success("Sample updated successfully");
					router.back();
				} else {
					toast.error(result.message || "Failed to update sample");
				}
			} else {
				// Create new sample
				const result = await createSample(data);
				if (result.success) {
					toast.success("Sample created successfully");
					router.back();
				} else {
					toast.error(result.message || "Failed to create sample");
				}
			}
		} catch (error) {
			toast.error("Failed to save sample");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			{!hideHeader && (
				<CardHeader>
					<CardTitle>{sampleId ? "Edit Sample" : "Create Sample"}</CardTitle>
				</CardHeader>
			)}
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
						data-sample-form>
						{/* Test Order ID (hidden if provided) */}
						{testOrderId && (
							<input
								type="hidden"
								{...form.register("testOrderId")}
								value={testOrderId}
							/>
						)}

						{/* Test Order Selection (only for new samples without pre-selected test order) */}
						{!sampleId && !testOrderId && (
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

						{/* Name */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sample Name *</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter sample name"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Description */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter sample description"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Type and Quantity */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sample Type</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="PHYSICAL">Physical</SelectItem>
												<SelectItem value="DIGITAL">Digital</SelectItem>
												<SelectItem value="SOFTWARE">Software</SelectItem>
												<SelectItem value="DOCUMENTATION">Documentation</SelectItem>
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="quantity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Quantity</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="Enter quantity"
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						{/* Received Date */}
						<FormField
							control={form.control}
							name="receivedDate"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Received Date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
													{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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

						{/* Received From and Storage Location */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="receivedFrom"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Received From</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter source"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="storageLocation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Storage Location</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter storage location"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						{/* Condition */}
						<FormField
							control={form.control}
							name="condition"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Condition</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter sample condition"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Notes */}
						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter additional notes"
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
									{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : sampleId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
									{sampleId ? "Update Sample" : "Create Sample"}
								</Button>
							</div>
						)}

						{hideButtons && (
							<div className="hidden">
								<Button
									type="submit"
									disabled={loading}>
									{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : sampleId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
									{sampleId ? "Update Sample" : "Create Sample"}
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
