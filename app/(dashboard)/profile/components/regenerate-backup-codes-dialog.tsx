"use client";

import { useState } from "react";

import { AlertCircle, Check, Copy, Download, X } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { regenerateBackupCodesAction } from "@/lib/features/auth/actions/two-factor-actions";

interface RegenerateBackupCodesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

type Step = "verify" | "codes";

export function RegenerateBackupCodesDialog({ open, onOpenChange, onSuccess }: RegenerateBackupCodesDialogProps) {
	const [step, setStep] = useState<Step>("verify");
	const [password, setPassword] = useState("");
	const [token, setToken] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [method, setMethod] = useState<"password" | "token">("password");
	const [copiedCodes, setCopiedCodes] = useState(false);

	const handleVerify = async (e: React.FormEvent) => {
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

		const result = await regenerateBackupCodesAction({
			password: method === "password" ? password : undefined,
			token: method === "token" ? token : undefined,
		});

		setLoading(false);

		if (result.success && result.data) {
			setBackupCodes(result.data.backupCodes);
			setStep("codes");
		} else {
			setError(result.message);
		}
	};

	const copyBackupCodes = async () => {
		const codesText = backupCodes.join("\n");
		await navigator.clipboard.writeText(codesText);
		setCopiedCodes(true);
		toast.success("Backup codes copied to clipboard");
		setTimeout(() => setCopiedCodes(false), 2000);
	};

	const downloadBackupCodes = () => {
		const codesText = backupCodes.join("\n");
		const blob = new Blob([codesText], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "madeapp-2fa-backup-codes-new.txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success("Backup codes downloaded");
	};

	const resetForm = () => {
		setStep("verify");
		setPassword("");
		setToken("");
		setBackupCodes([]);
		setError("");
		setCopiedCodes(false);
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			resetForm();
		}
		onOpenChange(newOpen);
	};

	const handleFinish = () => {
		onSuccess();
		handleOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-md">
				{step === "verify" && (
					<>
						<DialogHeader>
							<DialogTitle>Regenerate Backup Codes</DialogTitle>
							<DialogDescription>Verify your identity to generate new backup codes</DialogDescription>
						</DialogHeader>

						<form
							onSubmit={handleVerify}
							className="space-y-4">
							<Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
								<AlertCircle className="h-4 w-4 text-amber-600" />
								<AlertDescription className="text-amber-800 dark:text-amber-200">
									<strong>Important:</strong> Your old backup codes will no longer work after regenerating.
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
									disabled={loading}>
									{loading && (
										<Loader
											size="sm"
											className="mr-2"
										/>
									)}
									Generate New Codes
								</Button>
							</DialogFooter>
						</form>
					</>
				)}

				{step === "codes" && (
					<>
						<DialogHeader>
							<DialogTitle>New Backup Codes</DialogTitle>
							<DialogDescription>Save these codes in a safe place. You won&apos;t be able to see them again.</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<Alert
								variant="default"
								className="border-amber-500 bg-amber-50 dark:bg-amber-950">
								<AlertCircle className="h-4 w-4 text-amber-600" />
								<AlertDescription className="text-amber-800 dark:text-amber-200">
									<strong>Important:</strong> Your old backup codes are now invalid. Each of these new codes can only be used once.
								</AlertDescription>
							</Alert>

							<div className="space-y-2">
								<div className="bg-muted grid grid-cols-2 gap-2 rounded-lg p-4 font-mono text-sm">
									{backupCodes.map((code, index) => (
										<div
											key={index}
											className="py-1 text-center">
											{code}
										</div>
									))}
								</div>

								<div className="flex gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={copyBackupCodes}
										className="flex-1">
										{copiedCodes ? (
											<>
												<Check className="mr-2 h-4 w-4 text-green-600" />
												Copied
											</>
										) : (
											<>
												<Copy className="mr-2 h-4 w-4" />
												Copy All
											</>
										)}
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={downloadBackupCodes}
										className="flex-1">
										<Download className="mr-2 h-4 w-4" />
										Download
									</Button>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button
								onClick={handleFinish}
								className="w-full">
								I&apos;ve Saved My New Backup Codes
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
