import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ShareModal } from './ShareModal';

describe('ShareModal Component', () => {
  beforeAll(() => {
    // Mock navigator.clipboard.writeText API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('should render null when isOpen is false', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <ShareModal isOpen={false} shareUrl="http://test.com#test" onClose={handleClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render content and trigger copy and close events', async () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();
    render(
      <ShareModal isOpen={true} shareUrl="http://test.com#test" onClose={handleClose} />
    );

    // Assert link text input value
    const input = document.getElementById('share-url-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('http://test.com#test');

    // Click copy button inside async act to flush Promise resolution
    await act(async () => {
      const copyBtn = screen.getByRole('button', { name: 'Copy' });
      fireEvent.click(copyBtn);
    });

    const copyBtn = screen.getByRole('button', { name: 'Copied!' });
    expect(copyBtn).toBeInTheDocument();

    // Clipboard API should have been called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://test.com#test');

    // Advance timer to test feedback reset
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(copyBtn).toHaveTextContent('Copy');

    // Click close button
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
