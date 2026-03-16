"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { format } from "date-fns";
import jsQR from "jsqr";
import { Camera, CheckCircle, ChevronLeft, ChevronRight, Clock, QrCode, RefreshCw, Search, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CHECK_IN_STATUS_OPTIONS, REGISTRATION_STATUSES } from "@/lib/config/module-types";
import { checkInAttendeeAction, getEventRegistrations, getEvents, getRecentCheckInsAction, searchRegistration as searchRegistrationAction } from "@/lib/features/events/actions";
import { EventWithRelations, RegistrationWithRelations } from "@/lib/features/events/types";

export function EventCheckIn({ page, pageSize, recentPage, recentPageSize }: { page: number; pageSize: number; recentPage: number; recentPageSize: number }) {
	const [events, setEvents] = useState<EventWithRelations[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<EventWithRelations | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(false);
	const [checkingIn, setCheckingIn] = useState(false);
	const [recentCheckIns, setRecentCheckIns] = useState<RegistrationWithRelations[]>([]);
	const [recentCheckInsTotal, setRecentCheckInsTotal] = useState(0);
	const [eventRegistrations, setEventRegistrations] = useState<RegistrationWithRelations[]>([]);
	const [eventRegistrationsTotal, setEventRegistrationsTotal] = useState(0);
	const [loadingEventRegistrations, setLoadingEventRegistrations] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isScanning, setIsScanning] = useState(false);
	const streamRef = useRef<MediaStream | null>(null);
	const { data: session } = useSession();
	const router = useRouter();

	const loadEvents = useCallback(async () => {
		try {
			const result = await getEvents({
				status: "PUBLISHED",
			});
			if (result.success) {
				setEvents(result.data || []);
			} else {
				console.error("Failed to load events:", result.message);
			}
		} catch (error) {
			console.error("Failed to load events:", error);
		}
	}, []);

	const loadEventRegistrations = useCallback(async () => {
		if (!selectedEvent) return;

		setLoadingEventRegistrations(true);
		try {
			const skip = (page - 1) * pageSize;
			const result = await getEventRegistrations(selectedEvent.id, { skip, take: pageSize });
			if (result.success) {
				const data = result.data;
				if (data && typeof data === "object" && "registrations" in data) {
					setEventRegistrations(data.registrations);
					setEventRegistrationsTotal(data.total);
				} else {
					setEventRegistrations(Array.isArray(data) ? data : []);
					setEventRegistrationsTotal(0);
				}
			} else {
				console.error("Failed to load event registrations:", result.message);
				setEventRegistrations([]);
				setEventRegistrationsTotal(0);
			}
		} catch (error) {
			console.error("Failed to load event registrations:", error);
			setEventRegistrations([]);
			setEventRegistrationsTotal(0);
		} finally {
			setLoadingEventRegistrations(false);
		}
	}, [selectedEvent, page, pageSize]);
	const loadRecentCheckIns = useCallback(async () => {
		try {
			if (!session?.user?.id) return;

			const result = await getRecentCheckInsAction(session.user.id, { page: recentPage, pageSize: recentPageSize });
			if (result.success) {
				setRecentCheckIns(result.data || []);
				setRecentCheckInsTotal(result.total || 0);
			} else {
				console.error("Failed to load recent check-ins:", result.message);
			}
		} catch (error) {
			console.error("Failed to load recent check-ins:", error);
		}
	}, [session, recentPage, recentPageSize]);
	const searchRegistration = async () => {
		if (!selectedEvent || !searchTerm.trim()) return;

		setLoading(true);
		try {
			const result = await searchRegistrationAction(selectedEvent.id, searchTerm.trim());
			if (result.success && result.data) {
				setEventRegistrations([result.data]);
				setEventRegistrationsTotal(1);
			} else {
				setEventRegistrations([]);
				setEventRegistrationsTotal(0);
				toast.error("Not Found", { description: "No registration found for this search term." });
			}
		} catch (error) {
			console.error("Failed to search registration:", error);
			toast.error("Search Failed", { description: "Failed to search for registration." });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadEvents();
		loadRecentCheckIns();
		loadRecentCheckIns();
		if (selectedEvent) {
			loadEventRegistrations();
		} else {
			setEventRegistrations([]);
		}
	}, [selectedEvent, page, pageSize, loadEventRegistrations, loadEvents, loadRecentCheckIns]);

	const checkInAttendee = async (registration: RegistrationWithRelations) => {
		if (!session?.user?.id) {
			toast.error("Authentication Required", { description: "You must be logged in to check in attendees." });
			return;
		}

		setCheckingIn(true);
		try {
			const result = await checkInAttendeeAction(registration.id, session.user.id);
			if (result.success) {
				toast.success("Check-in Successful", { description: `${registration.user.name || registration.user.email} has been checked in.` });
				setSearchTerm("");
				loadRecentCheckIns();
				// Refresh the registration list to show updated status
				if (selectedEvent) {
					loadEventRegistrations();
				}
			} else {
				toast.error("Check-in Failed", { description: result.message });
			}
		} catch (error) {
			console.error("Failed to check in attendee:", error);
			toast.error("Check-in Failed", { description: "An error occurred during check-in." });
		} finally {
			setCheckingIn(false);
		}
	};

	const startScanning = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment" },
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.onloadedmetadata = () => {
					setIsScanning(true);
					captureQRCode(); // Start the scanning loop
				};
			}
		} catch (error) {
			console.error("Failed to access camera:", error);
			toast.error("Camera Access Failed", { description: "Unable to access camera for QR code scanning." });
		}
	};

	const stopScanning = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
		setIsScanning(false);
	};

	const captureQRCode = () => {
		if (!videoRef.current || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const video = videoRef.current;
		const context = canvas.getContext("2d");

		if (context) {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			context.drawImage(video, 0, 0, canvas.width, canvas.height);

			const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			const code = jsQR(imageData.data, imageData.width, imageData.height);

			if (code) {
				setSearchTerm(code.data);
				stopScanning();
				toast.info("QR Code Detected", { description: "Searching for registration..." });
				setTimeout(() => searchRegistration(), 500);
			} else {
				// Continue scanning if no QR code found
				if (isScanning) {
					requestAnimationFrame(captureQRCode);
				}
			}
		}
	};

	const getStatusBadge = (registration: RegistrationWithRelations) => {
		if (registration.checkedInAt) {
			const checkInConfig = CHECK_IN_STATUS_OPTIONS.find((option) => option.value === "checked_in");
			return <Badge variant={checkInConfig?.badgeVariant || "default"}>{checkInConfig?.label || "Checked In"}</Badge>;
		}
		const statusConfig = REGISTRATION_STATUSES.find((s) => s.value === registration.status);
		if (statusConfig) {
			return <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>;
		}
		return <Badge variant="outline">{registration.status}</Badge>;
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold">Event Check-In</h2>
				<p className="text-muted-foreground">Scan QR codes or manually search to check in attendees</p>
			</div>

			<Tabs
				defaultValue="manual"
				className="space-y-4">
				<TabsList>
					<TabsTrigger value="manual">Manual Search</TabsTrigger>
					<TabsTrigger value="qr">QR Code Scan</TabsTrigger>
				</TabsList>

				<TabsContent
					value="manual"
					className="m-0 space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Manual Check-In</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="event-select">Select Event</Label>
									<Select
										value={selectedEvent?.id || ""}
										onValueChange={(value) => {
											const event = events.find((e) => e.id === value);
											setSelectedEvent(event || null);
											setSearchTerm("");
										}}>
										<SelectTrigger>
											<SelectValue placeholder="Choose an event" />
										</SelectTrigger>
										<SelectContent>
											{events.map((event) => (
												<SelectItem
													key={event.id}
													value={event.id}>
													{event.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="search">Search by Email or Registration ID</Label>
									<div className="flex gap-2">
										<Input
											id="search"
											placeholder="Enter email or registration ID"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											onKeyPress={(e) => e.key === "Enter" && searchRegistration()}
											disabled={!selectedEvent}
										/>
										<Button
											onClick={searchRegistration}
											disabled={!selectedEvent || !searchTerm.trim() || loading}>
											{loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Event Registrations List */}
					{selectedEvent && (
						<>
							<h4 className="flex items-center justify-between">
								<span>Event Registrations</span>
								<Button
									onClick={loadEventRegistrations}
									disabled={loadingEventRegistrations}
									variant="outline"
									size="sm">
									{loadingEventRegistrations ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
								</Button>
							</h4>
							<div>
								{loadingEventRegistrations ? (
									<Loader size="lg" />
								) : eventRegistrations.length === 0 ? (
									<div className="text-muted-foreground py-8 text-center">
										<p>No registrations found for this event.</p>
									</div>
								) : (
									<div className="border-border bg-background max-h-[600px] space-y-1 overflow-y-auto rounded-lg border p-3 shadow">
										{eventRegistrations.map((registration) => (
											<div
												key={registration.id}
												className="flex items-center justify-between border-t p-2 first:border-t-0">
												<div className="flex items-center gap-3">
													<Avatar className="h-8 w-8">
														<AvatarImage src={registration.user.avatar} />
														<AvatarFallback className="text-xs">{registration.user.name?.charAt(0) || registration.user.email.charAt(0)}</AvatarFallback>
													</Avatar>
													<div className="flex items-center">
														<div className="flex items-center space-x-2">
															<h4 className="text-sm font-medium">{registration.user.name || "N/A"}</h4>
															<p className="text-muted-foreground text-xs">{registration.user.email}</p>
														</div>
													</div>
													<div className="mt-0.5 flex items-center gap-1">
														{getStatusBadge(registration)}
														{registration.tickets?.[0] && (
															<Badge
																variant="outline"
																className="px-1 py-0 text-xs">
																{registration.tickets[0].ticketType.name}
															</Badge>
														)}
													</div>
												</div>

												<div className="flex items-center gap-1">
													<div>
														{registration.checkedInAt ? (
															<div className="text-muted-foreground flex items-center gap-1">
																<CheckCircle className="h-3 w-3" />
																<span className="text-xs">{format(new Date(registration.checkedInAt), "HH:mm")}</span>
															</div>
														) : registration.status === "CONFIRMED" ? (
															<Button
																onClick={() => checkInAttendee(registration)}
																disabled={checkingIn}
																size="sm"
																className="h-7 px-2 text-xs">
																{checkingIn ? <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> : <CheckCircle className="mr-1 h-3 w-3" />}
																Check In
															</Button>
														) : (
															<div className="text-muted-foreground flex items-center gap-1">
																<XCircle className="h-3 w-3" />
																<span className="text-xs">Cannot check in</span>
															</div>
														)}
													</div>
												</div>
											</div>
										))}
										<div className="w-full">
											{/* Pagination for Event Registrations */}
											{eventRegistrationsTotal > 0 && (
												<div className="flex w-full flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
													<div className="text-center text-sm text-gray-600 sm:text-left">
														Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, eventRegistrationsTotal)} of {eventRegistrationsTotal} registrations
													</div>
													<div className="flex justify-center gap-2 sm:justify-end">
														{page > 1 && (
															<Button
																variant="outline"
																size="sm"
																onClick={() => {
																	const params = new URLSearchParams(window.location.search);
																	params.set("page", (page - 1).toString());
																	router.push(`/events/check-in?${params.toString()}`);
																}}
																className="gap-1 sm:gap-2">
																<ChevronLeft className="h-4 w-4" />
																<span className="xs:inline hidden">Previous</span>
															</Button>
														)}
														{page * pageSize < eventRegistrationsTotal && (
															<Button
																variant="outline"
																size="sm"
																onClick={() => {
																	const params = new URLSearchParams(window.location.search);
																	params.set("page", (page + 1).toString());
																	router.push(`/events/check-in?${params.toString()}`);
																}}
																className="gap-1 sm:gap-2">
																<span className="xs:inline hidden">Next</span>
																<ChevronRight className="h-4 w-4" />
															</Button>
														)}
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</>
					)}
				</TabsContent>

				<TabsContent
					value="qr"
					className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>QR Code Scanning</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label>Select Event</Label>
									<Select
										value={selectedEvent?.id || ""}
										onValueChange={(value) => {
											const event = events.find((e) => e.id === value);
											setSelectedEvent(event || null);
										}}>
										<SelectTrigger>
											<SelectValue placeholder="Choose an event" />
										</SelectTrigger>
										<SelectContent>
											{events.map((event) => (
												<SelectItem
													key={event.id}
													value={event.id}>
													{event.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-end">
									{!isScanning ? (
										<Button
											onClick={startScanning}
											disabled={!selectedEvent}
											className="w-full">
											<Camera className="mr-2 h-4 w-4" />
											Start Scanning
										</Button>
									) : (
										<Button
											onClick={stopScanning}
											variant="destructive"
											className="w-full">
											Stop Scanning
										</Button>
									)}
								</div>
							</div>

							{isScanning && (
								<div className="space-y-4">
									<div className="relative mx-auto max-w-md">
										<video
											ref={videoRef}
											autoPlay
											playsInline
											muted
											className="w-full rounded-lg border"
											onLoadedMetadata={() => {
												// Start capturing frames for QR code detection
												const interval = setInterval(captureQRCode, 500);
												return () => clearInterval(interval);
											}}
										/>
										<div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-blue-500">
											<div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 transform rounded-lg border-2 border-white"></div>
										</div>
									</div>
									<canvas
										ref={canvasRef}
										className="hidden"
									/>
									<Alert>
										<QrCode className="h-4 w-4" />
										<AlertDescription>Point your camera at a QR code. The system will automatically detect and process it.</AlertDescription>
									</Alert>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Recent Check-ins */}
			{recentCheckIns.length > 0 && (
				<>
					<h4 className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Recent Check-ins
					</h4>
					<div>
						<div className="space-y-3">
							{recentCheckIns.map((registration) => (
								<div
									key={registration.id}
									className="flex items-center justify-between border-b py-2 last:border-b-0">
									<div className="flex items-center gap-3">
										<Avatar className="h-8 w-8">
											<AvatarImage src={registration.user.avatar} />
											<AvatarFallback className="text-xs">{registration.user.name?.charAt(0) || registration.user.email.charAt(0)}</AvatarFallback>
										</Avatar>
										<div>
											<p className="text-sm font-medium">{registration.user.name || "N/A"}</p>
											<p className="text-muted-foreground text-xs">{registration.user.email}</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-muted-foreground text-sm">{registration.checkedInAt ? format(new Date(registration.checkedInAt), "HH:mm") : "N/A"}</p>
									</div>
								</div>
							))}
						</div>

						{/* Pagination for Recent Check-ins */}
						{recentCheckInsTotal > recentPageSize && (
							<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div className="text-center text-sm text-gray-600 sm:text-left">
									Showing {(recentPage - 1) * recentPageSize + 1} to {Math.min(recentPage * recentPageSize, recentCheckInsTotal)} of {recentCheckInsTotal} check-ins
								</div>
								<div className="flex justify-center gap-2 sm:justify-end">
									{recentPage > 1 && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												const params = new URLSearchParams(window.location.search);
												params.set("recentPage", (recentPage - 1).toString());
												router.push(`/events/check-in?${params.toString()}`);
											}}
											className="gap-1 sm:gap-2">
											<ChevronLeft className="h-4 w-4" />
											<span className="xs:inline hidden">Previous</span>
										</Button>
									)}
									{recentPage * recentPageSize < recentCheckInsTotal && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												const params = new URLSearchParams(window.location.search);
												params.set("recentPage", (recentPage + 1).toString());
												router.push(`/events/check-in?${params.toString()}`);
											}}
											className="gap-1 sm:gap-2">
											<span className="xs:inline hidden">Next</span>
											<ChevronRight className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
