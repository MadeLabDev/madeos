"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { updateProfile } from "@/lib/features/users/actions";
import type { ProfileFormProps } from "@/lib/features/users/types";

export function ProfileForm({ initialData }: ProfileFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState({
		name: initialData.name || "",
		username: initialData.username || "",
		image: initialData.image || "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const result = await updateProfile({
				name: data.name || undefined,
				username: data.username || undefined,
				image: data.image || undefined,
			});

			if (result.success) {
				toast.success("Profile updated", {
					description: result.message,
				});
				router.refresh();
			} else {
				toast.error("Update failed", {
					description: result.message,
				});
			}
		} catch (error) {
			toast.error("Error", {
				description: "An unexpected error occurred",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="p-6">
			<form
				onSubmit={handleSubmit}
				className="space-y-6">
				<div>
					<Label htmlFor="email">Email Address (Read-only)</Label>
					<Input
						id="email"
						type="email"
						value={initialData.email}
						disabled
						className="mt-1"
					/>
					<p className="text-muted-foreground mt-1 text-xs">Contact support to change email</p>
				</div>

				<div>
					<Label htmlFor="username">Username</Label>
					<Input
						id="username"
						name="username"
						type="text"
						value={data.username}
						onChange={handleChange}
						placeholder="your-username"
						className="mt-1"
						disabled={loading}
					/>
					<p className="text-muted-foreground mt-1 text-xs">Used for login alongside email</p>
				</div>

				<div>
					<Label htmlFor="name">Full Name</Label>
					<Input
						id="name"
						name="name"
						type="text"
						value={data.name}
						onChange={handleChange}
						placeholder="John Doe"
						className="mt-1"
						disabled={loading}
					/>
				</div>

				<div>
					<Label htmlFor="image">Avatar URL</Label>
					<Input
						id="image"
						name="image"
						type="url"
						value={data.image}
						onChange={handleChange}
						placeholder="Upload Image"
						className="mt-1"
						disabled={loading}
					/>
					<p className="text-muted-foreground mt-1 text-xs">Link to your profile picture</p>
				</div>

				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setData({
								name: initialData.name || "",
								username: initialData.username || "",
								image: initialData.image || "",
							});
						}}
						disabled={loading}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={loading}>
						{loading && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						{!loading && <Save className="mr-2 h-4 w-4" />}
						Save Changes
					</Button>
				</div>
			</form>
		</Card>
	);
}
