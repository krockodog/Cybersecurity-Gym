// RAG (Retrieval-Augmented Generation) Service for trygit.me
// Provides context-aware question retrieval for AI professors
// Uses TF-IDF-like keyword scoring for fast, relevant results

interface QuestionDoc {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  domain: string;
  exam: string;
}

interface SearchResult {
  question: QuestionDoc;
  score: number;
}

let questionCache: QuestionDoc[] | null = null;
let domainKeywords: Record<string, string[]> = {};

// Domain-specific keywords for better matching
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  // PenTest+ Domains
  "Planning and Scoping": ["scope", "sow", "statement of work", "rules of engagement", "roe", "compliance", "gdpr", "hipaa", "pci", "authorization", "legal", "contract", "agreement"],
  "Information Gathering and Vulnerability Scanning": ["nmap", "scan", "reconnaissance", "osint", "shodan", "nessus", "openvas", "vulnerability", "cvss", "port scan", "banner grabbing", "whois"],
  "Attacks and Exploits": ["sql injection", "xss", "cross-site", "exploit", "payload", "privilege escalation", "metasploit", "buffer overflow", "reverse shell", "brute force", "phishing"],
  "Tools and Code Analysis": ["python", "powershell", "bash", "script", "burp suite", "wireshark", "tcpdump", "code review", "static analysis", "grep", "awk", "sed"],
  "Reporting and Communication": ["report", "executive summary", "cvss score", "risk", "remediation", "finding", "evidence", "stakeholder", "communication"],
  // Security+ Domains
  "General Security Concepts": ["threat", "vulnerability", "risk", "mitigation", "attack", "breach", "incident"],
  "Threats, Vulnerabilities, and Mitigations": ["malware", "ransomware", "trojan", "rootkit", "social engineering", "zero-day", "patch"],
  "Security Architecture": ["firewall", "ids", "ips", "siem", "dmz", "vpn", "proxy", "load balancer"],
  "Security Operations": ["incident response", "forensics", "log analysis", "monitoring", "soc", "dlp"],
  "Security Program Management": ["governance", "compliance", "audit", "policy", "framework", "nist", "iso"],
  // Linux Domains
  "System Management": ["systemd", "service", "journal", "log", "cron", "boot", "init", "process"],
  "Security": ["permission", "chmod", "chown", "selinux", "firewall", "iptables", "ssh", "encrypt", "sudo"],
  "Networking": ["ip", "route", "dns", "dhcp", "interface", "ping", "apache", "nginx"],
  "Storage": ["filesystem", "partition", "lvm", "mount", "disk", "ext4", "xfs"],
  "Scripting": ["bash", "script", "shell", "awk", "sed", "grep", "regex"],
};

// Load all questions from databases
export async function loadQuestions(): Promise<QuestionDoc[]> {
  if (questionCache) return questionCache;

  const docs: QuestionDoc[] = [];
  const dbs = [
    '/exam_database.json',
    '/lpi1_database.json',
    '/xk006_database.json',
    '/network_plus_database.json',
    '/aplus_database.json',
  ];

  for (const path of dbs) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue;
      const data = await response.json();
      const questions = data.questions || [];
      for (const q of questions) {
        docs.push({
          id: q.id || q.seq_id?.toString() || Math.random().toString(),
          question: q.question || '',
          options: q.options || [],
          correct_answer: q.correct_answer || '',
          explanation: q.explanation || '',
          domain: q.domain || 'General',
          exam: q.exam || 'Unknown',
        });
      }
    } catch (e) {
      console.warn(`Failed to load ${path}:`, e);
    }
  }

  questionCache = docs;
  console.log(`[RAG] Loaded ${docs.length} questions`);
  return docs;
}

// Simple TF-IDF-like scoring
function calculateScore(query: string, doc: QuestionDoc): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const questionText = (doc.question + ' ' + doc.explanation + ' ' + doc.domain).toLowerCase();
  
  let score = 0;
  
  for (const word of queryWords) {
    // Exact match in question (highest weight)
    if (doc.question.toLowerCase().includes(word)) score += 10;
    // Match in explanation
    if (doc.explanation.toLowerCase().includes(word)) score += 5;
    // Match in domain
    if (doc.domain.toLowerCase().includes(word)) score += 8;
    // Match in options
    for (const opt of doc.options) {
      if (opt.toLowerCase().includes(word)) score += 3;
    }
  }

  // Domain keyword boost
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (doc.domain === domain) {
      for (const kw of keywords) {
        if (query.toLowerCase().includes(kw)) score += 15;
      }
    }
  }

  return score;
}

// Search questions by query
export async function searchQuestions(query: string, limit: number = 5): Promise<SearchResult[]> {
  const docs = await loadQuestions();
  if (!query.trim()) return [];

  const results = docs
    .map(doc => ({ question: doc, score: calculateScore(query, doc) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results;
}

// Get context for a specific topic/domain
export async function getContextForTopic(topic: string, limit: number = 3): Promise<string> {
  const results = await searchQuestions(topic, limit);
  if (results.length === 0) return '';

  let context = `\n\n=== RELEVANT EXAM QUESTIONS ===\n`;
  for (const r of results) {
    const q = r.question;
    context += `\n[${q.exam}] ${q.domain}\nQ: ${q.question}\n`;
    if (q.options.length > 0) {
      context += q.options.join('\n') + '\n';
    }
    context += `Answer: ${q.correct_answer}\n`;
    if (q.explanation) {
      context += `Explanation: ${q.explanation.slice(0, 200)}...\n`;
    }
  }
  context += `\n=== END CONTEXT ===\n`;
  
  return context;
}

// Get weaknesses-based context for personalized tutoring
export async function getWeaknessContext(weaknesses: string[], limit: number = 2): Promise<string> {
  if (weaknesses.length === 0) return '';
  
  let context = `\n\n=== STUDENT WEAKNESS PRACTICE QUESTIONS ===\n`;
  
  for (const weakness of weaknesses.slice(0, 3)) {
    const results = await searchQuestions(weakness, limit);
    for (const r of results) {
      const q = r.question;
      context += `\n[FOCUS AREA: ${weakness}]\nQ: ${q.question}\n`;
      if (q.options.length > 0) {
        context += q.options.join('\n') + '\n';
      }
      context += `Answer: ${q.correct_answer}\n`;
    }
  }
  
  context += `\n=== END PRACTICE QUESTIONS ===\n`;
  return context;
}

// RAG-enhanced system prompt
export async function createRAGSystemPrompt(
  professorId: string,
  studentMessage: string,
  weaknesses: string[] = [],
  strengths: string[] = []
): Promise<string> {
  // Import the professor prompts from ollama service
  const { PROFESSOR_PROMPTS } = await import('./ollama');
  const basePrompt = PROFESSOR_PROMPTS[professorId] || PROFESSOR_PROMPTS['cipher'];
  
  // Get RAG context
  const questionContext = await getContextForTopic(studentMessage, 3);
  const weaknessContext = weaknesses.length > 0 
    ? await getWeaknessContext(weaknesses, 2) 
    : '';
  
  return `${basePrompt}\n\n${questionContext}${weaknessContext}\n\nUse the exam questions above as reference material. When answering, relate your explanation to real exam questions and concepts. If the student is struggling with a topic, reference the relevant exam question to make your explanation concrete and actionable.`;
}

// Preload questions on app start
export function preloadQuestions(): void {
  loadQuestions().catch(console.error);
}
