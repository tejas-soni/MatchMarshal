import { describe, it, expect } from 'vitest';
import { classifyIncident } from './classify-incident';

describe('classifyIncident', () => {
  it('classifies lost child scenarios', () => {
    expect(classifyIncident({ description: 'There is a lost child near gate 4' })).toBe('lost-child');
    expect(classifyIncident({ description: 'Missing kid crying at the entrance' })).toBe('lost-child');
  });

  it('classifies medical emergencies', () => {
    expect(classifyIncident({ description: 'Someone fainted in section B' })).toBe('medical');
    expect(classifyIncident({ description: 'A fan is bleeding from a head injury' })).toBe('medical');
    expect(classifyIncident({ description: 'Need first aid at gate 7' })).toBe('medical');
  });

  it('classifies crowd buildup', () => {
    expect(classifyIncident({ description: 'Crowd congestion at the north entrance' })).toBe('crowd-buildup');
    expect(classifyIncident({ description: 'Too many people at gate 2, bottleneck forming' })).toBe('crowd-buildup');
  });

  it('classifies accessibility needs', () => {
    expect(classifyIncident({ description: 'A wheelchair user needs help at ramp' })).toBe('accessibility');
    expect(classifyIncident({ description: 'Disabled fan needs accessible seating' })).toBe('accessibility');
  });

  it('classifies aggressive fan incidents', () => {
    expect(classifyIncident({ description: 'Two fans are fighting in section C' })).toBe('aggressive-fan');
    expect(classifyIncident({ description: 'A drunk fan is threatening others' })).toBe('aggressive-fan');
  });

  it('classifies navigation requests', () => {
    expect(classifyIncident({ description: 'Fan asking where is the restroom' })).toBe('navigation');
    expect(classifyIncident({ description: 'Looking for directions to parking lot' })).toBe('navigation');
  });

  it('classifies lost item reports', () => {
    expect(classifyIncident({ description: 'Someone lost their phone near section D' })).toBe('lost-item');
    expect(classifyIncident({ description: 'A fan left behind their bag' })).toBe('lost-item');
  });

  it('classifies weather incidents', () => {
    expect(classifyIncident({ description: 'Lightning warning, fans need shelter' })).toBe('weather');
    expect(classifyIncident({ description: 'Heatstroke risk due to extreme heat' })).toBe('weather');
  });

  it('falls back to general for unknown descriptions', () => {
    expect(classifyIncident({ description: 'Something happened but I am not sure what' })).toBe('general');
    expect(classifyIncident({ description: 'Just checking in from post 5' })).toBe('general');
  });

  it('falls back to general for empty descriptions', () => {
    expect(classifyIncident({ description: '' })).toBe('general');
    expect(classifyIncident({ description: '   ' })).toBe('general');
  });

  it('is case insensitive', () => {
    expect(classifyIncident({ description: 'MEDICAL EMERGENCY in section A' })).toBe('medical');
    expect(classifyIncident({ description: 'LOST CHILD near the food court' })).toBe('lost-child');
  });

  it('prioritizes more dangerous categories when multiple match', () => {
    // "lost child" + "medical" keywords → lost-child has higher priority
    expect(classifyIncident({ description: 'Lost child who is injured and bleeding' })).toBe('lost-child');
  });
});
