/* ═══════════════════════════════════════════
   AI Learning Orchestrator
   
   Analyzes skill assessment results and
   assigns the optimal professor for each
   student's learning journey.
   ═══════════════════════════════════════════ */

import { getProfessorById } from './professor-data';

export interface AssessmentResult {
  overallScore: number;
  domainScores: Record<string, number>;
  recommendedLevel: 'beginner' | 'intermediate' | 'advanced';
  weakDomains: string[];
  strongDomains: string[];
}

export interface ProfessorAssignment {
  primaryProfessor: string;
  secondaryProfessors: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusDomains: string[];
  dailyQuestionTarget: number;
  pbqFrequency: number;
}

// Domain to professor mapping
const DOMAIN_PROFESSOR_MAP: Record<string, string[]> = {
  'Planning and Scoping': ['sage', 'phantom'],
  'Information Gathering': ['recon', 'netrunner'],
  'Attacks and Exploits': ['cipher', 'viper'],
  'Reporting and Communication': ['sage', 'cisonova'],
  'Tools and Code Analysis': ['codemaster', 'ghost'],
  'Security Fundamentals': ['shield', 'harden'],
  'Networking': ['recon', 'ciscokate'],
  'Hardware/Software': ['codemaster', 'techmom'],
  'Linux': ['benny', 'tuxtina'],
  'Cybersecurity Analyst': ['ghost', 'hunterx'],
  'Advanced Security': ['phantom', 'cisonova'],
  'Cloud Security': ['guardian', 'cloudnate']
};

export function orchestrateLearning(assessment: AssessmentResult): ProfessorAssignment {
  // Determine primary professor based on weakest domain
  const weakestDomain = assessment.weakDomains[0] || 'Attacks and Exploits';
  const professorCandidates = DOMAIN_PROFESSOR_MAP[weakestDomain] || ['cipher'];
  
  // Pick primary based on skill level
  const primaryProfessor = assessment.recommendedLevel === 'beginner' 
    ? professorCandidates[1] || professorCandidates[0]  // More patient professor
    : professorCandidates[0];  // Expert professor
  
  // Get secondary professors for other weak domains
  const secondaryProfessors = assessment.weakDomains
    .slice(1, 3)
    .flatMap(d => DOMAIN_PROFESSOR_MAP[d] || [])
    .filter((p, i, arr) => arr.indexOf(p) === i) // deduplicate
    .filter(p => p !== primaryProfessor)
    .slice(0, 2);
  
  // Adjust difficulty
  const difficulty = assessment.recommendedLevel;
  
  // Calculate daily targets based on exam proximity and weakness count
  const dailyQuestionTarget = difficulty === 'beginner' ? 15 
    : difficulty === 'intermediate' ? 25 
    : 40;
  
  // PBQ frequency: more often for advanced students
  const pbqFrequency = difficulty === 'advanced' ? 2 
    : difficulty === 'intermediate' ? 3 
    : 4; // Every N days
  
  const assignment: ProfessorAssignment = {
    primaryProfessor,
    secondaryProfessors,
    difficulty,
    focusDomains: assessment.weakDomains.slice(0, 3),
    dailyQuestionTarget,
    pbqFrequency
  };
  
  // Store assignment
  localStorage.setItem('trygit_orchestrator_assignment', JSON.stringify(assignment));
  
  return assignment;
}

export function getCurrentAssignment(): ProfessorAssignment | null {
  const saved = localStorage.getItem('trygit_orchestrator_assignment');
  return saved ? JSON.parse(saved) : null;
}

export function getProfessorDisplayName(professorId: string): string {
  const professor = getProfessorById(professorId);
  return professor?.name || professorId;
}

export function getProfessorColor(professorId: string): string {
  const professor = getProfessorById(professorId);
  return professor?.color || '#00ff41';
}

export function getPersonalizedWelcome(): string {
  const name = localStorage.getItem('trygit_student_name') || 'Student';
  const assignment = getCurrentAssignment();
  
  if (!assignment) return `Welcome, ${name}!`;
  
  const professor = getProfessorDisplayName(assignment.primaryProfessor);
  
  const messages = [
    `Welcome back, ${name}! ${professor} has prepared today's training session.`,
    `Good to see you, ${name}! Your focus today: ${assignment.focusDomains.join(', ')}.`,
    `Ready to level up, ${name}? ${professor} recommends ${assignment.dailyQuestionTarget} questions today.`,
    `Hey ${name}! Time to strengthen ${assignment.focusDomains[0] || 'your skills'}. Let's go!`
  ];
  
  // Rotate messages based on day
  const dayOfWeek = new Date().getDay();
  return messages[dayOfWeek % messages.length];
}

