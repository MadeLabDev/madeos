"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCampaignTemplateAction, updateCampaignTemplateAction } from "@/lib/features/marketing/actions";
import { CampaignTemplate, CreateCampaignTemplateInput } from "@/lib/features/marketing/types";

const campaignTemplateSchema = z.object({
	name: z.string().min(1, "Template name is required"),
	subject: z.string().min(1, "Email subject is required"),
	content: z.string().min(10, "Content must be at least 10 characters"),
	type: z.enum(["GENERAL", "EVENT_INVITATION", "EVENT_REMINDER", "NEWSLETTER", "SPONSOR_UPDATE"]),
	isActive: z.boolean(),
});

type CampaignTemplateFormValues = z.infer<typeof campaignTemplateSchema>;

interface CampaignTemplateFormProps {
	template?: CampaignTemplate;
	onSuccess?: (template: CampaignTemplate) => void;
}

export function CampaignTemplateForm({ template, onSuccess }: CampaignTemplateFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const isEditing = Boolean(template);

	const form = useForm<CampaignTemplateFormValues>({
		resolver: zodResolver(campaignTemplateSchema),
		defaultValues: {
			name: template?.name || "",
			subject: template?.subject || "",
			content: template?.content || "",
			type: template?.type || "GENERAL",
			isActive: template?.isActive ?? true,
		},
	});

	async function onSubmit(values: CampaignTemplateFormValues) {
		setIsLoading(true);

		try {
			let result;

			if (isEditing) {
				result = await updateCampaignTemplateAction(template!.id, values);
			} else {
				result = await createCampaignTemplateAction(values as CreateCampaignTemplateInput);
			}

			if (result.success) {
				toast.success(result.message);
				if (onSuccess && result.data) {
					onSuccess(result.data);
				} else {
					router.push("/marketing/templates");
					router.refresh();
				}
			} else {
				toast.error(result.message || "Operation failed");
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">{isEditing ? "Edit" : "Create"} Campaign Template</h1>
					<p className="text-muted-foreground mt-1">{isEditing ? "Update" : "Create"} a reusable email template for your campaigns</p>
				</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={form.handleSubmit(onSubmit)}
						disabled={isLoading}
						className="gap-2">
						{isLoading && <Loader size="sm" />}
						{isEditing ? "Update Template" : "Create Template"}
					</Button>
				</div>
			</div>

			<div className="max-w-2xl">
				<div className="bg-card rounded-lg border p-6">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Template Name</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., Welcome Email, Event Reminder"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormDescription>Internal name to identify this template</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Template Type</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											disabled={isLoading}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a template type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="GENERAL">General</SelectItem>
												<SelectItem value="EVENT_INVITATION">Event Invitation</SelectItem>
												<SelectItem value="EVENT_REMINDER">Event Reminder</SelectItem>
												<SelectItem value="NEWSLETTER">Newsletter</SelectItem>
												<SelectItem value="SPONSOR_UPDATE">Sponsor Update</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>Categorize this template for easier organization</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="subject"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email Subject</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., You're invited to our event!"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormDescription>The subject line that will appear in email clients</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email Content</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter your email template content. You can use variables like {{firstName}}, {{eventName}}, etc."
												disabled={isLoading}
												rows={10}
												className="font-mono text-sm"
												{...field}
											/>
										</FormControl>
										<FormDescription>HTML or plain text content. Use variables for dynamic content.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex items-center space-x-2">
										<FormControl>
											<input
												type="checkbox"
												checked={field.value}
												onChange={field.onChange}
												disabled={isLoading}
												className="h-4 w-4"
											/>
										</FormControl>
										<FormLabel className="!mt-0">Active</FormLabel>
										<FormDescription>Only active templates can be used in campaigns</FormDescription>
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</div>
			</div>
		</div>
	);
}
