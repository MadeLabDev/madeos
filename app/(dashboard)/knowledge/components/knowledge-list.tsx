"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, Lock, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { ViewAssignedUsersModal } from "@/components/dialogs/view-assigned-users-modal";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageLoading } from "@/components/ui/page-loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KNOWLEDGE_STATUS_OPTIONS, KNOWLEDGE_TYPE_OPTIONS } from "@/lib/config/module-types";
import { bulkDeleteArticlesAction, deleteArticleAction, getArticlesAction } from "@/lib/features/knowledge/actions";
import { KnowledgeListProps, KnowledgeWithRelations } from "@/lib/features/knowledge/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function KnowledgeList({ page, search, categoryId, pageSize }: KnowledgeListProps) {
	const [articles, setArticles] = useState<KnowledgeWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [articleToDelete, setArticleToDelete] = useState<KnowledgeWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Modal state for viewing assigned users
	const [viewAssignedUsersModalOpen, setViewAssignedUsersModalOpen] = useState(false);
	const [selectedArticleForUsers, setSelectedArticleForUsers] = useState<KnowledgeWithRelations | null>(null);

	// Checkbox selection state
	const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load articles function
	const loadArticles = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getArticlesAction({
				page,
				pageSize,
				search: search || undefined,
				categoryId: categoryId || undefined,
			});

			if (result.success && result.data) {
				const data = result.data as { data: KnowledgeWithRelations[]; total: number };
				setArticles(data.data);
				setTotal(data.total);
			} else {
				toast.error("Failed to load articles");
			}
		} catch (error) {
			toast.error("Error loading articles");
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, search, categoryId]);

	useEffect(() => {
		loadArticles();
		setSelectedArticleIds([]);
	}, [loadArticles]);

	// Initialize Pusher
	usePusher();

	// Subscribe to knowledge updates
	const handleKnowledgeUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "knowledge_created") {
				if (page === 1) {
					setArticles((prev) => {
						if (prev.find((a) => a.id === data.article.id)) return prev;
						return [data.article, ...prev];
					});
				}
			} else if (data.action === "knowledge_updated") {
				setArticles((prev) => prev.map((a) => (a.id === data.article.id ? { ...a, ...data.article } : a)));
			} else if (data.action === "knowledge_deleted") {
				setArticles((prev) => prev.filter((a) => a.id !== data.article?.id));
			} else {
				loadArticles();
			}
		},
		[page, loadArticles],
	);

	useChannelEvent("private-global", "knowledge_update", handleKnowledgeUpdate);

	const handleDelete = async () => {
		if (!articleToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteArticleAction(articleToDelete.id);

			if (result.success) {
				toast.success("Article deleted successfully");
				setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
				setDeleteDialogOpen(false);
				setArticleToDelete(null);
			} else {
				toast.error(result.message || "Failed to delete article");
			}
		} catch (error) {
			toast.error("Error deleting article");
		} finally {
			setDeleting(false);
		}
	};

	// Checkbox selection functions
	const toggleSelectAll = () => {
		if (selectedArticleIds.length === articles.length) {
			setSelectedArticleIds([]);
		} else {
			setSelectedArticleIds(articles.map((a) => a.id));
		}
	};

	const toggleSelectArticle = (articleId: string) => {
		setSelectedArticleIds((prev) => (prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]));
	};

	// Bulk delete handler
	const handleBulkDelete = async () => {
		if (selectedArticleIds.length === 0) return;

		if (!confirm(`Are you sure you want to delete ${selectedArticleIds.length} article(s)? This action cannot be undone.`)) {
			return;
		}

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteArticlesAction(selectedArticleIds);
			if (result.success) {
				toast.success(result.message || "Articles deleted successfully");
				setSelectedArticleIds([]);
				await loadArticles();
			} else {
				toast.error(result.message || "Failed to delete articles");
			}
		} catch (error) {
			toast.error("Error deleting articles");
		} finally {
			setBulkActionLoading(false);
		}
	};

	if (loading) {
		return <PageLoading />;
	}

	if (articles.length === 0) {
		return <NoItemFound text="No articles found" />;
	}

	return (
		<>
			{/* Bulk Actions Bar */}
			<BulkActionsBar
				selectedCount={selectedArticleIds.length}
				itemName="article"
				isLoading={bulkActionLoading}
				actions={[
					{
						label: "Delete Selected",
						icon: Trash2,
						onClick: handleBulkDelete,
						variant: "destructive",
					},
				]}
				onClear={() => setSelectedArticleIds([])}
			/>

			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[50px]">
								<Checkbox
									checked={selectedArticleIds.length === articles.length}
									onCheckedChange={toggleSelectAll}
									aria-label="Select all"
								/>
							</TableHead>
							<TableHead className="w-16">Image</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-center">Assigned Users</TableHead>
							<TableHead className="text-right">Views</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{articles.map((article) => (
							<TableRow key={article.id}>
								<TableCell>
									<Checkbox
										checked={selectedArticleIds.includes(article.id)}
										onCheckedChange={() => toggleSelectArticle(article.id)}
										aria-label={`Select ${article.title}`}
									/>
								</TableCell>
								<TableCell>
									{article.thumbnail && (
										<div className="bg-muted relative aspect-square w-16 overflow-hidden rounded border">
											<Image
												src={article.thumbnail || ""}
												alt=""
												fill
												className="rounded object-cover"
											/>
										</div>
									)}
								</TableCell>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<span>{article.title}</span>
										{article.visibility === "private" && <Lock className="text-muted-foreground h-4 w-4" />}
									</div>
								</TableCell>
								<TableCell>
									{(() => {
										const config = KNOWLEDGE_TYPE_OPTIONS.find((option) => option.value === article.type);
										return (
											<Badge
												variant={config?.badgeVariant || "outline"}
												className="capitalize">
												{config?.label || article.type}
											</Badge>
										);
									})()}
								</TableCell>
								<TableCell>
									{article.categories && article.categories.length > 0 ? (
										<div className="flex flex-wrap gap-1">
											{article.categories.map((cat) => (
												<Badge
													key={cat.id}
													variant="outline">
													{cat.name}
												</Badge>
											))}
										</div>
									) : (
										<span className="text-muted-foreground text-sm">Uncategorized</span>
									)}
								</TableCell>
								<TableCell>
									{(() => {
										const statusValue = article.isPublished ? "published" : "draft";
										const config = KNOWLEDGE_STATUS_OPTIONS.find((option) => option.value === statusValue);
										return <Badge variant={config?.badgeVariant || "outline"}>{config?.label || statusValue}</Badge>;
									})()}
								</TableCell>
								<TableCell className="text-center">
									{article.visibility === "private" ? (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setSelectedArticleForUsers(article);
												setViewAssignedUsersModalOpen(true);
											}}
											className="gap-1">
											<Users className="h-4 w-4" />
											<span>{article.assignedUsers?.length || 0}</span>
										</Button>
									) : (
										<span className="text-muted-foreground text-sm">-</span>
									)}
								</TableCell>
								<TableCell className="text-right">{article.viewCount}</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link href={`/knowledge/${article.id}`}>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/knowledge/${article.id}/edit`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => {
													setArticleToDelete(article);
													setDeleteDialogOpen(true);
												}}>
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

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="articles"
					baseUrl="/knowledge"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Article"
				description={`Are you sure you want to delete "${articleToDelete?.title}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>

			{/* View Assigned Users Modal */}
			<ViewAssignedUsersModal
				isOpen={viewAssignedUsersModalOpen}
				onClose={() => setViewAssignedUsersModalOpen(false)}
				article={selectedArticleForUsers}
			/>
		</>
	);
}
