import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SeverityBadge from './SeverityBadge';

describe('SeverityBadge Component', () => {
  it('renders critical severity badge correctly', () => {
    render(<SeverityBadge level="critical" score={85} />);
    const badge = screen.getByText(/critical \(85\)/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-red-100');
  });

  it('renders high severity badge correctly', () => {
    render(<SeverityBadge level="high" score={75} />);
    const badge = screen.getByText(/high \(75\)/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-orange-100');
  });

  it('renders medium severity badge correctly', () => {
    render(<SeverityBadge level="medium" score={45} />);
    const badge = screen.getByText(/medium \(45\)/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-yellow-100');
  });

  it('renders low/default severity badge correctly', () => {
    render(<SeverityBadge level="low" score={12} />);
    const badge = screen.getByText(/low \(12\)/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-emerald-100');
  });
});
