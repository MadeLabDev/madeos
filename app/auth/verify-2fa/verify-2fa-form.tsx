"use client";

import { useState } from "react";

import { AlertCircle, Key } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { verify2FALoginAction } from "@/lib/features/auth/actions/two-factor-actions";

export function Verify2FAForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [token, setToken] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [useBackupCode, setUseBackupCode] = useState(false);

	const userId = searchParams.get("userId");
	const callbackUrl = searchParams.get("callbackUrl") || "/";

	if (!userId) {
		router.push("/auth/signin");
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!token || (useBackupCode ? token.length < 8 : token.length !== 6)) {
			setError(useBackupCode ? "Please enter a valid backup code" : "Please enter a valid 6-digit code");
			return;
		}

		setLoading(true);

		try {
			// Verify 2FA code
			const result = await verify2FALoginAction(userId, {
				token,
				isBackupCode: useBackupCode,
			});

			if (result.success) {
				// Code verified, complete sign in
				toast.success("Verification successful");

				// Redirect to callback URL
				router.push(callbackUrl);
				router.refresh();
			} else {
				setError(result.message);
			}
		} catch (err) {
			console.error("2FA verification error:", err);
			setError("Verification failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="token">{useBackupCode ? "Backup Code" : "Verification Code"}</Label>
				<Input
					id="token"
					type="text"
					inputMode={useBackupCode ? "text" : "numeric"}
					maxLength={useBackupCode ? 9 : 6}
					placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
					value={token}
					onChange={(e) => {
						const value = useBackupCode ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, "");
						setToken(value);
						setError("");
					}}
					className="text-center font-mono text-2xl tracking-widest"
					autoComplete="off"
					autoFocus
					disabled={loading}
				/>
				<p className="text-muted-foreground text-center text-xs">{useBackupCode ? "Enter one of your backup codes" : "Enter the 6-digit code from your authenticator app"}</p>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<Button
				type="submit"
				className="w-full"
				disabled={loading}>
				{loading && (
					<Loader
						size="sm"
						className="mr-2"
					/>
				)}
				Verify
			</Button>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background text-muted-foreground px-2">Or</span>
				</div>
			</div>

			<Button
				type="button"
				variant="outline"
				className="w-full"
				onClick={() => {
					setUseBackupCode(!useBackupCode);
					setToken("");
					setError("");
				}}
				disabled={loading}>
				<Key className="mr-2 h-4 w-4" />
				{useBackupCode ? "Use Authenticator App" : "Use Backup Code"}
			</Button>

			<div className="text-center">
				<Button
					type="button"
					variant="link"
					onClick={() => router.push("/auth/signin")}
					disabled={loading}>
					Back to Sign In
				</Button>
			</div>
		</form>
	);
}