export function getPersonalizedWelcomeForName(name: string): string {
  const assignment = getCurrentAssignment();
  
  if (!assignment) return `Welcome, ${name}!`;
  
  const professor = getProfessorDisplayName(assignment.primaryProfessor);
  
  const messages = [
    `Welcome back, ${name}! ${professor} has prepared today's training session.`,
    `Good to see you, ${name}! Your focus today: ${assignment.focusDomains.join(', ')}.`,
    `Ready to level up, ${name}? ${professor} recommends ${assignment.dailyQuestionTarget} questions today.`,
    `Hey ${name}! Time to strengthen ${assignment.focusDomains[0] || 'your skills'}. Let's go!`
  ];
  
  const dayOfWeek = new Date().getDay();
  return messages[dayOfWeek % messages.length];
}

export function shouldShowOnboarding(): boolean {
  return !localStorage.getItem('trygit_onboarding_complete');
}

export function getStudentName(): string {
  return localStorage.getItem('trygit_student_name') || 'Student';
}

export function setStudentName(name: string): void {
  localStorage.setItem('trygit_student_name', name);
}

export function completeOnboarding(): void {
  localStorage.setItem('trygit_onboarding_complete', 'true');
}

// Get recommended next steps based on assignment
export function getRecommendedNextSteps(): string[] {
  const assignment = getCurrentAssignment();
  if (!assignment) {
    return ['Complete skill assessment', 'Choose your certification path', 'Meet your professors'];
  }
  
  const steps = [
    `Practice ${assignment.focusDomains[0] || 'weak domains'} with ${getProfessorDisplayName(assignment.primaryProfessor)}`,
    `Complete ${assignment.dailyQuestionTarget} questions today`,
    `Review PBQ challenges (every ${assignment.pbqFrequency} days)`,
  ];
  
  if (assignment.secondaryProfessors.length > 0) {
    steps.push(`Supplemental study with ${getProfessorDisplayName(assignment.secondaryProfessors[0])}`);
  }
  
  return steps;
}

// Generate a mock assessment for demo/testing
export function generateMockAssessment(): AssessmentResult {
  return {
    overallScore: 62,
    domainScores: {
      'Planning and Scoping': 55,
      'Information Gathering': 70,
      'Attacks and Exploits': 45,
      'Reporting and Communication': 60,
      'Tools and Code Analysis': 65,
      'Security Fundamentals': 80,
      'Networking': 50,
    },
    recommendedLevel: 'intermediate',
    weakDomains: ['Attacks and Exploits', 'Planning and Scoping', 'Networking'],
    strongDomains: ['Security Fundamentals', 'Information Gathering', 'Tools and Code Analysis'],
  };
}

/* ═══════════════════════════════════════════
   5-AGENT PERSONNEL MODEL EXTENSION
   Each classroom: 2 Professors + 2 Tutors + 1 Organizer
   ═══════════════════════════════════════════ */

// Tutor assignment — routes questions to theory or practice tutor
export interface TutorAssignment {
  theoryTutor: string;      // Tutor 1 — handles conceptual questions
  practiceTutor: string;    // Tutor 2 — handles hands-on/tool questions
}

// Organizer triggers and actions
export interface OrganizerState {
  dailyTarget: number;
  pbqFrequency: number;
  lastCheckIn: string;
  interventionFlags: string[];
  nextMilestone: string;
  daysUntilExam: number | null;
}

// Complete 5-agent classroom staffing
export interface ClassroomStaff {
  certification: string;
  professor1: string;       // Lead Professor
  professor2: string;       // Support Professor
  tutor1: string;           // Theory Tutor
  tutor2: string;           // Practice Tutor
  organizer: string;        // Background Organizer (always 'auto')
}

