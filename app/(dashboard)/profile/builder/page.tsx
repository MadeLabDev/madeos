import { Suspense } from "react";

import { LogIn } from "lucide-react";
import Link from "next/link";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import { getMyProfileAction } from "@/lib/features/profile/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { ProfileBuilder } from "./components";

export const metadata = generateCrudMetadata("Profile");

async function ProfileBuilderContent() {
	const result = await getMyProfileAction();

	if (!result.success) {
		const isSessionError = result.message?.includes("invalid") || result.message?.includes("authenticated");

		return (
			<div className="space-y-4 text-center text-red-500">
				<div>Error: {result.message}</div>
				{isSessionError && (
					<div>
						<p className="text-muted-foreground mb-4 text-sm">Your session has expired. Please log in again.</p>
						<Link href="/api/auth/signin">
							<Button>
								<LogIn className="mr-2 h-4 w-4" />
								Sign In
							</Button>
						</Link>
					</div>
				)}
			</div>
		);
	}

	return <ProfileBuilder profile={result.data?.profile || null} />;
}

export default function ProfileBuilderPage() {
	return (
		<div className="container mx-auto max-w-6xl space-y-6 py-8">
			<SetBreadcrumb
				segment="builder"
				label="Build Your Profile"
			/>

			<Suspense fallback={<PageLoading />}>
				<ProfileBuilderContent />
			</Suspense>
		</div>
	);
}
