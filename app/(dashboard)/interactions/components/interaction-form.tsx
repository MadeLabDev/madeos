"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
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
import { cn } from "@/lib/utils";

interface InteractionFormProps {
	interaction?: any;
	contacts: any[];
	onSubmit: (data: any) => Promise<any>;
	onCancel: () => void;
	hideButtons?: boolean;
}

export function InteractionForm({ interaction, contacts, onSubmit, onCancel, hideButtons = false }: InteractionFormProps) {
	const [loading, setLoading] = useState(false);
	const [initialCustomer] = useState<SearchSelectOption | null>(
		interaction?.customer
			? {
					value: interaction.customer.id,
					label: interaction.customer.companyName,
					description: interaction.customer.email,
				}
			: null,
	);
	const [filteredContacts, setFilteredContacts] = useState<any[]>(contacts);
	const [formData, setFormData] = useState({
		type: interaction?.type || "NOTE",
		subject: interaction?.subject || "",
		description: interaction?.description || "",
		date: interaction?.date ? new Date(interaction.date) : new Date(),
		duration: interaction?.duration || "",
		participants: interaction?.participants || "",
		outcome: interaction?.outcome || "",
		customerId: interaction?.customerId || "",
		contactId: interaction?.contactId || "",
	});

	// Wrapper function for AsyncSearchSelect
	const fetchCustomersOptions = useCallback(async (query: string) => {
		const result = await searchCustomers(query);
		return result.success ? result.data : [];
	}, []);

	// Filter contacts based on selected customer
	useEffect(() => {
		if (formData.customerId) {
			// For now, we only have contacts from the initial data
			// In the future, this could be enhanced to fetch contacts when a customer is selected
			const selectedContacts = contacts.filter((c) => {
				// Assuming contacts have a customerId field
				return c.customerId === formData.customerId;
			});
			setFilteredContacts(selectedContacts.length > 0 ? selectedContacts : []);
		} else {
			setFilteredContacts(contacts);
		}
	}, [formData.customerId, contacts]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "duration" ? (value ? Number(value) : "") : value,
		}));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
			// Reset contact when customer changes
			...(name === "customerId" && { contactId: "" }),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const submitData = {
				...formData,
				date: formData.date,
				duration: formData.duration ? Number(formData.duration) : undefined,
			};
			await onSubmit(submitData);
		} finally {
			setLoading(false);
		}
	};

	const types = [
		{ value: "MEETING", label: "Meeting" },
		{ value: "CALL", label: "Call" },
		{ value: "EMAIL", label: "Email" },
		{ value: "NOTE", label: "Note" },
	];

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
			data-interaction-form>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Interaction Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="type">Type *</Label>
							<Select
								value={formData.type}
								onValueChange={(value) => handleSelectChange("type", value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									{types.map((type) => (
										<SelectItem
											key={type.value}
											value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="subject">Subject *</Label>
							<Input
								id="subject"
								name="subject"
								value={formData.subject}
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
							<Label htmlFor="outcome">Outcome</Label>
							<Input
								id="outcome"
								name="outcome"
								value={formData.outcome}
								onChange={handleChange}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Date & Participants</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="date">Date *</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn("w-full pl-3 text-left font-normal", !formData.date && "text-muted-foreground")}>
										{formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
										<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="start">
									<Calendar
										mode="single"
										selected={formData.date}
										onSelect={(date) => setFormData((prev) => ({ ...prev, date: date || new Date() }))}
										disabled={(date) => date < new Date("1900-01-01")}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
						<div className="space-y-2">
							<Label htmlFor="duration">Duration (minutes)</Label>
							<Input
								id="duration"
								name="duration"
								type="number"
								value={formData.duration}
								onChange={handleChange}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="participants">Participants</Label>
							<Input
								id="participants"
								name="participants"
								value={formData.participants}
								onChange={handleChange}
								placeholder="Comma-separated names"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="customerId">Customer</Label>
							<AsyncSearchSelect
								placeholder="Search customers..."
								value={formData.customerId}
								onValueChange={(value) => handleSelectChange("customerId", value)}
								fetchOptions={fetchCustomersOptions}
								initialOptions={initialCustomer ? [initialCustomer] : []}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="contactId">Contact</Label>
							<Select
								value={formData.contactId}
								onValueChange={(value) => handleSelectChange("contactId", value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select contact (optional)" />
								</SelectTrigger>
								<SelectContent>
									{filteredContacts.map((contact) => (
										<SelectItem
											key={contact.id}
											value={contact.id}>
											{contact.firstName} {contact.lastName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
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
						{interaction ? "Update Interaction" : "Create Interaction"}
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
