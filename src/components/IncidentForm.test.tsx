import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import IncidentForm from './IncidentForm';

describe('IncidentForm Component', () => {
  const mockPresets = [
    { label: 'Lost Child', text: 'Lost child in section B' }
  ];

  it('renders form elements correctly', () => {
    render(
      <IncidentForm
        description=""
        setDescription={vi.fn()}
        language="en"
        setLanguage={vi.fn()}
        useAI={false}
        setUseAI={vi.fn()}
        loading={false}
        onSubmit={vi.fn()}
        onLoadScenario={vi.fn()}
        presets={mockPresets}
        onPresetClick={vi.fn()}
      />
    );

    // Textarea
    expect(screen.getByRole('textbox', { name: /Describe the situation/i })).toBeInTheDocument();
    
    // Language Select
    expect(screen.getByRole('combobox', { name: /Fan Language/i })).toBeInTheDocument();
    
    // AI Checkbox
    expect(screen.getByRole('checkbox', { name: /Use Server-side Gemini AI/i })).toBeInTheDocument();
    
    // Buttons
    expect(screen.getByRole('button', { name: /Load Seeded Scenario/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze Incident/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lost Child' })).toBeInTheDocument();
  });

  it('calls handlers when interacted with', () => {
    const setDesc = vi.fn();
    const setLang = vi.fn();
    const setUseAI = vi.fn();
    const onSubmit = vi.fn((e) => e.preventDefault());
    const onLoadScenario = vi.fn();
    const onPresetClick = vi.fn();

    render(
      <IncidentForm
        description="test"
        setDescription={setDesc}
        language="en"
        setLanguage={setLang}
        useAI={false}
        setUseAI={setUseAI}
        loading={false}
        onSubmit={onSubmit}
        onLoadScenario={onLoadScenario}
        presets={mockPresets}
        onPresetClick={onPresetClick}
      />
    );

    // Textarea typing
    fireEvent.change(screen.getByRole('textbox', { name: /Describe the situation/i }), { target: { value: 'new text' } });
    expect(setDesc).toHaveBeenCalledWith('new text');

    // Select change
    fireEvent.change(screen.getByRole('combobox', { name: /Fan Language/i }), { target: { value: 'es' } });
    expect(setLang).toHaveBeenCalledWith('es');

    // Checkbox click
    fireEvent.click(screen.getByRole('checkbox', { name: /Use Server-side Gemini AI/i }));
    expect(setUseAI).toHaveBeenCalledWith(true);

    // Click load scenario
    fireEvent.click(screen.getByRole('button', { name: /Load Seeded Scenario/i }));
    expect(onLoadScenario).toHaveBeenCalled();

    // Click preset
    fireEvent.click(screen.getByRole('button', { name: 'Lost Child' }));
    expect(onPresetClick).toHaveBeenCalledWith('Lost child in section B');

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Analyze Incident/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('shows loading spinner and disables submit button when loading=true', () => {
    render(
      <IncidentForm
        description="some text"
        setDescription={vi.fn()}
        language="en"
        setLanguage={vi.fn()}
        useAI={false}
        setUseAI={vi.fn()}
        loading={true}
        onSubmit={vi.fn()}
        onLoadScenario={vi.fn()}
        presets={[]}
        onPresetClick={vi.fn()}
      />
    );
    // When loading, the submit button should be disabled
    const submitBtn = screen.getByRole('button', { name: /Analyzing.../i });
    expect(submitBtn).toBeDisabled();
  });
});
