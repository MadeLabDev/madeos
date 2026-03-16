"use client";

import { useEffect, useState } from "react";

import { Check, Star, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { changePlanAction, getAvailablePlansAction, getSubscriptionDetailsAction } from "@/lib/features/pricing/actions";
import type { PricingPlan, UserSubscription } from "@/lib/features/pricing/types";

export function AvailablePlans() {
	const [plans, setPlans] = useState<PricingPlan[]>([]);
	const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
	const [loading, setLoading] = useState(true);
	const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			const [plansResult, subResult] = await Promise.all([getAvailablePlansAction(), getSubscriptionDetailsAction()]);

			if (plansResult.success) setPlans((plansResult.data as any) || []);
			if (subResult.success && subResult.data) {
				const subData = subResult.data as any;
				setCurrentSubscription(subData?.subscription);
			}
			setLoading(false);
		};
		load();
	}, []);

	const handleChangePlan = async (planId: string) => {
		setProcessingPlanId(planId);

		try {
			const plan = plans.find((p) => p.id === planId);
			if (!plan) return;

			// If user doesn't have a subscription yet
			if (!currentSubscription) {
				// For free plan, create subscription directly
				if (plan.monthlyPrice === 0) {
					const result = await changePlanAction({
						userId: "", // Server action will get userId from session
						newPlanId: planId,
					});

					if (result.success) {
						toast.success("Free plan activated!");
						window.location.reload();
					} else {
						toast.error(result.message);
					}
				} else {
					// For paid plans, redirect to checkout
					window.location.href = `/checkout?planId=${planId}`;
				}
			} else {
				// User already has subscription, change plan
				const result = await changePlanAction({
					userId: currentSubscription.userId,
					newPlanId: planId,
				});

				if (result.success) {
					toast.success("Plan changed successfully!");
					window.location.reload();
				} else {
					toast.error(result.message);
				}
			}
		} catch (error) {
			toast.error("Something went wrong");
			console.error(error);
		} finally {
			setProcessingPlanId(null);
		}
	};

	if (loading) return <div className="text-muted-foreground text-center">Loading plans...</div>;

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
				{plans.map((plan) => {
					const isCurrent = currentSubscription?.planId === plan.id;
					const features = typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features || [];
					const limitations = typeof plan.limitations === "string" ? JSON.parse(plan.limitations) : plan.limitations || [];

					return (
						<Card
							key={plan.id}
							className={`relative transition-all ${isCurrent ? "border-primary shadow-lg" : ""} ${plan.isFeatured ? "ring-primary ring-2" : ""}`}>
							{plan.isFeatured && (
								<div className="absolute -top-4 right-4">
									<Badge className="bg-primary">
										<Star className="mr-1 h-3 w-3" />
										Featured
									</Badge>
								</div>
							)}

							{isCurrent && (
								<div className="absolute -top-4 left-4">
									<Badge variant="secondary">Current Plan</Badge>
								</div>
							)}

							<CardHeader className={plan.isFeatured ? "pt-8" : ""}>
								<CardTitle>{plan.displayName}</CardTitle>
								<CardDescription>{plan.description}</CardDescription>
								<div className="mt-4">
									<span className="text-3xl font-bold">${plan.monthlyPrice}</span>
									<span className="text-muted-foreground ml-2">/{plan.billingCycle}</span>
								</div>
							</CardHeader>

							<CardContent className="space-y-4">
								{/* Features */}
								{features.length > 0 && (
									<div className="space-y-2">
										<p className="text-sm font-semibold">Includes:</p>
										<ul className="space-y-2">
											{features.slice(0, 5).map((feature: string, idx: number) => (
												<li
													key={idx}
													className="flex items-start gap-2 text-sm">
													<Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
													<span>{feature}</span>
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Limitations */}
								{limitations.length > 0 && (
									<div className="space-y-2">
										<p className="text-muted-foreground text-sm font-semibold">Limitations:</p>
										<ul className="space-y-1">
											{limitations.slice(0, 3).map((limit: string, idx: number) => (
												<li
													key={idx}
													className="text-muted-foreground flex items-start gap-2 text-sm">
													<X className="mt-0.5 h-4 w-4 flex-shrink-0" />
													<span>{limit}</span>
												</li>
											))}
										</ul>
									</div>
								)}
							</CardContent>

							<CardFooter>
								{isCurrent ? (
									<Button
										disabled
										className="w-full">
										Current Plan
									</Button>
								) : (
									<Button
										onClick={() => handleChangePlan(plan.id)}
										disabled={processingPlanId !== null}
										className="w-full"
										variant={plan.isFeatured ? "default" : "outline"}>
										{processingPlanId === plan.id ? "Processing..." : plan.monthlyPrice === 0 ? "Get Started Free" : "Upgrade Now"}
									</Button>
								)}
							</CardFooter>
						</Card>
					);
				})}
			</div>

			<p className="text-muted-foreground text-center">Upgrade to unlock more features, or downgrade to save costs</p>
		</div>
	);
}
