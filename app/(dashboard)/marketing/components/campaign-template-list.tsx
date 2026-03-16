"use client";

import { useState } from "react";

import { Copy, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Pagination } from "@/components/pagination/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteCampaignTemplateAction, toggleCampaignTemplateActiveAction } from "@/lib/features/marketing/actions";
import { CampaignTemplate } from "@/lib/features/marketing/types";

interface CampaignTemplateListProps {
	templates: CampaignTemplate[];
	total: number;
	currentPage: number;
	limit: number;
}

export function CampaignTemplateList({ templates, total, currentPage, limit }: CampaignTemplateListProps) {
	const router = useRouter();
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [togglingId, setTogglingId] = useState<string | null>(null);

	const totalPages = Math.ceil(total / limit);

	async function handleDelete(id: string) {
		setIsDeleting(true);
		try {
			const result = await deleteCampaignTemplateAction(id);
			if (result.success) {
				toast.success("Template deleted successfully");
				setDeleteId(null);
				router.refresh();
			} else {
				toast.error(result.message || "Failed to delete template");
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
			console.error(error);
		} finally {
			setIsDeleting(false);
		}
	}

	async function handleToggleActive(id: string, currentStatus: boolean) {
		setTogglingId(id);
		try {
			const result = await toggleCampaignTemplateActiveAction(id, !currentStatus);
			if (result.success) {
				toast.success(`Template ${!currentStatus ? "activated" : "deactivated"} successfully`);
				router.refresh();
			} else {
				toast.error(result.message || "Failed to update template");
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
			console.error(error);
		} finally {
			setTogglingId(null);
		}
	}

	const typeColors: Record<string, string> = {
		GENERAL: "bg-blue-100 text-blue-800",
		EVENT_INVITATION: "bg-purple-100 text-purple-800",
		EVENT_REMINDER: "bg-orange-100 text-orange-800",
		NEWSLETTER: "bg-green-100 text-green-800",
		SPONSOR_UPDATE: "bg-pink-100 text-pink-800",
	};

	if (templates.length === 0) {
		return (
			<div className="py-12 text-center">
				<p className="text-muted-foreground mb-4">No campaign templates found</p>
				<Link href="/marketing/templates/new">
					<Button>Create First Template</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="overflow-hidden rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Subject</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created By</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{templates.map((template) => (
							<TableRow key={template.id}>
								<TableCell className="font-medium">{template.name}</TableCell>
								<TableCell>
									<Badge className={typeColors[template.type]}>{template.type.replace(/_/g, " ")}</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground max-w-xs truncate text-sm">{template.subject}</TableCell>
								<TableCell>
									<Badge variant={template.isActive ? "default" : "outline"}>{template.isActive ? "Active" : "Inactive"}</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground text-sm">{template.createdBy?.name || "Unknown"}</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="sm">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<Link
													href={`/marketing/templates/${template.id}`}
													className="cursor-pointer">
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href={`/marketing/templates/${template.id}/edit`}
													className="cursor-pointer">
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleToggleActive(template.id, template.isActive)}
												disabled={togglingId === template.id}>
												{togglingId === template.id && <Loader size="sm" />}
												{template.isActive ? "Deactivate" : "Activate"}
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => {
													navigator.clipboard.writeText(template.id);
													toast.success("Template ID copied");
												}}>
												<Copy className="mr-2 h-4 w-4" />
												Copy ID
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => setDeleteId(template.id)}
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
			{totalPages > 1 && (
				<Pagination
					page={currentPage}
					total={total}
					pageSize={limit}
					baseUrl="/marketing/templates"
				/>
			)}{" "}
			<AlertDialog
				open={Boolean(deleteId)}
				onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogTitle>Delete Template</AlertDialogTitle>
					<AlertDialogDescription>Are you sure you want to delete this template? This action cannot be undone.</AlertDialogDescription>
					<div className="flex justify-end gap-3">
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteId && handleDelete(deleteId)}
							disabled={isDeleting}
							className="gap-2">
							{isDeleting && <Loader size="sm" />}
							Delete
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
