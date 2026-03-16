'use client';

import { useRef,useState } from 'react';

interface UseTextToSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const {
    lang = 'en-US',
    rate = 1,
    pitch = 1,
    volume = 1,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;

    synth.current = window.speechSynthesis;

    // Cancel any ongoing speech
    if (synth.current.speaking) {
      synth.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.current.speak(utterance);
  };

  const pause = () => {
    if (synth.current && synth.current.speaking && !synth.current.paused) {
      synth.current.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (synth.current && synth.current.paused) {
      synth.current.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (synth.current && synth.current.speaking) {
      synth.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
  };
};
