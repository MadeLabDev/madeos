"use client";

import { useState } from "react";

import { AlertCircle, CreditCard, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { changePlanAction } from "@/lib/features/pricing/actions/subscription.actions";
import type { PricingPlan } from "@/lib/features/pricing/types";

interface CheckoutFormProps {
	plan: PricingPlan;
	userId: string;
}

export default function CheckoutForm({ plan, userId }: CheckoutFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
	const [cardData, setCardData] = useState({
		cardName: "",
		cardNumber: "",
		expiry: "",
		cvc: "",
	});
	const [bankData, setBankData] = useState({
		accountHolder: "",
		accountNumber: "",
		routingNumber: "",
		bankName: "",
	});

	const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCardData((prev) => ({
			...prev,
			[name]: formatCardInput(name, value),
		}));
	};

	const formatCardInput = (field: string, value: string): string => {
		if (field === "cardNumber") {
			return value
				.replace(/\s/g, "")
				.replace(/(\d{4})/g, "$1 ")
				.trim();
		}
		if (field === "expiry") {
			return value
				.replace(/\D/g, "")
				.replace(/(\d{2})(\d{0,2})/, "$1/$2")
				.slice(0, 5);
		}
		if (field === "cvc") {
			return value.replace(/\D/g, "").slice(0, 3);
		}
		return value;
	};

	const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setBankData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const validateCardData = (): boolean => {
		if (!cardData.cardName.trim()) {
			toast.error("Please enter cardholder name");
			return false;
		}
		if (!cardData.cardNumber.replace(/\s/g, "")) {
			toast.error("Please enter card number");
			return false;
		}
		if (cardData.cardNumber.replace(/\s/g, "").length !== 16) {
			toast.error("Card number must be 16 digits");
			return false;
		}
		if (!cardData.expiry) {
			toast.error("Please enter expiry date");
			return false;
		}
		if (!cardData.cvc) {
			toast.error("Please enter CVC");
			return false;
		}
		return true;
	};

	const validateBankData = (): boolean => {
		if (!bankData.accountHolder.trim()) {
			toast.error("Please enter account holder name");
			return false;
		}
		if (!bankData.accountNumber) {
			toast.error("Please enter account number");
			return false;
		}
		if (!bankData.routingNumber) {
			toast.error("Please enter routing number");
			return false;
		}
		if (!bankData.bankName.trim()) {
			toast.error("Please enter bank name");
			return false;
		}
		return true;
	};

	const handleSubmit = async () => {
		// Validate payment method data
		if (paymentMethod === "card") {
			if (!validateCardData()) return;
		} else {
			if (!validateBankData()) return;
		}

		setIsLoading(true);
		try {
			// Call server action to create subscription
			const result = await changePlanAction({
				userId,
				newPlanId: plan.id,
				reason: "Paid plan activation via checkout",
			});

			if (result.success) {
				toast.success("Payment processed! Activating your plan...");

				// Simulate payment processing (in real app, integrate with Stripe/PayPal)
				await new Promise((resolve) => setTimeout(resolve, 1500));

				// Redirect to success page
				router.push("/payment?status=success");
			} else {
				toast.error(result.message || "Payment failed. Please try again.");
			}
		} catch (error) {
			console.error("Checkout error:", error);
			toast.error("An error occurred during checkout. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Security Badge */}
			<div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950">
				<Lock className="h-4 w-4 text-green-600" />
				<p className="text-sm text-green-700 dark:text-green-300">Your payment information is encrypted and secured with SSL technology</p>
			</div>

			{/* Payment Method Selection */}
			<Tabs
				value={paymentMethod}
				onValueChange={(v) => setPaymentMethod(v as "card" | "bank")}>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="card">
						<CreditCard className="mr-2 h-4 w-4" />
						Credit Card
					</TabsTrigger>
					<TabsTrigger value="bank">Bank Transfer</TabsTrigger>
				</TabsList>

				{/* Credit Card Form */}
				<TabsContent
					value="card"
					className="space-y-4">
					<div>
						<Label htmlFor="cardName">Cardholder Name</Label>
						<Input
							id="cardName"
							name="cardName"
							placeholder="John Doe"
							value={cardData.cardName}
							onChange={handleCardChange}
							disabled={isLoading}
						/>
					</div>

					<div>
						<Label htmlFor="cardNumber">Card Number</Label>
						<Input
							id="cardNumber"
							name="cardNumber"
							placeholder="4242 4242 4242 4242"
							value={cardData.cardNumber}
							onChange={handleCardChange}
							disabled={isLoading}
							maxLength={19}
						/>
						<p className="text-muted-foreground text-xs">Test: 4242 4242 4242 4242 (any future date, any CVC)</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="expiry">Expiry Date</Label>
							<Input
								id="expiry"
								name="expiry"
								placeholder="MM/YY"
								value={cardData.expiry}
								onChange={handleCardChange}
								disabled={isLoading}
								maxLength={5}
							/>
						</div>
						<div>
							<Label htmlFor="cvc">CVC</Label>
							<Input
								id="cvc"
								name="cvc"
								placeholder="123"
								value={cardData.cvc}
								onChange={handleCardChange}
								disabled={isLoading}
								maxLength={3}
								type="password"
							/>
						</div>
					</div>
				</TabsContent>

				{/* Bank Transfer Form */}
				<TabsContent
					value="bank"
					className="space-y-4">
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Bank transfer payments typically process within 3-5 business days. You'll receive confirmation via email.</AlertDescription>
					</Alert>

					<div>
						<Label htmlFor="accountHolder">Account Holder Name</Label>
						<Input
							id="accountHolder"
							name="accountHolder"
							placeholder="John Doe"
							value={bankData.accountHolder}
							onChange={handleBankChange}
							disabled={isLoading}
						/>
					</div>

					<div>
						<Label htmlFor="bankName">Bank Name</Label>
						<Input
							id="bankName"
							name="bankName"
							placeholder="Chase Bank"
							value={bankData.bankName}
							onChange={handleBankChange}
							disabled={isLoading}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="routingNumber">Routing Number</Label>
							<Input
								id="routingNumber"
								name="routingNumber"
								placeholder="021000021"
								value={bankData.routingNumber}
								onChange={handleBankChange}
								disabled={isLoading}
							/>
						</div>
						<div>
							<Label htmlFor="accountNumber">Account Number</Label>
							<Input
								id="accountNumber"
								name="accountNumber"
								placeholder="123456789"
								value={bankData.accountNumber}
								onChange={handleBankChange}
								disabled={isLoading}
							/>
						</div>
					</div>
				</TabsContent>
			</Tabs>

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
				onClick={handleSubmit}
				disabled={isLoading}
				className="w-full"
				size="lg">
				{isLoading ? "Processing Payment..." : `Pay $${plan.monthlyPrice.toFixed(2)} & Activate Plan`}
			</Button>

			{/* Additional Info */}
			<div className="text-muted-foreground text-center text-xs">
				<p>By clicking pay, you authorize us to charge your {paymentMethod === "card" ? "card" : "bank"} account.</p>
			</div>
		</div>
	);
}
