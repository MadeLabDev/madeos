"use client";

import { useEffect, useState } from "react";

import { format } from "date-fns";
import { Calendar, CheckCircle, ChevronLeft, ChevronRight, Download, Filter, Search, Users, XCircle } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CHECK_IN_STATUS_OPTIONS, REGISTRATION_STATUSES } from "@/lib/config/module-types";
import { EventWithRelations, RegistrationWithRelations, Ticket, TicketType } from "@/lib/features/events/types";

function RegistrationQRCode({ registrationId }: { registrationId: string }) {
	const [qrDataUrl, setQrDataUrl] = useState<string>("");

	useEffect(() => {
		QRCode.toDataURL(registrationId, { width: 100, margin: 1 })
			.then((url) => setQrDataUrl(url))
			.catch((err) => console.error("Failed to generate QR code:", err));
	}, [registrationId]);

	if (!qrDataUrl) return <div className="h-16 w-16 animate-pulse rounded bg-gray-100" />;

	return (
		<Image
			src={qrDataUrl}
			alt={`QR Code for ${registrationId}`}
			width={64}
			height={64}
		/>
	);
}

import { useRouter } from "next/navigation";

export function EventAttendees({ initialRegistrations, initialEvents, total, page, pageSize, search, eventId, status, checkIn }: { initialRegistrations: RegistrationWithRelations[]; initialEvents: EventWithRelations[]; total: number; page: number; pageSize: number; search: string; eventId: string; status: string; checkIn: string }) {
	const router = useRouter();
	const [registrations] = useState<RegistrationWithRelations[]>(initialRegistrations);
	const [events] = useState<EventWithRelations[]>(initialEvents);
	const [loading] = useState(false);
	const [searchInput, setSearchInput] = useState(search);
	const [eventFilter, setEventFilter] = useState<string>(eventId || "all");
	const [statusFilter, setStatusFilter] = useState<string>(status || "all");
	const [checkInFilter, setCheckInFilter] = useState<string>(checkIn || "all");

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (searchInput) params.set("search", searchInput);
		if (eventFilter !== "all") params.set("eventId", eventFilter);
		if (statusFilter !== "all") params.set("status", statusFilter);
		if (checkInFilter !== "all") params.set("checkIn", checkInFilter);
		params.set("page", "1"); // Reset to first page on search
		router.push(`/events/attendees?${params.toString()}`);
	};

	const exportAttendees = () => {
		const csvData = registrations.map((registration) => ({
			Event: registration.event?.title || "Unknown Event",
			Name: registration.user.name || "",
			Email: registration.user.email,
			Phone: registration.user.phone || "",
			TicketType: registration.tickets?.[0]?.ticketType?.name || "N/A",
			Quantity: registration.tickets?.length || 0,
			TotalAmount: registration.tickets?.reduce((total: number, ticket: Ticket & { ticketType: TicketType }) => total + ticket.ticketType.price, 0) || 0,
			Status: registration.status,
			CheckInStatus: registration.checkedInAt ? "Checked In" : "Not Checked In",
			RegisteredAt: format(new Date(registration.createdAt), "yyyy-MM-dd HH:mm:ss"),
			CheckedInAt: registration.checkedInAt ? format(new Date(registration.checkedInAt), "yyyy-MM-dd HH:mm:ss") : "",
		}));

		if (csvData.length === 0) return;

		const csvString = [Object.keys(csvData[0]!).join(","), ...csvData.map((row) => Object.values(row).join(","))].join("\n");

		const blob = new Blob([csvString], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `event-attendees-${format(new Date(), "yyyy-MM-dd")}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = REGISTRATION_STATUSES.find((s) => s.value === status);
		if (statusConfig) {
			return <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>;
		}
		return <Badge variant="outline">{status}</Badge>;
	};

	const getCheckInBadge = (registration: RegistrationWithRelations) => {
		const checkInConfig = CHECK_IN_STATUS_OPTIONS.find((option) => option.value === (registration.checkedInAt ? "checked_in" : "not_checked_in"));
		if (checkInConfig) {
			return <Badge variant={checkInConfig.badgeVariant}>{checkInConfig.label}</Badge>;
		}
		return <Badge variant="outline">Unknown</Badge>;
	};

	const getStats = () => {
		const total = registrations.length;
		const checkedIn = registrations.filter((r) => r.checkedInAt).length;
		const confirmed = registrations.filter((r) => r.status === "CONFIRMED").length;
		const pending = registrations.filter((r) => r.status === "PENDING").length;

		return { total, checkedIn, confirmed, pending };
	};

	const stats = getStats();

	if (loading) {
		return <Loader size="lg" />;
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
						<Users className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Checked In</CardTitle>
						<CheckCircle className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
						<p className="text-muted-foreground text-xs">{stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}% of total</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Confirmed</CardTitle>
						<Calendar className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.confirmed}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<XCircle className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.pending}</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						<CardTitle>All Attendees</CardTitle>
						<Button
							variant="outline"
							onClick={exportAttendees}>
							<Download className="mr-2 h-4 w-4" />
							Export CSV
						</Button>
					</div>

					<div className="flex flex-col gap-4 sm:flex-row">
						<div className="flex-1">
							<div className="relative">
								<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
								<Input
									placeholder="Search by name, email, or event..."
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSearch();
										}
									}}
									className="pl-10"
								/>
							</div>
						</div>

						<div className="flex gap-2">
							<Select
								value={eventFilter}
								onValueChange={setEventFilter}>
								<SelectTrigger className="w-40">
									<Filter className="mr-2 h-4 w-4" />
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Events</SelectItem>
									{events.map((event) => (
										<SelectItem
											key={event.id}
											value={event.id}>
											{event.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={statusFilter}
								onValueChange={setStatusFilter}>
								<SelectTrigger className="w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									{REGISTRATION_STATUSES.map((status) => (
										<SelectItem
											key={status.value}
											value={status.value}>
											{status.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={checkInFilter}
								onValueChange={setCheckInFilter}>
								<SelectTrigger className="w-36">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Check-ins</SelectItem>
									{CHECK_IN_STATUS_OPTIONS.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					{registrations.length === 0 ? (
						<div className="py-8 text-center">
							<p className="text-muted-foreground">{registrations.length === 0 ? "No registrations found." : "No registrations match your filters."}</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>QR Code</TableHead>
										<TableHead>Attendee</TableHead>
										<TableHead>Event</TableHead>
										<TableHead>Ticket Type</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Check-in</TableHead>
										<TableHead>Registered</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{registrations.map((registration) => (
										<TableRow key={registration.id}>
											<TableCell>
												<RegistrationQRCode registrationId={registration.id} />
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar className="h-8 w-8">
														<AvatarImage src={registration.user.avatar} />
														<AvatarFallback>{registration.user.name?.charAt(0) || registration.user.email.charAt(0)}</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{registration.user.name || "N/A"}</p>
														<p className="text-muted-foreground text-sm">{registration.user.email}</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div>
													<p className="font-medium">{registration.event?.title || "Unknown Event"}</p>
													<p className="text-muted-foreground text-sm">{registration.event ? format(new Date(registration.event.startDate), "MMM dd, yyyy") : "N/A"}</p>
												</div>
											</TableCell>
											<TableCell>{registration.tickets?.[0]?.ticketType?.name || "N/A"}</TableCell>
											<TableCell>{getStatusBadge(registration.status)}</TableCell>
											<TableCell>{getCheckInBadge(registration)}</TableCell>
											<TableCell>
												<div className="text-sm">{format(new Date(registration.createdAt), "MMM dd, yyyy")}</div>
												<div className="text-muted-foreground text-xs">{format(new Date(registration.createdAt), "HH:mm")}</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Pagination */}
			{total > 0 && (
				<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="text-center text-sm text-gray-600 sm:text-left">
						Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} registrations
					</div>
					<div className="flex justify-center gap-2 sm:justify-end">
						{page > 1 && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									const params = new URLSearchParams();
									if (searchInput) params.set("search", searchInput);
									if (eventFilter !== "all") params.set("eventId", eventFilter);
									if (statusFilter !== "all") params.set("status", statusFilter);
									if (checkInFilter !== "all") params.set("checkIn", checkInFilter);
									params.set("page", (page - 1).toString());
									router.push(`/events/attendees?${params.toString()}`);
								}}
								className="gap-1 sm:gap-2">
								<ChevronLeft className="h-4 w-4" />
								<span className="xs:inline hidden">Previous</span>
							</Button>
						)}
						{page * pageSize < total && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									const params = new URLSearchParams();
									if (searchInput) params.set("search", searchInput);
									if (eventFilter !== "all") params.set("eventId", eventFilter);
									if (statusFilter !== "all") params.set("status", statusFilter);
									if (checkInFilter !== "all") params.set("checkIn", checkInFilter);
									params.set("page", (page + 1).toString());
									router.push(`/events/attendees?${params.toString()}`);
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
	);
}
