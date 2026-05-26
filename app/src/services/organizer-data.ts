/* ═══════════════════════════════════════════
   Organizer Data Registry — 8 AI Organizers
   1 per certification classroom
   ═══════════════════════════════════════════ */

export interface OrganizerData {
  id: string;
  name: string;
  certification: string;
  color: string;
  description: string;
  triggers: string[];
  responsibilities: string[];
}

export const organizers: OrganizerData[] = [
  {
    id: 'organizer-pentest',
    name: 'Oracle Pentest',
    certification: 'PT0-003',
    color: '#ff3366',
    description: 'Monitors your PenTest+ progress, schedules daily targets, and triggers interventions when you fall behind.',
    triggers: ['Low domain score (<50%)', 'Inactive 3+ days', 'Streak at risk'],
    responsibilities: ['Daily target adjustment', 'PBQ scheduling', 'Professor reassignment', 'Milestone tracking'],
  },
  {
    id: 'organizer-security',
    name: 'Sentinel Security',
    certification: 'SY0-701',
    color: '#ffaa00',
    description: 'Tracks your Security+ readiness and ensures balanced coverage across all domains.',
    triggers: ['Weak domain detected', 'Practice exam score drop', 'Study gap detected'],
    responsibilities: ['Domain balance monitoring', 'Flashcard scheduling', 'Weakness alerts', 'Progress reporting'],
  },
  {
    id: 'organizer-network',
    name: 'Navigator Network',
    certification: 'N10-009',
    color: '#00e5ff',
    description: 'Maps your Network+ learning journey and optimizes your study schedule.',
    triggers: ['Subnetting practice missed', 'Troubleshooting score low', 'Lab incomplete'],
    responsibilities: ['Concept-lab balance', 'Troubleshooting drills', 'Subnetting practice', 'Exam date tracking'],
  },
  {
    id: 'organizer-aplus',
    name: 'Atlas A+',
    certification: '220-1201',
    color: '#2ec4b6',
    description: 'Coordinates your A+ studies across hardware and software domains.',
    triggers: ['Hardware score <60%', 'OS concepts weak', 'Practice test failed'],
    responsibilities: ['Hardware/software balance', 'Troubleshooting rotations', 'Lab scheduling', 'Milestone alerts'],
  },
  {
    id: 'organizer-linux',
    name: 'Daemon Linux',
    certification: 'LPI-1',
    color: '#fb8500',
    description: 'Orchestrates your Linux learning path from basics to system administration.',
    triggers: ['Command practice missed', 'Scripting score low', 'Permission concepts weak'],
    responsibilities: ['Command practice schedule', 'Scripting progression', 'Permission drills', 'Terminal time tracking'],
  },
  {
    id: 'organizer-cysa',
    name: 'Chronicle CySA',
    certification: 'CS0-003',
    color: '#e63946',
    description: 'Manages your CySA+ analyst training with focus on log analysis and threat detection.',
    triggers: ['Log analysis score low', 'SIEM practice missed', 'IR playbook incomplete'],
    responsibilities: ['Log analysis scheduling', 'SIEM lab rotation', 'Threat intel updates', 'Incident scenario rotation'],
  },
  {
    id: 'organizer-casp',
    name: 'Cipher CASP',
    certification: 'CAS-004',
    color: '#06d6a0',
    description: 'Directs your CASP+ enterprise security architecture studies.',
    triggers: ['Architecture score low', 'Risk assessment weak', 'Governance concepts missed'],
    responsibilities: ['Architecture case studies', 'Risk assessment drills', 'Governance review', 'Enterprise scenario rotation'],
  },
  {
    id: 'organizer-cloud',
    name: 'Cumulus Cloud',
    certification: 'CV0-003',
    color: '#00b4d8',
    description: 'Coordinates your Cloud+ training across AWS, Azure, and GCP fundamentals.',
    triggers: ['Cloud concepts weak', 'Security controls missed', 'Architecture score low'],
    responsibilities: ['Multi-cloud lab rotation', 'Security control practice', 'Architecture reviews', 'Provider comparison drills'],
  },
];

// Get organizer for certification
export function getOrganizerForCert(certification: string): OrganizerData | undefined {
  return organizers.find((o) => o.certification === certification);
}

// All organizer triggers as a flat list for the UI
export function getAllTriggers(): string[] {
  const allTriggers = new Set<string>();
  organizers.forEach((o) => o.triggers.forEach((t) => allTriggers.add(t)));
  return Array.from(allTriggers);
}
