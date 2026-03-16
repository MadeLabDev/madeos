"use client";

import { useState } from "react";

import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { sendTestEmailAction } from "@/lib/features/settings/actions/settings-actions";

interface EmailTestFormProps {
	onLoadingChange?: (loading: boolean) => void;
	hideButtons?: boolean;
}

export function EmailTestForm({ onLoadingChange, hideButtons }: EmailTestFormProps) {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) {
			toast.error("Please enter an email address");
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast.error("Please enter a valid email address");
			return;
		}

		setIsLoading(true);
		onLoadingChange?.(true);

		try {
			const result = await sendTestEmailAction(email.trim());

			if (result.success) {
				toast.success("Test email sent successfully!");
				setEmail("");
			} else {
				toast.error(result.message || "Failed to send test email");
			}
		} catch (error) {
			console.error("Error sending test email:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
			onLoadingChange?.(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Mail className="h-5 w-5" />
					Email Test
				</CardTitle>
				<CardDescription>Send a test email to verify your email configuration is working correctly.</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="test-email">Test Email Address</Label>
						<Input
							id="test-email"
							type="email"
							placeholder="Enter email address to test"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isLoading}
							required
						/>
					</div>

					{!hideButtons && (
						<div className="flex gap-3">
							<Button
								type="submit"
								disabled={isLoading}>
								{isLoading && (
									<Loader
										size="sm"
										className="mr-2"
									/>
								)}
								<Send className="mr-2 h-4 w-4" />
								Send Test Email
							</Button>
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
