import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import AppHeader from './AppHeader';

describe('AppHeader Component', () => {
  it('renders logo and navigation links correctly', () => {
    const onChangeTab = vi.fn();
    render(<AppHeader activeTab="landing" onChangeTab={onChangeTab} />);

    expect(screen.getByText('MatchMarshal')).toBeInTheDocument();
    expect(screen.getByText('FIFA 2026 Volunteer Copilot')).toBeInTheDocument();
    
    // Check nav buttons exist by role
    const landingBtn = screen.getByRole('button', { name: /^Landing$/i });
    const consoleBtn = screen.getByRole('button', { name: /^Console$/i });
    const methodologyBtn = screen.getByRole('button', { name: /^Methodology$/i });

    expect(landingBtn).toBeInTheDocument();
    expect(consoleBtn).toBeInTheDocument();
    expect(methodologyBtn).toBeInTheDocument();
  });

  it('calls onChangeTab with correct parameters when clicked', () => {
    const onChangeTab = vi.fn();
    render(<AppHeader activeTab="landing" onChangeTab={onChangeTab} />);

    const consoleBtn = screen.getByRole('button', { name: /^Console$/i });
    fireEvent.click(consoleBtn);

    expect(onChangeTab).toHaveBeenCalledWith('console');
  });
});
