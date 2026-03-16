import { Suspense } from "react";

import { Lock } from "lucide-react";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { ReadOnlyEditor } from "@/components/blocks/editor-x/read-only-editor";
import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { auth } from "@/lib/auth";
import { getCourseAction } from "@/lib/features/knowledge/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const metadata = generateCrudMetadata("Course");

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const result = await getCourseAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const course = result.data as any;

	// Check access permission for private content
	if (course.visibility === "private") {
		const session = await auth();
		const user = session?.user as any;

		if (!user) {
			redirect("/access-denied");
		}

		const userRoles = user.roles || [];
		const isAdmin = userRoles.some((r: any) => r.name === "admin");
		const isManager = userRoles.some((r: any) => r.name === "manager");

		// Admin and Manager can bypass permission check
		if (!isAdmin && !isManager) {
			// Check if user is directly assigned (compare by email)
			const isUserAssigned = course.assignedUsers?.some((au: any) => au.user?.email === user.email);

			// Check if user belongs to assigned group (compare by email in group members)
			const isGroupMember = course.assignedGroups?.some((ag: any) => ag.group?.members?.some((m: any) => m.user?.email === user.email));

			console.log("👤 User access result:", { isUserAssigned, isGroupMember });

			// If not assigned to user or group, deny access
			if (!isUserAssigned && !isGroupMember) {
				redirect("/access-denied");
			}
		}
	}

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={course.title}
				/>

				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="flex items-center gap-2 text-3xl font-bold">
							{course.title}
							{course.visibility === "private" && <Lock className="text-muted-foreground h-6 w-6" />}
						</h1>
					</div>
				</div>

				{/* Main content - 2 columns */}
				<div className="grid grid-cols-3 gap-6">
					{/* Left column - Content (2/3 width) */}
					<div className="col-span-2 space-y-6">
						{/* Main course content */}
						<Card>
							<CardContent
								className="py-0"
								id="coursecontent">
								<ReadOnlyEditor editorSerializedState={course.content} />
							</CardContent>
						</Card>
					</div>

					{/* Right column - Sidebar (1/3 width) */}
					<div className="col-span-1 space-y-6">
						{/* Thumbnail */}
						{course.thumbnail && (
							<Card className="p-0">
								<CardContent className="p-0">
									<div className="relative h-48 w-full">
										<Image
											src={course.thumbnail}
											alt={course.title}
											fill
											className="rounded-lg object-cover"
										/>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Categories */}
						{course.categories && course.categories.length > 0 && (
							<Card>
								<CardHeader>
									<h3 className="text-sm font-semibold">Categories</h3>
								</CardHeader>
								<CardContent className="space-y-2 py-0">
									<div className="flex flex-col gap-2">
										{course.categories.map((category: any) => (
											<Badge
												key={category.id}
												variant="outline"
												className="w-fit">
												{category.name}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Tags */}
						{course.tags && course.tags.length > 0 && (
							<Card>
								<CardHeader>
									<h3 className="text-sm font-semibold">Tags</h3>
								</CardHeader>
								<CardContent className="space-y-2 py-0">
									<div className="flex flex-col gap-2">
										{course.tags.map((tag: any) => (
											<Badge
												key={tag.id}
												variant="secondary"
												className="w-fit">
												{tag.name}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Status & Info */}
						<Card>
							<CardHeader>
								<h3 className="text-sm font-semibold">Information</h3>
							</CardHeader>
							<CardContent className="space-y-4 py-0">
								{/* Visibility */}
								<div>
									<p className="text-muted-foreground mb-1 text-xs">Visibility</p>
									<div className="flex items-center gap-2">
										<Badge
											variant={course.visibility === "public" ? "default" : "secondary"}
											className="w-fit capitalize">
											{course.visibility}
										</Badge>
										{course.visibility === "private" && <Lock className="text-muted-foreground h-4 w-4" />}
									</div>
								</div>

								{/* Status */}
								<div>
									<p className="text-muted-foreground mb-1 text-xs">Status</p>
									<Badge
										variant={course.isPublished ? "default" : "secondary"}
										className="w-fit">
										{course.isPublished ? "Published" : "Draft"}
									</Badge>
								</div>

								{/* Views */}
								<div>
									<p className="text-muted-foreground mb-1 text-xs">Views</p>
									<p className="text-sm font-medium">{course.viewCount || 0}</p>
								</div>

								{/* Published Date */}
								{course.publishedAt && (
									<div>
										<p className="text-muted-foreground mb-1 text-xs">Published</p>
										<p className="text-sm font-medium">
											{new Date(course.publishedAt).toLocaleDateString("vi-VN", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</p>
									</div>
								)}

								{/* Created Date */}
								{course.createdAt && (
									<div>
										<p className="text-muted-foreground mb-1 text-xs">Created</p>
										<p className="text-sm font-medium">
											{new Date(course.createdAt).toLocaleDateString("vi-VN", {
												year: "numeric",
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</>
		</Suspense>
	);
}
