"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { Calendar, CheckCircle, Clock, MapPin, Users, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { CHECK_IN_STATUS_OPTIONS, REGISTRATION_STATUSES } from "@/lib/config/module-types";
import { checkInAttendeeAction, getUserRegistrations } from "@/lib/features/events/actions";
import { RegistrationWithRelations } from "@/lib/features/events/types";

export function UserEventCheckIn() {
	const [registrations, setRegistrations] = useState<RegistrationWithRelations[]>([]);
	const [loading, setLoading] = useState(true);
	const [checkingIn, setCheckingIn] = useState<string | null>(null);
	const { data: session } = useSession();

	const loadUserRegistrations = useCallback(async () => {
		if (!session?.user?.id) return;

		setLoading(true);
		try {
			const result = await getUserRegistrations(session.user.id);
			if (result.success) {
				// Filter out registrations without event data
				const validRegistrations = (result.data || []).filter((reg) => reg.event);
				setRegistrations(validRegistrations);
			} else {
				console.error("Failed to load registrations:", result.message);
				setRegistrations([]);
			}
		} catch (error) {
			console.error("Failed to load registrations:", error);
			setRegistrations([]);
		} finally {
			setLoading(false);
		}
	}, [session?.user?.id]);

	useEffect(() => {
		loadUserRegistrations();
	}, [session, loadUserRegistrations]);

	const handleCheckIn = async (registration: RegistrationWithRelations) => {
		if (!session?.user?.id) {
			toast.error("Authentication Required", { description: "You must be logged in to check in." });
			return;
		}

		// Ensure event exists
		if (!registration.event) {
			toast.error("Check-in Failed", { description: "Event information is missing." });
			return;
		}

		setCheckingIn(registration.id);
		try {
			const result = await checkInAttendeeAction(registration.id, session.user.id);
			if (result.success) {
				toast.success("Check-in Successful", { description: `You have been checked in for ${registration.event.title}!` });
				// Refresh registrations
				loadUserRegistrations();
			} else {
				toast.error("Check-in Failed", { description: result.message });
			}
		} catch (error) {
			console.error("Failed to check in:", error);
			toast.error("Check-in Failed", { description: "An error occurred during check-in." });
		} finally {
			setCheckingIn(null);
		}
	};

	const getStatusBadge = (registration: RegistrationWithRelations) => {
		if (registration.checkedInAt) {
			const checkInConfig = CHECK_IN_STATUS_OPTIONS.find((option) => option.value === "checked_in");
			return (
				<Badge
					variant={checkInConfig?.badgeVariant || "default"}
					className="bg-green-500">
					{checkInConfig?.label || "Checked In"}
				</Badge>
			);
		}
		const statusConfig = REGISTRATION_STATUSES.find((s) => s.value === registration.status);
		if (statusConfig) {
			return <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>;
		}
		return <Badge variant="outline">{registration.status}</Badge>;
	};

	const canCheckIn = (registration: RegistrationWithRelations) => {
		// Can check in if:
		// 1. Registration is CONFIRMED
		// 2. Not already checked in
		// 3. Event is happening today or in the future
		// 4. Event has check-in enabled
		const now = new Date();
		const eventDate = new Date(registration.event!.startDate);

		return (
			registration.status === "CONFIRMED" &&
			!registration.checkedInAt &&
			eventDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000) && // Within 24 hours of event
			registration.event!.enableCheckIn
		);
	};

	if (loading) {
		return <Loader size="lg" />;
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold">My Event Registrations</h2>
				<p className="text-muted-foreground">View your upcoming events and check in when you arrive</p>
			</div>

			{registrations.length === 0 ? (
				<Card>
					<CardContent className="py-12">
						<div className="text-center">
							<Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
							<h3 className="mb-2 text-lg font-semibold">No Registrations Found</h3>
							<p className="text-muted-foreground mb-4">You haven't registered for any events yet.</p>
							<Button asChild>
								<a href="/events">Browse Events</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6">
					{registrations.map((registration) => (
						<Card
							key={registration.id}
							className="gap-0 overflow-hidden">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<CardTitle className="text-xl">{registration.event!.title}</CardTitle>
										<div className="text-muted-foreground flex items-center gap-4 text-sm">
											<div className="flex items-center gap-1">
												<Calendar className="h-4 w-4" />
												{format(new Date(registration.event!.startDate), "PPP")}
											</div>
											<div className="flex items-center gap-1">
												<MapPin className="h-4 w-4" />
												{registration.event!.location || "TBD"}
											</div>
										</div>
									</div>
									<div className="space-x-2 text-right">
										{getStatusBadge(registration)}
										{registration.tickets?.[0] && (
											<Badge
												variant="outline"
												className="text-xs">
												{registration.tickets[0].ticketType.name}
											</Badge>
										)}
									</div>
								</div>
							</CardHeader>

							<CardContent>
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										{registration.checkedInAt ? (
											<div className="flex items-center gap-2 text-green-600">
												<CheckCircle className="h-5 w-5" />
												<span className="text-sm font-medium">Checked in at {format(new Date(registration.checkedInAt), "HH:mm")}</span>
											</div>
										) : canCheckIn(registration) ? (
											<div className="space-y-2">
												<div className="flex items-center gap-2 text-blue-600">
													<Clock className="h-5 w-5" />
													<span className="text-sm">Ready to check in</span>
												</div>
												<Button
													onClick={() => handleCheckIn(registration)}
													disabled={checkingIn === registration.id}
													size="sm"
													className="bg-green-600 hover:bg-green-700">
													{checkingIn === registration.id ? (
														<>
															<Loader size="lg" />
															Checking in...
														</>
													) : (
														<>
															<CheckCircle className="mr-2 h-4 w-4" />
															Check In Now
														</>
													)}
												</Button>
											</div>
										) : registration.status === "CONFIRMED" ? (
											<div className="flex items-center gap-2 text-orange-600">
												<Clock className="h-5 w-5" />
												<span className="text-sm">Check-in available closer to event time</span>
											</div>
										) : (
											<div className="flex items-center gap-2 text-red-600">
												<XCircle className="h-5 w-5" />
												<span className="text-sm">Not eligible for check-in</span>
											</div>
										)}
									</div>

									<div className="text-muted-foreground text-right text-sm">
										<p>Registered: {format(new Date(registration.registeredAt), "MMM dd, yyyy")}</p>
										{registration.event!.description && (
											<p
												className="mt-1 max-w-xs truncate"
												title={registration.event!.description}>
												{registration.event!.description}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{registrations.some((r) => r.checkedInAt) && (
				<Alert>
					<CheckCircle className="h-4 w-4" />
					<AlertDescription>You have successfully checked in to {registrations.filter((r) => r.checkedInAt).length} event(s). Show your confirmation or QR code at the venue if requested.</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
