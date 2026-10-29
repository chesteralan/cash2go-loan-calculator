import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalcErrorBoundary } from './CalcErrorBoundary';

const Good: React.FC = () => <div>Calculations are healthy</div>;
const Bad: React.FC = () => {
  throw new Error('boom');
};

describe('CalcErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <CalcErrorBoundary onReset={() => undefined}>
        <Good />
      </CalcErrorBoundary>
    );
    expect(screen.getByText('Calculations are healthy')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the recovery panel when a calculation throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <CalcErrorBoundary onReset={() => undefined}>
        <Bad />
      </CalcErrorBoundary>
    );
    consoleError.mockRestore();

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/This loan configuration can't be calculated/i)).toBeTruthy();
  });

  it('calls the reset recovery action', async () => {
    const onReset = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <CalcErrorBoundary onReset={onReset}>
        <Bad />
      </CalcErrorBoundary>
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Reset Inputs/i }));
    consoleError.mockRestore();
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Reset Inputs/i })).toBeTruthy();
  });
});
