import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getDesignDeckById } from "@/lib/features/design/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditDesignDeckForm } from "./edit-design-deck-form";

export const metadata = generateCrudMetadata("Design Decks");

export default async function EditDesignDeckPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getDesignDeckById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const designDeck = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={designDeck.title || `Design Deck ${id}`}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditDesignDeckForm id={id} />
			</>
		</Suspense>
	);
}
