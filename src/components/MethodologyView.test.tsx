import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MethodologyView from './MethodologyView';

describe('MethodologyView Component', () => {
  it('renders architecture overview and comparison table', () => {
    render(<MethodologyView />);

    expect(screen.getByRole('heading', { level: 2, name: /Deterministic Engine & AI Fallback Architecture/i })).toBeInTheDocument();
    
    // Check for the flow diagram container
    expect(screen.getByLabelText(/Architecture flow diagram/i)).toBeInTheDocument();

    // Check for table
    expect(screen.getByRole('heading', { level: 3, name: /Comparison of Operational Layers/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Check for table headers
    expect(screen.getByRole('columnheader', { name: /Features/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Deterministic Local Engine/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Gemini Server Enhancer/i })).toBeInTheDocument();
  });
});
