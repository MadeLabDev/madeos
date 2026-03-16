"use client";

import { useEffect, useState } from "react";

import { AlertCircle, Check, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubscriptionDetailsAction } from "@/lib/features/pricing/actions";
import type { PricingPlan, UserSubscription } from "@/lib/features/pricing/types";
import { formatDate } from "@/lib/utils";

export function SubscriptionCard() {
	const [subscription, setSubscription] = useState<UserSubscription | null>(null);
	const [plan, setPlan] = useState<PricingPlan | null>(null);
	const [loading, setLoading] = useState(true);
	const [changingPlan, setChangingPlan] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const result = await getSubscriptionDetailsAction();
				if (result.success && result.data) {
					const data = result.data as any;
					setSubscription(data?.subscription);
					setPlan(data?.currentPlan);
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	if (loading) return <div className="text-muted-foreground text-center">Loading...</div>;

	if (!plan) {
		return (
			<Card>
				<CardContent className="pt-6">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Failed to load subscription details</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-2xl">{plan.displayName}</CardTitle>
						<CardDescription>
							${plan.monthlyPrice.toFixed(2)}/{plan.billingCycle}
						</CardDescription>
					</div>
					{subscription && <Badge variant={subscription.status === "ACTIVE" ? "default" : "secondary"}>{subscription.status}</Badge>}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Subscription Status */}
				{subscription ? (
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Status</p>
							<p className="font-semibold capitalize">{subscription.status}</p>
						</div>

						{subscription.renewalDate && (
							<div className="space-y-1">
								<p className="text-muted-foreground text-sm">Renewal Date</p>
								<p className="font-semibold">{formatDate(subscription.renewalDate)}</p>
							</div>
						)}

						{subscription.endDate && (
							<div className="space-y-1">
								<p className="text-muted-foreground text-sm">Ends On</p>
								<p className="font-semibold text-red-600">{formatDate(subscription.endDate)}</p>
							</div>
						)}
					</div>
				) : (
					<div className="text-muted-foreground text-sm">
						<p>You don't have an active subscription yet. Choose a plan below to get started.</p>
					</div>
				)}

				{/* Trial Info */}
				{subscription?.trialEndDate && new Date(subscription.trialEndDate) > new Date() && (
					<Alert className="border-blue-200 bg-blue-50">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Trial ends on {formatDate(subscription.trialEndDate)}</AlertDescription>
					</Alert>
				)}

				{/* Scheduled Downgrade */}
				{subscription?.scheduledDowngradeAt && (
					<Alert className="border-yellow-200 bg-yellow-50">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Plan will downgrade on {formatDate(subscription.scheduledDowngradeAt)}</AlertDescription>
					</Alert>
				)}

				{/* Features */}
				{plan.features && (
					<div className="space-y-3">
						<p className="text-sm font-semibold">Features Included:</p>
						<ul className="space-y-2">
							{(typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features).slice(0, 5).map((feature: string, idx: number) => (
								<li
									key={idx}
									className="flex items-center gap-2 text-sm">
									<Check className="h-4 w-4 text-green-600" />
									{feature}
								</li>
							))}
						</ul>
					</div>
				)}
			</CardContent>

			<CardFooter className="flex gap-2">
				<Button
					variant="outline"
					disabled={changingPlan}>
					Manage Billing
				</Button>
				<Button
					disabled={changingPlan}
					onClick={() => setChangingPlan(true)}>
					{changingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Change Plan
				</Button>
			</CardFooter>
		</Card>
	);
}
