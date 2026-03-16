"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Pencil, Save, Trash2, Users, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createEventSession, deleteEventSession, getEventById, updateEventSession } from "@/lib/features/events/actions/event.actions";
import { EventSession, EventWithRelations } from "@/lib/features/events/types";
import { cn } from "@/lib/utils";

const sessionSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	startTime: z.date(),
	endTime: z.date(),
	room: z.string().optional(),
	capacity: z.number().optional(),
	speaker: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface EventSessionsProps {
	eventId: string;
	eventData?: EventWithRelations;
}

export function EventSessions({ eventId, eventData }: EventSessionsProps) {
	const [sessions, setSessions] = useState<EventSession[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingSession, setEditingSession] = useState<EventSession | null>(null);

	const form = useForm<SessionFormData>({
		resolver: zodResolver(sessionSchema),
		defaultValues: {
			title: "",
			description: "",
			startTime: new Date(),
			endTime: new Date(),
			room: "",
			capacity: undefined,
			speaker: "",
		},
	});

	const loadSessions = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getEventById(eventId);
			if (result.success && result.data?.sessions) {
				setSessions(result.data.sessions);
			} else {
				console.error("Failed to load sessions:", result.message);
			}
		} catch (error) {
			console.error("Failed to load sessions:", error);
		} finally {
			setLoading(false);
		}
	}, [eventId]);

	useEffect(() => {
		if (eventData) {
			setSessions(eventData.sessions || []);
			setLoading(false);
		} else {
			loadSessions();
		}
	}, [eventId, eventData, loadSessions]);

	const handleCreateSession = () => {
		setEditingSession(null);
		form.reset({
			title: "",
			description: "",
			startTime: new Date(),
			endTime: new Date(),
			room: "",
			capacity: undefined,
			speaker: "",
		});
		setDialogOpen(true);
	};

	const handleEditSession = (session: EventSession) => {
		setEditingSession(session);
		form.reset({
			title: session.title,
			description: session.description || "",
			startTime: new Date(session.startTime),
			endTime: new Date(session.endTime),
			room: session.room || "",
			capacity: session.capacity || undefined,
			speaker: session.speaker || "",
		});
		setDialogOpen(true);
	};

	const handleDeleteSession = async (sessionId: string) => {
		if (!confirm("Are you sure you want to delete this session?")) return;

		try {
			const result = await deleteEventSession(sessionId);
			if (result.success) {
				await loadSessions();
			} else {
				console.error("Failed to delete session:", result.message);
			}
		} catch (error) {
			console.error("Failed to delete session:", error);
		}
	};

	const onSubmit = async (data: SessionFormData) => {
		try {
			const sessionData = {
				...data,
				eventId,
				capacity: data.capacity || undefined,
				description: data.description || undefined,
				room: data.room || undefined,
				speaker: data.speaker || undefined,
			};

			let result;
			if (editingSession) {
				result = await updateEventSession(editingSession.id, sessionData);
			} else {
				result = await createEventSession(sessionData);
			}

			if (result.success) {
				setDialogOpen(false);
				await loadSessions();
			} else {
				console.error("Failed to save session:", result.message);
			}
		} catch (error) {
			console.error("Failed to save session:", error);
		}
	};

	if (loading) {
		return <Loader size="lg" />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Event Sessions</h3>
				<Button onClick={handleCreateSession}>
					<Save className="mr-2 h-4 w-4" />
					Add Session
				</Button>
			</div>

			{sessions.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center">
						<p className="text-muted-foreground">No sessions created yet.</p>
						<Button
							variant="outline"
							onClick={handleCreateSession}
							className="mt-4">
							<Save className="mr-2 h-4 w-4" />
							Create First Session
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{sessions.map((session) => (
						<Card key={session.id}>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<CardTitle className="text-base">{session.title}</CardTitle>
										{session.description && <p className="text-muted-foreground text-sm">{session.description}</p>}
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditSession(session)}>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDeleteSession(session.id)}
											className="text-destructive hover:text-destructive">
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
									<div className="flex items-center gap-2">
										<Clock className="text-muted-foreground h-4 w-4" />
										<div>
											<p className="font-medium">Time</p>
											<p className="text-muted-foreground">
												{format(new Date(session.startTime), "HH:mm")} - {format(new Date(session.endTime), "HH:mm")}
											</p>
										</div>
									</div>

									{session.room && (
										<div className="flex items-center gap-2">
											<MapPin className="text-muted-foreground h-4 w-4" />
											<div>
												<p className="font-medium">Location</p>
												<p className="text-muted-foreground">{session.room}</p>
											</div>
										</div>
									)}

									{session.speaker && (
										<div className="flex items-center gap-2">
											<Users className="text-muted-foreground h-4 w-4" />
											<div>
												<p className="font-medium">Speaker</p>
												<p className="text-muted-foreground">{session.speaker}</p>
											</div>
										</div>
									)}

									{session.capacity && (
										<div className="flex items-center gap-2">
											<Users className="text-muted-foreground h-4 w-4" />
											<div>
												<p className="font-medium">Capacity</p>
												<p className="text-muted-foreground">{session.capacity}</p>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Dialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>{editingSession ? "Edit Session" : "Create Session"}</DialogTitle>
					</DialogHeader>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title *</FormLabel>
										<FormControl>
											<Input
												placeholder="Session title"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Session description"
												rows={3}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="startTime"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Start Time *</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
															{field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
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
														onSelect={(date) => {
															if (date) {
																const currentTime = field.value || new Date();
																date.setHours(currentTime.getHours(), currentTime.getMinutes());
																field.onChange(date);
															}
														}}
														initialFocus
													/>
													<div className="border-t p-3">
														<Input
															type="time"
															value={field.value ? format(field.value, "HH:mm") : ""}
															onChange={(e) => {
																const [hours, minutes] = e.target.value.split(":");
																if (hours && minutes) {
																	const newDate = new Date(field.value || new Date());
																	newDate.setHours(parseInt(hours), parseInt(minutes));
																	field.onChange(newDate);
																}
															}}
														/>
													</div>
												</PopoverContent>
											</Popover>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="endTime"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>End Time *</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
															{field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
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
														onSelect={(date) => {
															if (date) {
																const currentTime = field.value || new Date();
																date.setHours(currentTime.getHours(), currentTime.getMinutes());
																field.onChange(date);
															}
														}}
														initialFocus
													/>
													<div className="border-t p-3">
														<Input
															type="time"
															value={field.value ? format(field.value, "HH:mm") : ""}
															onChange={(e) => {
																const [hours, minutes] = e.target.value.split(":");
																if (hours && minutes) {
																	const newDate = new Date(field.value || new Date());
																	newDate.setHours(parseInt(hours), parseInt(minutes));
																	field.onChange(newDate);
																}
															}}
														/>
													</div>
												</PopoverContent>
											</Popover>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="room"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Location</FormLabel>
											<FormControl>
												<Input
													placeholder="Session location"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="speaker"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Speaker</FormLabel>
											<FormControl>
												<Input
													placeholder="Speaker name"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

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

							<div className="flex justify-end gap-4 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setDialogOpen(false)}>
									<X className="h-4 w-4" />
									Cancel
								</Button>
								<Button type="submit">
									<Pencil className="h-4 w-4" />
									{editingSession ? "Update Session" : "Create Session"}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
