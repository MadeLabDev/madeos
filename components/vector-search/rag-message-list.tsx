"use client";

import type { RAGResponse } from "@/lib/features/vector-search/types";

import { RAGResultsList } from "./rag-results-list";

interface Message {
	id: string;
	type: "user" | "assistant";
	content: string;
	response?: RAGResponse;
	timestamp?: Date;
}

interface RAGMessageListProps {
	messages: Message[];
}

export function RAGMessageList({ messages }: RAGMessageListProps) {
	return (
		<div className="space-y-4">
			{messages.map((message) => (
				<div
					key={message.id}
					className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
					<div className={`max-w-[80%] ${message.type === "user" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-50"} rounded-lg p-3`}>
						<p className="text-sm whitespace-pre-wrap">{message.content}</p>

						{/* Show results if available */}
						{message.response?.sources && message.response.sources.length > 0 && (
							<div className="border-opacity-20 mt-2 border-t border-current pt-2">
								<RAGResultsList sources={message.response.sources} />
							</div>
						)}

						{/* Show confidence score */}
						{message.response?.confidence && message.type === "assistant" && <div className="mt-2 text-xs opacity-70">Confidence: {(message.response.confidence * 100).toFixed(0)}%</div>}
					</div>
				</div>
			))}
		</div>
	);
}
