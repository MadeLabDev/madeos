import Stripe from "stripe";

export class StripeService {
	private static stripe: Stripe;

	private static getStripe(): Stripe {
		if (!this.stripe) {
			const secretKey = process.env.STRIPE_SECRET_KEY;
			if (!secretKey) {
				throw new Error("STRIPE_SECRET_KEY is not configured");
			}
			this.stripe = new Stripe(secretKey);
		}
		return this.stripe;
	}

	/**
	 * Create a payment intent for subscription
	 */
	static async createPaymentIntent(amount: number, currency: string = "usd", metadata?: Record<string, string>): Promise<Stripe.PaymentIntent> {
		const stripe = this.getStripe();

		return await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Convert to cents
			currency,
			automatic_payment_methods: {
				enabled: true,
			},
			metadata: {
				...metadata,
				source: "madeapp_subscription",
			},
		});
	}

	/**
	 * Confirm a payment intent
	 */
	static async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
		const stripe = this.getStripe();

		return await stripe.paymentIntents.confirm(paymentIntentId);
	}

	/**
	 * Retrieve a payment intent
	 */
	static async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
		const stripe = this.getStripe();

		return await stripe.paymentIntents.retrieve(paymentIntentId);
	}

	/**
	 * Cancel a payment intent
	 */
	static async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
		const stripe = this.getStripe();

		return await stripe.paymentIntents.cancel(paymentIntentId);
	}

	/**
	 * Create a customer in Stripe
	 */
	static async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
		const stripe = this.getStripe();

		return await stripe.customers.create({
			email,
			name,
		});
	}

	/**
	 * Create a subscription in Stripe
	 */
	static async createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<Stripe.Subscription> {
		const stripe = this.getStripe();

		return await stripe.subscriptions.create({
			customer: customerId,
			items: [{ price: priceId }],
			metadata: {
				...metadata,
				source: "madeapp_subscription",
			},
		});
	}

	/**
	 * Handle Stripe webhook
	 */
	static constructEvent(payload: string | Buffer, signature: string, webhookSecret: string): Stripe.Event {
		const stripe = this.getStripe();

		return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
	}
}
