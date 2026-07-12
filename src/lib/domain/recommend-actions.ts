import type { IncidentCategory, SeverityScore, ActionStep } from '../types';

/**
 * Action templates keyed by incident category.
 * Each step has a static order, an action verb phrase, and an explanatory detail.
 * Lower order = do this first.
 */
const ACTION_TEMPLATES: Record<IncidentCategory, ActionStep[]> = {
  'medical': [
    { order: 1, action: 'Call for medical assistance', detail: 'Radio Channel 3 — Medical Team. State location, number of people affected, and visible symptoms.' },
    { order: 2, action: 'Clear the area', detail: 'Ask bystanders to step back at least 3 metres to give the medical team space.' },
    { order: 3, action: 'Stay with the person', detail: 'Keep the person calm and still. Do not move them unless there is immediate danger.' },
    { order: 4, action: 'Document the incident', detail: 'Note the exact time, gate/section number, and a brief description for the incident report.' },
  ],
  'lost-child': [
    { order: 1, action: 'Secure the child with you', detail: 'Keep the child in sight and do not let them move. Crouch to their eye level to calm them.' },
    { order: 2, action: 'Alert Security and Supervisors', detail: 'Radio Channel 1 — Security Command. Give a description: age, clothing, hair, last known location.' },
    { order: 3, action: 'Initiate venue lost-child protocol', detail: 'Notify Guest Services desk to announce on the PA system using the child\'s name and description.' },
    { order: 4, action: 'Document and wait for reunification', detail: 'Log the case number provided by Security. Remain at the reunification point until resolved.' },
  ],
  'aggressive-fan': [
    { order: 1, action: 'Do not engage physically', detail: 'Step back and maintain a safe distance. Your safety comes first — never intervene physically.' },
    { order: 2, action: 'Alert Security immediately', detail: 'Radio Channel 1 — Security. State location (gate/section), number of people involved, and any weapons visible.' },
    { order: 3, action: 'Protect bystanders', detail: 'Calmly guide nearby fans away from the area without causing panic.' },
    { order: 4, action: 'Preserve evidence', detail: 'If safe, note descriptions of individuals involved for the incident report.' },
  ],
  'crowd-buildup': [
    { order: 1, action: 'Assess and report congestion', detail: 'Radio Channel 2 — Operations. Report the affected gate/section and estimated crowd density.' },
    { order: 2, action: 'Open additional gates or redirect flow', detail: 'Coordinate with Operations to open overflow routes. Use barriers and signage to redirect foot traffic.' },
    { order: 3, action: 'Communicate calmly with fans', detail: 'Use a calm, authoritative tone to ask fans to move to adjacent gates. Avoid creating alarm.' },
    { order: 4, action: 'Monitor continuously', detail: 'Stay at the location and provide updates every 5 minutes until flow is normalised.' },
  ],
  'accessibility': [
    { order: 1, action: 'Approach and greet the fan respectfully', detail: 'Introduce yourself and ask how you can assist. Never assume what help is needed — ask directly.' },
    { order: 2, action: 'Identify the specific need', detail: 'Wheelchair access, hearing loop, seating, or escort? Note the specific requirement.' },
    { order: 3, action: 'Contact Accessibility Services', detail: 'Radio Channel 4 — Accessibility Desk. They can arrange wheelchair routes, seating upgrades, or special assistance.' },
    { order: 4, action: 'Escort or arrange assistance', detail: 'If trained and appropriate, escort the fan yourself. Otherwise wait with them until services arrive.' },
  ],
  'weather': [
    { order: 1, action: 'Alert fans in exposed areas', detail: 'Calmly instruct fans in exposed areas to move to covered sections or concourses.' },
    { order: 2, action: 'Report to Operations', detail: 'Radio Channel 2 — Operations. Report the affected area and number of fans at risk.' },
    { order: 3, action: 'Watch for heat or cold distress', detail: 'Look for signs of heatstroke (dizziness, flushing, confusion) or hypothermia. Escalate to Medical if needed.' },
    { order: 4, action: 'Follow venue weather protocol', detail: 'If lightning is detected, the suspension-of-play protocol must be activated by stadium management.' },
  ],
  'lost-item': [
    { order: 1, action: 'Take a report from the fan', detail: 'Note the item description, where it was last seen, and the fan\'s contact details.' },
    { order: 2, action: 'Check nearby Lost & Found points', detail: 'Direct the fan to the nearest Lost & Found desk (Gate 1 Concourse or Gate 8 Concourse).' },
    { order: 3, action: 'Log the item in the system', detail: 'Radio Channel 2 — Operations to log the report and assign a reference number.' },
    { order: 4, action: 'Advise on follow-up', detail: 'Inform the fan that items are held for 7 days and they can call the venue hotline with their reference number.' },
  ],
  'navigation': [
    { order: 1, action: 'Confirm the fan\'s destination', detail: 'Ask which gate, section, service, or facility they need to reach.' },
    { order: 2, action: 'Provide clear verbal directions', detail: 'Give step-by-step directions using landmarks (screens, colour-coded columns, gate numbers).' },
    { order: 3, action: 'Offer to escort if feasible', detail: 'For elderly fans, large families, or mobility-impaired visitors, offer a short escort to the next waypoint.' },
    { order: 4, action: 'Point to physical signage', detail: 'Direct the fan to the nearest directional signage panel and confirm they understand the route.' },
  ],
  'general': [
    { order: 1, action: 'Gather more information', detail: 'Ask the fan or bystander to describe the situation in more detail.' },
    { order: 2, action: 'Assess whether escalation is needed', detail: 'Decide if the situation requires Security (Ch 1), Operations (Ch 2), or Medical (Ch 3).' },
    { order: 3, action: 'Document the incident', detail: 'Record time, location, people involved, and what was observed — regardless of severity.' },
  ],
};

/**
 * Additional urgent actions prepended when severity is critical.
 */
const CRITICAL_PREPEND: ActionStep = {
  order: 0,
  action: 'URGENT — Call Supervisor immediately',
  detail: 'This is a critical incident. Contact your Shift Supervisor on Radio Channel 5 NOW before taking other action.',
};

/**
 * Return recommended action steps for the given category and severity.
 * Steps are sorted by order (ascending). Critical incidents get an extra priority step.
 */
export function recommendActions(
  category: IncidentCategory,
  severity: SeverityScore,
): ActionStep[] {
  const base = ACTION_TEMPLATES[category] ?? ACTION_TEMPLATES['general'];
  const steps: ActionStep[] = [...base];

  if (severity.level === 'critical') {
    steps.unshift(CRITICAL_PREPEND);
  }

  return steps.sort((a, b) => a.order - b.order);
}
