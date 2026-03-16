"use client";

import { useState } from "react";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createStripeSetupIntentAction } from "@/lib/features/pricing/actions/subscription.actions";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface PaymentMethodSetupProps {
	children: React.ReactNode;
	onSuccess?: () => void;
}

function PaymentMethodSetupForm({ onSuccess }: { onSuccess?: () => void }) {
	const stripe = useStripe();
	const elements = useElements();
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!stripe || !elements) {
			toast.error("Stripe not loaded");
			return;
		}

		setIsLoading(true);

		try {
			const result = await stripe.confirmSetup({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/payment`,
				},
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to setup payment method");
			} else {
				toast.success("Payment method added successfully!");
				onSuccess?.();
			}
		} catch (err) {
			console.error("Setup error:", err);
			toast.error("Failed to setup payment method");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6">
			<div className="space-y-2">
				<PaymentElement
					options={{
						layout: "tabs",
					}}
				/>
			</div>

			<div className="text-muted-foreground flex items-center gap-2 text-sm">
				<CreditCard className="h-4 w-4" />
				<span>Your payment information is secure and encrypted</span>
			</div>

			<Button
				type="submit"
				className="w-full"
				disabled={!stripe || isLoading}>
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Setting up payment method...
					</>
				) : (
					"Add Payment Method"
				)}
			</Button>
		</form>
	);
}

function PaymentMethodSetupDialog({ children, onSuccess }: PaymentMethodSetupProps) {
	const [open, setOpen] = useState(false);
	const [clientSecret, setClientSecret] = useState<string | null>(null);

	const handleOpenChange = async (newOpen: boolean) => {
		if (newOpen && !clientSecret) {
			try {
				const result = await createStripeSetupIntentAction();
				const setupData = result.data as any;
				if (result.success && setupData?.clientSecret) {
					setClientSecret(setupData.clientSecret);
				} else {
					toast.error("Failed to initialize payment setup");
					return;
				}
			} catch (error) {
				console.error("Error creating setup intent:", error);
				toast.error("Failed to initialize payment setup");
				return;
			}
		}
		setOpen(newOpen);
	};

	const handleSuccess = () => {
		setOpen(false);
		setClientSecret(null);
		onSuccess?.();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add Payment Method</DialogTitle>
					<DialogDescription>Add a payment method to enable automatic billing for your subscription.</DialogDescription>
				</DialogHeader>

				{clientSecret ? (
					<Elements
						stripe={stripePromise}
						options={{ clientSecret }}>
						<PaymentMethodSetupForm onSuccess={handleSuccess} />
					</Elements>
				) : (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin" />
						<span className="ml-2">Initializing...</span>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export { PaymentMethodSetupDialog };
