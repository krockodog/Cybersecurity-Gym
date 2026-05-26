import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Lock, Unlock, Fingerprint, Calendar, User, CheckCircle } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const certMetadata: PBQMetadata = {
  id: 'cert-chain',
  title: 'Certificate Chain Validator',
  description: 'Analyze a TLS certificate chain. Identify expired certificates, mismatched CNs, and untrusted roots by inspecting each cert in the hierarchy.',
  difficulty: 3,
  category: 'Security+',
  tags: ['crypto', 'tls', 'certificates'],
  xpReward: 45,
  estimatedTime: '7 min',
};

interface Certificate {
  id: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  thumbprint: string;
  cn: string;
  isExpired: boolean;
  isTrusted: boolean;
  isValidCN: boolean;
  flipped: boolean;
}

const CERTIFICATES: Certificate[] = [
  {
    id: 'root',
    subject: 'DigiCert Global Root CA',
    issuer: 'DigiCert Global Root CA',
    validFrom: '2006-11-10',
    validTo: '2031-11-10',
    thumbprint: 'A8:98:5D:3A:65:E5:E5:C4:B2:D7:D6:6D:38:61:5C:08:5C:DD:77:5E',
    cn: 'DigiCert Global Root CA',
    isExpired: false,
    isTrusted: true,
    isValidCN: true,
    flipped: false,
  },
  {
    id: 'intermediate',
    subject: 'DigiCert TLS RSA SHA256 2020 CA1',
    issuer: 'DigiCert Global Root CA',
    validFrom: '2021-04-14',
    validTo: '2031-04-13',
    thumbprint: '3F:5E:5B:9C:BA:9E:89:54:D3:71:3A:01:3A:F5:6B:E7:9B:4F:6D:1A',
    cn: 'DigiCert TLS RSA SHA256 2020 CA1',
    isExpired: false,
    isTrusted: true,
    isValidCN: true,
    flipped: false,
  },
  {
    id: 'server',
    subject: 'www.example.com',
    issuer: 'DigiCert TLS RSA SHA256 2020 CA1',
    validFrom: '2023-01-15',
    validTo: '2024-01-14',
    thumbprint: 'C2:8E:3D:54:A7:12:9F:5E:33:8B:21:4C:DD:77:5E:09:F8:1A:6B:E2',
    cn: 'www.evil.com',
    isExpired: true,
    isTrusted: false,
    isValidCN: false,
    flipped: false,
  },
];

