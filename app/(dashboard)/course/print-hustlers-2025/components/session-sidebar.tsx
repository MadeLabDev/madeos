"use client";

import { useEffect, useState } from "react";

import { FileText, Play, X } from "lucide-react";

import { JoinModal } from "@/components/dashboard/join-modal";
import { AudioPlayer } from "@/components/media/audio-player";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
// import { useTextToSpeech } from '@/hooks/use-text-to-speech';

interface Session {
	id: number;
	title: string;
	speaker: string;
	duration: string;
	hasVideo: boolean;
	hasResources: boolean;
}

interface SessionSidebarProps {
	onClose?: () => void;
	currentSession?: number;
}

const sessions: Session[] = [
	{
		id: 1,
		title: "Unlock the Power of AI",
		speaker: "Rob Cressy",
		duration: "45 min",
		hasVideo: true,
		hasResources: true,
	},
	{
		id: 2,
		title: "Selling with Higher Perceived Value",
		speaker: "Megan Spire (Bella+Canvas)",
		duration: "40 min",
		hasVideo: true,
		hasResources: true,
	},
	{
		id: 3,
		title: "Economic Forecast 2026",
		speaker: "Alex Chausovsky",
		duration: "50 min",
		hasVideo: true,
		hasResources: true,
	},
	{
		id: 4,
		title: "Improv In Business",
		speaker: "The Second City",
		duration: "35 min",
		hasVideo: true,
		hasResources: true,
	},
	{
		id: 5,
		title: "Live Print Hustlers Podcast",
		speaker: "Dan Frank from Silverscreen",
		duration: "55 min",
		hasVideo: true,
		hasResources: true,
	},
	{
		id: 6,
		title: "Intro Licensing To Licensing",
		speaker: "Steven Farag and Justin Lawrence",
		duration: "42 min",
		hasVideo: true,
		hasResources: true,
	},
	{
		id: 7,
		title: "SanMar Update",
		speaker: "SanMar",
		duration: "48 min",
		hasVideo: true,
		hasResources: true,
	},
	{
		id: 8,
		title: "Effective Marketing in a Content-Crazy World",
		speaker: "Mike Niemczyk",
		duration: "38 min",
		hasVideo: true,
		hasResources: true,
	},
];

interface SessionSidebarProps {
	currentSession?: number;
}

