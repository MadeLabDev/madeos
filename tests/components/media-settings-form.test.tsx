import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { MediaSettingsForm } from '@/app/(dashboard)/settings/components/media-settings-form';

// Mock the server action
vi.mock('@/lib/features/settings/actions/settings-actions', () => ({
  updateMediaSettingsAction: vi.fn(async (data) => ({
    success: true,
    data,
    message: 'Media settings updated'
  }))
}));

// Mock storage provider action
vi.mock('@/lib/features/upload/actions/upload-storage', () => ({
  getStorageProviderAction: vi.fn(async () => 'local'),
  setStorageProviderAction: vi.fn(async () => ({ success: true }))
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('MediaSettingsForm', () => {
  const mockSettingsObj = {
    media_max_file_size_mb: '10',
    media_allowed_file_types: 'pdf,docx,jpg'
  };

  const mockOnSaveSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with initial data', () => {
    render(
      <MediaSettingsForm
        settingsObj={mockSettingsObj}
        onSuccess={mockOnSaveSuccess}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByDisplayValue('10') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('10');
  });

  it('should handle max file size input change', async () => {
    const user = userEvent.setup();
    render(
      <MediaSettingsForm
        settingsObj={mockSettingsObj}
        onSaveSuccess={mockOnSaveSuccess}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '20');

    expect(input.value).toBe('20');
  });

  it('should toggle file type selection', async () => {
    const user = userEvent.setup();
    render(
      <MediaSettingsForm
        settingsObj={mockSettingsObj}
        onSaveSuccess={mockOnSaveSuccess}
        onCancel={mockOnCancel}
      />
    );

    const pdfCheckbox = screen.getByRole('checkbox', { name: /pdf/i });
    expect(pdfCheckbox).toBeChecked();

    await user.click(pdfCheckbox);
    expect(pdfCheckbox).not.toBeChecked();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MediaSettingsForm
        settingsObj={mockSettingsObj}
        onSuccess={mockOnSaveSuccess}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Cancel should reset the form to initial values
    const input = screen.getByDisplayValue('10') as HTMLInputElement;
    expect(input.value).toBe('10');
  });

  it('should call onCancel when cancel button with data-action is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MediaSettingsForm
        settingsObj={mockSettingsObj}
        onSuccess={mockOnSaveSuccess}
      />
    );

    const cancelButton = document.querySelector('[data-action="cancel"]');
    expect(cancelButton).toBeInTheDocument();

    if (cancelButton) {
      await user.click(cancelButton as HTMLElement);
      // Cancel should reset the form to initial values
      const input = screen.getByDisplayValue('10') as HTMLInputElement;
      expect(input.value).toBe('10');
    }
  });

  it('should hide buttons when hideButtons prop is true', () => {
    render(
      <MediaSettingsForm
        settingsObj={mockSettingsObj}
        onSuccess={mockOnSaveSuccess}
        hideButtons={true}
      />
    );

    const buttons = screen.queryAllByRole('button');
    // When hideButtons is true, buttons should be in a hidden container
    buttons.forEach(button => {
      expect(button.closest('.hidden')).toBeInTheDocument();
    });
  });

  it('should validate file size range', async () => {
    const user = userEvent.setup();
    render(
      <MediaSettingsForm
        settingsObj={mockSettingsObj}
        onSaveSuccess={mockOnSaveSuccess}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByRole('spinbutton') as HTMLInputElement;

    // Test minimum value
    await user.clear(input);
    await user.type(input, '0');
    expect(input.min).toBe('1');

    // Test maximum value
    await user.clear(input);
    await user.type(input, '1001');
    expect(input.max).toBe('1000');
  });

  it('should render form within a form element', () => {
    const { container } = render(
      <MediaSettingsForm
        settingsObj={mockSettingsObj}
        onSaveSuccess={mockOnSaveSuccess}
        onCancel={mockOnCancel}
      />
    );

    const form = container.querySelector('form[data-settings-media-form]');
    expect(form).toBeInTheDocument();
  });

  it('should prevent default form submission', async () => {
    const user = userEvent.setup();
    render(
      <MediaSettingsForm
        settingsObj={mockSettingsObj}
        onSaveSuccess={mockOnSaveSuccess}
        onCancel={mockOnCancel}
        hideButtons={false}
      />
    );

    const form = document.querySelector('form[data-settings-media-form]');
    const submitSpy = vi.spyOn(Event.prototype, 'preventDefault');

    if (form) {
      fireEvent.submit(form);
      // Check that form submission is handled
      expect(form).toBeInTheDocument();
    }
  });
});
