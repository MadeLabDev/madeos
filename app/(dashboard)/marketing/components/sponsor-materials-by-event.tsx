"use client";

import { useCallback, useEffect, useState } from "react";

import { ArrowLeft, CheckCircle, Clock, Eye, MoreHorizontal, Pencil, Plus, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteSponsorMaterialAction, getSponsorMaterialsByEventIdAction, updateSponsorMaterialStatusAction } from "@/lib/features/marketing/actions";
import { SponsorMaterial } from "@/lib/features/marketing/types";
import { formatDate } from "@/lib/utils";

interface SponsorMaterialsByEventProps {
	eventId: string;
}

export function SponsorMaterialsByEvent({ eventId }: SponsorMaterialsByEventProps) {
	const [materials, setMaterials] = useState<SponsorMaterial[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [materialToDelete, setMaterialToDelete] = useState<SponsorMaterial | null>(null);
	const [deleting, setDeleting] = useState(false);
	const router = useRouter();

	const loadMaterials = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getSponsorMaterialsByEventIdAction(eventId);
			if (result.success) {
				setMaterials(result.data || []);
			} else {
				toast.error(result.message || "Failed to load sponsor materials");
				setMaterials([]);
			}
		} catch (error) {
			console.error("Error loading materials:", error);
			toast.error("Failed to load sponsor materials");
			setMaterials([]);
		} finally {
			setLoading(false);
		}
	}, [eventId]);

	useEffect(() => {
		loadMaterials();
	}, [eventId, loadMaterials]);

	const handleDelete = async () => {
		if (!materialToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteSponsorMaterialAction(materialToDelete.id);
			if (result.success) {
				toast.success("Sponsor material deleted successfully");
				setDeleteDialogOpen(false);
				setMaterialToDelete(null);
				loadMaterials();
			} else {
				toast.error(result.message || "Failed to delete sponsor material");
			}
		} catch (error) {
			console.error("Error deleting sponsor material:", error);
			toast.error("Failed to delete sponsor material");
		} finally {
			setDeleting(false);
		}
	};

	const handleStatusUpdate = async (material: SponsorMaterial, newStatus: string) => {
		try {
			const result = await updateSponsorMaterialStatusAction(material.id, newStatus);
			if (result.success) {
				toast.success(`Material status updated to ${newStatus}`);
				loadMaterials();
			} else {
				toast.error(result.message || "Failed to update material status");
			}
		} catch (error) {
			console.error("Error updating material status:", error);
			toast.error("Failed to update material status");
		}
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "PENDING":
				return "secondary";
			case "SUBMITTED":
				return "default";
			case "APPROVED":
				return "default";
			case "REJECTED":
				return "destructive";
			case "REVISION_REQUESTED":
				return "outline";
			default:
				return "secondary";
		}
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						onClick={() => router.back()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
					<div>
						<h1 className="text-2xl font-bold">Sponsor Materials</h1>
						<p className="text-muted-foreground">Manage sponsor assets and deliverables for this event</p>
					</div>
				</div>
				<Button asChild>
					<Link href={`/marketing/sponsors/new?eventId=${eventId}`}>
						<Plus className="mr-2 h-4 w-4" />
						Add Material
					</Link>
				</Button>
			</div>

			{/* Materials Table */}
			<Card>
				<CardContent className="pt-6">
					{materials.length === 0 ? (
						<div className="py-8 text-center">
							<NoItemFound message="No sponsor materials found for this event" />
							<Button
								asChild
								className="mt-4">
								<Link href={`/marketing/sponsors/new?eventId=${eventId}`}>Add First Material</Link>
							</Button>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Title</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Due Date</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="w-[70px]">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{materials.map((material) => (
										<TableRow key={material.id}>
											<TableCell className="font-medium">
												<div>
													<div className="font-semibold">{material.title}</div>
													{material.description && <div className="text-muted-foreground line-clamp-1 text-sm">{material.description}</div>}
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline">{material.type}</Badge>
											</TableCell>
											<TableCell>
												<Badge variant={getStatusBadgeVariant(material.status)}>{material.status.replace("_", " ")}</Badge>
											</TableCell>
											<TableCell>
												{material.dueDate ? (
													<div className="flex items-center gap-2">
														<span>{formatDate(material.dueDate)}</span>
														{material.dueDate < new Date() && material.status !== "APPROVED" && (
															<Badge
																variant="destructive"
																className="text-xs">
																Overdue
															</Badge>
														)}
													</div>
												) : (
													"-"
												)}
											</TableCell>
											<TableCell>{formatDate(material.createdAt)}</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															className="h-8 w-8 p-0">
															<span className="sr-only">Open menu</span>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														{material.file && (
															<DropdownMenuItem asChild>
																<Link
																	href={material.file.url}
																	target="_blank">
																	<Eye className="mr-2 h-4 w-4" />
																	View File
																</Link>
															</DropdownMenuItem>
														)}
														{material.url && (
															<DropdownMenuItem asChild>
																<Link
																	href={material.url}
																	target="_blank">
																	<Eye className="mr-2 h-4 w-4" />
																	View URL
																</Link>
															</DropdownMenuItem>
														)}
														<DropdownMenuSeparator />
														{material.status === "PENDING" && (
															<DropdownMenuItem onClick={() => handleStatusUpdate(material, "SUBMITTED")}>
																<CheckCircle className="mr-2 h-4 w-4" />
																Mark as Submitted
															</DropdownMenuItem>
														)}
														{material.status === "SUBMITTED" && (
															<>
																<DropdownMenuItem onClick={() => handleStatusUpdate(material, "APPROVED")}>
																	<CheckCircle className="mr-2 h-4 w-4" />
																	Approve
																</DropdownMenuItem>
																<DropdownMenuItem onClick={() => handleStatusUpdate(material, "REVISION_REQUESTED")}>
																	<Clock className="mr-2 h-4 w-4" />
																	Request Revision
																</DropdownMenuItem>
																<DropdownMenuItem onClick={() => handleStatusUpdate(material, "REJECTED")}>
																	<XCircle className="mr-2 h-4 w-4" />
																	Reject
																</DropdownMenuItem>
															</>
														)}
														{material.status === "REVISION_REQUESTED" && (
															<DropdownMenuItem onClick={() => handleStatusUpdate(material, "SUBMITTED")}>
																<CheckCircle className="mr-2 h-4 w-4" />
																Mark as Resubmitted
															</DropdownMenuItem>
														)}
														<DropdownMenuSeparator />
														<DropdownMenuItem asChild>
															<Link href={`/marketing/sponsors/${material.id}/edit`}>
																<Pencil className="mr-2 h-4 w-4" />
																Edit
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => {
																setMaterialToDelete(material);
																setDeleteDialogOpen(true);
															}}
															className="text-red-600">
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Sponsor Material"
				description={`Are you sure you want to delete "${materialToDelete?.title}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
