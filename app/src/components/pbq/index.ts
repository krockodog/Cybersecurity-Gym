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
export const SQLInjectionPBQ = lazy(() => import('./SQLInjectionPBQ'));
export const SocialEngineeringPBQ = lazy(() => import('./SocialEngineeringPBQ'));

// Security+ PBQs (new)
export const IncidentResponsePBQ = lazy(() => import('./IncidentResponsePBQ'));
export const AccessControlPBQ = lazy(() => import('./AccessControlPBQ'));

// Network+ PBQs
export const SubnetCalculatorPBQ = lazy(() => import('./SubnetCalculatorPBQ'));
export const ProtocolAnalyzerPBQ = lazy(() => import('./ProtocolAnalyzerPBQ'));
export const DNSResolutionPBQ = lazy(() => import('./DNSResolutionPBQ'));
export const VLANConfigPBQ = lazy(() => import('./VLANConfigPBQ'));
export const CableTesterPBQ = lazy(() => import('./CableTesterPBQ'));
export const RoutingTablePBQ = lazy(() => import('./RoutingTablePBQ'));

// A+ PBQs
export const HardwareDiagPBQ = lazy(() => import('./HardwareDiagPBQ'));
export const OSTroubleshootPBQ = lazy(() => import('./OSTroubleshootPBQ'));
export const BIOSConfigPBQ = lazy(() => import('./BIOSConfigPBQ'));
export const DiskManagementPBQ = lazy(() => import('./DiskManagementPBQ'));
export const MobileRepairPBQ = lazy(() => import('./MobileRepairPBQ'));
export const PrintTroubleshootPBQ = lazy(() => import('./PrintTroubleshootPBQ'));

// LPI-1 PBQs
export const FilePermissionsPBQ = lazy(() => import('./FilePermissionsPBQ'));
export const PackageManagerPBQ = lazy(() => import('./PackageManagerPBQ'));
export const ProcessManagerPBQ = lazy(() => import('./ProcessManagerPBQ'));
export const ShellScriptPBQ = lazy(() => import('./ShellScriptPBQ'));
export const UserManagementPBQ = lazy(() => import('./UserManagementPBQ'));
export const SystemLogsPBQ = lazy(() => import('./SystemLogsPBQ'));

// Linux+ PBQs
export const KernelModulePBQ = lazy(() => import('./KernelModulePBQ'));
export const LVMStoragePBQ = lazy(() => import('./LVMStoragePBQ'));
export const SystemdServicePBQ = lazy(() => import('./SystemdServicePBQ'));
export const FirewallConfigPBQ = lazy(() => import('./FirewallConfigPBQ'));
export const ContainerLabPBQ = lazy(() => import('./ContainerLabPBQ'));
export const NetworkConfigPBQ = lazy(() => import('./NetworkConfigPBQ'));

// CySA+ PBQs
export const SIEMDashboardPBQ = lazy(() => import('./SIEMDashboardPBQ'));
export const ThreatIntelPBQ = lazy(() => import('./ThreatIntelPBQ'));
export const MalwareAnalysisPBQ = lazy(() => import('./MalwareAnalysisPBQ'));
export const VulnScannerPBQ = lazy(() => import('./VulnScannerPBQ'));
export const IRTimelinePBQ = lazy(() => import('./IRTimelinePBQ'));
export const ForensicsPBQ = lazy(() => import('./ForensicsPBQ'));

// CASP+ PBQs
export const RiskMatrixPBQ = lazy(() => import('./RiskMatrixPBQ'));
export const ZeroTrustPBQ = lazy(() => import('./ZeroTrustPBQ'));
export const CloudMigrationSecPBQ = lazy(() => import('./CloudMigrationSecPBQ'));
export const PKIInfraPBQ = lazy(() => import('./PKIInfraPBQ'));
export const BCPDRPlannerPBQ = lazy(() => import('./BCPDRPlannerPBQ'));
export const SecArchReviewPBQ = lazy(() => import('./SecArchReviewPBQ'));

