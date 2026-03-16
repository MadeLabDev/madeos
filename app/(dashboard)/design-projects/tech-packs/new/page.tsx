import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewTechPackForm } from "./new-tech-pack-form";

export const metadata = generateCrudMetadata("Tech Packs");

export default function NewTechPackPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="New Tech Pack"
				/>
				<NewTechPackForm />
			</>
		</Suspense>
	);
}
