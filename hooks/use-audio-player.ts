'use client';

import { useEffect,useRef, useState } from 'react';

interface UseAudioPlayerOptions {
  src: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export const useAudioPlayer = ({ src, onPlay, onPause, onEnded }: UseAudioPlayerOptions) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === 'undefined') return;

    audioRef.current = new Audio(src);
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleError = () => {
      setError('Failed to load audio file');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.pause();
    };
  }, [src, onPlay, onPause, onEnded]);

  const play = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (err) {
        setError('Failed to play audio');
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resume = play;

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
    }
  };

  const setAudioVolume = (vol: number) => {
    const normalizedVol = Math.max(0, Math.min(vol, 1));
    setVolume(normalizedVol);
    if (audioRef.current) {
      audioRef.current.volume = normalizedVol;
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    play,
    pause,
    resume,
    stop,
    seek,
    setVolume: setAudioVolume,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    formattedCurrentTime: formatTime(currentTime),
    formattedDuration: formatTime(duration),
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
  };
};
