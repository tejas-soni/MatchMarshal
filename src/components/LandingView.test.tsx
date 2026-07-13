import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LandingView from './LandingView';

const mockPresetChips = [
  { label: 'Lost Child', text: 'Lost boy crying alone near the Gate 4 food kiosk.' },
];

describe('LandingView Component', () => {
  it('renders landing pitch and preset chips correctly', () => {
    const onChangeTab = vi.fn();
    render(<LandingView presetChips={mockPresetChips} onChangeTab={onChangeTab} />);

    expect(screen.getByRole('heading', { level: 1, name: /Empowering World Cup Volunteers/i })).toBeInTheDocument();
    expect(screen.getByText(/Volunteers are the first line of defense/i)).toBeInTheDocument();
    
    // Check preset chips render
    expect(screen.getByText('Lost Child')).toBeInTheDocument();
    expect(screen.getByText(/Lost boy crying alone near the Gate 4 food kiosk/i)).toBeInTheDocument();

    // Check action buttons exist
    expect(screen.getByRole('button', { name: /Start Demo Console/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Methodology/i })).toBeInTheDocument();
  });

  it('calls onChangeTab with correct parameters when buttons are clicked', () => {
    const onChangeTab = vi.fn();
    render(<LandingView presetChips={mockPresetChips} onChangeTab={onChangeTab} />);

    const startConsoleBtn = screen.getByRole('button', { name: /Start Demo Console/i });
    fireEvent.click(startConsoleBtn);
    expect(onChangeTab).toHaveBeenCalledWith('console');

    const viewMethodologyBtn = screen.getByRole('button', { name: /View Methodology/i });
    fireEvent.click(viewMethodologyBtn);
    expect(onChangeTab).toHaveBeenCalledWith('methodology');
  });
});
