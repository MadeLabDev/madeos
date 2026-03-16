"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EventType, TicketingMode } from "@/generated/prisma/enums";
import { EVENT_TYPES, TICKETING_MODES } from "@/lib/config/module-types";
import { createEvent, getEventById, updateEvent } from "@/lib/features/events/actions";
import { cn } from "@/lib/utils";
import { generateSlug } from "@/lib/utils/slug-generator";

const eventSchema = z.object({
	title: z.string().min(1, "Title is required"),
	slug: z.string().min(1, "Slug is required"),
	description: z.string().min(1, "Description is required"),
	startDate: z.date(),
	endDate: z.date(),
	location: z.string().optional(),
	capacity: z.number().optional(),
	eventType: z.nativeEnum(EventType),
	ticketingMode: z.nativeEnum(TicketingMode),
	externalTicketUrl: z.string().url().optional().or(z.literal("")),
	externalTicketProvider: z.string().optional(),
	enableCheckIn: z.boolean(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
	eventId?: string;
	hideButtons?: boolean;
}

export function EventForm({ eventId, hideButtons = false }: EventFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	const form = useForm<EventFormData>({
		resolver: zodResolver(eventSchema),
		defaultValues: {
			title: "",
			slug: "",
			description: "",
			startDate: new Date(),
			endDate: new Date(),
			location: "",
			capacity: undefined,
			eventType: EventType.WITH_SESSIONS,
			ticketingMode: TicketingMode.INTERNAL,
			externalTicketUrl: "",
			externalTicketProvider: "",
			enableCheckIn: true,
		},
	});

	const loadEvent = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getEventById(eventId!);
			if (result.success && result.data) {
				form.reset({
					title: result.data.title,
					slug: result.data.slug,
					description: result.data.description,
					startDate: new Date(result.data.startDate),
					endDate: new Date(result.data.endDate),
					location: result.data.location || "",
					capacity: result.data.capacity || undefined,
					eventType: result.data.eventType,
					ticketingMode: result.data.ticketingMode,
					externalTicketUrl: result.data.externalTicketUrl || "",
					externalTicketProvider: result.data.externalTicketProvider || "",
					enableCheckIn: result.data.enableCheckIn,
				});
			}
		} catch (error) {
			console.error("Failed to load event:", error);
		} finally {
			setLoading(false);
		}
	}, [eventId, form, setLoading]);

	useEffect(() => {
		if (eventId) {
			loadEvent();
		}
	}, [eventId, loadEvent]);

	const onSubmit = async (data: EventFormData) => {
		try {
			setSaving(true);

			const eventData = {
				...data,
				externalTicketUrl: data.externalTicketUrl || undefined,
				externalTicketProvider: data.externalTicketProvider || undefined,
				capacity: data.capacity || undefined,
			};

			if (eventId) {
				const result = await updateEvent(eventId, eventData);
				if (result.success) {
					router.push(`/events/${eventId}`);
				} else {
					console.error("Failed to update event:", result.message);
				}
			} else {
				const result = await createEvent(eventData);
				if (result.success && result.data) {
					router.push(`/events/${result.data.id}`);
				} else {
					console.error("Failed to create event:", result.message);
				}
			}
		} catch (error) {
			console.error("Failed to save event:", error);
		} finally {
			setSaving(false);
		}
	};

	const handleTitleChange = (title: string) => {
		form.setValue("title" as keyof EventFormData, title);
		if (!eventId) {
			form.setValue("slug" as keyof EventFormData, generateSlug(title));
		}
	};

	if (loading) {
		return <div className="py-8 text-center">Loading event...</div>;
	}

	return (
		<div className="mx-auto">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6"
					data-event-form>
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title *</FormLabel>
										<FormControl>
											<Input
												placeholder="Event title"
												{...field}
												onChange={(e) => handleTitleChange(e.target.value)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="slug"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Slug *</FormLabel>
										<FormControl>
											<Input
												placeholder="event-slug"
												{...field}
												onChange={(e) => form.setValue("slug" as keyof EventFormData, generateSlug(e.target.value))}
											/>
										</FormControl>

										<p className="text-muted-foreground text-xs">{eventId ? "Editable - used in the event URL" : "Auto-generated from title - edit after creation if needed"}</p>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description *</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Event description"
												rows={4}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Date & Location</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Start Date *</FormLabel>
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
														disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="endDate"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>End Date *</FormLabel>
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
														disabled={(date) => date < (form.getValues("startDate") as Date) || date < new Date(new Date().setHours(0, 0, 0, 0))}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Location</FormLabel>
										<FormControl>
											<Input
												placeholder="Event location"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="capacity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Capacity</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="Unlimited if empty"
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Event Settings</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="eventType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Event Type *</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select event type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{EVENT_TYPES.map((type) => (
													<SelectItem
														key={type.value}
														value={type.value}>
														{type.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="ticketingMode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ticketing Mode *</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select ticketing mode" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{TICKETING_MODES.map((mode) => (
													<SelectItem
														key={mode.value}
														value={mode.value}>
														{mode.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							{(form.watch("ticketingMode") === TicketingMode.EXTERNAL || form.watch("ticketingMode") === TicketingMode.HYBRID) && (
								<>
									<FormField
										control={form.control}
										name="externalTicketUrl"
										render={({ field }) => (
											<FormItem>
												<FormLabel>External Ticket URL</FormLabel>
												<FormControl>
													<Input
														placeholder="https://external-tickets.com/event"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="externalTicketProvider"
										render={({ field }) => (
											<FormItem>
												<FormLabel>External Provider</FormLabel>
												<FormControl>
													<Input
														placeholder="Eventbrite, Ticketmaster, etc."
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</>
							)}

							<FormField
								control={form.control}
								name="enableCheckIn"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Enable Check-in</FormLabel>
											<div className="text-muted-foreground text-sm">Allow attendees to check-in at the event</div>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Actions */}
					{!hideButtons && (
						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.push("/events")}
								disabled={saving}>
								<X className="h-4 w-4" />
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={saving}>
								{saving && <Loader size="lg" />}
								<Save className="mr-2 h-4 w-4" />
								{saving ? "Saving..." : eventId ? "Update Event" : "Create Event"}
							</Button>
						</div>
					)}

					{/* Hidden buttons for wrapper to trigger */}
					{hideButtons && (
						<div className="hidden">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.push("/events")}
								disabled={saving}>
								<X className="h-4 w-4" />
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={saving}>
								{saving && <Loader size="lg" />}
								<Save className="mr-2 h-4 w-4" />
								{saving ? "Saving..." : eventId ? "Update Event" : "Create Event"}
							</Button>
						</div>
					)}
				</form>
			</Form>
		</div>
	);
}
