import type { IncidentCategory, SeverityScore, EscalationPlan } from '../types';

/** Escalation contacts keyed by primary category */
const CATEGORY_CONTACTS: Record<IncidentCategory, { contactRole: string; contactTitle: string; radioChannel: string }> = {
  'medical':        { contactRole: 'medical',     contactTitle: 'Medical Response Team',      radioChannel: 'Ch 3 — Medical' },
  'lost-child':     { contactRole: 'security',    contactTitle: 'Security + Child Welfare',   radioChannel: 'Ch 1 — Security' },
  'aggressive-fan': { contactRole: 'security',    contactTitle: 'Security Command',            radioChannel: 'Ch 1 — Security' },
  'crowd-buildup':  { contactRole: 'operations',  contactTitle: 'Operations & Crowd Control',  radioChannel: 'Ch 2 — Operations' },
  'accessibility':  { contactRole: 'accessibility',contactTitle: 'Accessibility Services Desk',radioChannel: 'Ch 4 — Accessibility' },
  'weather':        { contactRole: 'operations',  contactTitle: 'Operations & Safety',         radioChannel: 'Ch 2 — Operations' },
  'lost-item':      { contactRole: 'operations',  contactTitle: 'Lost & Found / Operations',   radioChannel: 'Ch 2 — Operations' },
  'navigation':     { contactRole: 'volunteer',   contactTitle: 'Volunteer / Guest Services',  radioChannel: 'Ch 2 — Operations' },
  'general':        { contactRole: 'supervisor',  contactTitle: 'Shift Supervisor',            radioChannel: 'Ch 5 — Supervisor' },
};

/** Urgency descriptor per severity level */
const URGENCY_LABELS: Record<SeverityScore['level'], string> = {
  low:      'Routine — handle as normal, log if resolved',
  medium:   'Elevated — report within 5 minutes, monitor closely',
  high:     'High — escalate immediately, do not wait',
  critical: 'CRITICAL — escalate NOW, supervisor required',
};

/**
 * Build an escalation plan for a given category and severity.
 * Always returns a valid plan — never throws.
 */
export function buildEscalation(
  category: IncidentCategory,
  severity: SeverityScore,
): EscalationPlan {
  const contact = CATEGORY_CONTACTS[category] ?? CATEGORY_CONTACTS['general'];

  // For critical severity, always also involve the supervisor regardless of category
  const contactTitle =
    severity.level === 'critical'
      ? `${contact.contactTitle} + Shift Supervisor (Ch 5)`
      : contact.contactTitle;

  return {
    contactRole: contact.contactRole,
    contactTitle,
    radioChannel: contact.radioChannel,
    urgency: URGENCY_LABELS[severity.level],
  };
}
