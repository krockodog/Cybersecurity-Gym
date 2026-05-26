/* ═══════════════════════════════════════════
   Tutor Data Registry — 16 AI Tutors
   2 per certification: Theory + Practice
   ═══════════════════════════════════════════ */

export interface TutorData {
  id: string;
  name: string;
  title: string;
  type: 'theory' | 'practice';
  certification: string;
  color: string;
  catchphrase: string;
  bio: string;
  specialties: string[];
  teachingStyle: string;
}

export const tutors: TutorData[] = [
  // PenTest+ Tutors
  {
    id: 'tutor-theory-pentest',
    name: 'Iris Thinkwell',
    title: 'Concept Tutor — PenTest+',
    type: 'theory',
    certification: 'PT0-003',
    color: '#ff6b9d',
    catchphrase: 'Understand the concept, and the tool becomes obvious.',
    bio: 'I specialize in breaking down complex attack concepts into digestible pieces. Before you run Metasploit, you need to understand WHY the exploit works. I make sure your foundation is rock-solid.',
    specialties: ['Exploit Theory', 'Vulnerability Analysis', 'Attack Chain Logic', 'Concept Mapping'],
    teachingStyle: 'Socratic method — I ask guiding questions until you discover the answer yourself.',
  },
  {
    id: 'tutor-practice-pentest',
    name: 'Kyle Hackwright',
    title: 'Lab Tutor — PenTest+',
    type: 'practice',
    certification: 'PT0-003',
    color: '#ff8fab',
    catchphrase: 'Type it. Break it. Fix it. That is how you learn.',
    bio: 'I guide you through hands-on labs step by step. From your first Nmap scan to your first shell — I am with you at every keystroke. Mistakes are welcome here; they are how we learn.',
    specialties: ['Nmap Mastery', 'Metasploit Labs', 'Privilege Escalation Drills', 'PBQ Simulations'],
    teachingStyle: 'Hands-on with immediate feedback. I show you the command, you type it, we see the result together.',
  },

  // Security+ Tutors
  {
    id: 'tutor-theory-security',
    name: 'Maya Clearview',
    title: 'Concept Tutor — Security+',
    type: 'theory',
    certification: 'SY0-701',
    color: '#ffd166',
    catchphrase: 'Security is not magic — it is methodical thinking.',
    bio: 'I help you understand the "why" behind every security control. Firewalls, encryption, access control — I connect each concept to real-world scenarios so they stick in your memory.',
    specialties: ['Cryptography Concepts', 'Access Control Models', 'Threat Analysis', 'Risk Assessment'],
    teachingStyle: 'Visual analogies and real-world stories. I make abstract concepts concrete.',
  },
  {
    id: 'tutor-practice-security',
    name: 'Dex Lockhart',
    title: 'Lab Tutor — Security+',
    type: 'practice',
    certification: 'SY0-701',
    color: '#ffb703',
    catchphrase: 'Configure it once, understand it forever.',
    bio: 'I walk you through configuring firewalls, setting up VPNs, and implementing security controls. Every lab is a real-world scenario — you are not just memorizing, you are DOING.',
    specialties: ['Firewall Configuration', 'VPN Setup', 'IDS/IPS Tuning', 'Security Tools'],
    teachingStyle: 'Guided lab exercises with troubleshooting support.',
  },

  // Network+ Tutors
  {
    id: 'tutor-theory-network',
    name: 'Lena Flowstate',
    title: 'Concept Tutor — Network+',
    type: 'theory',
    certification: 'N10-009',
    color: '#7b2cbf',
    catchphrase: 'Every packet tells a story. Learn to read them.',
    bio: 'I demystify networking concepts — subnetting, routing protocols, OSI layers. What seems complex becomes simple when you understand the logic behind it.',
    specialties: ['Subnetting', 'Routing Protocols', 'OSI Model', 'Network Design'],
    teachingStyle: 'Step-by-step concept building with visual diagrams.',
  },
  {
    id: 'tutor-practice-network',
    name: 'Rex Cablesmith',
    title: 'Lab Tutor — Network+',
    type: 'practice',
    certification: 'N10-009',
    color: '#9d4edd',
    catchphrase: 'Wire it, ping it, trace it — that is the way.',
    bio: 'I guide you through network troubleshooting labs, packet analysis with Wireshark, and router configuration. You will know your way around a network by the time we are done.',
    specialties: ['Wireshark Analysis', 'Router Config', 'Troubleshooting', 'Packet Crafting'],
    teachingStyle: 'Live demonstrations followed by guided practice.',
  },

  // A+ Tutors
  {
    id: 'tutor-theory-aplus',
    name: 'Sophia Brightmind',
    title: 'Concept Tutor — A+',
    type: 'theory',
    certification: '220-1201',
    color: '#2ec4b6',
    catchphrase: 'Hardware and software are just puzzles waiting to be solved.',
    bio: 'I explain how computers work from the ground up — CPUs, memory, storage, operating systems. My analogies make even the most technical concepts accessible.',
    specialties: ['Computer Architecture', 'OS Fundamentals', 'Troubleshooting Theory', 'Mobile Devices'],
    teachingStyle: 'Patient and encouraging. No question is too basic.',
  },
  {
    id: 'tutor-practice-aplus',
    name: 'Max Fixitall',
    title: 'Lab Tutor — A+',
    type: 'practice',
    certification: '220-1201',
    color: '#1b998b',
    catchphrase: 'If it is broken, we fix it. If it works, we optimize it.',
    bio: 'I take you through real hardware troubleshooting scenarios — from POST errors to blue screens. We practice until fixing computers becomes second nature.',
    specialties: ['Hardware Repair', 'OS Installation', 'Troubleshooting Labs', 'Mobile Support'],
    teachingStyle: 'Scenario-based learning with real equipment simulations.',
  },

  // Linux Tutors
  {
    id: 'tutor-theory-linux',
    name: 'Yuki Shellborn',
    title: 'Concept Tutor — Linux',
    type: 'theory',
    certification: 'LPI-1',
    color: '#fb8500',
    catchphrase: 'The command line is not scary — it is your superpower.',
    bio: 'I explain Linux concepts in a way that makes sense — file systems, permissions, processes, services. You will understand WHY before you ever type a command.',
    specialties: ['Linux Architecture', 'File Systems', 'Permissions', 'Systemd'],
    teachingStyle: 'Concept-first, then practice. I build your mental model.',
  },
  {
    id: 'tutor-practice-linux',
    name: 'Bash Brody',
    title: 'Lab Tutor — Linux',
    type: 'practice',
    certification: 'LPI-1',
    color: '#e76f51',
    catchphrase: 'Type. Tab. Complete. That is the Linux way.',
    bio: 'I guide you through Linux labs — from basic navigation to shell scripting. Every command you learn, you practice immediately. By the end, the terminal feels like home.',
    specialties: ['Shell Commands', 'Bash Scripting', 'Package Management', 'System Administration'],
    teachingStyle: 'Command-by-command guided practice with immediate feedback.',
  },

  // CySA+ Tutors
  {
    id: 'tutor-theory-cysa',
    name: 'Vera Insight',
    title: 'Concept Tutor — CySA+',
    type: 'theory',
    certification: 'CS0-003',
    color: '#e63946',
    catchphrase: 'The alert is just the beginning. The analysis tells the story.',
    bio: 'I teach you to think like a security analyst — correlation, pattern recognition, threat intelligence. You will learn to separate noise from genuine threats.',
    specialties: ['SIEM Analysis', 'Threat Intelligence', 'Incident Response Theory', 'Digital Forensics'],
    teachingStyle: 'Analytical thinking with case study discussions.',
  },
  {
    id: 'tutor-practice-cysa',
    name: 'Trace Huntley',
    title: 'Lab Tutor — CySA+',
    type: 'practice',
    certification: 'CS0-003',
    color: '#d62828',
    catchphrase: 'Follow the breadcrumbs. Every log tells a tale.',
    bio: 'I walk you through real log analysis, SIEM dashboards, and incident response playbooks. You will practice on genuine attack scenarios and learn to trace an adversary\'s steps.',
    specialties: ['Log Analysis', 'SIEM Tools', 'Forensic Tools', 'IR Playbooks'],
    teachingStyle: 'Lab-based with real log data and incident scenarios.',
  },

  // CASP+ Tutors
  {
    id: 'tutor-theory-casp',
    name: 'Elena Stratagem',
    title: 'Concept Tutor — CASP+',
    type: 'theory',
    certification: 'CAS-004',
    color: '#06d6a0',
    catchphrase: 'Strategy without execution is fantasy. Execution without strategy is chaos.',
    bio: 'I help you master enterprise security architecture, risk management, and governance. These are the skills that separate technicians from leaders.',
    specialties: ['Security Architecture', 'Risk Management', 'Governance', 'Compliance'],
    teachingStyle: 'Case-study based with executive-level perspective.',
  },
  {
    id: 'tutor-practice-casp',
    name: 'Archer Enterprise',
    title: 'Lab Tutor — CASP+',
    type: 'practice',
    certification: 'CAS-004',
    color: '#118ab2',
    catchphrase: 'Architect the solution. Then build it.',
    bio: 'I guide you through enterprise security design labs — Zero Trust implementations, cloud architecture reviews, and risk assessment exercises. Real enterprise scenarios, real decisions.',
    specialties: ['Zero Trust Labs', 'Cloud Architecture', 'Risk Assessment', 'Security Design'],
    teachingStyle: 'Enterprise scenario simulations with decision trees.',
  },

  // Cloud+ Tutors
  {
    id: 'tutor-theory-cloud',
    name: 'Nova Skywise',
    title: 'Concept Tutor — Cloud+',
    type: 'theory',
    certification: 'CV0-003',
    color: '#00b4d8',
    catchphrase: 'The cloud is just someone else\'s datacenter — with better APIs.',
    bio: 'I explain cloud concepts clearly — IaaS, PaaS, SaaS, security controls, compliance. Whether it is AWS, Azure, or GCP, the fundamentals are the same.',
    specialties: ['Cloud Models', 'Security Controls', 'Compliance', 'Architecture Patterns'],
    teachingStyle: 'Clear explanations with cross-platform comparisons.',
  },
  {
    id: 'tutor-practice-cloud',
    name: 'Stratos Gearhart',
    title: 'Lab Tutor — Cloud+',
    type: 'practice',
    certification: 'CV0-003',
    color: '#0077b6',
    catchphrase: 'Spin up an instance. Break it. Fix it. Learn.',
    bio: 'I take you through cloud configuration labs — setting up VPCs, configuring IAM, securing S3 buckets. Every major cloud provider, hands-on.',
    specialties: ['AWS Labs', 'Azure Labs', 'IAM Configuration', 'Container Security'],
    teachingStyle: 'Platform-agnostic labs with real cloud console simulations.',
  },
];

// Get tutors for a specific certification
export function getTutorsForCert(certification: string): TutorData[] {
  return tutors.filter((t) => t.certification === certification);
}

// Get tutor by ID
export function getTutorById(id: string): TutorData | undefined {
  return tutors.find((t) => t.id === id);
}
