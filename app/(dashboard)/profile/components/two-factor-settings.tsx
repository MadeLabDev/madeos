"use client";

import { useEffect, useState } from "react";

import { AlertTriangle, Key, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { get2FAStatusAction } from "@/lib/features/auth/actions/two-factor-actions";
import type { TwoFactorStatus } from "@/lib/features/auth/types/two-factor.types";

import { Disable2FADialog } from "./disable-2fa-dialog";
import { Enable2FADialog } from "./enable-2fa-dialog";
import { RegenerateBackupCodesDialog } from "./regenerate-backup-codes-dialog";

export function TwoFactorSettings() {
	const [status, setStatus] = useState<TwoFactorStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [showEnableDialog, setShowEnableDialog] = useState(false);
	const [showDisableDialog, setShowDisableDialog] = useState(false);
	const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

	// Load 2FA status
	const loadStatus = async () => {
		setLoading(true);
		const result = await get2FAStatusAction();
		if (result.success && result.data) {
			setStatus(result.data);
		} else {
			toast.error("Failed to load 2FA status");
		}
		setLoading(false);
	};

	useEffect(() => {
		const loadStatus = async () => {
			setLoading(true);
			const result = await get2FAStatusAction();
			if (result.success && result.data) {
				setStatus(result.data);
			} else {
				toast.error("Failed to load 2FA status");
			}
			setLoading(false);
		};
		loadStatus();
	}, []);

	const handleEnableSuccess = () => {
		setShowEnableDialog(false);
		loadStatus();
		toast.success("Two-factor authentication enabled successfully");
	};

	const handleDisableSuccess = () => {
		setShowDisableDialog(false);
		loadStatus();
		toast.success("Two-factor authentication disabled successfully");
	};

	const handleRegenerateSuccess = () => {
		setShowRegenerateDialog(false);
		loadStatus();
		toast.success("Backup codes regenerated successfully");
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Two-Factor Authentication</CardTitle>
					<CardDescription>Loading...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="space-y-1.5">
							<CardTitle className="flex items-center gap-2">
								{status?.enabled ? (
									<>
										<ShieldCheck className="h-5 w-5 text-green-600" />
										Two-Factor Authentication
									</>
								) : (
									<>
										<ShieldOff className="text-muted-foreground h-5 w-5" />
										Two-Factor Authentication
									</>
								)}
							</CardTitle>
							<CardDescription>Add an extra layer of security to your account with TOTP (Time-based One-Time Password)</CardDescription>
						</div>
						<Badge variant={status?.enabled ? "default" : "secondary"}>{status?.enabled ? "Enabled" : "Disabled"}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Status Info */}
					<div className="space-y-3 rounded-lg border p-4">
						<div className="flex items-start gap-3">
							{status?.enabled ? <ShieldCheck className="mt-0.5 h-5 w-5 text-green-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />}
							<div className="flex-1">
								<h4 className="font-medium">{status?.enabled ? "Your account is protected with 2FA" : "Your account is not protected with 2FA"}</h4>
								<p className="text-muted-foreground mt-1 text-sm">{status?.enabled ? "You will be asked to enter a code from your authenticator app when you sign in." : "Enable 2FA to add an extra layer of security. You will need an authenticator app like Google Authenticator or Authy."}</p>
							</div>
						</div>

						{/* Backup Codes Info */}
						{status?.enabled && (
							<div className="flex items-center gap-3 border-t pt-3">
								<Key className="text-muted-foreground h-5 w-5" />
								<div className="flex-1">
									<p className="text-sm">
										<span className="font-medium">Backup codes:</span> {status.backupCodesCount > 0 ? <span className="text-green-600">{status.backupCodesCount} remaining</span> : <span className="text-destructive">No backup codes remaining</span>}
									</p>
									<p className="text-muted-foreground mt-0.5 text-xs">Use backup codes to sign in if you lose access to your authenticator app</p>
								</div>
							</div>
						)}
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-3 sm:flex-row">
						{status?.enabled ? (
							<>
								<Button
									variant="outline"
									onClick={() => setShowRegenerateDialog(true)}
									className="sm:flex-1">
									<Key className="mr-2 h-4 w-4" />
									Regenerate Backup Codes
								</Button>
								<Button
									variant="destructive"
									onClick={() => setShowDisableDialog(true)}
									className="sm:flex-1">
									<ShieldOff className="mr-2 h-4 w-4" />
									Disable 2FA
								</Button>
							</>
						) : (
							<Button
								onClick={() => setShowEnableDialog(true)}
								className="sm:flex-1">
								<ShieldCheck className="mr-2 h-4 w-4" />
								Enable Two-Factor Authentication
							</Button>
						)}
					</div>

					{/* Help Text */}
					<div className="text-muted-foreground space-y-1 border-t pt-4 text-xs">
						<p className="font-medium">What is Two-Factor Authentication?</p>
						<p>2FA adds an extra layer of security by requiring both your password and a verification code from your authenticator app to sign in.</p>
						<p className="mt-2">
							<span className="font-medium">Supported authenticator apps:</span>
						</p>
						<ul className="ml-2 list-inside list-disc space-y-0.5">
							<li>Google Authenticator (iOS, Android)</li>
							<li>Microsoft Authenticator (iOS, Android)</li>
							<li>Authy (iOS, Android, Desktop)</li>
							<li>1Password (iOS, Android, Desktop)</li>
							<li>Any TOTP-compatible authenticator app</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			{/* Dialogs */}
			<Enable2FADialog
				open={showEnableDialog}
				onOpenChange={setShowEnableDialog}
				onSuccess={handleEnableSuccess}
			/>

			<Disable2FADialog
				open={showDisableDialog}
				onOpenChange={setShowDisableDialog}
				onSuccess={handleDisableSuccess}
			/>

			<RegenerateBackupCodesDialog
				open={showRegenerateDialog}
				onOpenChange={setShowRegenerateDialog}
				onSuccess={handleRegenerateSuccess}
			/>
		</>
	);
}
