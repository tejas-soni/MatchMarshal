import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ResultCard from './ResultCard';
import type { CopilotResponse } from '@/lib/types';

describe('ResultCard Component', () => {
  const mockResult: CopilotResponse = {
    category: 'medical',
    severity: { level: 'critical', score: 95 },
    actions: [
      { order: 1, action: 'Call Medic', detail: 'Immediately' }
    ],
    escalation: {
      contactRole: 'Medic',
      contactTitle: 'Medical Team',
      radioChannel: 'Channel 1',
      urgency: 'Immediate'
    },
    multilingualPhrase: 'Por favor, mantenga la calma',
    isFallback: false,
    timestamp: '2026-07-13T12:00:00Z'
  };

  it('renders correctly with given result and language', () => {
    render(<ResultCard result={mockResult} language="es" />);

    // Category
    expect(screen.getByRole('heading', { name: /medical/i })).toBeInTheDocument();
    
    // Actions
    expect(screen.getByRole('heading', { name: /Immediate Volunteer Actions/i })).toBeInTheDocument();
    expect(screen.getByText('Call Medic')).toBeInTheDocument();
    
    // Escalation
    expect(screen.getByRole('heading', { name: /Primary Escalation Contact/i })).toBeInTheDocument();
    expect(screen.getByText('Medical Team')).toBeInTheDocument();
    
    // Multilingual
    expect(screen.getByRole('heading', { name: /Multilingual Fan Guidance/i })).toBeInTheDocument();
    expect(screen.getByText('Por favor, mantenga la calma')).toBeInTheDocument();
    
    // Source Metadata — not a fallback
    expect(screen.getByText(/Gemini Server AI/i)).toBeInTheDocument();
  });

  it('renders RTL direction for Arabic language', () => {
    render(<ResultCard result={mockResult} language="ar" />);
    // The multilingual phrase paragraph should have dir="rtl" for Arabic
    const phraseEl = screen.getByText('Por favor, mantenga la calma');
    expect(phraseEl).toHaveAttribute('dir', 'rtl');
    expect(phraseEl).toHaveAttribute('lang', 'ar');
  });

  it('shows fallback source label when isFallback is true', () => {
    const fallbackResult = { ...mockResult, isFallback: true };
    render(<ResultCard result={fallbackResult} language="en" />);
    expect(screen.getByText(/Local Policy Fallback/i)).toBeInTheDocument();
  });
});
