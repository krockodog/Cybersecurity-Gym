// ── PBQ Metadata Registry ──────────────────────────────────────────
// Separate from components to avoid dynamic+static import conflicts

import type { PBQMetadata } from './shared/types';

export const PBQ_METADATA: PBQMetadata[] = [
  {
    id: 'network-topology',
    title: 'Network Topology Analyzer',
    description: 'Analyze a live network topology, identify vulnerable nodes, and trace the optimal attack path through routers, firewalls, and hosts.',
    difficulty: 3,
    category: 'PenTest+',
    tags: ['network', 'recon', 'path-tracing'],
    xpReward: 50,
    estimatedTime: '8 min',
  },
  {
    id: 'terminal-sim',
    title: 'Interactive Terminal',
    description: 'Navigate a realistic terminal simulation. Run nmap scans, interpret output, and select the correct exploit path to compromise the target.',
    difficulty: 3,
    category: 'PenTest+',
    tags: ['terminal', 'nmap', 'exploitation'],
    xpReward: 60,
    estimatedTime: '10 min',
  },
  {
    id: 'web-vuln-hotspot',
    title: 'Web Vulnerability Scanner',
    description: 'Inspect a mock web application to identify 5 common security vulnerabilities hidden in forms, URLs, headers, and code.',
    difficulty: 2,
    category: 'Security+',
    tags: ['web', 'vulnerabilities', 'appsec'],
    xpReward: 40,
    estimatedTime: '6 min',
  },
  {
    id: 'firewall-rules',
    title: 'Firewall Rule Architect',
    description: 'Drag and drop firewall rules into the correct priority order, then watch packets flow through and validate your configuration.',
    difficulty: 4,
    category: 'Security+',
    tags: ['firewall', 'rules', 'network-security'],
    xpReward: 55,
    estimatedTime: '10 min',
  },
  {
    id: 'cert-chain',
    title: 'Certificate Chain Validator',
    description: 'Analyze a TLS certificate chain. Identify expired certificates, mismatched CNs, and untrusted roots by inspecting each cert in the hierarchy.',
    difficulty: 3,
    category: 'Security+',
    tags: ['crypto', 'tls', 'certificates'],
    xpReward: 45,
    estimatedTime: '7 min',
  },
  {
    id: 'log-radar',
    title: 'Log Analysis Radar',
    description: 'Analyze streaming log entries to detect attack patterns. Flag suspicious entries and correlate events on the timeline radar.',
    difficulty: 4,
    category: 'Security+',
    tags: ['logs', 'siem', 'threat-detection'],
    xpReward: 55,
    estimatedTime: '10 min',
  },
  {
    id: 'wireless-attack',
    title: 'Wireless Attack Visualizer',
    description: 'Simulate a wireless network assessment. Place attack tools, capture the WPA handshake, and crack the password through a visual interactive flow.',
    difficulty: 3,
    category: 'PenTest+',
    tags: ['wireless', 'wpa2', 'aircrack'],
    xpReward: 50,
    estimatedTime: '8 min',
  },
  {
    id: 'exploit-chain',
    title: 'Exploit Chain Builder',
    description: 'Construct a multi-step exploit chain against a target system. Progress from reconnaissance to full system compromise through correct technique selection.',
    difficulty: 5,
    category: 'PenTest+',
    tags: ['exploitation', 'privesc', 'lateral-movement'],
    xpReward: 70,
    estimatedTime: '12 min',
  },
];

export const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
  'PenTest+': { color: '#ff3366', icon: 'Target' },
  'Security+': { color: '#00ff41', icon: 'Shield' },
  'Network+': { color: '#00d4ff', icon: 'Network' },
};

export const PBQ_ACCENT_COLORS: Record<string, string> = {
  'network-topology': '#00d4ff',
  'terminal-sim': '#00ff41',
  'web-vuln-hotspot': '#a855f7',
  'firewall-rules': '#ffaa00',
  'cert-chain': '#00d4ff',
  'log-radar': '#ff3366',
  'wireless-attack': '#00e5ff',
  'exploit-chain': '#ff3366',
};

export const PBQ_ICONS: Record<string, string> = {
  'network-topology': 'Network',
  'terminal-sim': 'Terminal',
  'web-vuln-hotspot': 'Globe',
  'firewall-rules': 'ShieldCheck',
  'cert-chain': 'Lock',
  'log-radar': 'Activity',
  'wireless-attack': 'Wifi',
  'exploit-chain': 'Target',
};
