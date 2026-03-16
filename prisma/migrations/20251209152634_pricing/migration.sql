-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIAL', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'PENDING_RENEWAL');

-- CreateEnum
CREATE TYPE "SubscriptionAction" AS ENUM ('CREATED', 'UPGRADED', 'DOWNGRADED', 'RENEWED', 'CANCELLED', 'REACTIVATED', 'TRIAL_STARTED', 'TRIAL_ENDED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'PENDING', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "monthlyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "annualPrice" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "features" TEXT,
    "limitations" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'basic',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastPaymentDate" TIMESTAMP(3),
    "nextPaymentDate" TIMESTAMP(3),
    "lastPaymentId" TEXT,
    "trialEndDate" TIMESTAMP(3),
    "scheduledDowngradeAt" TIMESTAMP(3),
    "scheduledDowngradePlanId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionHistory" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" "SubscriptionAction" NOT NULL,
    "fromPlanId" TEXT,
    "toPlanId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "effectiveDate" TIMESTAMP(3),
    "invoiceId" TEXT,
    "paymentId" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "billingPeriodStart" TIMESTAMP(3) NOT NULL,
    "billingPeriodEnd" TIMESTAMP(3) NOT NULL,
    "paymentId" TEXT,
    "paymentMethod" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_name_key" ON "PricingPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_slug_key" ON "PricingPlan"("slug");

-- CreateIndex
CREATE INDEX "PricingPlan_slug_idx" ON "PricingPlan"("slug");

-- CreateIndex
CREATE INDEX "PricingPlan_tier_idx" ON "PricingPlan"("tier");

-- CreateIndex
CREATE INDEX "PricingPlan_isActive_idx" ON "PricingPlan"("isActive");

-- CreateIndex
CREATE INDEX "PricingPlan_order_idx" ON "PricingPlan"("order");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_key" ON "UserSubscription"("userId");

-- CreateIndex
CREATE INDEX "UserSubscription_userId_idx" ON "UserSubscription"("userId");

-- CreateIndex
CREATE INDEX "UserSubscription_planId_idx" ON "UserSubscription"("planId");

-- CreateIndex
CREATE INDEX "UserSubscription_status_idx" ON "UserSubscription"("status");

-- CreateIndex
CREATE INDEX "UserSubscription_renewalDate_idx" ON "UserSubscription"("renewalDate");

-- CreateIndex
CREATE INDEX "UserSubscription_createdAt_idx" ON "UserSubscription"("createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_subscriptionId_idx" ON "SubscriptionHistory"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_userId_idx" ON "SubscriptionHistory"("userId");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_actionType_idx" ON "SubscriptionHistory"("actionType");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_createdAt_idx" ON "SubscriptionHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_issuedAt_idx" ON "Invoice"("issuedAt");

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionHistory" ADD CONSTRAINT "SubscriptionHistory_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "UserSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
