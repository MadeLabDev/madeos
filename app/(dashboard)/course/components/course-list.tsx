"use client";

import { useCallback, useEffect, useState } from "react";

import { Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getArticlesAction } from "@/lib/features/knowledge/actions";
import { KnowledgeListProps, KnowledgeWithRelations } from "@/lib/features/knowledge/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function CourseList({ page, search, categoryId, pageSize }: KnowledgeListProps) {
	const [courses, setCourses] = useState<KnowledgeWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);

	// Load courses function
	const loadCourses = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getArticlesAction({
				page,
				pageSize,
				search: search || undefined,
				categoryId: categoryId || undefined,
				type: "course",
				isPublished: true,
			});

			if (result.success && result.data) {
				const data = result.data as { data: KnowledgeWithRelations[]; total: number };
				setCourses(data.data);
				setTotal(data.total);
			} else {
				toast.error("Failed to load courses");
			}
		} catch (error) {
			toast.error("Error loading courses");
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, search, categoryId]);

	useEffect(() => {
		loadCourses();
	}, [loadCourses]);

	// Initialize Pusher
	usePusher();

	// Subscribe to knowledge updates
	const handleKnowledgeUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "knowledge_created") {
				if (page === 1 && data.article?.type === "course" && data.article?.isPublished) {
					setCourses((prev) => {
						if (prev.find((a) => a.id === data.article.id)) return prev;
						return [data.article, ...prev];
					});
				}
			} else if (data.action === "knowledge_updated") {
				setCourses((prev) => prev.map((a) => (a.id === data.article.id ? { ...a, ...data.article } : a)));
			} else if (data.action === "knowledge_deleted") {
				setCourses((prev) => prev.filter((a) => a.id !== data.article?.id));
			} else {
				loadCourses();
			}
		},
		[page, loadCourses],
	);

	useChannelEvent("private-global", "knowledge_update", handleKnowledgeUpdate);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader size="lg" />
			</div>
		);
	}

	if (courses.length === 0) {
		return <NoItemFound text="No courses found" />;
	}

	return (
		<>
			<div className="overflow-hidden rounded-lg border">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-16">Image</TableHead>
								<TableHead>Title</TableHead>
								<TableHead className="hidden sm:table-cell">Visibility</TableHead>
								<TableHead className="hidden md:table-cell">Category</TableHead>
								<TableHead className="hidden lg:table-cell">Tags</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{courses.map((course) => (
								<TableRow key={course.id}>
									<TableCell>
										{course.thumbnail && (
											<div className="bg-muted relative aspect-square h-12 w-12 overflow-hidden rounded border sm:h-16 sm:w-16">
												<Image
													src={course.thumbnail}
													alt={course.title}
													fill
													className="rounded object-cover"
												/>
											</div>
										)}
									</TableCell>
									<TableCell className="font-medium">
										<div className="flex flex-col gap-1">
											<Link
												href={`/course/${course.slug}`}
												className="hover:text-primary flex items-center gap-2 underline">
												<span className="line-clamp-2">{course.title}</span>
												{course.visibility === "private" && <Lock className="text-muted-foreground h-4 w-4 flex-shrink-0" />}
											</Link>
											{/* Mobile-only info */}
											<div className="flex items-center gap-2 sm:hidden">
												<Badge
													variant={course.visibility === "public" ? "default" : "secondary"}
													className="text-xs capitalize">
													{course.visibility}
												</Badge>
												{course.categories && course.categories.length > 0 && course.categories[0] && (
													<Badge
														variant="outline"
														className="text-xs">
														{course.categories[0].name}
													</Badge>
												)}
											</div>
										</div>
									</TableCell>
									<TableCell className="hidden sm:table-cell">
										<Badge
											variant={course.visibility === "public" ? "default" : "secondary"}
											className="capitalize">
											{course.visibility}
										</Badge>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										{course.categories && course.categories.length > 0 ? (
											<div className="flex flex-wrap gap-1">
												{course.categories.slice(0, 2).map((cat) => (
													<Badge
														key={cat.id}
														variant="outline"
														className="text-xs">
														{cat.name}
													</Badge>
												))}
												{course.categories.length > 2 && (
													<Badge
														variant="outline"
														className="text-xs">
														+{course.categories.length - 2}
													</Badge>
												)}
											</div>
										) : (
											<span className="text-muted-foreground text-sm">Uncategorized</span>
										)}
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										<div className="flex flex-wrap gap-1">
											{course.tags.slice(0, 3).map((tag: any) => (
												<Badge
													key={tag.id}
													variant="secondary"
													className="text-xs">
													{tag.name}
												</Badge>
											))}
											{course.tags.length > 3 && (
												<Badge
													variant="secondary"
													className="text-xs">
													+{course.tags.length - 3}
												</Badge>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="courses"
					baseUrl="/course"
				/>
			)}
		</>
	);
}
