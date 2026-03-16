"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ModuleFormField } from "@/components/module-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CustomerFormProps } from "@/lib/features/customers/types";
import type { FieldDefinition } from "@/lib/features/profile/types";

import { ParentCompanySearch } from "./parent-company-search";

const customerFormSchema = z.object({
	companyName: z.string().min(1, "Company name is required"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().optional(),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	zipCode: z.string().min(1, "Zip code is required"),
	taxId: z.string().optional(),
	website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
	parentId: z.string().optional(),
	contactName: z.string().min(1, "Contact name is required"),
	contactTitle: z.string().optional(),
	contactEmail: z.string().email("Please enter a valid contact email").optional().or(z.literal("")),
	contactPhone: z.string().optional(),
	discountPercent: z.number().min(0).max(100).optional(),
	paymentTermsDays: z.number().min(0).optional(),
	creditLimit: z.number().min(0).optional(),
	notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

type GroupedModuleFields = {
	moduleType: any;
	fields: FieldDefinition[];
};

export function CustomerForm({ customer, parentCustomers = [], onSubmit, onCancel, hideButtons = false, moduleTypes }: CustomerFormProps) {
	const [loading, setLoading] = useState(false);
	const [groupedMetaFields, setGroupedMetaFields] = useState<GroupedModuleFields[]>([]);
	const [activeMetaTab, setActiveMetaTab] = useState<string>("");

	const form = useForm<CustomerFormData>({
		resolver: zodResolver(customerFormSchema),
		defaultValues: {
			companyName: customer?.companyName || "",
			email: customer?.email || "",
			phone: customer?.phone || "",
			address: customer?.address || "",
			city: customer?.city || "",
			state: customer?.state || "",
			zipCode: customer?.zipCode || "",
			taxId: customer?.taxId || "",
			website: customer?.website || "",
			parentId: customer?.parentId || "",
			contactName: customer?.contactName || "",
			contactTitle: customer?.contactTitle || "",
			contactEmail: customer?.contactEmail || "",
			contactPhone: customer?.contactPhone || "",
			discountPercent: customer?.discountPercent || 0,
			paymentTermsDays: customer?.paymentTermsDays || 30,
			creditLimit: customer?.creditLimit || 0,
		},
	});

	const { control, setValue, watch, reset } = form;
	const formValues = watch();

	// Extract dynamic fields from moduleTypes
	useEffect(() => {
		if (moduleTypes && moduleTypes.length > 0) {
			// Sort module types by order first
			const sortedModuleTypes = [...moduleTypes].sort((a, b) => (a.order || 0) - (b.order || 0));

			const groupedFields: GroupedModuleFields[] = [];

			// Process all module types in order
			for (const moduleType of sortedModuleTypes) {
				if (moduleType.fieldSchema && "fields" in moduleType.fieldSchema) {
					// Normalize field orders for fields
					let fieldsWithOrder = (moduleType.fieldSchema.fields as any[]).map((field, idx) => {
						if (!field.order || field.order <= 0) {
							return { ...field, order: idx + 1 };
						}
						return field;
					});

					const fields = fieldsWithOrder.sort((a, b) => (a.order || 0) - (b.order || 0));

					// Add to grouped fields
					groupedFields.push({
						moduleType,
						fields,
					});
				}
			}

			setGroupedMetaFields(groupedFields);

			// Set first tab as active if available
			if (groupedFields.length > 0 && groupedFields[0]?.moduleType?.id && !activeMetaTab) {
				setActiveMetaTab(groupedFields[0].moduleType.id);
			}

			// Set default values for dynamic fields
			const existingMetaData = typeof customer?.metaData === "object" && customer?.metaData && !Array.isArray(customer.metaData) ? (customer.metaData as Record<string, any>) : {};
			const defaultValues: Record<string, any> = {};

			// Collect all fields from grouped fields
			const allFields = groupedFields.flatMap((group) => group.fields);

			allFields.forEach((field) => {
				const currentValue = existingMetaData[field.name];
				if (currentValue !== undefined && currentValue !== null) {
					defaultValues[field.name] = currentValue;
				} else {
					if (["tags", "multiselect", "checkbox"].includes(field.type)) {
						defaultValues[field.name] = [];
					} else if (["file", "image"].includes(field.type)) {
						defaultValues[field.name] = null;
					} else {
						defaultValues[field.name] = "";
					}
				}
			});

			reset(defaultValues, { keepValues: false });
		}
	}, [moduleTypes, customer?.metaData, reset, activeMetaTab]);

	const handleParentCompanySelect = useCallback(
		(customerId: string | null) => {
			setValue("parentId", customerId || "");
		},
		[setValue],
	);

	const onFormSubmit = async (data: CustomerFormData) => {
		setLoading(true);
		try {
			const submitData = {
				...data,
				metaData: { ...((customer?.metaData as Record<string, any>) || {}), ...formValues }, // Merge existing metaData with dynamic fields
			};
			await onSubmit(submitData);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onFormSubmit)}
				className="space-y-6"
				data-customer-form>
				<div className="grid grid-cols-2 gap-6">
					<Card>
						<CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							{/* Company Name */}
							<FormField
								control={form.control}
								name="companyName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Name *</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter company name"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Parent Company Search */}
							<div className="lg:col-span-2">
								<ParentCompanySearch
									value={form.watch("parentId") || null}
									onSelect={handleParentCompanySelect}
									currentCustomerId={customer?.id}
									allCustomers={parentCustomers}
								/>
							</div>

							{/* Email */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email *</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="company@example.com"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Phone */}
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<Input
												placeholder="(555) 123-4567"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Address */}
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>Address *</FormLabel>
										<FormControl>
											<Input
												placeholder="123 Main Street"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* City */}
							<FormField
								control={form.control}
								name="city"
								render={({ field }) => (
									<FormItem>
										<FormLabel>City *</FormLabel>
										<FormControl>
											<Input
												placeholder="New York"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* State */}
							<FormField
								control={form.control}
								name="state"
								render={({ field }) => (
									<FormItem>
										<FormLabel>State *</FormLabel>
										<FormControl>
											<Input
												placeholder="NY"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Zip Code */}
							<FormField
								control={form.control}
								name="zipCode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Zip Code *</FormLabel>
										<FormControl>
											<Input
												placeholder="10001"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							{/* Tax ID */}
							<FormField
								control={form.control}
								name="taxId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tax ID</FormLabel>
										<FormControl>
											<Input
												placeholder="XX-XXXXXXX"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Contact Name */}
							<FormField
								control={form.control}
								name="contactName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact Name</FormLabel>
										<FormControl>
											<Input
												placeholder="John Doe"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Contact Email */}
							<FormField
								control={form.control}
								name="contactEmail"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="john@example.com"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Contact Phone */}
							<FormField
								control={form.control}
								name="contactPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact Phone</FormLabel>
										<FormControl>
											<Input
												placeholder="(555) 123-4567"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Discount Percent */}
							<FormField
								control={form.control}
								name="discountPercent"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Discount %</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												max="100"
												placeholder="0"
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Payment Terms */}
							<FormField
								control={form.control}
								name="paymentTermsDays"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Payment Terms (Days)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												placeholder="30"
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Credit Limit */}
							<FormField
								control={form.control}
								name="creditLimit"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Credit Limit</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												placeholder="0"
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Meta Data Fields */}
				{groupedMetaFields.length > 0 && (
					<Card>
						<CardHeader>
							<h2 className="text-lg font-semibold">Additional Fields</h2>
						</CardHeader>
						<CardContent>
							<Tabs
								value={activeMetaTab}
								onValueChange={setActiveMetaTab}
								className="w-full">
								<TabsList className="mb-6 grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{groupedMetaFields.map((group) => (
										<TabsTrigger
											key={group.moduleType.id}
											value={group.moduleType.id}
											className="text-xs sm:text-sm">
											{group.moduleType.name}
										</TabsTrigger>
									))}
								</TabsList>

								{groupedMetaFields.map((group) => (
									<TabsContent
										key={group.moduleType.id}
										value={group.moduleType.id}
										className="mt-0 space-y-4">
										{group.moduleType.description && <p className="text-muted-foreground text-sm">{group.moduleType.description}</p>}
										{group.fields.map((field) => (
											<ModuleFormField
												key={field.id}
												field={field}
												control={control}
												name={field.name as any}
											/>
										))}
									</TabsContent>
								))}
							</Tabs>
						</CardContent>
					</Card>
				)}

				{/* Form Actions */}
				{!hideButtons && (
					<div className="flex gap-3 border-t pt-6">
						<Button
							type="submit"
							disabled={loading}>
							{!loading && <Save className="mr-2 h-4 w-4" />}
							{loading ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
					</div>
				)}

				{hideButtons && (
					<div className="hidden">
						<Button
							type="submit"
							disabled={loading}>
							{loading ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}>
							Cancel
						</Button>
					</div>
				)}
			</form>
		</Form>
	);
}
