"use client";

import { useState } from "react";

import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { changePassword } from "@/lib/features/users/actions";

export function ChangePasswordForm() {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [data, setData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
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

		if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
			toast.error("Error", {
				description: "All fields are required",
			});
			return;
		}

		if (data.newPassword !== data.confirmPassword) {
			toast.error("Error", {
				description: "Passwords do not match",
			});
			return;
		}

		if (data.newPassword.length < 8) {
			toast.error("Error", {
				description: "Password must be at least 8 characters",
			});
			return;
		}

		setLoading(true);

		try {
			const result = await changePassword(data);

			if (result.success) {
				toast.success("Password changed", {
					description: result.message,
				});
				setData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
			} else {
				toast.error("Change failed", {
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
					<Label htmlFor="currentPassword">Current Password</Label>
					<Input
						id="currentPassword"
						name="currentPassword"
						type={showPassword ? "text" : "password"}
						value={data.currentPassword}
						onChange={handleChange}
						placeholder="Enter current password"
						className="mt-1"
						disabled={loading}
					/>
				</div>

				<div>
					<Label htmlFor="newPassword">New Password</Label>
					<Input
						id="newPassword"
						name="newPassword"
						type={showPassword ? "text" : "password"}
						value={data.newPassword}
						onChange={handleChange}
						placeholder="Enter new password"
						className="mt-1"
						disabled={loading}
					/>
					<p className="text-muted-foreground mt-1 text-xs">Minimum 8 characters</p>
				</div>

				<div>
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type={showPassword ? "text" : "password"}
						value={data.confirmPassword}
						onChange={handleChange}
						placeholder="Confirm new password"
						className="mt-1"
						disabled={loading}
					/>
				</div>

				<div className="flex items-center">
					<input
						type="checkbox"
						id="showPassword"
						checked={showPassword}
						onChange={(e) => setShowPassword(e.target.checked)}
						className="border-input h-4 w-4 cursor-pointer rounded"
						disabled={loading}
					/>
					<label
						htmlFor="showPassword"
						className="text-foreground ml-2 cursor-pointer text-sm">
						Show passwords
					</label>
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() =>
							setData({
								currentPassword: "",
								newPassword: "",
								confirmPassword: "",
							})
						}
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
						Change Password
					</Button>
				</div>
			</form>
		</Card>
	);
}
