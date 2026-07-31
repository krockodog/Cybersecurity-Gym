// ── PBQ Component Registry ──────────────────────────────────────────
// Lazy-loaded components only — metadata is in metadata.ts

import { lazy } from 'react';

export const NetworkTopologyPBQ = lazy(() => import('./NetworkTopologyPBQ'));
export const TerminalPBQ = lazy(() => import('./TerminalPBQ'));
export const WebVulnHotspotPBQ = lazy(() => import('./WebVulnHotspotPBQ'));
export const FirewallVisualPBQ = lazy(() => import('./FirewallVisualPBQ'));
export const CertChainPBQ = lazy(() => import('./CertChainPBQ'));
export const LogRadarPBQ = lazy(() => import('./LogRadarPBQ'));
export const WirelessAttackPBQ = lazy(() => import('./WirelessAttackPBQ'));
export const ExploitChainPBQ = lazy(() => import('./ExploitChainPBQ'));
export const SubnetCalculatorPBQ = lazy(() => import('./SubnetCalculatorPBQ'));
export const ProtocolAnalyzerPBQ = lazy(() => import('./ProtocolAnalyzerPBQ'));
export const DNSResolutionPBQ = lazy(() => import('./DNSResolutionPBQ'));
export const VLANConfigPBQ = lazy(() => import('./VLANConfigPBQ'));
export const CableTesterPBQ = lazy(() => import('./CableTesterPBQ'));
export const RoutingTablePBQ = lazy(() => import('./RoutingTablePBQ'));

export const PBQ_COMPONENT_MAP: Record<string, React.ComponentType<{ onComplete?: (score: number) => void }>> = {
  'network-topology': NetworkTopologyPBQ,
  'terminal-sim': TerminalPBQ,
  'web-vuln-hotspot': WebVulnHotspotPBQ,
  'firewall-rules': FirewallVisualPBQ,
  'cert-chain': CertChainPBQ,
  'log-radar': LogRadarPBQ,
  'wireless-attack': WirelessAttackPBQ,
  'exploit-chain': ExploitChainPBQ,
  'subnet-calculator': SubnetCalculatorPBQ,
  'protocol-analyzer': ProtocolAnalyzerPBQ,
  'dns-resolution': DNSResolutionPBQ,
  'vlan-config': VLANConfigPBQ,
  'cable-tester': CableTesterPBQ,
  'routing-table': RoutingTablePBQ,
};
