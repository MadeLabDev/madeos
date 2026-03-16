"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PaymentMethodSetupDialog } from "./payment-method-setup-dialog";

interface PaymentMethodSectionProps {
	subscription: any;
}

export function PaymentMethodSection({ subscription }: PaymentMethodSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Payment Method</CardTitle>
				<CardDescription>Manage your billing information</CardDescription>
			</CardHeader>
			<CardContent>
				{subscription && subscription.lastPaymentId ? (
					<div className="space-y-4">
						<div className="rounded-lg border p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">•••• •••• •••• 4242</p>
									<p className="text-muted-foreground text-sm">Expires 12/26</p>
									<p className="text-muted-foreground text-sm">Last used: {new Date(subscription.startDate).toLocaleDateString()}</p>
								</div>
								<Button
									variant="outline"
									size="sm">
									Update
								</Button>
							</div>
						</div>
						<p className="text-muted-foreground text-sm">This payment method will be charged automatically for renewals.</p>
					</div>
				) : (
					<div className="space-y-4">
						<div className="rounded-lg border border-dashed p-8 text-center">
							<p className="text-muted-foreground">No payment method on file</p>
							<p className="text-muted-foreground mt-2 text-sm">Add a payment method to enable automatic billing</p>
						</div>
						<PaymentMethodSetupDialog onSuccess={() => window.location.reload()}>
							<Button className="w-full">Add Payment Method</Button>
						</PaymentMethodSetupDialog>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
