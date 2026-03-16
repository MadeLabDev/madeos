"use client";

import { useState } from "react";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

// Very small, local natural-language handler for course commands.
// Design: parse the user's text -> dispatch a CustomEvent on window with the requested action.

// The assistant UI is click-based — commands are dispatched as CustomCourses
// and are English-only. No text input is required by design.

export function AIAssistant() {
	const [open, setOpen] = useState(false);
	const [status, setStatus] = useState<string | null>(null);

	const sessions = [1, 2, 3, 4, 5, 6, 7, 8];

	function clickSession(id: number) {
		window.dispatchEvent(new CustomEvent("ai:scroll-to-session", { detail: { id } }));
		setStatus(`Scrolling to session ${id}`);
	}

	function playAudio() {
		window.dispatchEvent(new CustomEvent("ai:play-audio"));
		setStatus("Playing audio");
	}

	function pauseAudio() {
		window.dispatchEvent(new CustomEvent("ai:pause-audio"));
		setStatus("Audio paused");
	}

	// Toggle UI with public env var: set NEXT_PUBLIC_SHOW_AI_ASSISTANT=true to show the icon.
	const showAssistant = process.env.NEXT_PUBLIC_SHOW_AI_ASSISTANT === "true";

	return (
		<div className="fixed right-6 bottom-6 z-[1000]">
			{/* Floating button */}
			<div className="flex flex-col items-end gap-2">
				{open && (
					<div className="bg-popover border-border w-[340px] rounded-lg border p-3 shadow-md">
						<label className="text-muted-foreground text-xs">AI Assistant</label>
						<div className="mt-2 grid grid-cols-2 gap-2">
							{sessions.map((s) => (
								<Button
									key={s}
									onClick={() => clickSession(s)}
									aria-label={`Session ${s}`}>
									Session {s}
								</Button>
							))}
							<Button
								onClick={playAudio}
								aria-label="Play audio">
								Play audio
							</Button>
							<Button
								onClick={pauseAudio}
								aria-label="Pause audio">
								Pause audio
							</Button>
						</div>

						{status && <p className="text-muted-foreground mt-2 text-xs">{status}</p>}
					</div>
				)}

				{showAssistant && (
					<Button
						className="h-12 w-12 rounded-full"
						onClick={() => setOpen(!open)}
						aria-label="Open assistant">
						<Search className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}

// Assistant is click-based now; parsing function removed.
