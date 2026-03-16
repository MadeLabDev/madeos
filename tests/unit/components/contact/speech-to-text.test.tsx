import React from 'react';

import { fireEvent,render, screen } from '@testing-library/react';
import { afterEach,describe, expect, it, vi } from 'vitest';

import ContactSpeechToText from '@/components/contact/speech-to-text';

vi.mock('react-speech-recognition', () => {
  return {
    __esModule: true,
    default: {
      browserSupportsSpeechRecognition: () => true,
      startListening: vi.fn(),
      stopListening: vi.fn(),
    },
    useSpeechRecognition: () => ({ transcript: '', listening: false, resetTranscript: vi.fn() }),
  };
});

describe('ContactSpeechToText', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('renders nothing when textarea#content is not present', () => {
    render(<ContactSpeechToText />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders a mic button when the textarea#content is present', () => {
    document.body.innerHTML = '<textarea id="content"></textarea>';
    render(<ContactSpeechToText />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  // Live transcript behavior is handled by the hook and browser API; unit testing
  // the live flow requires more advanced mocking of the hook's dynamic output.
});
