"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, DollarSign, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createTicketType, deleteTicketType, getEventById, updateTicketType } from "@/lib/features/events/actions/event.actions";
import { EventWithRelations, TicketType } from "@/lib/features/events/types";

const ticketTypeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	price: z.number().min(0, "Price must be positive"),
	quantity: z.number().min(1, "Quantity must be at least 1"),
	maxPerUser: z.number().min(1, "Max per user must be at least 1"),
	saleStart: z.date().optional(),
	saleEnd: z.date().optional(),
	isActive: z.boolean(),
	isExternal: z.boolean(),
});

type TicketTypeFormData = z.infer<typeof ticketTypeSchema>;

interface EventTicketTypesProps {
	eventId: string;
	eventData?: EventWithRelations;
}

export function EventTicketTypes({ eventId, eventData }: EventTicketTypesProps) {
	const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null);

	const form = useForm<TicketTypeFormData>({
		resolver: zodResolver(ticketTypeSchema),
		defaultValues: {
			name: "",
			description: "",
			price: 0,
			quantity: 100,
			maxPerUser: 1,
			saleStart: undefined,
			saleEnd: undefined,
			isActive: true,
			isExternal: false,
		},
	});

	const loadTicketTypes = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getEventById(eventId);
			if (result.success && result.data?.ticketTypes) {
				setTicketTypes(result.data.ticketTypes);
			} else {
				console.error("Failed to load ticket types:", result.message);
			}
		} catch (error) {
			console.error("Failed to load ticket types:", error);
		} finally {
			setLoading(false);
		}
	}, [eventId]);

	useEffect(() => {
		if (eventData) {
			setTicketTypes(eventData.ticketTypes || []);
			setLoading(false);
		} else {
			loadTicketTypes();
		}
	}, [eventId, eventData, loadTicketTypes]);

	const handleCreateTicketType = () => {
		setEditingTicketType(null);
		form.reset({
			name: "",
			description: "",
			price: 0,
			quantity: 100,
			maxPerUser: 1,
			saleStart: undefined,
			saleEnd: undefined,
			isActive: true,
			isExternal: false,
		});
		setDialogOpen(true);
	};

	const handleEditTicketType = (ticketType: TicketType) => {
		setEditingTicketType(ticketType);
		form.reset({
			name: ticketType.name,
			description: ticketType.description || "",
			price: ticketType.price,
			quantity: ticketType.quantity,
			maxPerUser: ticketType.maxPerUser,
			saleStart: ticketType.saleStart ? new Date(ticketType.saleStart) : undefined,
			saleEnd: ticketType.saleEnd ? new Date(ticketType.saleEnd) : undefined,
			isActive: ticketType.isActive,
			isExternal: ticketType.isExternal,
		});
		setDialogOpen(true);
	};

	const handleDeleteTicketType = async (ticketTypeId: string) => {
		if (!confirm("Are you sure you want to delete this ticket type? This action cannot be undone.")) return;

		try {
			const result = await deleteTicketType(ticketTypeId);
			if (result.success) {
				await loadTicketTypes();
			} else {
				console.error("Failed to delete ticket type:", result.message);
			}
		} catch (error) {
			console.error("Failed to delete ticket type:", error);
		}
	};

	const toggleTicketTypeStatus = async (ticketType: TicketType) => {
		try {
			const result = await updateTicketType(ticketType.id, {
				isActive: !ticketType.isActive,
			});
			if (result.success) {
				await loadTicketTypes();
			} else {
				console.error("Failed to toggle ticket type status:", result.message);
			}
		} catch (error) {
			console.error("Failed to toggle ticket type status:", error);
		}
	};

	const onSubmit = async (data: TicketTypeFormData) => {
		try {
			const ticketTypeData = {
				...data,
				eventId,
				description: data.description || undefined,
				saleStart: data.saleStart || undefined,
				saleEnd: data.saleEnd || undefined,
			};

			let result;
			if (editingTicketType) {
				result = await updateTicketType(editingTicketType.id, ticketTypeData);
			} else {
				result = await createTicketType(ticketTypeData);
			}

			if (result.success) {
				setDialogOpen(false);
				await loadTicketTypes();
			} else {
				console.error("Failed to save ticket type:", result.message);
			}
		} catch (error) {
			console.error("Failed to save ticket type:", error);
		}
	};

	if (loading) {
		return <Loader size="lg" />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Ticket Types</h3>
				<Button onClick={handleCreateTicketType}>
					<Plus className="mr-2 h-4 w-4" />
					Add Ticket Type
				</Button>
			</div>

			{ticketTypes.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center">
						<p className="text-muted-foreground">No ticket types created yet.</p>
						<Button
							variant="outline"
							onClick={handleCreateTicketType}
							className="mt-4">
							<Plus className="mr-2 h-4 w-4" />
							Create First Ticket Type
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{ticketTypes.map((ticketType) => (
						<Card key={ticketType.id}>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<CardTitle className="text-base">{ticketType.name}</CardTitle>
											<Badge variant={ticketType.isActive ? "default" : "secondary"}>{ticketType.isActive ? "Active" : "Inactive"}</Badge>
										</div>
										{ticketType.description && <p className="text-muted-foreground text-sm">{ticketType.description}</p>}
									</div>
									<div className="flex gap-2">
										<Button
											variant={`${ticketType.isActive ? "outline" : "default"}`}
											size="sm"
											onClick={() => toggleTicketTypeStatus(ticketType)}>
											{ticketType.isActive ? "Deactivate" : "Activate"}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditTicketType(ticketType)}>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDeleteTicketType(ticketType.id)}
											className="text-destructive hover:text-destructive">
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
									<div className="flex items-center gap-2">
										<DollarSign className="text-muted-foreground h-4 w-4" />
										<div>
											<p className="font-medium">Price</p>
											<p className="text-muted-foreground">${ticketType.price.toFixed(2)}</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Users className="text-muted-foreground h-4 w-4" />
										<div>
											<p className="font-medium">Quantity</p>
											<p className="text-muted-foreground">{ticketType.quantity}</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Users className="text-muted-foreground h-4 w-4" />
										<div>
											<p className="font-medium">Max per User</p>
											<p className="text-muted-foreground">{ticketType.maxPerUser}</p>
										</div>
									</div>

									{(ticketType.saleStart || ticketType.saleEnd) && (
										<div className="flex items-center gap-2">
											<Calendar className="text-muted-foreground h-4 w-4" />
											<div>
												<p className="font-medium">Sales Period</p>
												<p className="text-muted-foreground">
													{ticketType.saleStart ? new Date(ticketType.saleStart).toLocaleDateString() : "Now"} - {ticketType.saleEnd ? new Date(ticketType.saleEnd).toLocaleDateString() : "Ongoing"}
												</p>
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
						<DialogTitle>{editingTicketType ? "Edit Ticket Type" : "Create Ticket Type"}</DialogTitle>
					</DialogHeader>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name *</FormLabel>
										<FormControl>
											<Input
												placeholder="Early Bird, VIP, General Admission, etc."
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
												placeholder="Describe what's included with this ticket type"
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
									name="price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Price *</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													min="0"
													placeholder="0.00"
													{...field}
													onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="quantity"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Quantity *</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="1"
													placeholder="100"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="maxPerUser"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Max per User</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="1"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="saleStart"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Sale Start Date</FormLabel>
											<Input
												type="datetime-local"
												{...field}
												value={field.value ? field.value.toISOString().slice(0, 16) : ""}
												onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
											/>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="saleEnd"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Sale End Date</FormLabel>
											<Input
												type="datetime-local"
												{...field}
												value={field.value ? field.value.toISOString().slice(0, 16) : ""}
												onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
											/>
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Active</FormLabel>
											<div className="text-muted-foreground text-sm">Allow this ticket type to be purchased</div>
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
									{editingTicketType ? "Update Ticket Type" : "Create Ticket Type"}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
