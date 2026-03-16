import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewDesignDeckForm } from "./new-design-deck-form";

export const metadata = generateCrudMetadata("Design Decks");

export default function NewDesignDeckPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="New Design Deck"
				/>
				<NewDesignDeckForm />
			</>
		</Suspense>
	);
}
