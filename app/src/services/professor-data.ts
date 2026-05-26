/* ═══════════════════════════════════════════
   Professor Data Registry
   
   All 19 professors with their teaching
   domains, styles, and specialties.
   ═══════════════════════════════════════════ */

export interface ProfessorData {
  id: string;
  name: string;
  title: string;
  nickname: string;
  color: string;
  catchphrase: string;
  domains: string[];
  teachingStyle: 'patient' | 'intense' | 'analytical' | 'practical' | 'mentor';
  personality: string;
  specialty: string;
}

export const professors: ProfessorData[] = [
  {
    id: 'cipher',
    name: 'Professor Cipher',
    title: 'Offensive Security Expert',
    nickname: 'cipher',
    color: '#ff3366',
    catchphrase: 'Every system has a weakness. Find it before they do.',
    domains: ['Attacks and Exploits', 'Vulnerability Assessment', 'Penetration Testing'],
    teachingStyle: 'intense',
    personality: 'Aggressive, challenging, pushes students to their limits',
    specialty: 'Exploit development and real-world attack scenarios',
  },
  {
    id: 'shield',
    name: 'Agent Shield',
    title: 'Defensive Security Lead',
    nickname: 'shield',
    color: '#ffaa00',
    catchphrase: 'Defense is not a product — it\'s a process.',
    domains: ['Security Fundamentals', 'Incident Response', 'Risk Management'],
    teachingStyle: 'practical',
    personality: 'Steady, reliable, focuses on fundamentals',
    specialty: 'Building robust defensive strategies',
  },
  {
    id: 'recon',
    name: 'Dr. Recon',
    title: 'OSINT Specialist',
    nickname: 'recon',
    color: '#00e5ff',
    catchphrase: 'Information is ammunition. Gather it wisely.',
    domains: ['Information Gathering', 'Networking', 'Reconnaissance'],
    teachingStyle: 'analytical',
    personality: 'Methodical, detail-oriented, loves data',
    specialty: 'Open-source intelligence and network mapping',
  },
  {
    id: 'codemaster',
    name: 'Code Master',
    title: 'Programming & Automation Expert',
    nickname: 'codemaster',
    color: '#a855f7',
    catchphrase: 'Automate everything. Manual is a bug.',
    domains: ['Tools and Code Analysis', 'Hardware/Software', 'Scripting'],
    teachingStyle: 'practical',
    personality: 'Efficient, no-nonsense, loves clean code',
    specialty: 'Python, Bash, and security automation',
  },
  {
    id: 'sage',
    name: 'Director Sage',
    title: 'Strategic Security Advisor',
    nickname: 'sage',
    color: '#10b981',
    catchphrase: 'A finding without a fix is just complaining.',
    domains: ['Reporting and Communication', 'Planning and Scoping', 'Governance'],
    teachingStyle: 'mentor',
    personality: 'Wise, patient, strategic thinker',
    specialty: 'Security reporting and strategic planning',
  },
  {
    id: 'fixit',
    name: 'Professor Fixit',
    title: 'Systems Troubleshooter',
    nickname: 'fixit',
    color: '#f59e0b',
    catchphrase: 'Have you tried turning it off and on again? No, seriously.',
    domains: ['Hardware/Software', 'Troubleshooting', 'System Administration'],
    teachingStyle: 'patient',
    personality: 'Helpful, patient, finds creative solutions',
    specialty: 'System diagnostics and repair',
  },
  {
    id: 'guardian',
    name: 'Professor Guardian',
    title: 'Cloud Security Architect',
    nickname: 'guardian',
    color: '#0066ff',
    catchphrase: 'The cloud is just someone else\'s computer. Secure it.',
    domains: ['Cloud Security', 'Architecture', 'Advanced Security'],
    teachingStyle: 'analytical',
    personality: 'Protective, forward-thinking, architecture-focused',
    specialty: 'Cloud-native security and infrastructure protection',
  },
  {
    id: 'netrunner',
    name: 'NetRunner',
    title: 'Network Security Expert',
    nickname: 'netrunner',
    color: '#00d4ff',
    catchphrase: 'The network never lies. Listen carefully.',
    domains: ['Networking', 'Information Gathering', 'Network Security'],
    teachingStyle: 'intense',
    personality: 'Fast-paced, technically deep, no shortcuts',
    specialty: 'Network protocols and traffic analysis',
  },
  {
    id: 'benny',
    name: 'Benny',
    title: 'Linux Systems Expert',
    nickname: 'benny',
    color: '#ff9500',
    catchphrase: 'rm -rf / ist keine Lösung. Aber manchmal fühlt es sich so an.',
    domains: ['Linux', 'System Administration', 'Command Line'],
    teachingStyle: 'practical',
    personality: 'Direct, humorous, commands respect',
    specialty: 'Linux internals and shell mastery',
  },
  {
    id: 'ghost',
    name: 'Analyst Ghost',
    title: 'Threat Intelligence Lead',
    nickname: 'ghost',
    color: '#64748b',
    catchphrase: 'Stay invisible. See everything.',
    domains: ['Cybersecurity Analyst', 'Threat Intelligence', 'Advanced Security'],
    teachingStyle: 'analytical',
    personality: 'Quiet, observant, deeply analytical',
    specialty: 'Threat hunting and digital forensics',
  },
  {
    id: 'phantom',
    name: 'Architect Phantom',
    title: 'Advanced Security Architect',
    nickname: 'phantom',
    color: '#8b5cf6',
    catchphrase: 'True security is invisible. If you see it, it\'s already failing.',
    domains: ['Advanced Security', 'Planning and Scoping', 'Enterprise Architecture'],
    teachingStyle: 'mentor',
    personality: 'Enigmatic, visionary, demands excellence',
    specialty: 'Enterprise security architecture',
  },
  {
    id: 'viper',
    name: 'Red Viper',
    title: 'Red Team Operator',
    nickname: 'viper',
    color: '#ef4444',
    catchphrase: 'Think like the enemy. Be the enemy.',
    domains: ['Attacks and Exploits', 'Social Engineering', 'Physical Security'],
    teachingStyle: 'intense',
    personality: 'Ruthless, cunning, always three moves ahead',
    specialty: 'Advanced persistent threats and red team ops',
  },
  {
    id: 'harden',
    name: 'Dr. Harden',
    title: 'Systems Hardening Specialist',
    nickname: 'harden',
    color: '#14b8a6',
    catchphrase: 'Default is insecure. Harden everything.',
    domains: ['Security Fundamentals', 'Linux', 'Compliance'],
    teachingStyle: 'practical',
    personality: 'Thorough, disciplined, leaves no stone unturned',
    specialty: 'System hardening and compliance frameworks',
  },
  {
    id: 'ciscokate',
    name: 'Cisco Kate',
    title: 'Network Infrastructure Expert',
    nickname: 'ciscokate',
    color: '#005073',
    catchphrase: 'It\'s not routing — it\'s relationships between packets.',
    domains: ['Networking', 'Infrastructure', 'Protocols'],
    teachingStyle: 'patient',
    personality: 'Encouraging, structured, builds confidence',
    specialty: 'Cisco networking and infrastructure',
  },
  {
    id: 'techmom',
    name: 'Tech Mom',
    title: 'IT Fundamentals Guru',
    nickname: 'techmom',
    color: '#ec4899',
    catchphrase: 'Every expert was once a beginner. Let\'s start there.',
    domains: ['Hardware/Software', 'Security Fundamentals', 'IT Basics'],
    teachingStyle: 'patient',
    personality: 'Nurturing, supportive, explains clearly',
    specialty: 'Breaking down complex topics for beginners',
  },
  {
    id: 'tuxtina',
    name: 'Tux Tina',
    title: 'Linux Educator',
    nickname: 'tuxtina',
    color: '#f97316',
    catchphrase: 'The penguin is your friend. Embrace the shell.',
    domains: ['Linux', 'Open Source', 'Server Administration'],
    teachingStyle: 'patient',
    personality: 'Friendly, enthusiastic, makes Linux fun',
    specialty: 'Linux education for newcomers',
  },
  {
    id: 'hunterx',
    name: 'Hunter X',
    title: 'Threat Hunter',
    nickname: 'hunterx',
    color: '#dc2626',
    catchphrase: 'Threats don\'t hide. You just need to know where to look.',
    domains: ['Cybersecurity Analyst', 'Threat Hunting', 'Incident Response'],
    teachingStyle: 'intense',
    personality: 'Relentless, sharp, always on the hunt',
    specialty: 'Proactive threat detection and hunting',
  },
  {
    id: 'cisonova',
    name: 'CISO Nova',
    title: 'Chief Information Security Officer',
    nickname: 'cisonova',
    color: '#fbbf24',
    catchphrase: 'Security is a business enabler, not a cost center.',
    domains: ['Reporting and Communication', 'Governance', 'Advanced Security'],
    teachingStyle: 'mentor',
    personality: 'Authoritative, business-savvy, strategic',
    specialty: 'Executive security leadership and communication',
  },
  {
    id: 'cloudnate',
    name: 'Cloud Native Nate',
    title: 'Cloud Security Engineer',
    nickname: 'cloudnate',
    color: '#38bdf8',
    catchphrase: 'Infrastructure as code, security as culture.',
    domains: ['Cloud Security', 'DevSecOps', 'Container Security'],
    teachingStyle: 'practical',
    personality: 'Modern, cloud-native, automation-first',
    specialty: 'Cloud security engineering and DevSecOps',
  },
];

// Professor lookup by ID
export function getProfessorById(id: string): ProfessorData | undefined {
  return professors.find((p) => p.id === id);
}

// Get professors by domain
export function getProfessorsByDomain(domain: string): ProfessorData[] {
  return professors.filter((p) => p.domains.some((d) => d.toLowerCase().includes(domain.toLowerCase())));
}

// Get all professor IDs
export function getAllProfessorIds(): string[] {
  return professors.map((p) => p.id);
}
