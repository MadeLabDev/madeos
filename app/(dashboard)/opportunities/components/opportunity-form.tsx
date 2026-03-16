"use client";

import { useCallback, useState } from "react";

import { format } from "date-fns";
import { X } from "lucide-react";
import { CalendarIcon } from "lucide-react";

import { AsyncSearchSelect, type SearchSelectOption } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { searchCustomers } from "@/lib/features/design/actions/search.actions";
import { searchUsersAction } from "@/lib/features/users/actions";
import { cn } from "@/lib/utils";

interface OpportunityFormProps {
	opportunity?: any;
	onSubmit: (data: any) => Promise<any>;
	onCancel: () => void;
	hideButtons?: boolean;
}

export function OpportunityForm({ opportunity, onSubmit, onCancel, hideButtons = false }: OpportunityFormProps) {
	const [loading, setLoading] = useState(false);
	const [initialCustomer] = useState<SearchSelectOption | null>(
		opportunity?.customer
			? {
					value: opportunity.customer.id,
					label: opportunity.customer.companyName,
					description: opportunity.customer.email,
				}
			: null,
	);
	const [initialOwner] = useState<SearchSelectOption | null>(
		opportunity?.owner
			? {
					value: opportunity.owner.id,
					label: opportunity.owner.name || opportunity.owner.email,
					description: opportunity.owner.email,
				}
			: null,
	);
	const [formData, setFormData] = useState({
		title: opportunity?.title || "",
		description: opportunity?.description || "",
		value: opportunity?.value || "",
		stage: opportunity?.stage || "PROSPECTING",
		probability: opportunity?.probability || 0,
		expectedClose: opportunity?.expectedClose ? new Date(opportunity.expectedClose) : undefined,
		customerId: opportunity?.customerId || "",
		ownerId: opportunity?.ownerId || "",
		source: opportunity?.source || "",
	});

	// Wrapper function for AsyncSearchSelect
	const fetchCustomersOptions = useCallback(async (query: string) => {
		const result = await searchCustomers(query);
		return result.success ? result.data : [];
	}, []);

	const fetchUsersOptions = useCallback(async (query: string) => {
		const result = await searchUsersAction(query);
		if (result.success && result.data) {
			const data = result.data as { users: any[] };
			return data.users.map((user: any) => ({
				value: user.id,
				label: user.name || user.email,
				description: user.email,
			}));
		}
		return [];
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "value" || name === "probability" ? (value ? Number(value) : "") : value,
		}));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCustomerChange = (value: string) => {
		handleSelectChange("customerId", value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const submitData = {
				...formData,
				value: formData.value ? Number(formData.value) : undefined,
				probability: Number(formData.probability),
				expectedClose: formData.expectedClose,
			};
			await onSubmit(submitData);
		} finally {
			setLoading(false);
		}
	};

	const stages = [
		{ value: "PROSPECTING", label: "Prospecting" },
		{ value: "QUALIFIED", label: "Qualified" },
		{ value: "PROPOSAL", label: "Proposal" },
		{ value: "NEGOTIATION", label: "Negotiation" },
		{ value: "CLOSED_WON", label: "Closed Won" },
		{ value: "CLOSED_LOST", label: "Closed Lost" },
	];

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
			data-opportunity-form>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Opportunity Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								name="title"
								value={formData.title}
								onChange={handleChange}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="value">Value ($)</Label>
							<Input
								id="value"
								name="value"
								type="number"
								step="0.01"
								value={formData.value}
								onChange={handleChange}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="source">Source</Label>
							<Input
								id="source"
								name="source"
								value={formData.source}
								onChange={handleChange}
								placeholder="Lead source"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Status & Assignment</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="stage">Stage *</Label>
							<Select
								value={formData.stage}
								onValueChange={(value) => handleSelectChange("stage", value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select stage" />
								</SelectTrigger>
								<SelectContent>
									{stages.map((stage) => (
										<SelectItem
											key={stage.value}
											value={stage.value}>
											{stage.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="probability">Probability (%)</Label>
							<Input
								id="probability"
								name="probability"
								type="number"
								min="0"
								max="100"
								value={formData.probability}
								onChange={handleChange}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="expectedClose">Expected Close Date</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn("w-full pl-3 text-left font-normal", !formData.expectedClose && "text-muted-foreground")}>
										{formData.expectedClose ? format(formData.expectedClose, "PPP") : <span>Pick a date</span>}
										<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="start">
									<Calendar
										mode="single"
										selected={formData.expectedClose}
										onSelect={(date) => setFormData((prev) => ({ ...prev, expectedClose: date }))}
										disabled={(date) => date < new Date("1900-01-01")}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
						<div className="space-y-2">
							<Label htmlFor="customerId">Customer *</Label>
							<AsyncSearchSelect
								placeholder="Search customers..."
								value={formData.customerId}
								onValueChange={handleCustomerChange}
								fetchOptions={fetchCustomersOptions}
								initialOptions={initialCustomer ? [initialCustomer] : []}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ownerId">Owner *</Label>
							<AsyncSearchSelect
								value={formData.ownerId}
								onValueChange={(value) => handleSelectChange("ownerId", value)}
								fetchOptions={fetchUsersOptions}
								placeholder="Search owner..."
								searchPlaceholder="Search by name or email..."
								emptyMessage="No owners found"
								initialOptions={initialOwner ? [initialOwner] : []}
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			{!hideButtons && (
				<div className="flex justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={loading}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={loading}>
						{loading && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						{opportunity ? "Update Opportunity" : "Create Opportunity"}
					</Button>
				</div>
			)}

			{/* Hidden submit button for header button to trigger */}
			{hideButtons && (
				<button
					type="submit"
					className="hidden"
					disabled={loading}>
					Submit
				</button>
			)}
		</form>
	);
}
