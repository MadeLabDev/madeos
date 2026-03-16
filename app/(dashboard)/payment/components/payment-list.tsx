"use client";

import { DollarSign } from "lucide-react";

import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentListProps {
	search: string;
	statusFilter: string;
	page: number;
	pageSize: number;
}

export function PaymentList({ page, pageSize }: PaymentListProps) {
	// Placeholder component - payment data loading logic would go here
	return (
		<Card>
			<CardHeader>
				<CardTitle>Payment History</CardTitle>
				<CardDescription>View all payments and transactions</CardDescription>
			</CardHeader>

			<CardContent>
				<NoItemFound
					icon={DollarSign}
					text="No payments found"
				/>

				<Pagination
					page={page}
					pageSize={pageSize}
					total={0}
					baseUrl="/payment"
				/>
			</CardContent>
		</Card>
	);
}
