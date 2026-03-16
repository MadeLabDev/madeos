"use client";

import { useEffect, useRef, useState } from "react";

import { Bot, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useChat } from "./chat-provider";

export function ChatInterface() {
	const { currentSession, messages, sendMessage, isLoading } = useChat();
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const messageContent = input.trim();
		setInput("");
		await sendMessage(messageContent);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	if (!currentSession) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="text-center">
					<Bot className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
					<h2 className="mb-2 text-2xl font-semibold">Welcome to AI Assistant</h2>
					<p className="text-muted-foreground mb-4">Start a new conversation to get help with your MADE system</p>
					<p className="text-muted-foreground text-sm">Ask questions about your data, get insights, or request assistance with tasks.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			{/* Chat Header */}
			<div className="flex-shrink-0 border-b p-4">
				<h1 className="text-lg font-semibold">{currentSession.title}</h1>
			</div>

			{/* Messages */}
			<ScrollArea className="flex-1 p-4">
				<div className="space-y-4">
					{messages.map((message) => (
						<div
							key={message.id}
							className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
							{message.role === "assistant" && (
								<div className="flex-shrink-0">
									<div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
										<Bot className="text-primary-foreground h-4 w-4" />
									</div>
								</div>
							)}

							<div className={cn("max-w-[70%] rounded-lg px-4 py-2", message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted")}>
								<p className="text-sm whitespace-pre-wrap">{message.content}</p>
								<p className="mt-1 text-xs opacity-70">{new Date(message.createdAt).toLocaleTimeString()}</p>
							</div>

							{message.role === "user" && (
								<div className="flex-shrink-0">
									<div className="bg-secondary flex h-8 w-8 items-center justify-center rounded-full">
										<User className="text-secondary-foreground h-4 w-4" />
									</div>
								</div>
							)}
						</div>
					))}

					{isLoading && (
						<div className="flex justify-start gap-3">
							<div className="flex-shrink-0">
								<div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
									<Bot className="text-primary-foreground h-4 w-4" />
								</div>
							</div>
							<div className="bg-muted rounded-lg px-4 py-2">
								<div className="flex space-x-1">
									<div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"></div>
									<div
										className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
										style={{ animationDelay: "0.1s" }}></div>
									<div
										className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
										style={{ animationDelay: "0.2s" }}></div>
								</div>
							</div>
						</div>
					)}
				</div>
				<div ref={messagesEndRef} />
			</ScrollArea>

			{/* Input */}
			<div className="flex-shrink-0 border-t p-4">
				<form
					onSubmit={handleSubmit}
					className="flex gap-2">
					<Textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type your message..."
						className="max-h-32 min-h-[44px] resize-none"
						rows={1}
						disabled={isLoading}
					/>
					<Button
						type="submit"
						size="icon"
						disabled={!input.trim() || isLoading}
						className="shrink-0">
						<Send className="h-4 w-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}
