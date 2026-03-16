"use client";

import { useEffect, useState } from "react";

import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { resetPassword, validateResetToken } from "@/lib/features/auth";

interface ResetPasswordFormData {
	password: string;
	confirmPassword: string;
}

export function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams?.get("token") || "";

	const [validating, setValidating] = useState(true);
	const [tokenValid, setTokenValid] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<ResetPasswordFormData>();

	const password = watch("password");

	useEffect(() => {
		if (!token) {
			setTokenValid(false);
			setErrorMessage("Reset token is missing");
			setValidating(false);
			return;
		}

		// Validate token
		validateResetToken(token)
			.then((data) => {
				setTokenValid(data.valid);
				if (!data.valid) {
					setErrorMessage("The password reset link is invalid or has expired");
				}
				setValidating(false);
			})
			.catch(() => {
				setTokenValid(false);
				setErrorMessage("Failed to validate reset link");
				setValidating(false);
			});
	}, [token]);

	const onSubmit = async (data: ResetPasswordFormData) => {
		if (data.password !== data.confirmPassword) {
			toast.error("Passwords don't match");
			return;
		}

		if (data.password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await resetPassword({ token, password: data.password });

			if (result.success) {
				toast.success("Password reset successfully!", {
					description: "Redirecting to sign in...",
				});
				setTimeout(() => router.push("/auth/signin"), 2000);
			} else {
				toast.error("Reset failed", {
					description: result.message || "Failed to reset password",
				});
			}
		} catch (error) {
			toast.error("An error occurred", {
				description: error instanceof Error ? error.message : "Please try again",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Loading state
	if (validating) {
		return (
			<div className="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8">
					<div className="flex flex-col items-center justify-center space-y-4">
						<Loader size="lg" />
						<p className="text-muted-foreground">Validating reset link...</p>
					</div>
				</div>
			</div>
		);
	}

	// Invalid token state
	if (!tokenValid) {
		return (
			<div className="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8">
					<div className="flex flex-col items-center justify-center space-y-4">
						<div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
							<XCircle className="text-destructive h-8 w-8" />
						</div>
						<div className="space-y-2 text-center">
							<h2 className="text-foreground text-2xl font-extrabold">Invalid or Expired Link</h2>
							<p className="text-muted-foreground text-sm">{errorMessage}</p>
						</div>
					</div>

					<div className="space-y-4">
						<Link href="/auth/forgot-password">
							<Button className="w-full">Request New Reset Link</Button>
						</Link>
						<Link href="/auth/signin">
							<Button
								variant="outline"
								className="w-full">
								Back to Sign In
							</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// Reset form
	return (
		<div className="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div>
					<div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
						<CheckCircle2 className="text-primary h-8 w-8" />
					</div>
					<h2 className="text-foreground mt-6 text-center text-3xl font-extrabold">Reset Your Password</h2>
					<p className="text-muted-foreground mt-2 text-center text-sm">Enter your new password below to reset your account password.</p>
				</div>

				<div className="bg-card border-border rounded-lg border px-6 py-8 shadow">
					<form
						className="space-y-6"
						onSubmit={handleSubmit(onSubmit)}>
						<div>
							<Label
								htmlFor="password"
								className="text-foreground block text-sm font-medium">
								New Password
							</Label>
							<div className="mt-1">
								<Input
									id="password"
									type="password"
									autoComplete="new-password"
									placeholder="Enter your new password (min 8 characters)"
									{...register("password", {
										required: "Password is required",
										minLength: {
											value: 8,
											message: "Password must be at least 8 characters",
										},
									})}
									disabled={isSubmitting}
									className="bg-background text-foreground"
								/>
							</div>
							{errors.password && <p className="text-destructive mt-1 text-sm">{errors.password.message}</p>}
						</div>

						<div>
							<Label
								htmlFor="confirmPassword"
								className="text-foreground block text-sm font-medium">
								Confirm Password
							</Label>
							<div className="mt-1">
								<Input
									id="confirmPassword"
									type="password"
									autoComplete="new-password"
									placeholder="Confirm your new password"
									{...register("confirmPassword", {
										required: "Please confirm your password",
										validate: (value) => value === password || "Passwords don't match",
									})}
									disabled={isSubmitting}
									className="bg-background text-foreground"
								/>
							</div>
							{errors.confirmPassword && <p className="text-destructive mt-1 text-sm">{errors.confirmPassword.message}</p>}
						</div>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full">
							{isSubmitting ? (
								<>
									<Loader
										size="sm"
										className="mr-2"
									/>
									Resetting Password...
								</>
							) : (
								"Reset Password"
							)}
						</Button>

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
