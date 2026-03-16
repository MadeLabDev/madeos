"use client";

import { useEffect, useState } from "react";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";

import { useAudioPlayer } from "@/hooks/use-audio-player";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
	src: string;
	title?: string;
	onEnded?: () => void;
	className?: string;
}

export function AudioPlayer({ src, title, onEnded, className }: AudioPlayerProps) {
	const [showVolume, setShowVolume] = useState(false);
	const {
		play,
		pause,
		seek,
		setVolume,
		isPlaying,
		duration,
		volume,
		isLoading,
		error,
		// formattedCurrentTime,
		formattedDuration,
		progress,
	} = useAudioPlayer({ src, onEnded });

	useEffect(() => {
		const onPlay = () => play();
		const onPause = () => pause();

		window.addEventListener("ai:play-audio", onPlay as EventListener);
		window.addEventListener("ai:pause-audio", onPause as EventListener);

		return () => {
			window.removeEventListener("ai:play-audio", onPlay as EventListener);
			window.removeEventListener("ai:pause-audio", onPause as EventListener);
		};
	}, [play, pause]);

	if (error) {
		return <div className={cn("bg-destructive/10 text-destructive rounded-lg p-4 text-sm", className)}>{error}</div>;
	}

	return (
		<div className={cn("bg-card border-border space-y-3 rounded-lg border p-4", className)}>
			{title && <h3 className="text-foreground truncate text-sm font-semibold">{title}</h3>}

			{/* Progress Bar */}
			<div className="space-y-2">
				<div
					className="bg-muted h-1 cursor-pointer rounded-full transition-all hover:h-1.5"
					onClick={(e) => {
						const rect = e.currentTarget.getBoundingClientRect();
						const percent = (e.clientX - rect.left) / rect.width;
						seek(percent * duration);
					}}>
					<div
						className="bg-primary h-full rounded-full transition-all"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			{/* Controls */}
			<div className="flex items-center gap-3">
				{/* Play/Pause Button */}
				<button
					onClick={() => (isPlaying ? pause() : play())}
					disabled={isLoading}
					className="bg-primary/10 hover:bg-primary/20 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50">
					{isLoading ? <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" /> : isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
				</button>

				{/* Volume Control */}
				<div className="relative flex items-center">
					<button
						onClick={() => setShowVolume(!showVolume)}
						className="hover:bg-accent flex-shrink-0 rounded p-2 transition-colors">
						{volume === 0 ? <VolumeX className="text-muted-foreground h-4 w-4" /> : <Volume2 className="text-muted-foreground h-4 w-4" />}
					</button>

					{/* Volume Slider Popover */}
					{showVolume && (
						<div className="bg-popover border-border absolute bottom-full left-0 z-50 mb-2 rounded-lg border p-3 shadow-lg">
							<div
								className="bg-muted flex h-24 w-1 cursor-pointer flex-col-reverse items-center justify-start rounded-full"
								onClick={(e) => {
									const rect = e.currentTarget.getBoundingClientRect();
									const percent = 1 - (e.clientY - rect.top) / rect.height;
									setVolume(Math.max(0, Math.min(percent, 1)));
								}}>
								<div
									className="bg-primary w-full rounded-full transition-all"
									style={{ height: `${volume * 100}%` }}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Duration Display */}
				<div className="text-muted-foreground ml-auto text-xs font-medium">{formattedDuration}</div>
			</div>
		</div>
	);
}
