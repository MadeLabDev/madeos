import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { auth } from "@/lib/auth";
import { getPublicArticleAction } from "@/lib/features/knowledge/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { CoursePageClient } from "./components/course-page-client";

export const metadata = generateCrudMetadata("Print Hustlers 2025");

export default async function DemoPage() {
	// Check
	const result = await getPublicArticleAction("print-hustlers-2025", "course");

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
			<CoursePageClient course={course} />
		</Suspense>
	);
}