const ISSUES = [
  { id: 'expired', label: 'Expired Certificate', description: 'Server certificate validity period has ended.' },
  { id: 'wrong-cn', label: 'Wrong Common Name', description: 'CN mismatch: cert issued for www.evil.com but serving www.example.com.' },
  { id: 'untrusted', label: 'Chain Break', description: 'Certificate chain cannot be validated to a trusted root.' },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function CertChainPBQ({ onComplete }: Props) {
  const [certs, setCerts] = useState<Certificate[]>(CERTIFICATES);
  const [identifiedIssues, setIdentifiedIssues] = useState<string[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [chainBroken, setChainBroken] = useState(false);

  const flipCert = useCallback((id: string) => {
    setCerts(prev => prev.map(c => c.id === id ? { ...c, flipped: !c.flipped } : c));
  }, []);

  const identifyIssue = useCallback((issueId: string) => {
    if (completed) return;
    if (identifiedIssues.includes(issueId)) return;

    const updated = [...identifiedIssues, issueId];
    setIdentifiedIssues(updated);
    const newScore = Math.round((updated.length / ISSUES.length) * 100);
    setScore(newScore);

    if (updated.length >= ISSUES.length) {
      setCompleted(true);
      setChainBroken(true);
      onComplete?.(newScore);
    }
  }, [identifiedIssues, completed, onComplete]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-[#a855f7]" />
          <span className="text-caption text-[#7da0c4] font-display">TLS Certificate Chain Analysis</span>
        </div>
        <ProgressTracker current={identifiedIssues.length} total={ISSUES.length} score={score} />
      </div>

      {/* Certificate Chain */}
      <div className="flex flex-col items-center gap-4 mb-6">
        {certs.map((cert, index) => {
          const isLast = index === certs.length - 1;
          const hasIssue = cert.isExpired || !cert.isValidCN;

          return (
            <div key={cert.id} className="flex flex-col items-center">
              <motion.div
                onClick={() => flipCert(cert.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer relative"
                style={{ perspective: 1000 }}
              >
                <motion.div
                  animate={{ rotateY: cert.flipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="relative w-80"
                >
                  {/* Front */}
                  <div
                    className={`p-4 rounded-xl border ${
                      hasIssue
                        ? 'border-[#ff3366] bg-gradient-to-br from-[#0d1526] to-[rgba(255,51,102,0.05)]'
                        : cert.isTrusted
                          ? 'border-[#00ff41] bg-gradient-to-br from-[#0d1526] to-[rgba(0,255,65,0.05)]'
                          : 'border-[#1a2d45] bg-[#0d1526]'
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          cert.isTrusted ? 'bg-[rgba(0,255,65,0.1)]' : 'bg-[rgba(255,51,102,0.1)]'
                        }`}>
                          {cert.isTrusted ? <ShieldCheck size={20} className="text-[#00ff41]" /> : <ShieldAlert size={20} className="text-[#ff3366]" />}
                        </div>
                        <div>
                          <p className="text-sm text-[#e0f2fe] font-display">{cert.subject}</p>
                          <p className="text-[10px] text-[#4a6682] font-mono">{cert.id.toUpperCase()} CERT</p>
                        </div>
                      </div>
                      {hasIssue && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ShieldAlert size={18} className="text-[#ff3366]" />
                        </motion.div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px]">
                        <User size={10} className="text-[#7da0c4]" />
                        <span className="text-[#7da0c4] font-mono">CN: {cert.cn}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <Calendar size={10} className="text-[#7da0c4]" />
                        <span className={`font-mono ${cert.isExpired ? 'text-[#ff3366]' : 'text-[#7da0c4]'}`}>
                          {cert.validFrom} &#8594; {cert.validTo}
                        </span>
                        {cert.isExpired && <span className="text-[#ff3366] font-bold">EXPIRED</span>}
                      </div>
                    </div>
                    <p className="text-[10px] text-[#4a6682] mt-2 text-center">Click to view details</p>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 p-4 rounded-xl border border-[#00d4ff] bg-[#0d1526]"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Fingerprint size={12} className="text-[#00d4ff]" />
                        <span className="text-[10px] text-[#7da0c4] font-mono break-all">{cert.thumbprint}</span>
                      </div>
                      <div className="text-[10px] text-[#7da0c4]">
                        <p><span className="text-[#4a6682]">Subject:</span> {cert.subject}</p>
                        <p><span className="text-[#4a6682]">Issuer:</span> {cert.issuer}</p>
                        <p><span className="text-[#4a6682]">Valid From:</span> {cert.validFrom}</p>
                        <p><span className="text-[#4a6682]">Valid To:</span> {cert.validTo}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cert.isExpired && <span className="px-1.5 py-0.5 bg-[rgba(255,51,102,0.15)] text-[#ff3366] rounded text-[9px] font-display">EXPIRED</span>}
                        {!cert.isValidCN && <span className="px-1.5 py-0.5 bg-[rgba(255,170,0,0.15)] text-[#ffaa00] rounded text-[9px] font-display">CN MISMATCH</span>}
                        {!cert.isTrusted && <span className="px-1.5 py-0.5 bg-[rgba(255,51,102,0.15)] text-[#ff3366] rounded text-[9px] font-display">UNTRUSTED</span>}
                        {!cert.isExpired && cert.isValidCN && <span className="px-1.5 py-0.5 bg-[rgba(0,255,65,0.15)] text-[#00ff41] rounded text-[9px] font-display">VALID</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Chain link */}
              {!isLast && (
                <motion.div
                  className="my-2 flex flex-col items-center"
                  animate={chainBroken && index === certs.length - 2 ? {
                    rotate: [-5, 5, -3, 3, 0],
                    y: [0, 5, 0],
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {chainBroken && index === certs.length - 2 ? (
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      className="text-[#ff3366] text-xs font-display"
                    >
                      <Unlock size={16} />
                    </motion.div>
                  ) : (
                    <Lock size={14} className={cert.isTrusted ? 'text-[#00ff41]' : 'text-[#ff3366]'} />
                  )}
                  <div className={`w-0.5 h-4 ${
                    chainBroken && index === certs.length - 2 ? 'bg-[#ff3366]' : 'bg-[#1a2d45]'
                  }`} />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Issue Identification */}
      <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
        <h4 className="font-display font-semibold text-sm text-[#e0f2fe] mb-3">Identify the Issues</h4>
        <p className="text-body-sm text-[#7da0c4] mb-4">Click on each issue present in this certificate chain:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ISSUES.map(issue => {
            const found = identifiedIssues.includes(issue.id);
            return (
              <motion.button
                key={issue.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => identifyIssue(issue.id)}
                disabled={found || completed}
                className={`p-3 rounded-lg border text-left transition-all ${
                  found
                    ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]'
                    : 'border-[#1a2d45] hover:border-[#ff3366] bg-[#111d2e]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {found ? <CheckCircle size={14} className="text-[#00ff41]" /> : <ShieldAlert size={14} className="text-[#ff3366]" />}
                  <span className={`text-xs font-display ${found ? 'text-[#00ff41]' : 'text-[#e0f2fe]'}`}>{issue.label}</span>
                </div>
                <p className="text-[10px] text-[#7da0c4]">{issue.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
