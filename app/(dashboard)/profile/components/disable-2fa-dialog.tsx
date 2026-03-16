"use client";

import { useState } from "react";

import { AlertCircle, X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { disable2FAAction } from "@/lib/features/auth/actions/two-factor-actions";

interface Disable2FADialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function Disable2FADialog({ open, onOpenChange, onSuccess }: Disable2FADialogProps) {
	const [password, setPassword] = useState("");
	const [token, setToken] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [method, setMethod] = useState<"password" | "token">("password");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (method === "password" && !password) {
			setError("Please enter your password");
			return;
		}

		if (method === "token" && (!token || token.length !== 6)) {
			setError("Please enter a valid 6-digit code");
			return;
		}

		setLoading(true);

		const result = await disable2FAAction({
			password: method === "password" ? password : undefined,
			token: method === "token" ? token : undefined,
		});

		setLoading(false);

		if (result.success) {
			onSuccess();
			resetForm();
		} else {
			setError(result.message);
		}
	};

	const resetForm = () => {
		setPassword("");
		setToken("");
		setError("");
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			resetForm();
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Disable Two-Factor Authentication</DialogTitle>
					<DialogDescription>Verify your identity to disable 2FA protection</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="space-y-4">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							<strong>Warning:</strong> Disabling 2FA will make your account less secure.
						</AlertDescription>
					</Alert>

					<Tabs
						value={method}
						onValueChange={(v) => setMethod(v as "password" | "token")}>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="password">Password</TabsTrigger>
							<TabsTrigger value="token">2FA Code</TabsTrigger>
						</TabsList>

						<TabsContent
							value="password"
							className="mt-4 space-y-4">
							<div className="space-y-2">
								<Label htmlFor="password">Current Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										setError("");
									}}
									autoComplete="current-password"
								/>
							</div>
						</TabsContent>

						<TabsContent
							value="token"
							className="mt-4 space-y-4">
							<div className="space-y-2">
								<Label htmlFor="token">2FA Code</Label>
								<Input
									id="token"
									type="text"
									inputMode="numeric"
									maxLength={6}
									placeholder="000000"
									value={token}
									onChange={(e) => {
										const value = e.target.value.replace(/\D/g, "");
										setToken(value);
										setError("");
									}}
									className="text-center font-mono text-2xl tracking-widest"
									autoComplete="off"
								/>
								<p className="text-muted-foreground text-xs">Enter the 6-digit code from your authenticator app</p>
							</div>
						</TabsContent>
					</Tabs>

					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
						<Button
							type="submit"
							variant="destructive"
							disabled={loading}>
							{loading && (
								<Loader
									size="sm"
									className="mr-2"
								/>
							)}
							Disable 2FA
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
