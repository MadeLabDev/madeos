"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AssessmentListRefresh() {
	const router = useRouter();

	return (
		<div className="flex justify-end">
			<Button
				variant="outline"
				size="sm"
				onClick={() => router.refresh()}>
				<RefreshCw className="mr-2 h-4 w-4" />
				Refresh
			</Button>
		</div>
	);
}
