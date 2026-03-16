"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useChat } from "./chat-provider";

export function ChatHistory() {
	const { sessions, currentSession, createNewSession, selectSession, deleteSession } = useChat();

	const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (confirm("Are you sure you want to delete this chat?")) {
			await deleteSession(sessionId);
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-b p-4">
				<Button
					onClick={createNewSession}
					className="w-full gap-2"
					size="sm">
					<Plus className="h-4 w-4" />
					New Chat
				</Button>
			</div>

			{/* Chat List */}
			<ScrollArea className="flex-1">
				<div className="space-y-1 p-2">
					{sessions.map((session) => (
						<div
							key={session.id}
							className={`group hover:bg-accent flex cursor-pointer items-center gap-2 rounded-lg p-3 transition-colors ${currentSession?.id === session.id ? "bg-accent" : ""}`}
							onClick={() => selectSession(session.id)}>
							<MessageSquare className="text-muted-foreground h-4 w-4 shrink-0" />
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium">{session.title}</p>
								<p className="text-muted-foreground text-xs">{formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
								onClick={(e) => handleDeleteSession(session.id, e)}>
								<Trash2 className="h-3 w-3" />
							</Button>
						</div>
					))}

					{sessions.length === 0 && (
						<div className="text-muted-foreground py-8 text-center">
							<MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
							<p className="text-sm">No chats yet</p>
							<p className="text-xs">Start a new conversation</p>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
