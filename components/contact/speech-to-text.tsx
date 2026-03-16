"use client";

import { useEffect, useRef, useState } from "react";

import { Mic, X } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Speech-to-text helper to attach to the contact Message textarea.
 *
 * Usage (no code changes to form required):
 * - Add this component anywhere in the page that renders the contact form (e.g. the top of the page)
 * - It will look for a textarea with id="content" and add a floating mic button next to it.
 *
 * Notes:
 * - This uses the react-speech-recognition wrapper which falls back to
 *   the browser Web Speech API. Make sure your browser supports it.
 * - When the speech engine returns text, it appends into the textarea and dispatches
 *   an input event so client form libraries like react-hook-form pick up the new value.
 */
export default function ContactSpeechToText() {
	const [isListening, setIsListening] = useState(false);
	const [isSupported] = useState(() => SpeechRecognition.browserSupportsSpeechRecognition());
	const attachedRef = useRef<Element | null>(null);
	const baseTextRef = useRef<string>("");
	const { transcript, listening, resetTranscript } = useSpeechRecognition();

	// When transcript changes and we're not listening, append to textarea
	useEffect(() => {
		if (!transcript) return;

		// While listening, update textarea live so users see text as they speak.
		// When listening stops we commit the final transcript and reset the transcript.
		if (listening) {
			const textarea = document.getElementById("content") as HTMLTextAreaElement | null;
			if (textarea) {
				const newValue = baseTextRef.current ? `${baseTextRef.current} ${transcript}` : transcript;
				textarea.value = newValue;
				textarea.dispatchEvent(new Event("input", { bubbles: true }));
			}
			return;
		}

		// Only append transcript when listening stops (final transcript)
		if (!listening) {
			const textarea = document.getElementById("content") as HTMLTextAreaElement | null;
			if (textarea) {
				// Append a space and the transcript
				const newValue = textarea.value ? `${textarea.value} ${transcript}` : transcript;
				textarea.value = newValue;

				// Notify React / react-hook-form
				textarea.dispatchEvent(new Event("input", { bubbles: true }));

				toast.success("Voice input added to message");
				// remember the new base text for future live sessions
				baseTextRef.current = textarea.value;
			}
			resetTranscript();
		}
	}, [transcript, listening, resetTranscript]);

	// Keep a reference of the textarea's parent in case we want to extend
	// behavior in the future. Currently not required by the component.
	useEffect(() => {
		const textarea = document.getElementById("content");
		if (!textarea) return;

		attachedRef.current = textarea.parentElement;

		return () => {
			attachedRef.current = null;
		};
	}, []);

	const toggle = () => {
		if (!isSupported) {
			toast.error("Speech recognition not supported in this browser");
			return;
		}

		if (isListening) {
			SpeechRecognition.stopListening();
			setIsListening(false);
		} else {
			// continuous makes it listen until we stop it
			// capture the current value so live speech appends correctly
			const textarea = document.getElementById("content") as HTMLTextAreaElement | null;
			baseTextRef.current = textarea?.value ?? "";
			resetTranscript();

			// Some browsers (Android) don't support continuous listening; ask library
			const continuous = typeof SpeechRecognition?.browserSupportsContinuousListening === "function" && SpeechRecognition.browserSupportsContinuousListening() ? true : false;

			SpeechRecognition.startListening({ continuous, language: "en-US" });
			setIsListening(true);
		}
	};

	// Render only when the form textarea is present on the page
	const textarea = typeof window !== "undefined" ? document.getElementById("content") : null;
	if (!textarea) return null;

	return (
		<Button
			variant={isListening ? "secondary" : "ghost"}
			onClick={toggle}
			type="button"
			aria-label={isListening ? "Stop speaking" : "Start speech-to-text"}
			title={isListening ? "Stop" : "Start speech-to-text"}>
			{isListening ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
		</Button>
	);
}
