"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { format } from "date-fns";
import { Calendar, Eye, MapPin, Package, Pencil, Plus, Save, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSamplesByTestOrderId } from "@/lib/features/testing/actions";
import { SampleWithRelations } from "@/lib/features/testing/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface SampleListProps {
	testOrderId?: string;
	showHeader?: boolean;
}

export function SampleList({ testOrderId, showHeader = true }: SampleListProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [samples, setSamples] = useState<SampleWithRelations[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const loadSamples = useCallback(async () => {
		try {
			setLoading(true);
			let result;

			if (testOrderId) {
				result = await getSamplesByTestOrderId(testOrderId);
			} else {
				// If no testOrderId, we might need a different endpoint
				// For now, let's assume we have a general getSamples endpoint
				result = { success: true, data: [] };
			}

			if (result.success) {
				setSamples(result.data || []);
			}
		} catch (error) {
			console.error("Failed to load samples:", error);
		} finally {
			setLoading(false);
		}
	}, [testOrderId]);

	const filteredSamples = useMemo(() => {
		let filtered = samples;

		if (searchTerm) {
			const lowerSearch = searchTerm.toLowerCase();
			filtered = filtered.filter((sample) => sample.name.toLowerCase().includes(lowerSearch) || (sample.description && sample.description.toLowerCase().includes(lowerSearch)) || (sample.storageLocation && sample.storageLocation.toLowerCase().includes(lowerSearch)));
		}

		if (statusFilter !== "all") {
			filtered = filtered.filter((sample) => sample.status === statusFilter);
		}

		return filtered;
	}, [samples, searchTerm, statusFilter]);

	const handleSampleUpdate = useCallback(
		(eventData: any) => {
			const data = eventData?.data || eventData;
			if (["sample_created", "sample_updated", "sample_deleted"].includes(data?.action)) {
				loadSamples();
			}
		},
		[loadSamples],
	);

	usePusher();
	useChannelEvent("private-global", "sample_update", handleSampleUpdate);

	useEffect(() => {
		loadSamples();
	}, [loadSamples]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "RECEIVED":
				return "bg-blue-100 text-blue-800";
			case "IN_STORAGE":
				return "bg-green-100 text-green-800";
			case "IN_TESTING":
				return "bg-yellow-100 text-yellow-800";
			case "TESTED":
				return "bg-purple-100 text-purple-800";
			case "ARCHIVED":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-6">
			{showHeader && (
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold">Samples</h2>
						<p className="text-muted-foreground">Manage test samples</p>
					</div>
					{testOrderId && (
						<Button onClick={() => router.push(`/test-management/test-orders/${testOrderId}/samples/new`)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Sample
						</Button>
					)}
				</div>
			)}

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 sm:flex-row">
						<div className="flex-1">
							<div className="relative">
								<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
								<Input
									placeholder="Search samples..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}>
							<SelectTrigger className="w-full sm:w-48">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="RECEIVED">Received</SelectItem>
								<SelectItem value="IN_STORAGE">In Storage</SelectItem>
								<SelectItem value="IN_TESTING">In Testing</SelectItem>
								<SelectItem value="TESTED">Tested</SelectItem>
								<SelectItem value="ARCHIVED">Archived</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Samples Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Package className="mr-2 h-5 w-5" />
						Samples ({filteredSamples.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex items-center justify-center p-8">
							<Loader size="lg" />
						</div>
					) : filteredSamples.length === 0 ? (
						<div className="py-8 text-center">
							<Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
							<p className="text-muted-foreground">{searchTerm || statusFilter !== "all" ? "No samples match your filters" : "No samples found"}</p>
							{testOrderId && (
								<Button
									className="mt-4"
									onClick={() => router.push(`/test-management/test-orders/${testOrderId}/samples/new`)}>
									<Save className="mr-2 h-4 w-4" />
									Create First Sample
								</Button>
							)}
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Received Date</TableHead>
										<TableHead>Storage Location</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredSamples.map((sample) => (
										<TableRow key={sample.id}>
											<TableCell>
												<div>
													<p className="font-medium">{sample.name}</p>
													{sample.description && <p className="text-muted-foreground max-w-xs truncate text-sm">{sample.description}</p>}
												</div>
											</TableCell>
											<TableCell>{sample.type && <Badge variant="outline">{sample.type}</Badge>}</TableCell>
											<TableCell>
												<Badge className={getStatusColor(sample.status)}>{sample.status}</Badge>
											</TableCell>
											<TableCell>
												{sample.receivedDate ? (
													<div className="flex items-center text-sm">
														<Calendar className="mr-1 h-4 w-4" />
														{format(new Date(sample.receivedDate), "MMM dd, yyyy")}
													</div>
												) : (
													<span className="text-muted-foreground">Not set</span>
												)}
											</TableCell>
											<TableCell>
												{sample.storageLocation ? (
													<div className="flex items-center text-sm">
														<MapPin className="mr-1 h-4 w-4" />
														{sample.storageLocation}
													</div>
												) : (
													<span className="text-muted-foreground">Not set</span>
												)}
											</TableCell>
											<TableCell>
												<div className="flex space-x-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => router.push(`/test-management/samples/${sample.id}`)}>
														<Eye className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => router.push(`/test-management/samples/${sample.id}/edit`)}>
														<Pencil className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
