import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { TrainingEngagementService, TrainingRegistrationService } from "@/lib/features/training/services";
import { requirePermission } from "@/lib/permissions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TrainingAttendees } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Training Attendees");

export const revalidate = 0;

interface AttendeesPageProps {
	searchParams: Promise<{
		page?: string;
		pageSize?: string;
		search?: string;
		trainingId?: string;
		status?: string;
		checkedIn?: string;
	}>;
}

export default async function AttendeesPage({ searchParams }: AttendeesPageProps) {
	await requirePermission("training", "read");

	const params = await searchParams;
	const page = parseInt(params.page || "1");
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const search = params.search || "";
	const trainingId = params.trainingId || "";
	const status = params.status || "";
	const checkedIn = params.checkedIn === "checked_in" ? true : params.checkedIn === "not_checked_in" ? false : undefined;

	const [result, trainings] = await Promise.all([
		TrainingRegistrationService.getTrainingRegistrationsPaginated({
			page,
			limit: pageSize,
			search: search || undefined,
			trainingEngagementId: trainingId || undefined,
			status: (status as any) || undefined,
			checkedIn,
		}),
		TrainingEngagementService.getTrainingEngagements(),
	]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Training Attendees"
				description="Manage training registrations and attendee check-ins"
				searchPlaceholder="Search by name or email..."
				search={search}
				clearHref={search || trainingId || status || checkedIn !== undefined ? "/training-support/attendees" : undefined}
			/>

			{/* Attendees List */}
			<Suspense fallback={<PageLoading />}>
				<TrainingAttendees
					initialRegistrations={result.registrations}
					initialTrainings={trainings}
					total={result.total}
					page={page}
					pageSize={pageSize}
					search={search}
					trainingId={trainingId}
					status={status}
					checkedIn={params.checkedIn || ""}
				/>
			</Suspense>
		</div>
	);
}
