"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MediaThumbnailField } from "@/components/form-fields/media-thumbnail-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import { createEventMicrositeAction, updateEventMicrositeAction } from "@/lib/features/marketing/actions";
import type { EventMicrositeFormData } from "@/lib/features/marketing/types";

interface EventMicrositeFormProps {
	event: {
		id: string;
		title: string;
		description?: string | null;
		startDate: Date;
		endDate: Date;
		status: string;
		location?: string | null;
	};
	microsite?: any; // For edit mode
	onSubmit?: (formData: EventMicrositeFormData) => Promise<any>;
	onCancel?: () => void;
	hideButtons?: boolean;
}

export function EventMicrositeForm({ event, microsite, onSubmit, onCancel, hideButtons }: EventMicrositeFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<EventMicrositeFormData>({
		eventId: event.id,
		heroTitle: microsite?.heroTitle || "",
		heroSubtitle: microsite?.heroSubtitle || "",
		heroImageId: microsite?.heroImageId || "",
		description: microsite?.description || "",
		agenda: microsite?.agenda || "",
		speakers: microsite?.speakers || "",
		sponsors: microsite?.sponsors || "",
		ctaText: microsite?.ctaText || "",
		ctaUrl: microsite?.ctaUrl || "",
		isPublished: microsite?.isPublished || false,
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCheckboxChange = (name: string, checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			[name]: checked,
		}));
	};

	const handleMediaChange = (url: string | null) => {
		setFormData((prev) => ({
			...prev,
			heroImageId: url,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (onSubmit) {
				await onSubmit(formData);
			} else {
				const action = microsite ? (data: any) => updateEventMicrositeAction(microsite.id, data) : createEventMicrositeAction;
				const submitData = microsite ? formData : formData;
				const result = await action(submitData);

				if (result.success) {
					toast.success(`Event microsite ${microsite ? "updated" : "created"} successfully`);
					router.push(`/marketing/microsites/${event.id}`);
				} else {
					toast.error(result.message || `Failed to ${microsite ? "update" : "create"} microsite`);
				}
			}
		} catch (error) {
			toast.error(`An error occurred while ${microsite ? "updating" : "creating"} the microsite`);
		} finally {
			setLoading(false);
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
						<h1 className="text-3xl font-bold">{microsite ? "Edit" : "Create"} Event Microsite</h1>
						<p className="text-muted-foreground mt-1">
							{microsite ? "Update" : "Create"} a public microsite for the event: <strong>{event.title}</strong>
						</p>
					</div>
					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={handleCancel}
							disabled={loading}>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={loading}>
							{loading ? <Loader className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
							{microsite ? "Update" : "Create"} Microsite
						</Button>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-6"
				data-microsite-form>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Hero Section</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="heroImageId">Hero Image</Label>
								<MediaThumbnailField
									value={formData.heroImageId}
									onChange={handleMediaChange}
									placeholder="Select hero image"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="heroTitle">Hero Title *</Label>
								<Input
									id="heroTitle"
									name="heroTitle"
									value={formData.heroTitle}
									onChange={handleChange}
									placeholder="Enter hero title"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="heroSubtitle">Hero Subtitle</Label>
								<Input
									id="heroSubtitle"
									name="heroSubtitle"
									value={formData.heroSubtitle || ""}
									onChange={handleChange}
									placeholder="Enter hero subtitle"
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Content & Call to Action</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="description">Description *</Label>
								<Textarea
									id="description"
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="Enter microsite description"
									rows={4}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="agenda">Agenda</Label>
								<Textarea
									id="agenda"
									name="agenda"
									value={formData.agenda}
									onChange={handleChange}
									placeholder="Enter event agenda"
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="speakers">Speakers</Label>
								<Textarea
									id="speakers"
									name="speakers"
									value={formData.speakers}
									onChange={handleChange}
									placeholder="Enter speakers information"
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="sponsors">Sponsors</Label>
								<Textarea
									id="sponsors"
									name="sponsors"
									value={formData.sponsors}
									onChange={handleChange}
									placeholder="Enter sponsors information"
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="ctaText">Call to Action Text</Label>
								<Input
									id="ctaText"
									name="ctaText"
									value={formData.ctaText}
									onChange={handleChange}
									placeholder="e.g., Register Now"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="ctaUrl">Call to Action URL</Label>
								<Input
									id="ctaUrl"
									name="ctaUrl"
									value={formData.ctaUrl}
									onChange={handleChange}
									placeholder="https://..."
									type="url"
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Publishing Settings</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="isPublished"
								checked={formData.isPublished}
								onCheckedChange={(checked) => handleCheckboxChange("isPublished", checked as boolean)}
							/>
							<Label htmlFor="isPublished">Publish microsite immediately</Label>
						</div>
						<p className="text-muted-foreground mt-2 text-sm">When published, the microsite will be accessible at a public URL.</p>
					</CardContent>
				</Card>
			</form>
		</div>
	);
}
