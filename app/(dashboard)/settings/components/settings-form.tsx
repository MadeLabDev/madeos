"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import { updateCompanySettingsAction } from "@/lib/features/settings/actions";
import type { SettingsFormProps } from "@/lib/features/settings/types";

export function SettingsForm({ settingsObj, onSuccess, hideButtons = false, onLoadingChange }: SettingsFormProps) {
	const [loading, setLoading] = useState(false);
	const [companyName, setCompanyName] = useState(settingsObj?.company_name || "");
	const [address, setAddress] = useState(settingsObj?.company_address || "");
	const [phone, setPhone] = useState(settingsObj?.company_phone || "");
	const [email, setEmail] = useState(settingsObj?.company_email || "");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!companyName.trim()) {
			toast.error("Company name is required");
			return;
		}

		setLoading(true);
		onLoadingChange?.(true);
		try {
			const result = await updateCompanySettingsAction({
				company_name: companyName.trim(),
				company_address: address.trim() || undefined,
				company_phone: phone.trim() || undefined,
				company_email: email.trim() || undefined,
			});

			if (result.success) {
				toast.success("Settings updated successfully");
				if (onSuccess) {
					onSuccess();
				}
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to update settings");
		} finally {
			setLoading(false);
			onLoadingChange?.(false);
		}
	}

	return (
		<Card>
			<CardContent className="space-y-6">
				<form
					onSubmit={handleSubmit}
					className="gap-4 space-y-6"
					data-settings-company-form>
					{/* Company Name */}
					<div>
						<Label htmlFor="companyName">Company Name *</Label>
						<Input
							id="companyName"
							placeholder="Enter company name"
							value={companyName}
							onChange={(e) => setCompanyName(e.target.value)}
							required
							className="mt-2"
						/>
					</div>

					{/* Address */}
					<div>
						<Label htmlFor="address">Address</Label>
						<Textarea
							id="address"
							placeholder="Enter company address"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							rows={3}
							className="mt-2"
						/>
					</div>

					{/* Phone */}
					<div>
						<Label htmlFor="phone">Phone Number</Label>
						<Input
							id="phone"
							placeholder="Enter phone number"
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="mt-2"
						/>
					</div>

					{/* Email */}
					<div>
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							placeholder="Enter email address"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-2"
						/>
					</div>

					{/* Submit Button */}
					{!hideButtons && (
						<div className="flex gap-2">
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
								{loading ? "Saving..." : "Save Settings"}
							</Button>
							<Button
								type="button"
								variant="outline"
								data-action="cancel"
								onClick={() => {
									setCompanyName(settingsObj?.company_name || "");
									setAddress(settingsObj?.company_address || "");
									setPhone(settingsObj?.company_phone || "");
									setEmail(settingsObj?.company_email || "");
								}}>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
						</div>
					)}
					{hideButtons && (
						<div className="hidden">
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
								Save Settings
							</Button>
							<Button
								type="button"
								variant="outline"
								data-action="cancel"
								onClick={() => {
									setCompanyName(settingsObj?.company_name || "");
									setAddress(settingsObj?.company_address || "");
									setPhone(settingsObj?.company_phone || "");
									setEmail(settingsObj?.company_email || "");
								}}>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
