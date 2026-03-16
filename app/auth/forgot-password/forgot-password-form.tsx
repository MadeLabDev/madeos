"use client";

import { useState } from "react";

import Link from "next/link";
import { toast } from "sonner";

import { forgotPassword } from "@/lib/features/auth";

export default function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email) {
			toast.error("Please enter your email");
			return;
		}

		setLoading(true);

		try {
			const result = await forgotPassword({ email });

			if (result.success) {
				setSent(true);
				toast.success("Check your email", {
					description: "We've sent you a password reset link",
				});
			} else {
				toast.error("Failed to send email", {
					description: result.message || "Please try again",
				});
			}
		} catch (error) {
			toast.error("Something went wrong", {
				description: "Please try again later",
			});
		} finally {
			setLoading(false);
		}
	};

	if (sent) {
		return (
			<div className="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center">
						<div className="bg-success/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
							<svg
								className="text-success h-8 w-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<h2 className="text-foreground mt-6 text-3xl font-extrabold">Check Your Email</h2>
						<p className="text-muted-foreground mt-2 text-sm">
							We've sent a password reset link to <strong>{email}</strong>
						</p>
						<p className="text-muted-foreground mt-4 text-sm">The link will expire in 1 hour. If you don't see the email, check your spam folder.</p>
					</div>

					<div className="mt-8 space-y-4">
						<button
							onClick={() => {
								setSent(false);
								setEmail("");
							}}
							className="border-border text-foreground bg-background hover:bg-muted flex w-full justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors">
							Send Another Email
						</button>
						<Link
							href="/auth/signin"
							className="text-muted-foreground hover:text-foreground block w-full px-4 py-2 text-center text-sm font-medium transition-colors">
							Back to Sign In
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div>
					<h2 className="text-foreground mt-6 text-center text-3xl font-extrabold">Forgot Your Password?</h2>
					<p className="text-muted-foreground mt-2 text-center text-sm">Enter your email address and we'll send you a link to reset your password.</p>
				</div>

				<div className="bg-card border-border rounded-lg border px-6 py-8 shadow">
					<form
						className="space-y-6"
						onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="email"
								className="text-foreground block text-sm font-medium">
								Email Address
							</label>
							<div className="mt-1">
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="border-input placeholder-muted-foreground focus:ring-ring focus:border-ring bg-background text-foreground block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
									placeholder="you@example.com"
									disabled={loading}
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={loading}
								className="text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-ring flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
								{loading ? "Sending..." : "Send Reset Link"}
							</button>
						</div>

						<div className="text-center">
							<Link
								href="/auth/signin"
								className="text-primary text-sm font-medium hover:underline">
								Back to Sign In
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
