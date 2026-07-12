import type { IncidentInput, IncidentCategory } from '../types';

/** Keyword map for classifying incidents by category */
const CATEGORY_KEYWORDS: Record<IncidentCategory, string[]> = {
  'lost-child': ['lost child', 'missing child', 'lost kid', 'missing kid', 'unaccompanied minor', 'child alone', 'kid alone', 'child crying'],
  'medical': ['medical', 'injury', 'injured', 'fainted', 'unconscious', 'bleeding', 'heart', 'seizure', 'allergic', 'ambulance', 'first aid', 'hurt', 'pain', 'sick', 'cardiac', 'arrest'],
  'crowd-buildup': ['crowd', 'overcrowd', 'congestion', 'bottleneck', 'stampede', 'crush', 'too many people', 'packed', 'blocked gate', 'queue'],
  'accessibility': ['wheelchair', 'disability', 'disabled', 'accessible', 'ramp', 'blind', 'deaf', 'hearing aid', 'mobility', 'crutches', 'service animal'],
  'aggressive-fan': ['aggressive', 'fight', 'fighting', 'violent', 'drunk', 'threatening', 'altercation', 'confrontation', 'harassing', 'abuse'],
  'navigation': ['directions', 'find', 'where is', 'gate', 'exit', 'entrance', 'parking', 'restroom', 'bathroom', 'seat', 'section'],
  'lost-item': ['lost item', 'lost phone', 'lost bag', 'lost wallet', 'lost ticket', 'lost their', 'stolen', 'missing bag', 'left behind', 'forgot'],
  'weather': ['rain', 'storm', 'lightning', 'heat', 'heatstroke', 'cold', 'wind', 'weather', 'shelter', 'sun exposure'],
  'general': [],
};

/**
 * Classify an incident description into one of the known categories.
 * Uses keyword matching against a priority-ordered category list.
 * Falls back to 'general' when no keywords match.
 */
export function classifyIncident(input: IncidentInput): IncidentCategory {
  const text = input.description.toLowerCase().trim();

  if (!text) {
    return 'general';
  }

  // Priority order: more dangerous categories first
  const priorityOrder: IncidentCategory[] = [
    'lost-child',
    'medical',
    'aggressive-fan',
    'crowd-buildup',
    'weather',
    'accessibility',
    'lost-item',
    'navigation',
  ];

  for (const category of priorityOrder) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return 'general';
}
