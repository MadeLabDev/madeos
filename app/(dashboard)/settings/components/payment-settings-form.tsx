"use client";

import { type FormEvent, useCallback, useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { updatePaymentSettingsAction } from "@/lib/features/settings/actions";
import type { PaymentSettingsFormProps } from "@/lib/features/settings/types";
import { PAYMENT_PROVIDER_LABELS, PAYMENT_PROVIDERS, type PaymentProvider } from "@/lib/features/settings/types";

const PAYMENT_PROVIDER_DETAILS: Record<PaymentProvider, { description: string; envVars: string[] }> = {
	stripe: {
		description: "Use Stripe for global card payments with automated reconciliation and webhooks.",
		envVars: ["STRIPE_API_KEY", "STRIPE_WEBHOOK_SECRET"],
	},
	square: {
		description: "Square is ideal for point-of-sale flows or localized payments in Square-enabled regions.",
		envVars: ["SQUARE_ACCESS_TOKEN", "SQUARE_LOCATION_ID"],
	},
	paypal: {
		description: "PayPal works great for existing PayPal merchant accounts or express checkout flows.",
		envVars: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"],
	},
};

function getInitialPaymentProvider(settingsObj: Record<string, string>): PaymentProvider {
	const stored = settingsObj["payment_provider"] as string | undefined;
	if (stored && PAYMENT_PROVIDERS.includes(stored as PaymentProvider)) {
		return stored as PaymentProvider;
	}

	return PAYMENT_PROVIDERS[0];
}

function getInitialPaymentCurrency(settingsObj: Record<string, string>): string {
	const storedCurrency = settingsObj["payment_currency"] as string | undefined;
	if (storedCurrency && storedCurrency.trim()) {
		return storedCurrency.trim().toUpperCase();
	}

	return "USD";
}

export function PaymentSettingsForm({ settingsObj, onSuccess, hideButtons = false, onLoadingChange }: PaymentSettingsFormProps) {
	const [provider, setProvider] = useState<PaymentProvider>(() => getInitialPaymentProvider(settingsObj));
	const [currency, setCurrency] = useState(() => getInitialPaymentCurrency(settingsObj));
	const [isLoading, setIsLoading] = useState(false);

	const handleSave = useCallback(async () => {
		const normalizedCurrency = currency.trim().toUpperCase();
		if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
			toast.error("Currency must be a valid 3-letter ISO code (e.g., USD)");
			return;
		}

		setIsLoading(true);
		onLoadingChange?.(true);
		setCurrency(normalizedCurrency);

		try {
			const result = await updatePaymentSettingsAction({
				provider,
				currency: normalizedCurrency,
			});

			if (!result.success) {
				toast.error(result.message || "Failed to update payment settings");
			} else {
				toast.success("Payment settings updated successfully");
				onSuccess?.();
			}
		} catch (error) {
			console.error("Error saving payment settings:", error);
			toast.error(error instanceof Error ? error.message : "Failed to update payment settings");
		} finally {
			setIsLoading(false);
			onLoadingChange?.(false);
		}
	}, [currency, onLoadingChange, onSuccess, provider]);

	const handleFormSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			handleSave();
		},
		[handleSave],
	);

	const handleCancel = useCallback(() => {
		setProvider(getInitialPaymentProvider(settingsObj));
		setCurrency(getInitialPaymentCurrency(settingsObj));
	}, [settingsObj]);

	return (
		<Card>
			<CardContent className="space-y-6">
				<form
					onSubmit={handleFormSubmit}
					className="gap-4 space-y-6"
					data-settings-payment-form>
					<div>
						<Label>Active Payment Provider</Label>
						<ToggleGroup
							value={provider}
							onValueChange={(value) => {
								if (value && PAYMENT_PROVIDERS.includes(value as PaymentProvider)) {
									setProvider(value as PaymentProvider);
								}
							}}
							type="single"
							className="mt-2"
							aria-label="Select active payment provider">
							{PAYMENT_PROVIDERS.map((item) => (
								<ToggleGroupItem
									key={item}
									value={item}
									aria-label={PAYMENT_PROVIDER_LABELS[item]}>
									{PAYMENT_PROVIDER_LABELS[item]}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
						<p className="text-muted-foreground mt-2 text-sm">Credentials live in environment variables, so switching providers is as simple as changing the active provider here and updating the corresponding keys in your `.env` file.</p>
					</div>

					<div>
						<Label htmlFor="payment-currency">Default Currency</Label>
						<Input
							id="payment-currency"
							value={currency}
							onChange={(event) => setCurrency(event.target.value)}
							placeholder="USD"
							className="mt-2 max-w-xs"
						/>
						<p className="text-muted-foreground mt-1 text-xs">ISO 4217 currency code used for hosted checkout totals.</p>
					</div>

					<div className="space-y-4">
						{PAYMENT_PROVIDERS.map((item) => {
							const detail = PAYMENT_PROVIDER_DETAILS[item];
							const isSelected = provider === item;
							return (
								<div
									key={item}
									className={`rounded-2xl border p-4 transition ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
									<div className="flex items-center justify-between">
										<p className="text-sm font-semibold">{PAYMENT_PROVIDER_LABELS[item]}</p>
										{isSelected && <Badge variant="secondary">Active</Badge>}
									</div>
									<p className="text-muted-foreground mt-1 text-sm">{detail.description}</p>
									<div className="mt-3 flex flex-wrap gap-2">
										{detail.envVars.map((envVar) => (
											<Badge
												key={envVar}
												variant="outline">
												{envVar}
											</Badge>
										))}
									</div>
								</div>
							);
						})}
					</div>

					{!hideButtons && (
						<div className="flex gap-3 border-t pt-6">
							<Button
								type="submit"
								disabled={isLoading}>
								{isLoading && (
									<Loader
										size="sm"
										className="mr-2"
									/>
								)}
								{!isLoading && "Save Changes"}
							</Button>
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={isLoading}>
								Cancel
							</Button>
						</div>
					)}
					{hideButtons && (
						<div className="hidden">
							<Button
								type="submit"
								disabled={isLoading}>
								{isLoading && (
									<Loader
										size="sm"
										className="mr-2"
									/>
								)}
								Save Changes
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isLoading}>
								Cancel
							</Button>
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
