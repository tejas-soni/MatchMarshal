import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Logo from './Logo';

describe('Logo Component', () => {
  it('renders SVG with data-testid app-logo', () => {
    render(<Logo />);
    const svg = screen.getByTestId('app-logo');
    expect(svg).toBeInTheDocument();
  });
});
