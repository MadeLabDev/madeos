declare module 'react-speech-recognition' {
  const SpeechRecognition: {
    browserSupportsSpeechRecognition: () => boolean;
    browserSupportsContinuousListening: () => boolean;
    startListening: (options?: { continuous?: boolean; language?: string }) => void;
    stopListening: () => void;
    abortListening: () => void;
  };

  export default SpeechRecognition;

  export function useSpeechRecognition(options?: any): {
    transcript: string;
    listening: boolean;
    resetTranscript: () => void;
  };
}
