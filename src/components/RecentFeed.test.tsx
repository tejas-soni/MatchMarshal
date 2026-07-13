import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RecentFeed from './RecentFeed';

describe('RecentFeed Component', () => {
  it('renders empty state correctly', () => {
    render(<RecentFeed recentScenarios={[]} onSelectScenario={vi.fn()} />);
    
    expect(screen.getByRole('heading', { name: /Recent Incident Feed/i })).toBeInTheDocument();
    expect(screen.getByText('No recent incidents logged.')).toBeInTheDocument();
  });

  it('renders scenarios and handles clicks', async () => {
    const mockOnSelect = vi.fn();
    const scenarios = [
      { description: 'Test scenario 1', timestamp: '2026-07-13T12:00:00Z' },
      { description: 'Test scenario 2', timestamp: '2026-07-13T12:01:00Z' },
    ];
    
    render(<RecentFeed recentScenarios={scenarios} onSelectScenario={mockOnSelect} />);
    
    expect(screen.getByRole('heading', { name: /Recent Incident Feed/i })).toBeInTheDocument();
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    expect(screen.getByText('Test scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Test scenario 2')).toBeInTheDocument();
    
    fireEvent.click(buttons[0]);
    expect(mockOnSelect).toHaveBeenCalledWith('Test scenario 1');
  });
});
