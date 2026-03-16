"use client";

import { useState } from "react";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSponsorMaterialAction, updateSponsorMaterialAction } from "@/lib/features/marketing/actions";
import type { CreateSponsorMaterialInput, SponsorMaterialFormData } from "@/lib/features/marketing/types";
import { MATERIAL_TYPES } from "@/lib/features/marketing/types";

interface SponsorMaterialFormProps {
	event: {
		id: string;
		title: string;
		startDate: Date;
		endDate: Date;
	};
	material?: any; // For edit mode
	onSubmit?: (formData: CreateSponsorMaterialInput) => Promise<any>;
	onCancel?: () => void;
	hideButtons?: boolean;
}

export default function SponsorMaterialForm({ event, material, onSubmit, onCancel, hideButtons }: SponsorMaterialFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<SponsorMaterialFormData>({
		eventId: event.id,
		sponsorId: material?.sponsorId || "",
		title: material?.title || "",
		description: material?.description || "",
		type: material?.type || "BROCHURE",
		fileId: material?.fileId || "",
		url: material?.url || "",
		dueDate: material?.dueDate ? new Date(material.dueDate).toISOString().split("T")[0] : "",
		notes: material?.notes || "",
	});

	// Simple sponsor search function
	// const fetchSponsorsOptions = useCallback(async (query: string) => {
	// 	// For now, return empty array - will implement proper search later
	// 	return [];
	// }, []);

	// const handleSponsorChange = (value: string) => {
	// 	setFormData((prev) => ({
	// 		...prev,
	// 		sponsorId: value,
	// 	}));
	// };

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Convert form data for submission
			const submitData = {
				...formData,
				dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
			};

			if (onSubmit) {
				await onSubmit(submitData);
			} else {
				let result;
				if (material) {
					result = await updateSponsorMaterialAction(material.id, submitData);
				} else {
					result = await createSponsorMaterialAction(submitData);
				}

				if (result.success) {
					toast.success(`Sponsor material ${material ? "updated" : "created"} successfully`);
					router.push(`/marketing/sponsors/${event.id}`);
				} else {
					toast.error(result.message || `Failed to ${material ? "update" : "create"} sponsor material`);
				}
			}
		} catch (error) {
			toast.error(`An error occurred while ${material ? "updating" : "creating"} the sponsor material`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		} else {
			router.back();
		}
	};

	return (
		<div className="space-y-6">
			{!hideButtons && (
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold">{material ? "Edit" : "Create"} Sponsor Material</h1>
						<p className="text-muted-foreground mt-1">
							{material ? "Update" : "Create"} sponsor material for the event: <strong>{event.title}</strong>
						</p>
					</div>
					<div className="flex gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isSubmitting}>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={isSubmitting}>
							{isSubmitting ? <Loader className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
							{material ? "Update" : "Create"} Material
						</Button>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-6"
				data-sponsor-form>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Sponsor Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="sponsorId">Sponsor *</Label>
								{/* TODO: Implement sponsor search */}
								<Input
									id="sponsorId"
									name="sponsorId"
									value={formData.sponsorId}
									onChange={handleChange}
									placeholder="Enter sponsor ID"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="title">Material Title *</Label>
								<Input
									id="title"
									name="title"
									value={formData.title}
									onChange={handleChange}
									placeholder="Enter material title"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="type">Material Type *</Label>
								<Select
									value={formData.type}
									onValueChange={(value) => handleSelectChange("type", value)}>
									<SelectTrigger>
										<SelectValue placeholder="Select material type" />
									</SelectTrigger>
									<SelectContent>
										{MATERIAL_TYPES.map((type) => (
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
								<Label htmlFor="dueDate">Due Date</Label>
								<Input
									id="dueDate"
									name="dueDate"
									type="date"
									value={formData.dueDate}
									onChange={handleChange}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Content & Files</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									name="description"
									value={formData.description || ""}
									onChange={handleChange}
									placeholder="Describe the sponsor material"
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="url">URL</Label>
								<Input
									id="url"
									name="url"
									value={formData.url}
									onChange={handleChange}
									placeholder="https://..."
									type="url"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="notes">Notes</Label>
								<Textarea
									id="notes"
									name="notes"
									value={formData.notes}
									onChange={handleChange}
									placeholder="Additional notes or instructions"
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</form>
		</div>
	);
}
