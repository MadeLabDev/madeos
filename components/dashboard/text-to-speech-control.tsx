"use client";

import { Pause, Play, Square, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

interface TextToSpeechControlProps {
	text: string;
	label?: string;
	className?: string;
}

export const TextToSpeechControl = ({ text, label = "Read Aloud", className = "" }: TextToSpeechControlProps) => {
	const { speak, pause, resume, stop, isPlaying, isPaused } = useTextToSpeech({
		lang: "en-US",
		rate: 0.9,
	});

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			{!isPlaying ? (
				<Button
					size="sm"
					variant="outline"
					onClick={() => speak(text)}
					className="flex items-center gap-2">
					<Volume2 className="h-4 w-4" />
					{label}
				</Button>
			) : (
				<>
					{!isPaused ? (
						<Button
							size="sm"
							variant="outline"
							onClick={pause}
							className="flex items-center gap-2">
							<Pause className="h-4 w-4" />
							Pause
						</Button>
					) : (
						<Button
							size="sm"
							variant="outline"
							onClick={resume}
							className="flex items-center gap-2">
							<Play className="h-4 w-4" />
							Resume
						</Button>
					)}
					<Button
						size="sm"
						variant="outline"
						onClick={stop}
						className="flex items-center gap-2">
						<Square className="h-4 w-4" />
						Stop
					</Button>
				</>
			)}
		</div>
	);
};
