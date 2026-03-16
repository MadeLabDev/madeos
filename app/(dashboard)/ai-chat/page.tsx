import { Suspense } from "react";

import { generateCrudMetadata } from "@/lib/utils/metadata";

import { ChatHistory } from "./components/chat-history";
import { ChatInterface } from "./components/chat-interface";
import { ChatProvider } from "./components/chat-provider";

export const metadata = generateCrudMetadata("AI Chat");

export default function AIChatPage() {
	return (
		<ChatProvider>
			<div className="bg-background -m-4 flex h-[calc(100%+calc(var(--spacing)*-6))] h-full md:-m-6">
				{/* Chat History Sidebar */}
				<div className="bg-muted/30 w-80 border-r">
					<Suspense fallback={<div className="p-4">Loading chat history...</div>}>
						<ChatHistory />
					</Suspense>
				</div>

				{/* Main Chat Interface */}
				<div className="flex flex-1 flex-col">
					<Suspense fallback={<div className="flex flex-1 items-center justify-center">Loading chat...</div>}>
						<ChatInterface />
					</Suspense>
				</div>
			</div>
		</ChatProvider>
	);
}
