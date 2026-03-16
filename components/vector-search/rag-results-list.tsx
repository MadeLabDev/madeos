"use client";

import type { RAGSource } from "@/lib/features/vector-search/types";

interface RAGResultsListProps {
	sources: RAGSource[];
}

export function RAGResultsList({ sources }: RAGResultsListProps) {
	return (
		<div className="space-y-1 text-xs">
			<p className="mb-2 font-semibold opacity-80">Sources ({sources.length})</p>
			{sources.map((source, index) => (
				<div
					key={source.id}
					className="flex items-start gap-2 rounded bg-white/10 p-1.5 text-current dark:bg-black/20">
					<span className="min-w-fit flex-shrink-0 font-medium">[{index + 1}]</span>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-1">
							<span className="bg-opacity-20 rounded bg-current px-1.5 py-0.5 text-xs font-medium">{source.module}</span>
							<span className="bg-opacity-20 rounded bg-current px-1.5 py-0.5 text-xs">{source.type}</span>
							<span className="ml-auto text-xs opacity-70">{(source.similarity * 100).toFixed(0)}%</span>
						</div>
						<p className="mt-1 line-clamp-2 opacity-90">{source.content.substring(0, 100)}...</p>
					</div>
				</div>
			))}
		</div>
	);
}