export function SessionSidebar({ onClose, currentSession }: SessionSidebarProps) {
	const [activeSession, setActiveSession] = useState(currentSession || 1);
	// const { speak, pause, resume, stop, isPlaying, isPaused } = useTextToSpeech({
	//   lang: 'en-US',
	//   rate: 0.9,
	// });

	//   const fullPageContent = `
	// Welcome to the Print Hustlers 2025 on-demand pass. This is your exclusive hub for every session, workshop, and resource from this year’s event at The Second City in Chicago. Inside, you’ll find full-length presentation videos, downloadable speaker materials, and bonus insights to help you implement what you learned. Join our exclusive Google Chat to ask questions and interact.

	// Session 1.
	// Rob Cressy – Unlock the Power of AI

	// Who he is: Rob is an entrepreneur, creator, and mindset strategist known for helping leaders adopt AI as a creative partner—not a replacement.
	// Session Summary:Rob demonstrates how AI becomes an amplifier of your creativity and productivity when you take the time to personalize it with your voice, goals, and thinking patterns.

	// What you’ll learn:How to train ChatGPT to understand your tone and communication style

	// A workflow for using AI as your “idea accelerator”
	// How to use Voice Chat to capture ideas in motion
	// Practical examples for automating thought work and business planning

	// Session 2.
	// Megan Spire (Bella+Canvas) – Selling with Higher Perceived Value
	// Who she is: Megan is the VP of Sales at Bella+Canvas and a leading voice in premium apparel storytelling and branding.
	// Session Summary:Megan explains how to sell apparel by emotion—not discounts—so customers value the story, feel, and memory associated with their merch.

	// What you’ll learn:Why perceived value drives profit more than product cost

	// How to create "I was there" moments with apparel
	// Techniques to build emotional connection through finishing and storytelling
	// Why "the cost goes down with every wear"

	// Session 3.
	// Alex Chausovsky – Economic Forecast 2026
	// Who he is: Alex is a global economist and keynote speaker specializing in forecasting, business strategy, and industrial trends.
	// Session Summary:Alex delivers a direct, grounded analysis of what shops can realistically expect from the next two years—and where the opportunities lie in a flat market.

	// What you’ll learn:Why 2026 will likely hover around ~1% growth

	// What a "not hiring, not firing" economy means for shops
	// How to raise prices strategically based on customer tiers
	// Why retaining top employees is key before the next upswing
	// How tariffs and global uncertainty affect decorators

	// Session 4.
	// The Second City – Improv In Business
	// Who they are: The world-famous Chicago improv institution that trained countless comedy legends.
	// Session Summary:The Second City team led interactive improv-based sales and communication workshops focused on collaboration, presence, and listening.

	// What you’ll learn:The power of "Yes, and…" in conversations

	// How to improve listening, presence, and customer connection
	// Skills to strengthen team culture and sales communication
	// Exercises to break patterns and unlock new thinking
	// PLEASE - DO THESE EXERCISES WITH YOUR TEAM!

	// Session 5.
	// Live Print Hustlers Podcast – Dan Frank from Silverscreen
	// Who he is: Dan is the founder of Silverscreen, a rapidly growing print shop excelling in retail markets and scaling operations.
	// Session Summary:A live conversation about the journey from startup to large-scale production, building teams, and navigating growth.

	// What you’ll learn:How Silverscreen scaled without losing quality

	// Lessons learned from both retail and client work
	// What’s changed in his shop since his Shirt Show episode
	// How to think about growth systems, teams, and capacity

	// Session 6.
	// Steven Farag and Justin Lawrence - Intro Licensing To Licensing

	// Session 7.
	// SanMar Update
	// Summary:SanMar unveiled their brand-new 3D Product Visualizer, launching November 6th.

	// What you’ll learn:How the new 3D mockup tool works

	// Why 3D visuals will help decorators sell faster
	// Use cases for customer approvals, ecommerce, and sales

	// Session 8.
	// Mike Niemczyk – Effective Marketing in a Content-Crazy World
	// Who he is: Mike is a digital strategist who specializes in modern social media behavior and discovery-based algorithms.
	// Session Summary:Mike breaks down how social media has shifted from "community" to "discovery"—and what shops must change to stay visible.

	// What you’ll learn:Why discovery now beats engagement

	// How algorithms actually choose content
	// How to create scroll-stopping videos without overthinking
	// What authenticity means in a world of algorithm-fed doom scrolling
	//   `;

	const scrollToSession = (sessionId: number) => {
		setActiveSession(sessionId);
		const element = document.getElementById(`session-${sessionId}`);
		if (element) {
			element.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	};

	// Listen for AI assistant commands
	useEffect(() => {
		const onScrollTo = (e: Event) => {
			// event detail contains { id }

			const detail: any = (e as CustomEvent).detail;
			if (detail?.id) {
				scrollToSession(detail.id);
			}
		};

		const onSearch = (e: Event) => {
			const detail: any = (e as CustomEvent).detail;
			const q = detail?.query?.toLowerCase?.() ?? "";
			if (!q) return;
			// find first session where title or speaker contains query
			const found = sessions.find((s) => s.title.toLowerCase().includes(q) || s.speaker.toLowerCase().includes(q));
			if (found) {
				scrollToSession(found.id);
			}
		};

		window.addEventListener("ai:scroll-to-session", onScrollTo as EventListener);
		window.addEventListener("ai:search-session", onSearch as EventListener);

		return () => {
			window.removeEventListener("ai:scroll-to-session", onScrollTo as EventListener);
			window.removeEventListener("ai:search-session", onSearch as EventListener);
		};
	}, []);

	return (
		<div className="bg-card border-border sticky top-0 flex h-screen w-80 flex-col border-r">
			{/* Header - fixed, doesn't grow or shrink */}
			<div className="border-border flex-shrink-0 border-b p-6">
				<div className="mb-4 flex items-start justify-between">
					<div className="flex-1">
						<h2 className="mb-0 text-lg font-semibold">Print Hustlers 2025</h2>
						<p className="text-muted-foreground mb-0 text-sm">{/* 8 Expert Sessions • 6+ Hours Content */}8 Expert Sessions</p>
					</div>

					{/* Close button for mobile */}
					{onClose && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
							className="shrink-0">
							<X className="h-5 w-5" />
							<span className="sr-only">Close sidebar</span>
						</Button>
					)}
				</div>
				<div className="text-muted-foreground mb-4 flex items-center gap-4 text-xs">
					<div className="flex items-center gap-1">
						<Play className="h-3 w-3" />
						<span>8 Videos</span>
					</div>
					<div className="flex items-center gap-1">
						<FileText className="h-3 w-3" />
						<span>Resources</span>
					</div>
				</div>

				{/* Audio Player - 2025.mp3 */}
				<AudioPlayer
					src="/medias/print-hustlers-2025/2025.mp3"
					title="Print Hustlers 2025 Audio"
					className="mb-0"
				/>

				{/* Read Full Page Button */}
				{/* <div className="flex gap-2">
          <button
            onClick={() => {
              if (isPlaying && !isPaused) {
                pause();
              } else if (isPaused) {
                resume();
              } else {
                speak(fullPageContent);
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors"
          >
            {!isPlaying ? (
              <>
                <Volume2 className="h-4 w-4" />
                Read Full Page
              </>
            ) : isPaused ? (
              <>
                <Play className="h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            )}
          </button>
          
          {isPlaying && (
            <button
              onClick={() => stop()}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium text-sm transition-colors"
            >
              <StopCircle className="h-4 w-4" />
            </button>
          )}
        </div> */}
			</div>

			{/* ScrollArea - grows to fill remaining space */}
			<ScrollArea className="flex-1 overflow-hidden">
				<div className="p-4">
					<div className="space-y-2">
						{sessions.map((session) => (
							<div
								key={session.id}
								className={cn("hover:bg-accent/50 cursor-pointer rounded-sm border p-3 transition-all", activeSession === session.id ? "bg-accent border-primary shadow-sm" : "border-border bg-card")}
								onClick={() => scrollToSession(session.id)}>
								<div className="flex items-start gap-3">
									<div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium", activeSession === session.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{session.id}</div>

									<div className="min-w-0 flex-1">
										<h3 className={cn("mb-1 text-sm leading-tight font-medium", activeSession === session.id ? "text-foreground" : "text-muted-foreground")}>{session.title}</h3>

										<p className="text-muted-foreground text-xs">{session.speaker}</p>

										{/* <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{session.duration}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {session.hasVideo && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            <Play className="h-2.5 w-2.5 mr-1" />
                            Video
                          </Badge>
                        )}
                        {session.hasResources && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            <FileText className="h-2.5 w-2.5 mr-1" />
                            Resources
                          </Badge>
                        )}
                      </div>
                    </div> */}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</ScrollArea>

			{/* Footer - fixed at bottom, doesn't grow or shrink */}
			<div className="border-border bg-card/95 flex-shrink-0 border-t p-4 backdrop-blur">
				<div className="text-center">
					<p className="text-muted-foreground mb-2 text-xs">Join the conversation</p>
					<JoinModal>
						<button className="text-primary inline-flex cursor-pointer items-center gap-2 border-none bg-transparent text-sm hover:underline">Google Chat Community →</button>
					</JoinModal>
				</div>
			</div>
		</div>
	);
}
