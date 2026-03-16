import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { getMediaList } from "@/lib/features/media/actions";
import type { MediaGridProps } from "@/lib/features/media/types";

import { MediaGridItems } from "./media-grid-items";

export async function MediaGrid({ page, search, pageSize }: MediaGridProps) {
	const result = await getMediaList(page, search, pageSize);

	if (!result.success) {
		return (
			<div className="py-12 text-center">
				<p className="text-destructive">{result.message}</p>
			</div>
		);
	}

	const { items = [], total = 0, currentPage = 1 } = result.data || {};

	return (
		<div className="space-y-6">
			{items.length === 0 ? (
				<NoItemFound text="No files uploaded found" />
			) : (
				<>
					<MediaGridItems items={items} />

					{/* Pagination */}
					<Pagination
						page={currentPage}
						total={total}
						pageSize={pageSize}
						search={search}
						itemName="media files"
						baseUrl="/medias"
					/>
				</>
			)}
		</div>
	);
}
