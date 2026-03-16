"use client";

import { useCallback, useState } from "react";

import { Save } from "lucide-react";

import { AsyncSearchSelect, type SearchSelectOption } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { searchCustomers } from "@/lib/features/design/actions/search.actions";

interface ContactFormProps {
	contact?: any;
	onSubmit: (data: any) => Promise<any>;
	onCancel: () => void;
	hideButtons?: boolean;
}

export function ContactForm({ contact, onSubmit, onCancel, hideButtons = false }: ContactFormProps) {
	const [loading, setLoading] = useState(false);
	const [initialCustomer] = useState<SearchSelectOption | null>(
		contact?.customer
			? {
					value: contact.customer.id,
					label: contact.customer.companyName,
					description: contact.customer.email,
				}
			: null,
	);
	const [formData, setFormData] = useState({
		firstName: contact?.firstName || "",
		lastName: contact?.lastName || "",
		email: contact?.email || "",
		phone: contact?.phone || "",
		title: contact?.title || "",
		customerId: contact?.customerId || "",
		isPrimary: contact?.isPrimary || false,
		tags: contact?.tags || "",
	});

	// Wrapper function for AsyncSearchSelect
	const fetchCustomersOptions = useCallback(async (query: string) => {
		const result = await searchCustomers(query);
		return result.success ? result.data : [];
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
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
			await onSubmit(formData);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
			data-contact-form>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Contact Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name *</Label>
								<Input
									id="firstName"
									name="firstName"
									value={formData.firstName}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name *</Label>
								<Input
									id="lastName"
									name="lastName"
									value={formData.lastName}
									onChange={handleChange}
									required
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email *</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone</Label>
							<Input
								id="phone"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								name="title"
								value={formData.title}
								onChange={handleChange}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Customer Association</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
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
							<Label htmlFor="tags">Tags</Label>
							<Input
								id="tags"
								name="tags"
								value={formData.tags}
								onChange={handleChange}
								placeholder="Comma-separated tags"
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
						<Save className="mr-2 h-4 w-4" />
						{contact ? "Update Contact" : "Create Contact"}
					</Button>
				</div>
			)}

			{/* Hidden submit button for header button functionality */}
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
