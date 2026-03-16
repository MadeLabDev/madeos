"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAllUserGroupsAction } from "@/lib/features/user-groups/actions";
import { createMultipleUsersAction } from "@/lib/features/users/actions";
import type { MassCreateResponse } from "@/lib/features/users/types";

export interface MassCreateUserFormProps {
	roles: any[];
	onSuccess?: () => void;
	onSubmitRef?: (handler: () => void) => void;
	onClearRef?: (handler: () => void) => void;
}

export function MassCreateUserForm({ roles, onSuccess, onSubmitRef, onClearRef }: MassCreateUserFormProps) {
	const [emailText, setEmailText] = useState("");
	const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [userGroups, setUserGroups] = useState<any[]>([]);
	const [loadingGroups, setLoadingGroups] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [progress, setProgress] = useState(0);

	// Load user groups on mount
	useEffect(() => {
		const loadGroups = async () => {
			try {
				const result = await getAllUserGroupsAction();
				if (result.success && result.data) {
					setUserGroups(result.data as any[]);
				}
			} catch (error) {
				console.error("Failed to load user groups:", error);
			} finally {
				setLoadingGroups(false);
			}
		};

		loadGroups();
	}, []);

	// Register submit handler with parent
	useEffect(() => {
		if (onSubmitRef) {
			onSubmitRef(() => {
				const form = document.querySelector("form[data-mass-create-form]") as HTMLFormElement;
				form?.dispatchEvent(new Event("submit", { bubbles: true }));
			});
		}
	}, [onSubmitRef]);

	// Register clear handler with parent
	useEffect(() => {
		if (onClearRef) {
			onClearRef(() => {
				setEmailText("");
				setSelectedRoleIds([]);
				setSelectedGroupId("");
			});
		}
	}, [onClearRef]);

	// Parse emails from textarea (split by comma or newline)
	const parseEmails = (text: string): string[] => {
		return text
			.split(/[,\n]/)
			.map((email) => email.trim())
			.filter((email) => email.length > 0 && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email));
	};

	const emails = parseEmails(emailText);
	const uniqueEmails = Array.from(new Set(emails));

	const toggleRole = (roleId: string) => {
		setSelectedRoleIds((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (uniqueEmails.length === 0) {
			toast.error("Please enter at least one valid email");
			return;
		}

		setIsSubmitting(true);
		setProgress(0);

		try {
			// Simulate progress updates
			const progressInterval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 90) return 90;
					return prev + Math.random() * 30;
				});
			}, 500);

			const result = await createMultipleUsersAction({
				emails: uniqueEmails,
				roleIds: selectedRoleIds.length > 0 ? selectedRoleIds : [],
				userGroupId: selectedGroupId || undefined,
			});

			clearInterval(progressInterval);
			setProgress(100);

			if (result.success && result.data) {
				const response = result.data as MassCreateResponse;

				// Show summary toast
				toast.success(`Created ${response.successCount} users, Skipped ${response.skipCount} (already exist), Failed ${response.failureCount}`);

				// Clear form if all successful
				if (response.failureCount === 0 && response.skipCount === 0) {
					setEmailText("");
					setSelectedRoleIds([]);
					setSelectedGroupId("");
					onSuccess?.();
				}
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsSubmitting(false);
			setProgress(0);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
			data-mass-create-form>
			{/* Email Input */}
			<Card>
				<CardHeader>
					<CardTitle>Email List</CardTitle>
					<CardDescription>Enter email addresses separated by commas or newlines</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="emails">
							Email Addresses <span className="text-error">*</span>
						</Label>
						<Textarea
							id="emails"
							placeholder="user1@example.com, user2@example.com&#10;user3@example.com&#10;user4@example.com"
							value={emailText}
							onChange={(e) => setEmailText(e.target.value)}
							disabled={isSubmitting}
							className="font-mono text-sm"
							rows={10}
						/>
						<div className="flex items-center justify-between text-sm">
							<div className="space-y-1">
								<span className="text-muted-foreground block">{uniqueEmails.length} valid email(s) found</span>
								{uniqueEmails.length > 0 && <span className="text-muted-foreground text-xs">Estimated time: ~{Math.ceil(uniqueEmails.length * 1.5)}s (1.5s per email to avoid spam detection)</span>}
							</div>
							{uniqueEmails.length > 0 && (
								<button
									type="button"
									className="text-primary text-xs hover:underline"
									onClick={() => setEmailText("")}>
									Clear
								</button>
							)}
						</div>
					</div>

					{uniqueEmails.length > 0 && (
						<div className="bg-muted max-h-32 overflow-y-auto rounded-lg p-3">
							<p className="mb-2 text-sm font-semibold">Emails to be created:</p>
							<div className="flex flex-wrap gap-2">
								{uniqueEmails.map((email) => (
									<span
										key={email}
										className="bg-background rounded px-2 py-1 font-mono text-xs">
										{email}
									</span>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* User Group Selection */}
			<Card>
				<CardHeader>
					<CardTitle>Add to User Group (Optional)</CardTitle>
					<CardDescription>Assign all newly created users to an existing user group</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<Label htmlFor="user-group">User Group</Label>
						{loadingGroups ? (
							<div className="flex items-center justify-center py-8">
								<Loader
									size="sm"
									className="mr-2"
								/>
								<span className="text-muted-foreground text-sm">Loading groups...</span>
							</div>
						) : userGroups.length === 0 ? (
							<div className="bg-muted rounded-lg border border-dashed p-4 text-center">
								<p className="text-muted-foreground text-sm">No user groups available</p>
							</div>
						) : (
							<Select
								value={selectedGroupId}
								onValueChange={setSelectedGroupId}
								disabled={isSubmitting}>
								<SelectTrigger id="user-group">
									<SelectValue placeholder="Select a user group (optional)" />
								</SelectTrigger>
								<SelectContent>
									{userGroups.map((group: any) => (
										<SelectItem
											key={group.id}
											value={group.id}>
											{group.name}
											{group._count?.members > 0 && <span className="text-muted-foreground ml-2 text-xs">({group._count.members} members)</span>}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						<p className="text-muted-foreground text-xs">{selectedGroupId ? "Created users will be added to this group" : "Leave empty to skip group assignment"}</p>
					</div>
				</CardContent>
			</Card>

			{/* Role Selection */}
			<Card>
				<CardHeader>
					<CardTitle>Default Roles & Permissions</CardTitle>
					<CardDescription>Assign roles to all new users (if none selected, will be assigned default "user" role)</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						{roles.map((role) => (
							<div
								key={role.id}
								className="flex items-start space-x-3 rounded-lg border p-3">
								<Checkbox
									id={`role-${role.id}`}
									checked={selectedRoleIds.includes(role.id)}
									onCheckedChange={() => toggleRole(role.id)}
									disabled={isSubmitting}
								/>
								<div className="flex-1 space-y-1">
									<Label
										htmlFor={`role-${role.id}`}
										className="cursor-pointer font-semibold">
										{role.displayName}
									</Label>
									{role.description && <p className="text-muted-foreground text-sm">{role.description}</p>}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Progress */}
			{isSubmitting && (
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Creating users...</span>
								<span className="text-muted-foreground text-sm">{Math.round(progress)}%</span>
							</div>
							<div className="bg-muted h-2 w-full rounded-full">
								<div
									className="bg-primary h-2 rounded-full transition-all duration-300"
									style={{ width: `${progress}%` }}></div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</form>
	);
}
