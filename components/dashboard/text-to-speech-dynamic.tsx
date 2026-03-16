"use client";

import dynamic from "next/dynamic";

const TextToSpeechControl = dynamic(() => import("./text-to-speech-control").then((mod) => ({ default: mod.TextToSpeechControl })), { ssr: false });

export { TextToSpeechControl };
