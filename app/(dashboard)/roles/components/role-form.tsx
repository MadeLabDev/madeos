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
import type { RoleFormProps } from "@/lib/features/roles/types";

export function RoleForm({ role, title, submitButtonText, onSubmit, redirectPath = "/roles", hideButtons = false }: RoleFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(e.currentTarget);
			const submitData: any = {
				name: (formData.get("name") as string) || role?.name || "",
				displayName: formData.get("displayName") as string,
				description: (formData.get("description") as string) || undefined,
			};

			const result = await onSubmit(submitData);

			if (!result.success) {
				toast.error("Failed to save role", {
					description: result.message,
				});
				return;
			}

			toast.success("Role saved successfully", {
				description: result.data?.displayName ? `${result.data.displayName} has been saved` : "Role saved",
			});

			router.push(redirectPath);
		} catch (error) {
			toast.error("Error saving role", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className="space-y-6"
					data-role-form>
					<div className="space-y-2">
						<Label htmlFor="name">Role Name</Label>
						{role ? (
							<>
								<Input
									id="name"
									value={role.name}
									disabled
									className="bg-muted"
								/>
								<p className="text-muted-foreground text-sm">Role name cannot be changed</p>
							</>
						) : (
							<>
								<Input
									id="name"
									name="name"
									placeholder="e.g., custom_role"
									required
									pattern="^[a-z_]+$"
									title="Role name must be lowercase with underscores only"
								/>
								<p className="text-muted-foreground text-sm">Lowercase name with underscores (e.g., sales_manager)</p>
							</>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="displayName">Display Name</Label>
						<Input
							id="displayName"
							name="displayName"
							placeholder="e.g., Sales Manager"
							defaultValue={role?.displayName}
							required
						/>
						<p className="text-muted-foreground text-sm">Human-readable role name</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							placeholder="Describe the purpose of this role..."
							defaultValue={role?.description || ""}
							rows={4}
						/>
						<p className="text-muted-foreground text-sm">Optional description for this role</p>
					</div>

					<div className="flex justify-end gap-2">
						{!hideButtons && (
							<>
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
									disabled={isLoading}>
									<X className="mr-2 h-4 w-4" />
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isLoading}>
									{isLoading && (
										<Loader
											size="sm"
											className="mr-2"
										/>
									)}
									{isLoading ? `${submitButtonText}...` : submitButtonText}
								</Button>
							</>
						)}
						{hideButtons && (
							<div className="hidden">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
									disabled={isLoading}>
									<X className="mr-2 h-4 w-4" />
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isLoading}>
									{isLoading && (
										<Loader
											size="sm"
											className="mr-2"
										/>
									)}
									{isLoading ? `${submitButtonText}...` : submitButtonText}
								</Button>
							</div>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
