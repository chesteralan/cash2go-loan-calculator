import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus, usePWAInstall } from './usePWA';

describe('useOnlineStatus', () => {
  it('reflects navigator.onLine initially', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(navigator.onLine);
  });

  it('updates when the browser goes offline and online again', () => {
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});

describe('usePWAInstall', () => {
  it('starts not installable in a bare environment', () => {
    const { result } = renderHook(() => usePWAInstall());
    expect(result.current.isInstallable).toBe(false);
    expect(typeof result.current.install).toBe('function');
  });
});
