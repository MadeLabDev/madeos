"use client";

import { useState } from "react";

import { Turnstile } from "@marsidev/react-turnstile";
import { CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";

interface JoinModalProps {
	children: React.ReactNode;
}

export function JoinModal({ children }: JoinModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [message, setMessage] = useState("");
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.firstName.trim()) {
			setStatus("error");
			setMessage("Please enter your first name");
			return;
		}
		if (!formData.lastName.trim()) {
			setStatus("error");
			setMessage("Please enter your last name");
			return;
		}
		if (!formData.email.trim()) {
			setStatus("error");
			setMessage("Please enter your email");
			return;
		}

		setIsSubmitting(true);
		setStatus("idle");
		setMessage("");

		try {
			// Get Turnstile token
			// const turnstileToken = (window as any)['cf-turnstile-response'];

			// if (!turnstileToken) {
			//   setStatus('error');
			//   setMessage('Please complete the captcha');
			//   setIsSubmitting(false);
			//   return;
			// }

			// // Verify with API
			// const response = await fetch('/api/siteverify', {
			//   method: 'POST',
			//   headers: {
			//     'Content-Type': 'application/json',
			//   },
			//   body: JSON.stringify({
			//     token: turnstileToken,
			//   }),
			// });

			// const data = await response.json();

			// if (data.success === 'success') {
			// Submit subscription data to API
			const subscriptionResponse = await fetch("/api/subscription", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: formData.email,
					firstName: formData.firstName,
					lastName: formData.lastName,
					audienID: "2,51", // Default audience IDs for community
				}),
			});

			const subscriptionData = await subscriptionResponse.json();

			if (subscriptionResponse.ok && subscriptionData.success) {
				// Success - show success message
				setStatus("success");
				setMessage("Thank you for joining! Welcome to our community.");

				// Reset form
				setFormData({
					firstName: "",
					lastName: "",
					email: "",
				});

				// Close modal after 2 seconds
				setTimeout(() => {
					setIsOpen(false);
					setStatus("idle");
					setMessage("");
				}, 2000);
			} else {
				// API error
				setStatus("error");
				setMessage(subscriptionData.message || "Failed to join. Please try again.");
				setIsSubmitting(false);
				return;
			}
			// } else {
			//   setStatus('error');
			//   setMessage(data.message || 'Verification failed. Please try again.');
			// }
		} catch (error) {
			setStatus("error");
			setMessage("An error occurred. Please try again.");
			setIsSubmitting(false);
		}
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			// Reset state when closing
			setStatus("idle");
			setMessage("");
			setFormData({
				firstName: "",
				lastName: "",
				email: "",
			});
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="leading-normal">Join our exclusive Google Chat to ask questions and interact.</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="space-y-4">
					{/* Status Messages */}
					{status !== "idle" && (
						<div className={`flex items-center gap-2 rounded-md p-3 ${status === "success" ? "border border-green-200 bg-green-50 text-green-700" : "border border-red-200 bg-red-50 text-red-700"}`}>
							{status === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
							<span className="text-sm">{message}</span>
						</div>
					)}

					{/* First Name */}
					<div className="space-y-2">
						<Label htmlFor="firstName">First Name</Label>
						<Input
							id="firstName"
							name="firstName"
							type="text"
							value={formData.firstName}
							onChange={handleInputChange}
							placeholder="Enter your first name"
							required
						/>
					</div>

					{/* Last Name */}
					<div className="space-y-2">
						<Label htmlFor="lastName">Last Name</Label>
						<Input
							id="lastName"
							name="lastName"
							type="text"
							value={formData.lastName}
							onChange={handleInputChange}
							placeholder="Enter your last name"
							required
						/>
					</div>

					{/* Email */}
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleInputChange}
							placeholder="Enter your email address"
							required
						/>
					</div>

					{/* Turnstile Captcha */}
					<div className="flex justify-center">
						<Turnstile
							siteKey="0x4AAAAAAAB17Dj0Ap28zBE7"
							options={{
								action: "submit-form",
								size: "invisible",
								theme: "light",
							}}
						/>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						className="w-full"
						disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader
									size="sm"
									className="mr-2"
								/>
								Joining...
							</>
						) : (
							"Join Now"
						)}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
