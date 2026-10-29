import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineIndicator } from './OfflineIndicator';
import { useOnlineStatus, useOfflineReady } from '../hooks/usePWA';

vi.mock('../hooks/usePWA', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/usePWA')>();
  return {
    ...actual,
    useOnlineStatus: vi.fn(),
    useOfflineReady: vi.fn(() => true),
  };
});

const mockOnlineStatus = vi.mocked(useOnlineStatus);
const mockOfflineReady = vi.mocked(useOfflineReady);

describe('OfflineIndicator', () => {
  it('is hidden while online', () => {
    mockOnlineStatus.mockReturnValue(true);
    const { container } = render(<OfflineIndicator />);
    expect(container.children.length).toBe(0);
  });

  it('shows the offline banner with cache confirmation when service worker is ready', () => {
    mockOnlineStatus.mockReturnValue(false);
    mockOfflineReady.mockReturnValue(true);
    render(<OfflineIndicator />);
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText(/Served fully from cache; all data remains accessible./i)).toBeTruthy();
  });

  it('explains that calculations still work when no service worker is ready', () => {
    mockOnlineStatus.mockReturnValue(false);
    mockOfflineReady.mockReturnValue(false);
    render(<OfflineIndicator />);
    expect(
      screen.getByText(/All calculations and saved schedules remain fully accessible./i)
    ).toBeTruthy();
  });
});
