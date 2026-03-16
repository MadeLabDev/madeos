import { describe, expect, it, vi } from 'vitest';
// Ensure assistant icon is visible during tests
process.env.NEXT_PUBLIC_SHOW_AI_ASSISTANT = 'true';
import { fireEvent,render, screen } from '@testing-library/react';

import { AIAssistant } from '../../../../app/(dashboard)/course/print-hustlers-2025/components/ai-assistant';

describe('AI Assistant clickable UI (English-only)', () => {
  it('dispatches scroll event when session button is clicked', () => {
    const handler = vi.fn();
    window.addEventListener('ai:scroll-to-session', handler as EventListener);

    render(<AIAssistant />);

    // open assistant
    fireEvent.click(screen.getByRole('button', { name: /open assistant/i }));

    // click session 3
    fireEvent.click(screen.getByRole('button', { name: /session 3/i }));

    expect(handler).toHaveBeenCalled();
    const event = handler.mock.calls[0][0];
    expect(event.detail.id).toBe(3);

    window.removeEventListener('ai:scroll-to-session', handler as EventListener);
  });

  it('dispatches play/pause audio events', () => {
    const play = vi.fn();
    const pause = vi.fn();
    window.addEventListener('ai:play-audio', play as EventListener);
    window.addEventListener('ai:pause-audio', pause as EventListener);

    render(<AIAssistant />);
    fireEvent.click(screen.getByRole('button', { name: /open assistant/i }));

    fireEvent.click(screen.getByRole('button', { name: /play audio/i }));
    expect(play).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /pause audio/i }));
    expect(pause).toHaveBeenCalled();

    window.removeEventListener('ai:play-audio', play as EventListener);
    window.removeEventListener('ai:pause-audio', pause as EventListener);
  });
});
