"use client";

import { useEffect, useState } from "react";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createStripePaymentIntentAction } from "@/lib/features/pricing/actions/subscription.actions";
import type { PricingPlan } from "@/lib/features/pricing/types";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface CheckoutFormProps {
	plan: PricingPlan;
	clientSecret: string;
}

function StripeCheckoutForm({ plan, clientSecret: _clientSecret }: CheckoutFormProps) {
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
			const { error } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/payment?status=success&planId=${plan.id}&session_id={CHECKOUT_SESSION_ID}`,
				},
			});

			if (error) {
				toast.error(error.message || "Payment failed");
			} else {
				// Payment will redirect to return_url, no need to handle here
				toast.info("Redirecting to payment confirmation...");
			}
		} catch (error) {
			console.error("Payment error:", error);
			toast.error("An error occurred during payment");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6">
			{/* Security Badge */}
			<div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950">
				<Lock className="h-4 w-4 text-green-600" />
				<p className="text-sm text-green-700 dark:text-green-300">Your payment information is encrypted and secured with SSL technology and Stripe</p>
			</div>

			{/* Payment Element */}
			<div className="space-y-2">
				<Label>Payment Information</Label>
				<div className="rounded-lg border p-4">
					<PaymentElement
						options={{
							layout: "tabs",
						}}
					/>
				</div>
			</div>

			{/* Terms */}
			<div className="bg-muted flex items-start gap-2 rounded-lg p-3">
				<input
					type="checkbox"
					id="terms"
					className="mt-1"
					defaultChecked
				/>
				<label
					htmlFor="terms"
					className="text-sm">
					I agree to the terms and conditions and understand that my subscription will auto-renew monthly until cancelled
				</label>
			</div>

			{/* Submit Button */}
			<Button
				type="submit"
				disabled={!stripe || isLoading}
				className="w-full"
				size="lg">
				{isLoading ? "Processing Payment..." : `Pay $${plan.monthlyPrice.toFixed(2)} & Activate Plan`}
			</Button>

			{/* Additional Info */}
			<div className="text-muted-foreground text-center text-xs">
				<p>By clicking pay, you authorize us to charge your payment method.</p>
			</div>
		</form>
	);
}

export default function StripeCheckoutFormWrapper({ plan }: { plan: PricingPlan }) {
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Create payment intent using server action
		const createPaymentIntent = async () => {
			try {
				const result = await createStripePaymentIntentAction(plan.id);
				const paymentData = result.data as any;

				if (result.success && paymentData?.clientSecret) {
					setClientSecret(paymentData.clientSecret);
				} else {
					setError(result.message || "Failed to create payment intent");
				}
			} catch (err) {
				setError("Failed to initialize payment");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		createPaymentIntent();
	}, [plan.id]);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-center">
					<div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
					<p className="text-muted-foreground">Initializing payment...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	if (!clientSecret) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>Failed to initialize payment form</AlertDescription>
			</Alert>
		);
	}

	const options = {
		clientSecret,
		appearance: {
			theme: "stripe" as const,
		},
	};

	return (
		<Elements
			stripe={stripePromise}
			options={options}>
			<StripeCheckoutForm
				plan={plan}
				clientSecret={clientSecret}
			/>
		</Elements>
	);
}