// Cloud+ PBQs
export const IAMPolicyPBQ = lazy(() => import('./IAMPolicyPBQ'));
export const VPCDesignerPBQ = lazy(() => import('./VPCDesignerPBQ'));
export const ContainerSecPBQ = lazy(() => import('./ContainerSecPBQ'));
export const CloudStoragePBQ = lazy(() => import('./CloudStoragePBQ'));
export const LoadBalancerPBQ = lazy(() => import('./LoadBalancerPBQ'));
export const CloudMonitorPBQ = lazy(() => import('./CloudMonitorPBQ'));

export const PBQ_COMPONENT_MAP: Record<string, React.ComponentType<{ onComplete?: (score: number) => void }>> = {
  'network-topology': NetworkTopologyPBQ,
  'terminal-sim': TerminalPBQ,
  'web-vuln-hotspot': WebVulnHotspotPBQ,
  'firewall-rules': FirewallVisualPBQ,
  'cert-chain': CertChainPBQ,
  'log-radar': LogRadarPBQ,
  'wireless-attack': WirelessAttackPBQ,
  'exploit-chain': ExploitChainPBQ,
  'sql-injection': SQLInjectionPBQ,
  'social-engineering': SocialEngineeringPBQ,
  // Security+ (new)
  'incident-response': IncidentResponsePBQ,
  'access-control': AccessControlPBQ,
  // Network+
  'subnet-calculator': SubnetCalculatorPBQ,
  'protocol-analyzer': ProtocolAnalyzerPBQ,
  'dns-resolution': DNSResolutionPBQ,
  'vlan-config': VLANConfigPBQ,
  'cable-tester': CableTesterPBQ,
  'routing-table': RoutingTablePBQ,
  // A+
  'hardware-diag': HardwareDiagPBQ,
  'os-troubleshoot': OSTroubleshootPBQ,
  'bios-config': BIOSConfigPBQ,
  'disk-management': DiskManagementPBQ,
  'mobile-repair': MobileRepairPBQ,
  'print-troubleshoot': PrintTroubleshootPBQ,
  // LPI-1
  'file-permissions': FilePermissionsPBQ,
  'package-manager': PackageManagerPBQ,
  'process-manager': ProcessManagerPBQ,
  'shell-script': ShellScriptPBQ,
  'user-management': UserManagementPBQ,
  'system-logs': SystemLogsPBQ,
  // Linux+
  'kernel-module': KernelModulePBQ,
  'lvm-storage': LVMStoragePBQ,
  'systemd-service': SystemdServicePBQ,
  'linux-firewall': FirewallConfigPBQ,
  'container-lab': ContainerLabPBQ,
  'linux-network-config': NetworkConfigPBQ,
  // CySA+
  'siem-dashboard': SIEMDashboardPBQ,
  'threat-intel': ThreatIntelPBQ,
  'malware-analysis': MalwareAnalysisPBQ,
  'vuln-scanner': VulnScannerPBQ,
  'ir-timeline': IRTimelinePBQ,
  'forensics': ForensicsPBQ,
  // CASP+
  'risk-matrix': RiskMatrixPBQ,
  'zero-trust': ZeroTrustPBQ,
  'cloud-migration-sec': CloudMigrationSecPBQ,
  'pki-infra': PKIInfraPBQ,
  'bcp-dr-planner': BCPDRPlannerPBQ,
  'sec-arch-review': SecArchReviewPBQ,
  // Cloud+
  'iam-policy': IAMPolicyPBQ,
  'vpc-designer': VPCDesignerPBQ,
  'container-sec': ContainerSecPBQ,
  'cloud-storage': CloudStoragePBQ,
  'load-balancer': LoadBalancerPBQ,
  'cloud-monitor': CloudMonitorPBQ,
};
