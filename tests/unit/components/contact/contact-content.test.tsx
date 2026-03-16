import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock submitContactForm action used inside ContactContent
vi.mock('@/lib/features/contact', () => ({
  submitContactForm: vi.fn(async () => ({ success: true, message: 'ok' })),
}));

// Mock browser speech support for the component
vi.mock('react-speech-recognition', () => ({
  __esModule: true,
  default: {
    browserSupportsSpeechRecognition: () => false,
    browserSupportsContinuousListening: () => false,
  },
  useSpeechRecognition: () => ({ transcript: '', listening: false, resetTranscript: () => { } }),
}));

import { ContactContent } from '@/app/(dashboard)/contact-us/components/contact-content';

describe('ContactContent', () => {
  it('shows speech-to-text hint under message textarea', () => {
    render(<ContactContent />);
    expect(screen.getByText(/Click the microphone icon to speak/i)).toBeTruthy();
  });

  it('shows fallback message when speech is not supported', () => {
    render(<ContactContent />);
    expect(screen.getByText(/Speech-to-text is not available on your browser/i)).toBeTruthy();
  });
});
