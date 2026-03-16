"use client";

import { useCallback, useEffect, useState } from "react";

import { DollarSign, Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";

interface Pricing {
	id: string;
	amount: number;
	currency: string;
	status: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

interface PricingListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function PricingList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: PricingListProps) {
	const [pricings, setPricings] = useState<Pricing[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);

	// Mock data for now - replace with actual API call
	const loadPricings = useCallback(async () => {
		setLoading(true);
		try {
			// Mock pricings data
			const mockPricings: Pricing[] = [
				{
					id: "1",
					amount: 39.0,
					currency: "USD",
					status: "completed",
					description: "Starter Plan - Monthly",
					createdAt: new Date("2024-01-15"),
					updatedAt: new Date("2024-01-15"),
				},
				{
					id: "2",
					amount: 69.0,
					currency: "USD",
					status: "pending",
					description: "Professional Plan - Monthly",
					createdAt: new Date("2024-01-20"),
					updatedAt: new Date("2024-01-20"),
				},
			];

			let filteredPricings = mockPricings;

			// Client-side search filtering
			if (search) {
				filteredPricings = filteredPricings.filter((pricing) => pricing.description.toLowerCase().includes(search.toLowerCase()));
			}

			// Status filtering
			if (statusFilter !== "ALL") {
				filteredPricings = filteredPricings.filter((pricing) => pricing.status === statusFilter);
			}

			// Set total for pagination
			setTotal(filteredPricings.length);

			// Client-side pagination
			const startIndex = (page - 1) * pageSize;
			const endIndex = startIndex + pageSize;
			const paginatedPricings = filteredPricings.slice(startIndex, endIndex);

			setPricings(paginatedPricings);
		} catch (error) {
			console.error("Failed to load pricings:", error);
			setPricings([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, page, pageSize]);

	useEffect(() => {
		loadPricings();
	}, [loadPricings]);

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return (
					<Badge
						variant="default"
						className="bg-green-500">
						Completed
					</Badge>
				);
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "failed":
				return <Badge variant="destructive">Failed</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (loading) {
		return <Loader />;
	}

	if (pricings.length === 0) {
		return <NoItemFound itemName="pricings" />;
	}

	return (
		<div className="space-y-6">
			{/* Pricings Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{pricings.map((pricing) => (
					<Card
						key={pricing.id}
						className="transition-shadow hover:shadow-md">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{pricing.description}</CardTitle>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="h-8 w-8 p-0">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem asChild>
										<Link href={`/pricing/${pricing.id}`}>
											<Eye className="mr-2 h-4 w-4" />
											View Details
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</CardHeader>
						<CardContent>
							<div className="mb-2 flex items-center justify-between">
								<div className="flex items-center">
									<DollarSign className="text-muted-foreground mr-1 h-4 w-4" />
									<span className="text-2xl font-bold">{pricing.amount.toFixed(2)}</span>
									<span className="text-muted-foreground ml-1">{pricing.currency}</span>
								</div>
								{getStatusBadge(pricing.status)}
							</div>
							<p className="text-muted-foreground text-xs">{formatDate(pricing.createdAt)}</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Pagination */}
			{total > pageSize && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					baseUrl="/pricing"
				/>
			)}
		</div>
	);
}
