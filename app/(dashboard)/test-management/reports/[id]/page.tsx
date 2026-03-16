import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TestReportDetail } from "../../components";

interface TestReportDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export const metadata = generateCrudMetadata("Test Report");

export default async function TestReportDetailPage({ params }: TestReportDetailPageProps) {
	const { id } = await params;
	return <TestReportDetail reportId={id} />;
}
