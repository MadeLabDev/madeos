"use client";

import { useEffect, useState } from "react";

import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { activateAccountAction, validateTokenAction } from "@/lib/features/users/actions";

interface ActivateFormData {
	password: string;
	confirmPassword: string;
}

export function ActivateAccountForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams?.get("token") || "";

	const [isValidating, setIsValidating] = useState(true);
	const [isValid, setIsValid] = useState(false);
	const [userInfo, setUserInfo] = useState<{ email: string; name: string | null } | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<ActivateFormData>();

	const password = watch("password");

	useEffect(() => {
		async function validateToken() {
			if (!token) {
				setIsValid(false);
				setErrorMessage("Activation token is missing");
				setIsValidating(false);
				return;
			}

			const result = await validateTokenAction(token);

			if (result.valid && result.user) {
				setIsValid(true);
				setUserInfo(result.user);
			} else {
				setIsValid(false);
				setErrorMessage(result.message || "Invalid token");
			}

			setIsValidating(false);
		}

		validateToken();
	}, [token]);

	const onSubmit = async (data: ActivateFormData) => {
		setIsSubmitting(true);

		try {
			const result = await activateAccountAction(token, data.password);

			if (result.success) {
				toast.success("Account activated successfully!", {
					description: "You can now sign in with your new password.",
				});

				// Redirect to sign in after 2 seconds
				setTimeout(() => {
					router.push("/auth/signin");
				}, 2000);
			} else {
				toast.error("Activation failed", {
					description: result.message,
				});
			}
		} catch (error) {
			toast.error("Activation failed", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isValidating) {
		return (
			<div className="flex flex-col items-center justify-center space-y-4 py-12">
				<Loader size="lg" />
				<p className="text-muted-foreground">Validating activation link...</p>
			</div>
		);
	}

	if (!isValid) {
		return (
			<div className="flex flex-col items-center justify-center space-y-4 py-12">
				<XCircle className="text-destructive h-12 w-12" />
				<div className="space-y-2 text-center">
					<h3 className="text-lg font-semibold">Invalid or Expired Link</h3>
					<p className="text-muted-foreground">{errorMessage}</p>
					<Button
						variant="outline"
						onClick={() => router.push("/auth/signin")}
						className="mt-4">
						Go to Sign In
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<CheckCircle2 className="text-primary mx-auto h-12 w-12" />
				<h3 className="text-lg font-semibold">Welcome, {userInfo?.name || userInfo?.email}!</h3>
				<p className="text-muted-foreground text-sm">Set your password to complete account activation</p>
			</div>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="password">
						New Password <span className="text-destructive">*</span>
					</Label>
					<Input
						id="password"
						type="password"
						placeholder="Enter your password"
						{...register("password", {
							required: "Password is required",
							minLength: {
								value: 6,
								message: "Password must be at least 6 characters",
							},
						})}
						disabled={isSubmitting}
					/>
					{errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword">
						Confirm Password <span className="text-destructive">*</span>
					</Label>
					<Input
						id="confirmPassword"
						type="password"
						placeholder="Confirm your password"
						{...register("confirmPassword", {
							required: "Please confirm your password",
							validate: (value) => value === password || "Passwords do not match",
						})}
						disabled={isSubmitting}
					/>
					{errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>}
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={isSubmitting}>
					{isSubmitting && (
						<Loader
							size="sm"
							className="mr-2"
						/>
					)}
					Activate Account
				</Button>
			</form>
		</div>
	);
}
