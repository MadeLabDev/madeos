"use client";

import { useCallback, useState } from "react";

import { Calendar, Mail, Pencil, Shield, User } from "lucide-react";
import Link from "next/link";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDetailWrapperProps } from "@/lib/features/users/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

import { ActivateUserButton } from "./activate-user-button";
import { ResendActivationButton } from "./resend-activation-button";

export function UserDetailWrapper({ userId, initialUser }: UserDetailWrapperProps) {
	const [user, setUser] = useState(initialUser);

	// Subscribe to Pusher
	usePusher();

	// Handle real-time user updates
	const handleUserUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			// Only update if this event is for the current user
			if (data.userId === userId) {
				setUser((prev) => {
					if (data.user) {
						// Merge updated user data with existing data
						return { ...prev, ...data.user };
					}
					return prev;
				});
			}
		},
		[userId],
	);

	// Listen for user update events
	useChannelEvent("private-global", "user_update", handleUserUpdate);

	return (
		<>
			<SetBreadcrumb
				segment={userId}
				label={user.name || user.email}
			/>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">{user.name || "User Details"}</h1>
						<p className="text-muted-foreground">{user.email}</p>
						{!user.isActive && (
							<Badge
								variant="destructive"
								className="mt-2">
								Pending Activation
							</Badge>
						)}
					</div>
					<div className="flex gap-2">
						{!user.isActive && (
							<>
								<ActivateUserButton
									userId={userId}
									userEmail={user.email}
									isActive={user.isActive}
								/>
								<ResendActivationButton
									userId={userId}
									userEmail={user.email}
								/>
							</>
						)}
						<Link href={`/users/${userId}/edit`}>
							<Button>
								<Pencil className="mr-2 h-4 w-4" />
								Edit User
							</Button>
						</Link>
					</div>
				</div>

				{/* User Information */}
				<div className="grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
							<CardDescription>User account details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-start gap-3">
								<Mail className="text-muted-foreground mt-0.5 h-5 w-5" />
								<div>
									<p className="text-sm font-medium">Email</p>
									<p className="text-muted-foreground text-sm">{user.email}</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<User className="text-muted-foreground mt-0.5 h-5 w-5" />
								<div>
									<p className="text-sm font-medium">Full Name</p>
									<p className="text-muted-foreground text-sm">{user.name || "—"}</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
								<div>
									<p className="text-sm font-medium">Created</p>
									<p className="text-muted-foreground text-sm">{new Date(user.createdAt).toLocaleString()}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Roles & Permissions</CardTitle>
							<CardDescription>Assigned roles and access levels</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<Shield className="text-muted-foreground mt-0.5 h-5 w-5" />
									<div className="flex-1">
										<p className="mb-2 text-sm font-medium">Roles</p>
										<div className="flex flex-wrap gap-2">
											{user.userRoles.length === 0 ? (
												<Badge
													variant="outline"
													className="text-muted-foreground">
													No roles assigned
												</Badge>
											) : (
												user.userRoles.map((ur: any) => (
													<Badge
														key={ur.role.id}
														variant="secondary">
														{ur.role.displayName}
													</Badge>
												))
											)}
										</div>
									</div>
								</div>

								{user.userRoles.length > 0 && (
									<div className="rounded-md border p-4">
										<p className="mb-3 text-sm font-medium">Permissions</p>
										<div className="space-y-2">
											{user.userRoles.map((ur: any) => (
												<div
													key={ur.role.id}
													className="space-y-1">
													<p className="text-muted-foreground text-sm font-semibold">{ur.role.displayName}:</p>
													<div className="flex flex-wrap gap-1">
														{(ur.role.rolePermissions?.length ?? 0) === 0 ? (
															<span className="text-muted-foreground text-sm">No specific permissions</span>
														) : (
															ur.role.rolePermissions?.map((rp: any, idx: number) => (
																<Badge
																	key={idx}
																	variant="outline"
																	className="text-xs">
																	{rp.module.name}: {rp.permission.action}
																</Badge>
															))
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
