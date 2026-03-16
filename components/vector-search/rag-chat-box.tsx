"use client";

import { useEffect, useRef, useState } from "react";

import { Loader2, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { crossFeatureSearch } from "@/lib/features/vector-search";
import type { RAGResponse } from "@/lib/features/vector-search/types";

import { RAGMessageList } from "./rag-message-list";

interface RAGChatBoxProps {
	onClose?: () => void;
	defaultModules?: string[];
}

export function RAGChatBox({ onClose, defaultModules }: RAGChatBoxProps) {
	const [messages, setMessages] = useState<
		Array<{
			id: string;
			type: "user" | "assistant";
			content: string;
			response?: RAGResponse;
		}>
	>([]);

	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!input.trim()) return;

		const userMessage = {
			id: `msg-${Date.now()}`,
			type: "user" as const,
			content: input,
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const response = await crossFeatureSearch(input, {
				modules: defaultModules,
				topK: 5,
				minSimilarity: 0.6,
			});

			const assistantMessage = {
				id: `msg-${Date.now()}-response`,
				type: "assistant" as const,
				content: response.answer || "Unable to generate response",
				response,
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			const errorMessage = {
				id: `msg-${Date.now()}-error`,
				type: "assistant" as const,
				content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			};

			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
				<div>
					<h2 className="font-semibold text-slate-900 dark:text-slate-50">AI Assistant</h2>
					<p className="text-xs text-slate-500 dark:text-slate-400">Search across your workspace</p>
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-900">
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			{/* Messages */}
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{messages.length === 0 && (
					<div className="flex h-full flex-col items-center justify-center p-4 text-center">
						<div className="text-sm text-slate-500 dark:text-slate-400">
							<p className="mb-2 font-medium">No messages yet</p>
							<p>Ask a question to get started...</p>
						</div>
					</div>
				)}

				<RAGMessageList messages={messages} />
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<form
				onSubmit={handleSubmit}
				className="border-t border-slate-200 p-4 dark:border-slate-800">
				<div className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Ask a question..."
						disabled={isLoading}
						className="flex-1"
					/>
					<Button
						type="submit"
						disabled={isLoading || !input.trim()}
						size="icon">
						{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
					</Button>
				</div>
			</form>
		</div>
	);
}
