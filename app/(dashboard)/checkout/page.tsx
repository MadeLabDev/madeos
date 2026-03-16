import { Suspense } from "react";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getAvailablePlansAction } from "@/lib/features/pricing/actions/subscription.actions";

import StripeCheckoutFormWrapper from "./components/stripe-checkout-form";

interface CheckoutPageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function CheckoutContent({ searchParams }: CheckoutPageProps) {
	// Get session
	const session = await auth();
	if (!session?.user) {
		notFound();
	}

	// Get planId from query params
	const params = await searchParams;
	const planId = typeof params.planId === "string" ? params.planId : null;

	if (!planId) {
		return (
			<div className="space-y-4">
				<div className="text-muted-foreground flex items-center gap-2 text-sm">
					<Link
						href="/pricing"
						className="hover:text-foreground">
						Pricing
					</Link>
					<span>/</span>
					<span>Checkout</span>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>No plan selected. Please go back and select a plan.</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Get plans
	const plansResult = await getAvailablePlansAction();
	const plansData = plansResult.data as any;
	if (!plansResult.success || !plansData?.plans) {
		return (
			<div className="space-y-4">
				<div className="text-muted-foreground flex items-center gap-2 text-sm">
					<Link
						href="/pricing"
						className="hover:text-foreground">
						Pricing
					</Link>
					<span>/</span>
					<span>Checkout</span>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>Failed to load plans. Please try again.</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Find the selected plan
	const selectedPlan = plansData.plans.find((p: any) => p.id === planId);
	if (!selectedPlan) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>Selected plan not found.</AlertDescription>
			</Alert>
		);
	}

	// Redirect to pricing if plan is free
	if (selectedPlan.monthlyPrice === 0) {
		// Free plans should be activated directly from pricing page
		// Redirect back to pricing with error message
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Free plans cannot be purchased through checkout. Please go back to{" "}
					<Link
						href="/pricing"
						className="underline">
						pricing page
					</Link>{" "}
					and click "Get Started Free".
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			{/* Breadcrumb */}
			<div className="text-muted-foreground flex items-center gap-2 text-sm">
				<Link
					href="/pricing"
					className="hover:text-foreground">
					Pricing
				</Link>
				<span>/</span>
				<span>Checkout</span>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Checkout Form */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Checkout</CardTitle>
							<CardDescription>Complete your payment to activate {selectedPlan.displayName}</CardDescription>
						</CardHeader>
						<CardContent>
							<StripeCheckoutFormWrapper plan={selectedPlan} />
						</CardContent>
					</Card>
				</div>

				{/* Order Summary */}
				<div className="h-fit lg:sticky lg:top-20">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Plan Details */}
							<div className="space-y-2 border-b pb-4">
								<div className="flex justify-between">
									<span className="font-medium">{selectedPlan.displayName}</span>
									<span className="font-medium">${selectedPlan.monthlyPrice.toFixed(2)}</span>
								</div>
								<p className="text-muted-foreground text-sm">Monthly billing</p>
							</div>

							{/* Trial Info */}
							{selectedPlan.trialDays > 0 && (
								<div className="space-y-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
									<p className="text-sm font-medium">Free trial included</p>
									<p className="text-muted-foreground text-sm">{selectedPlan.trialDays} days free. Cancel anytime.</p>
								</div>
							)}

							{/* Features */}
							{selectedPlan.features && selectedPlan.features.length > 0 && (
								<div className="space-y-2">
									<p className="text-sm font-medium">Includes:</p>
									<ul className="space-y-1">
										{selectedPlan.features.slice(0, 5).map((feature: string, idx: number) => (
											<li
												key={idx}
												className="text-muted-foreground flex items-start gap-2 text-sm">
												<span className="text-green-600">✓</span>
												<span>{feature}</span>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Total */}
							<div className="border-t pt-4">
								<div className="flex justify-between">
									<span className="text-base font-semibold">Total today</span>
									<span className="text-base font-semibold">${selectedPlan.trialDays > 0 ? "0.00" : selectedPlan.monthlyPrice.toFixed(2)}</span>
								</div>
								{selectedPlan.trialDays > 0 && <p className="text-muted-foreground text-xs">Then ${selectedPlan.monthlyPrice.toFixed(2)}/month</p>}
							</div>

							{/* Guarantee */}
							<div className="text-muted-foreground text-center text-xs">
								<p>30-day money-back guarantee</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
	return (
		<div className="flex flex-col gap-4">
			<div>
				<h1 className="text-3xl font-bold">Secure Checkout</h1>
				<p className="text-muted-foreground mt-1">Your payment information is encrypted and secure</p>
			</div>

			<Suspense fallback={<div className="bg-muted h-96 animate-pulse rounded-lg" />}>
				<CheckoutContent searchParams={searchParams} />
			</Suspense>
		</div>
	);
}
