"use client";

import { useEffect, useState } from "react";

import { AlertCircle, ArrowLeft, Check, ChevronRight, Copy, Download, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { enable2FAAction, setup2FAAction } from "@/lib/features/auth/actions/two-factor-actions";

interface Enable2FADialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

type Step = "loading" | "scan" | "verify" | "backup-codes";

export function Enable2FADialog({ open, onOpenChange, onSuccess }: Enable2FADialogProps) {
	const [step, setStep] = useState<Step>("loading");
	const [secret, setSecret] = useState("");
	const [qrCode, setQrCode] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [verificationToken, setVerificationToken] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [copiedSecret, setCopiedSecret] = useState(false);
	const [copiedCodes, setCopiedCodes] = useState(false);

	// Load setup data when dialog opens
	useEffect(() => {
		if (open && step === "loading") {
			const loadSetupData = async () => {
				try {
					const result = await setup2FAAction();

					if (result.success && result.data) {
						setSecret(result.data.secret);
						setQrCode(result.data.qrCodeDataURL);
						setBackupCodes(result.data.backupCodes);
						setStep("scan");
					} else {
						toast.error(result.message || "Failed to setup 2FA");
						setError(result.message || "Failed to setup 2FA");
						onOpenChange(false);
					}
				} catch (error) {
					console.error("Error loading 2FA setup:", error);
					toast.error("Failed to setup 2FA. Please try again.");
					setError("Failed to setup 2FA. Please try again.");
					onOpenChange(false);
				}
			};

			loadSetupData();
		}
	}, [open, step, onOpenChange]);

	// Reset state when dialog closes
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			// Reset all state when closing
			setStep("loading");
			setSecret("");
			setQrCode("");
			setBackupCodes([]);
			setVerificationToken("");
			setError("");
			setCopiedSecret(false);
			setCopiedCodes(false);
		}
		onOpenChange(newOpen);
	};

	const copySecret = async () => {
		await navigator.clipboard.writeText(secret);
		setCopiedSecret(true);
		toast.success("Secret copied to clipboard");
		setTimeout(() => setCopiedSecret(false), 2000);
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
		a.download = "madeapp-2fa-backup-codes.txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success("Backup codes downloaded");
	};

	const handleVerify = async () => {
		if (!verificationToken || verificationToken.length !== 6) {
			setError("Please enter a valid 6-digit code");
			return;
		}

		setLoading(true);
		setError("");

		const result = await enable2FAAction(secret, backupCodes, {
			token: verificationToken,
		});

		setLoading(false);

		if (result.success) {
			setStep("backup-codes");
		} else {
			setError(result.message);
		}
	};

	const handleFinish = () => {
		onSuccess();
		handleOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-lg">
				{step === "loading" && (
					<>
						<DialogHeader>
							<DialogTitle>Setting up 2FA...</DialogTitle>
						</DialogHeader>
						<div className="flex justify-center py-8">
							<Loader size="lg" />
						</div>
					</>
				)}

				{step === "scan" && (
					<>
						<DialogHeader>
							<DialogTitle>Step 1: Scan QR Code</DialogTitle>
							<DialogDescription>Open your authenticator app and scan this QR code</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							{/* QR Code */}
							<div className="flex justify-center rounded-lg bg-white p-4">
								<Image
									src={qrCode}
									alt="2FA QR Code"
									width={250}
									height={250}
									className="rounded"
								/>
							</div>

							{/* Manual Entry */}
							<div className="space-y-2">
								<Label className="text-muted-foreground text-sm">Or enter this code manually:</Label>
								<div className="flex gap-2">
									<Input
										value={secret}
										readOnly
										className="font-mono text-sm"
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={copySecret}>
										{copiedSecret ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
									</Button>
								</div>
							</div>

							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>Keep this secret safe. You&apos;ll need it if you want to set up 2FA on another device.</AlertDescription>
							</Alert>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => handleOpenChange(false)}>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button onClick={() => setStep("verify")}>
								<ChevronRight className="mr-2 h-4 w-4" />
								Next: Verify Code
							</Button>
						</DialogFooter>
					</>
				)}

				{step === "verify" && (
					<>
						<DialogHeader>
							<DialogTitle>Step 2: Verify Code</DialogTitle>
							<DialogDescription>Enter the 6-digit code from your authenticator app</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="verification-code">Verification Code</Label>
								<Input
									id="verification-code"
									type="text"
									inputMode="numeric"
									maxLength={6}
									placeholder="000000"
									value={verificationToken}
									onChange={(e) => {
										const value = e.target.value.replace(/\D/g, "");
										setVerificationToken(value);
										setError("");
									}}
									className="text-center font-mono text-2xl tracking-widest"
									autoComplete="off"
								/>
							</div>

							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<p className="text-muted-foreground text-sm">The code is valid for 30 seconds and changes every 30 seconds.</p>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setStep("scan")}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
							<Button
								onClick={handleVerify}
								disabled={loading}>
								{loading && (
									<Loader
										size="sm"
										className="mr-2"
									/>
								)}
								Verify & Enable
							</Button>
						</DialogFooter>
					</>
				)}

				{step === "backup-codes" && (
					<>
						<DialogHeader>
							<DialogTitle>Step 3: Save Backup Codes</DialogTitle>
							<DialogDescription>Save these codes in a safe place. You&apos;ll need them if you lose access to your authenticator app.</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<Alert
								variant="default"
								className="border-amber-500 bg-amber-50 dark:bg-amber-950">
								<AlertCircle className="h-4 w-4 text-amber-600" />
								<AlertDescription className="text-amber-800 dark:text-amber-200">
									<strong>Important:</strong> Each backup code can only be used once. Store them securely - you won&apos;t be able to see them again.
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
								I&apos;ve Saved My Backup Codes
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
