"use client";

import { useEffect, useRef, useState } from "react";

import { AlertCircle, Bot, Loader2, Minimize2, Send, Sparkles, X, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchAcrossModules } from "@/lib/features/vector-search/actions/search-actions";
import type { RAGSource } from "@/lib/features/vector-search/types";
import { cn } from "@/lib/utils";

interface ChatMessage {
	id: string;
	type: "user" | "assistant";
	content: string;
	sources?: RAGSource[];
	timestamp: Date;
}

interface AIAssistantProps {
	ragEnabled: boolean;
}

export function AIAssistant({ ragEnabled }: AIAssistantProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: "1",
			type: "assistant",
			content: "Hi! I'm your AI Assistant. I can help you search and find information across your entire system. Ask me anything!",
			timestamp: new Date(),
		},
	]);
	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (scrollAreaRef.current) {
			const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
			if (scrollElement) {
				setTimeout(() => {
					scrollElement.scrollTop = scrollElement.scrollHeight;
				}, 0);
			}
		}
	}, [messages]);

	async function handleSendMessage(e: React.FormEvent) {
		e.preventDefault();

		if (!query.trim()) return;
		if (!ragEnabled) {
			toast.error("RAG is not enabled. Enable it in Settings first.");
			return;
		}

		// Add user message
		const userMessageId = Date.now().toString();
		const userMessage: ChatMessage = {
			id: userMessageId,
			type: "user",
			content: query,
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, userMessage]);
		setQuery("");
		setLoading(true);

		try {
			// Search across all modules - try knowledge first for debugging
			console.log("🔍 AI Assistant searching for:", query);
			const result = await searchAcrossModules(query, ["knowledge"]);

			console.log("📊 Search result:", {
				success: result.success,
				message: result.message,
				sourceCount: result.sources?.length || 0,
				confidence: result.confidence,
			});

			if (result.sources && result.sources.length > 0) {
				console.log(
					"📋 Top sources:",
					result.sources.slice(0, 2).map((s) => ({
						module: s.module,
						content: s.content?.substring(0, 50),
						similarity: s.similarity,
					})),
				);
			}

			if (result.success && result.sources && result.sources.length > 0) {
				// Format response based on sources found
				const sources = result.sources!;
				const moduleGroups = sources.reduce(
					(acc, source) => {
						const moduleName = source.module;
						if (!acc[moduleName]) {
							acc[moduleName] = [];
						}
						acc[moduleName]!.push(source);
						return acc;
					},
					{} as Record<string, RAGSource[]>,
				);

				const moduleCount = Object.keys(moduleGroups).length;
				let responseContent = `I found ${sources.length} relevant result${sources.length !== 1 ? "s" : ""} across ${moduleCount} module${moduleCount > 1 ? "s" : ""}:\n\n`;

				// Add detailed content from top sources
				const topSources = sources.slice(0, 3); // Show top 3 detailed results
				topSources.forEach((source, idx) => {
					responseContent += `**${idx + 1}. ${source.module.toUpperCase()}**\n`;
					responseContent += `${source.content}\n\n`;
				});

				if (sources.length > 3) {
					responseContent += `*And ${sources.length - 3} more result${sources.length - 3 !== 1 ? "s" : ""}...*`;
				}

				const assistantMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					type: "assistant",
					content: responseContent,
					sources: sources.slice(0, 5), // Show top 5 as clickable links
					timestamp: new Date(),
				};

				setMessages((prev) => [...prev, assistantMessage]);
			} else {
				const assistantMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					type: "assistant",
					content: result.message || "I couldn't find any relevant information. Try asking with different keywords or check if RAG is properly configured.",
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, assistantMessage]);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Search error";
			const assistantMessage: ChatMessage = {
				id: (Date.now() + 1).toString(),
				type: "assistant",
				content: `Sorry, an error occurred: ${message}`,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, assistantMessage]);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			{/* Floating Button */}
			<div className="fixed right-6 bottom-6 z-40">
				<Button
					onClick={() => setIsOpen(!isOpen)}
					className={cn("group hover:shadow-3xl relative h-14 w-14 cursor-pointer rounded-full shadow-2xl transition-all duration-300 hover:scale-110", isOpen ? "bg-primary hover:bg-primary/90" : "bg-primary hover:bg-primary/90", !ragEnabled && "cursor-not-allowed opacity-60")}
					disabled={!ragEnabled}
					title={ragEnabled ? (isOpen ? "Close AI Assistant" : "Open AI Assistant") : "Enable RAG in Settings first"}>
					<div className="relative">
						{ragEnabled ? (
							<>
								{isOpen ? <Minimize2 className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
								{/* Pulse animation when closed */}
								{!isOpen && <div className="absolute inset-0 animate-ping rounded-full bg-white/20"></div>}
							</>
						) : (
							<AlertCircle className="h-6 w-6 text-white" />
						)}
					</div>

					{/* Tooltip */}
					<div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
						<div className="rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white">
							{ragEnabled ? (isOpen ? "Close Assistant" : "Ask AI Assistant") : "Enable RAG first"}
							<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
						</div>
					</div>
				</Button>
			</div>

			{/* Chat Window */}
			{isOpen && (
				<Card className="bg-background/95 fixed right-6 bottom-24 z-40 flex h-[600px] max-h-[calc(100vh-150px)] w-96 flex-col gap-0 border-0 py-0 shadow-2xl backdrop-blur-sm">
					{/* Header */}
					<div className="bg-muted/50 border-b px-4 py-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="relative">
									<div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full shadow-lg">
										<Bot className="text-primary-foreground h-5 w-5" />
									</div>
									{/* Online indicator */}
									<div className="border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-green-500"></div>
								</div>
								<div>
									<h3 className="text-sm font-semibold">AI Assistant</h3>
									<p className="text-muted-foreground text-xs">{ragEnabled ? "Online • Ready to help" : "Offline • Enable RAG"}</p>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsOpen(false)}
								className="hover:bg-muted/50 h-8 w-8 p-0">
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Messages */}
					{!ragEnabled ? (
						<CardContent className="flex flex-1 items-center justify-center">
							<Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
								<Zap className="h-4 w-4" />
								<AlertDescription>
									RAG is disabled. Enable it in{" "}
									<Link
										href="/settings"
										className="font-semibold underline">
										Settings
									</Link>{" "}
									to use the AI Assistant.
								</AlertDescription>
							</Alert>
						</CardContent>
					) : (
						<>
							<ScrollArea className="h-full max-h-[450px] flex-1">
								<div className="p-4">
									<div className="space-y-4">
										{messages.map((msg) => (
											<div
												key={msg.id}
												className={cn("flex gap-3", msg.type === "user" ? "justify-end" : "justify-start")}>
												{msg.type === "assistant" && (
													<div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm">
														<Bot className="text-primary-foreground h-4 w-4" />
													</div>
												)}

												<div className={cn("max-w-[75%] rounded-2xl px-4 py-3 shadow-sm", msg.type === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-foreground")}>
													<div className="text-sm break-words whitespace-pre-wrap">{msg.content}</div>

													{/* Show sources if available */}
													{msg.sources && msg.sources.length > 0 && (
														<div className="border-opacity-20 mt-3 space-y-2 border-t border-current pt-3">
															<p className="flex items-center gap-1 text-xs font-semibold opacity-70">
																<Sparkles className="h-3 w-3" />
																Quick Links:
															</p>
															<div className="flex flex-wrap gap-1">
																{msg.sources.slice(0, 3).map((source) => (
																	<Link
																		key={source.id}
																		href={`/${source.module}/${source.id}`}
																		className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors", msg.type === "user" ? "bg-white/20 text-white hover:bg-white/30" : "bg-primary/10 hover:bg-primary/20 text-primary")}>
																		<span>{source.module}</span>
																		<span className="opacity-70">({(source.similarity * 100).toFixed(0)}%)</span>
																	</Link>
																))}
															</div>
														</div>
													)}

													<p className="mt-2 text-xs opacity-60">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
												</div>

												{msg.type === "user" && (
													<div className="bg-muted flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm">
														<span className="text-muted-foreground text-xs font-semibold">U</span>
													</div>
												)}
											</div>
										))}

										{loading && (
											<div className="flex justify-start gap-3">
												<div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm">
													<Bot className="text-primary-foreground h-4 w-4" />
												</div>
												<div className="bg-muted flex items-center gap-2 rounded-2xl px-4 py-3 shadow-sm">
													<Loader2 className="h-4 w-4 animate-spin" />
													<span className="text-muted-foreground text-sm">Thinking...</span>
												</div>
											</div>
										)}
									</div>
								</div>
							</ScrollArea>

							{/* Input */}
							<div className="bg-background/50 border-t p-4">
								<form
									onSubmit={handleSendMessage}
									className="flex gap-2">
									<div className="relative flex-1">
										<Input
											placeholder="Type your message..."
											value={query}
											onChange={(e) => setQuery(e.target.value)}
											disabled={loading}
											className="focus:border-primary/50 rounded-full border-2 pr-10 transition-colors"
										/>
										{query.trim() && (
											<div className="absolute top-1/2 right-3 -translate-y-1/2">
												<Sparkles className="text-primary/60 h-4 w-4" />
											</div>
										)}
									</div>
									<Button
										type="submit"
										disabled={loading || !query.trim()}
										size="sm"
										className="bg-primary hover:bg-primary/90 h-10 w-10 rounded-full p-0 shadow-lg">
										{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
									</Button>
								</form>
								<p className="text-muted-foreground mt-2 text-center text-xs">AI Assistant can search your knowledge base and help with tasks</p>
							</div>
						</>
					)}
				</Card>
			)}
		</>
	);
}
