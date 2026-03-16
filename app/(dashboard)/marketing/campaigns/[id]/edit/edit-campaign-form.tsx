"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CampaignType } from "@/generated/prisma/enums";
import { updateMarketingCampaignAction } from "@/lib/features/marketing/actions";
import { MarketingCampaign } from "@/lib/features/marketing/types";
import { cn } from "@/lib/utils";

const campaignSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
	description: z.string().optional(),
	type: z.nativeEnum(CampaignType),
	targetAudience: z.string().optional(),
	scheduledAt: z.date().optional(),
	status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "CANCELLED"]).optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface EditCampaignFormProps {
	campaign: MarketingCampaign;
}

export function EditCampaignForm({ campaign }: EditCampaignFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<CampaignFormData>({
		resolver: zodResolver(campaignSchema),
		defaultValues: {
			title: campaign.title,
			description: campaign.description || "",
			type: campaign.type as CampaignType,
			targetAudience: campaign.targetAudience || "",
			scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt) : undefined,
			status: campaign.status,
		},
	});

	const onSubmit = async (data: CampaignFormData) => {
		setIsSubmitting(true);
		try {
			const result = await updateMarketingCampaignAction(campaign.id, data);

			if (result.success) {
				toast.success("Campaign updated successfully!");
				router.push(`/marketing/campaigns/${campaign.id}`);
			} else {
				toast.error(result.message || "Failed to update campaign");
			}
		} catch (error) {
			console.error("Error updating campaign:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		router.back();
	};

	const handleHeaderSubmit = () => {
		setIsSubmitting(true);
		try {
			const submitBtn = document.querySelector('form[data-campaign-form] button[type="submit"]') as HTMLButtonElement | null;
			submitBtn?.click();
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			// Reset submitting state after a short delay to allow form to handle submission
			setTimeout(() => setIsSubmitting(false), 1000);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Edit Campaign</h1>
					<p className="text-muted-foreground mt-1">
						Updating: <span className="font-semibold">{campaign.title}</span>
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						variant="outline"
						onClick={handleCancel}
						disabled={isSubmitting}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						onClick={handleHeaderSubmit}
						disabled={isSubmitting}>
						{isSubmitting && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						{!isSubmitting && <Save className="mr-2 h-4 w-4" />}
						Update Campaign
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Campaign Details</CardTitle>
					<CardDescription>Modify the information for your marketing campaign</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6"
							data-campaign-form>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Campaign Title *</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter campaign title"
													{...field}
												/>
											</FormControl>
											<FormDescription>A descriptive name for your campaign</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Campaign Type *</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select campaign type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value={CampaignType.EMAIL}>Email Campaign</SelectItem>
													<SelectItem value={CampaignType.SOCIAL}>Social Media</SelectItem>
													<SelectItem value={CampaignType.WEBINAR}>Webinar</SelectItem>
													<SelectItem value={CampaignType.NEWSLETTER}>Newsletter</SelectItem>
												</SelectContent>
											</Select>
											<FormDescription>The type of marketing campaign</FormDescription>
											<FormMessage />
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
												placeholder="Describe your campaign goals and strategy"
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormDescription>Optional description of the campaign objectives</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<FormField
									control={form.control}
									name="targetAudience"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Target Audience</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g., Existing customers, Prospects"
													{...field}
												/>
											</FormControl>
											<FormDescription>Who is this campaign targeting?</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="scheduledAt"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Schedule Date</FormLabel>
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
														disabled={(date) => date < new Date()}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
											<FormDescription>Optional: Schedule the campaign for later</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="DRAFT">Draft</SelectItem>
												<SelectItem value="SCHEDULED">Scheduled</SelectItem>
												<SelectItem value="SENDING">Sending</SelectItem>
												<SelectItem value="SENT">Sent</SelectItem>
												<SelectItem value="CANCELLED">Cancelled</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>Current status of the campaign</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
