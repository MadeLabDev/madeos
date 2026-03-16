"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bulkDeletePostsAction, deletePostAction, getPostsAction } from "@/lib/features/post/actions";
import { PostWithRelations } from "@/lib/features/post/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";
import { getPostTypeLabels } from "@/lib/utils/metadata";

interface PostListProps {
	page: number;
	search: string;
	categoryId: string;
	pageSize: number;
	type?: string;
}

export function PostList({ page, search, categoryId, pageSize, type = "blog" }: PostListProps) {
	const [posts, setPosts] = useState<PostWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [postToDelete, setPostToDelete] = useState<PostWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Checkbox selection state
	const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	const labels = getPostTypeLabels(type);
	const typePath = "post";

	// Initialize Pusher
	usePusher();

	// Subscribe to post updates
	useChannelEvent("private-global", "post_update", (data: any) => {
		const { action } = data;
		if (action === "post_created" || action === "post_updated" || action === "post_deleted") {
			loadPosts();
		}
	});

	// Load posts function
	const loadPosts = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getPostsAction({
				page,
				pageSize,
				search: search || undefined,
				categoryId: categoryId || undefined,
				type,
			});

			if (result.success && result.data) {
				const data = result.data as any;
				setPosts(data.items || []);
				setTotal(data.total || 0);
			} else {
				setPosts([]);
				setTotal(0);
				toast.error("Failed to load posts");
			}
		} catch (error) {
			toast.error("Error loading posts");
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, search, categoryId, type]);

	useEffect(() => {
		loadPosts();
		setSelectedPostIds([]);
	}, [loadPosts]);

	const handleDelete = async () => {
		if (!postToDelete) return;

		setDeleting(true);
		try {
			const result = await deletePostAction(postToDelete.id);
			if (result.success) {
				toast.success(labels.deleteSuccess);
				loadPosts();
			} else {
				toast.error(result.message || labels.deleteError);
			}
		} catch (error) {
			toast.error("Error deleting post");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setPostToDelete(null);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedPostIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const result = await bulkDeletePostsAction(selectedPostIds);
			if (result.success) {
				toast.success(labels.bulkDeleteSuccess(selectedPostIds.length));
				loadPosts();
				setSelectedPostIds([]);
			} else {
				toast.error(result.message || labels.bulkDeleteError);
			}
		} catch (error) {
			toast.error("Error deleting posts");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedPostIds(posts.map((post) => post.id));
		} else {
			setSelectedPostIds([]);
		}
	};

	const handleSelectPost = (postId: string, checked: boolean) => {
		if (checked) {
			setSelectedPostIds((prev) => [...prev, postId]);
		} else {
			setSelectedPostIds((prev) => prev.filter((id) => id !== postId));
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader size="lg" />
			</div>
		);
	}

	if (!posts || posts.length === 0) {
		return <NoItemFound text={labels.noItemsFound} />;
	}

	return (
		<div className="space-y-4">
			<BulkActionsBar
				selectedCount={selectedPostIds.length}
				itemName="post"
				onClear={() => setSelectedPostIds([])}
				isLoading={bulkActionLoading}
				actions={[
					{
						label: "Delete Selected",
						icon: Trash2,
						onClick: handleBulkDelete,
						variant: "destructive",
					},
				]}
			/>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={selectedPostIds.length === posts.length && posts.length > 0}
									onCheckedChange={handleSelectAll}
									aria-label="Select all posts"
								/>
							</TableHead>
							<TableHead className="w-16">Image</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Categories</TableHead>
							<TableHead>Tags</TableHead>
							<TableHead>Published</TableHead>
							<TableHead>Views</TableHead>
							<TableHead className="w-12"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{posts.map((post) => (
							<TableRow key={post.id}>
								<TableCell>
									<Checkbox
										checked={selectedPostIds.includes(post.id)}
										onCheckedChange={(checked) => handleSelectPost(post.id, checked as boolean)}
										aria-label={`Select post ${post.title}`}
									/>
								</TableCell>
								<TableCell>
									{post.thumbnail && (
										<div className="bg-muted relative aspect-square w-16 overflow-hidden rounded border">
											<Image
												src={post.thumbnail}
												alt=""
												fill
												className="rounded object-cover"
											/>
										</div>
									)}
								</TableCell>
								<TableCell>
									<div>
										<Link
											href={`/${typePath}/${post.id}`}
											className="font-medium hover:underline">
											{post.title}
										</Link>
										{post.excerpt && <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">{post.excerpt}</p>}
									</div>
								</TableCell>
								<TableCell>
									<Badge variant={post.isPublished ? "default" : "secondary"}>{post.isPublished ? "Published" : "Draft"}</Badge>
								</TableCell>
								<TableCell>
									<div className="flex flex-wrap gap-1">
										{post.categories.slice(0, 2).map((category) => (
											<Badge
												key={category.id}
												variant="outline"
												className="text-xs">
												{category.name}
											</Badge>
										))}
										{post.categories.length > 2 && (
											<Badge
												variant="outline"
												className="text-xs">
												+{post.categories.length - 2}
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex flex-wrap gap-1">
										{post.tags.slice(0, 2).map((tag) => (
											<Badge
												key={tag.id}
												variant="outline"
												className="text-xs">
												{tag.name}
											</Badge>
										))}
										{post.tags.length > 2 && (
											<Badge
												variant="outline"
												className="text-xs">
												+{post.tags.length - 2}
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell>{post.publishedAt ? <span className="text-sm">{new Date(post.publishedAt).toLocaleDateString()}</span> : <span className="text-muted-foreground text-sm">-</span>}</TableCell>
								<TableCell>
									<span className="text-sm">{post.viewCount}</span>
								</TableCell>
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
											<DropdownMenuItem asChild>
												<Link href={`/${typePath}/${post.id}${type !== "blog" ? `?type=${type}` : ""}`}>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/${typePath}/${post.id}/edit${type !== "blog" ? `?type=${type}` : ""}`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => {
													setPostToDelete(post);
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

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="posts"
					baseUrl="/post"
					type={type}
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDelete}
				title={labels.deleteTitle}
				description={`Are you sure you want to delete "${postToDelete?.title}"? This action cannot be undone.`}
				isDeleting={deleting}
			/>
		</div>
	);
}
