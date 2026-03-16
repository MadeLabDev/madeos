"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserFormData, UserFormProps } from "@/lib/features/users/types";

export function UserForm({ user, roles, userGroups = [], onSubmit, onCancel, hideButtons = false }: UserFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(user?.userRoles.map((ur) => ur.role.id) || []);
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UserFormData>({
		defaultValues: {
			email: user?.email || "",
			username: user?.username || "",
			name: user?.name || "",
			roleIds: selectedRoleIds,
		},
	});

	const handleFormSubmit = async (data: UserFormData) => {
		setIsSubmitting(true);

		try {
			// If no roles selected, will be set to default "user" role by action
			const result = await onSubmit({
				...data,
				roleIds: selectedRoleIds && selectedRoleIds.length > 0 ? selectedRoleIds : [],
				groupId: selectedGroupId || undefined,
			});

			// Don't show toast here - let parent component handle it
			// This prevents duplicate toasts
			if (!result.success) {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	const toggleRole = (roleId: string) => {
		setSelectedRoleIds((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]));
	};

	return (
		<form
			onSubmit={handleSubmit(handleFormSubmit)}
			className="space-y-6"
			data-user-form>
			{/* Basic Information */}
			<Card>
				<CardHeader>
					<CardTitle>Basic Information</CardTitle>
					<CardDescription>Enter user's basic information</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="email">
							Email <span className="text-error">*</span>
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="user@example.com"
							{...register("email", {
								required: "Email is required",
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: "Invalid email address",
								},
							})}
							disabled={isSubmitting}
						/>
						{errors.email && <p className="text-error text-sm">{errors.email.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="username">
							Username <span className="text-muted-foreground text-sm"> (Username must be 3-20 characters)</span>
						</Label>
						<Input
							id="username"
							type="text"
							placeholder="johndoe"
							{...register("username", {
								validate: (value) => {
									if (!value || value.trim() === "") return true;
									if (!/^[a-zA-Z0-9_-]{3,20}$/.test(value)) {
										return "Username must be 3-20 characters (letters, numbers, underscore, hyphen)";
									}
									return true;
								},
							})}
							disabled={isSubmitting}
						/>
						{/* {errors.username && (
              <p className="text-sm text-error">{errors.username.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Optional. Must be 3-20 characters using letters, numbers, underscores or hyphens.
            </p> */}
					</div>

					<div className="space-y-2">
						<Label htmlFor="name">Full Name</Label>
						<Input
							id="name"
							type="text"
							placeholder="John Doe"
							{...register("name")}
							disabled={isSubmitting}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">
							Password
							{user && <span className="text-muted-foreground text-sm"> (leave blank to keep current)</span>}
							{!user && <span className="text-muted-foreground text-sm"> (optional - will send activation email if empty)</span>}
						</Label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							{...register("password", {
								minLength: {
									value: 6,
									message: "Password must be at least 6 characters",
								},
								validate: (value) => {
									// Skip validation if empty (optional password)
									if (!value || value.trim() === "") return true;
									// If provided, must be at least 6 characters
									return value.length >= 6 || "Password must be at least 6 characters";
								},
							})}
							disabled={isSubmitting}
						/>
						{/* {errors.password && (
              <p className="text-sm text-error">{errors.password.message}</p>
            )}
            {!user && (
              <p className="text-sm text-muted-foreground">
                Leave blank to send an activation email where the user can set their own password
              </p>
            )} */}
					</div>
				</CardContent>
			</Card>

			{/* User Group Assignment */}
			{userGroups && userGroups.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>User Group (Optional)</CardTitle>
						<CardDescription>Assign user to a group</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="group-select">Select Group</Label>
							<Select
								value={selectedGroupId}
								onValueChange={setSelectedGroupId}
								disabled={isSubmitting}>
								<SelectTrigger id="group-select">
									<SelectValue placeholder="Choose a group (optional)" />
								</SelectTrigger>
								<SelectContent>
									{userGroups.map((group) => (
										<SelectItem
											key={group.id}
											value={group.id}>
											{group.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-muted-foreground text-sm">User can be assigned to a group for better organization</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Role Assignment */}
			<Card>
				<CardHeader>
					<CardTitle>Roles & Permissions</CardTitle>
					<CardDescription>Assign roles to grant permissions</CardDescription>
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

			{/* Form Actions */}
			{!hideButtons && (
				<div className="flex items-center justify-end space-x-3">
					{onCancel && (
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isSubmitting}>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
					)}
					<Button
						type="submit"
						disabled={isSubmitting}>
						{isSubmitting && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						{!isSubmitting && <Save className="mr-2 h-4 w-4" />}
						{user ? "Update User" : "Create User"}
					</Button>
				</div>
			)}

			{hideButtons && (
				<div className="hidden">
					{onCancel && (
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isSubmitting}>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
					)}
					<Button
						type="submit"
						disabled={isSubmitting}>
						{isSubmitting && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						{!isSubmitting && <Save className="mr-2 h-4 w-4" />}
						{user ? "Update User" : "Create User"}
					</Button>
				</div>
			)}
		</form>
	);
}
