"use client";

import { useState } from "react";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import { createUserGroupAction, updateUserGroupAction } from "@/lib/features/user-groups/actions";
import { UserGroupFormProps } from "@/lib/features/user-groups/types";

export function UserGroupForm({ userGroup, onSubmit, onCancel, isEditing = false, hideButtons = false }: UserGroupFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: userGroup?.name || "",
		description: userGroup?.description || "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast.error("Group name is required");
			return;
		}

		setIsSubmitting(true);
		try {
			let result;

			if (onSubmit) {
				// Custom submit handler
				result = await onSubmit({
					name: formData.name.trim(),
					description: formData.description.trim() || undefined,
				});
			} else if (isEditing && userGroup) {
				// Edit mode
				result = await updateUserGroupAction(userGroup.id, {
					name: formData.name.trim(),
					description: formData.description.trim() || undefined,
				});
			} else {
				// Create mode
				result = await createUserGroupAction({
					name: formData.name.trim(),
					description: formData.description.trim() || undefined,
				});
			}

			if (result.success) {
				toast.success(result.message);
				if (isEditing && userGroup) {
					router.push(`/user-groups/${userGroup.id}`);
				} else {
					router.push("/user-groups");
				}
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(`Failed to ${isEditing ? "update" : "create"} user group`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{isEditing ? "Edit User Group" : "Create User Group"}</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					data-user-group-form>
					<div className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name">Group Name *</Label>
							<Input
								id="name"
								type="text"
								value={formData.name}
								onChange={(e) => handleInputChange("name", e.target.value)}
								placeholder="Enter group name"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => handleInputChange("description", e.target.value)}
								placeholder="Enter group description (optional)"
								rows={3}
							/>
						</div>
					</div>

					{!hideButtons && (
						<div className="mt-6 flex justify-end gap-2">
							{onCancel && (
								<Button
									type="button"
									variant="outline"
									onClick={onCancel}>
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
										className="mr-2 h-4 w-4"
									/>
								)}
								{isSubmitting ? "Saving..." : isEditing ? "Update Group" : "Create Group"}
							</Button>
						</div>
					)}

					{hideButtons && (
						<button
							type="submit"
							className="hidden"
							aria-hidden="true"
						/>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