// Per-certification staff assignments
const CLASSROOM_STAFF: Record<string, ClassroomStaff> = {
  'PT0-003': {
    certification: 'PenTest+',
    professor1: 'cipher',
    professor2: 'viper',
    tutor1: 'tutor-theory-pentest',
    tutor2: 'tutor-practice-pentest',
    organizer: 'auto'
  },
  'SY0-701': {
    certification: 'Security+',
    professor1: 'shield',
    professor2: 'harden',
    tutor1: 'tutor-theory-security',
    tutor2: 'tutor-practice-security',
    organizer: 'auto'
  },
  'N10-009': {
    certification: 'Network+',
    professor1: 'recon',
    professor2: 'ciscokate',
    tutor1: 'tutor-theory-network',
    tutor2: 'tutor-practice-network',
    organizer: 'auto'
  },
  '220-1201': {
    certification: 'A+',
    professor1: 'techmom',
    professor2: 'fixit',
    tutor1: 'tutor-theory-aplus',
    tutor2: 'tutor-practice-aplus',
    organizer: 'auto'
  },
  'LPI-1': {
    certification: 'Linux LPI 1',
    professor1: 'benny',
    professor2: 'tuxtina',
    tutor1: 'tutor-theory-linux',
    tutor2: 'tutor-practice-linux',
    organizer: 'auto'
  },
  'CS0-003': {
    certification: 'CySA+',
    professor1: 'ghost',
    professor2: 'hunterx',
    tutor1: 'tutor-theory-cysa',
    tutor2: 'tutor-practice-cysa',
    organizer: 'auto'
  },
  'CAS-004': {
    certification: 'CASP+',
    professor1: 'phantom',
    professor2: 'cisonova',
    tutor1: 'tutor-theory-casp',
    tutor2: 'tutor-practice-casp',
    organizer: 'auto'
  },
  'CV0-003': {
    certification: 'Cloud+',
    professor1: 'guardian',
    professor2: 'cloudnate',
    tutor1: 'tutor-theory-cloud',
    tutor2: 'tutor-practice-cloud',
    organizer: 'auto'
  }
};

// Get full 5-agent staff for a certification
export function getClassroomStaff(certification: string): ClassroomStaff {
  return CLASSROOM_STAFF[certification] || CLASSROOM_STAFF['PT0-003'];
}

// Determine if a question is conceptual (theory tutor) or practical (practice tutor)
export function assignTutor(question: string): 'theory' | 'practice' | 'both' {
  const theoryKeywords = ['what is', 'why', 'explain', 'difference between',
    'concept', 'definition', 'how does', 'purpose of', 'meaning of'];
  const practiceKeywords = ['how to', 'command', 'flag', 'nmap', 'metasploit',
    'syntax', 'usage', 'step', 'configure', 'exploit', 'scan', 'payload'];

  const q = question.toLowerCase();
  const isTheory = theoryKeywords.some(kw => q.includes(kw));
  const isPractice = practiceKeywords.some(kw => q.includes(kw));

  if (isTheory && !isPractice) return 'theory';
  if (isPractice && !isTheory) return 'practice';
  return 'both';
}

// Organizer: check triggers and return actions
export function checkOrganizerTriggers(): string[] {
  const actions: string[] = [];
  const streak = JSON.parse(localStorage.getItem('trygit_streak') || '{}');
  const assessment = JSON.parse(localStorage.getItem('trygit_skill_assessment') || '{}');

  // Check streak
  if (streak.current === 0 && streak.lastDate) {
    const daysSince = Math.floor((Date.now() - new Date(streak.lastDate).getTime()) / 86400000);
    if (daysSince >= 3) actions.push('intervention:inactive');
  }

  // Check exam readiness
  if (assessment.overallScore && assessment.overallScore > 0.85) {
    actions.push('milestone:exam_ready');
  }

  // Check weak domains
  if (assessment.weakDomains && assessment.weakDomains.length > 2) {
    actions.push('focus:weak_domains');
  }

  return actions;
}

// Get all 5 agents for the current student's primary certification
export function getCurrentClassroomTeam(): ClassroomStaff | null {
  const assignment = getCurrentAssignment();
  if (!assignment) return null;

  // Find which certification has this professor as primary
  for (const [cert, staff] of Object.entries(CLASSROOM_STAFF)) {
    if (staff.professor1 === assignment.primaryProfessor ||
        staff.professor2 === assignment.primaryProfessor) {
      return staff;
    }
  }
  return null;
}
