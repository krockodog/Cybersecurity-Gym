import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Lock, AlertTriangle, XCircle, CheckCircle, ChevronRight, Eye } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const webVulnMetadata: PBQMetadata = {
  id: 'web-vuln-hotspot',
  title: 'Web Vulnerability Scanner',
  description: 'Inspect a mock web application to identify 5 common security vulnerabilities hidden in forms, URLs, headers, and code.',
  difficulty: 2,
  category: 'Security+',
  tags: ['web', 'vulnerabilities', 'appsec'],
  xpReward: 40,
  estimatedTime: '6 min',
};

interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vulnerability: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  found: boolean;
}

const INITIAL_HOTSPOTS: Hotspot[] = [
  {
    id: 'hs1',
    x: 28,
    y: 52,
    width: 42,
    height: 6,
    vulnerability: 'SQL Injection',
    severity: 'critical',
    description: 'The username field is vulnerable to SQL injection. Input is directly concatenated into the query without parameterization.',
    found: false,
  },
  {
    id: 'hs2',
    x: 28,
    y: 63,
    width: 42,
    height: 6,
    vulnerability: 'Weak Password Policy',
    severity: 'high',
    description: 'No password complexity requirements. Allows passwords like "123456" with no validation.',
    found: false,
  },
  {
    id: 'hs3',
    x: 1,
    y: 18,
    width: 22,
    height: 3,
    vulnerability: 'Insecure Direct Object Reference (IDOR)',
    severity: 'critical',
    description: 'URL exposes internal file structure with predictable paths like /admin/config.php',
    found: false,
  },
  {
    id: 'hs4',
    x: 4,
    y: 1,
    width: 60,
    height: 4,
    vulnerability: 'Missing Security Headers',
    severity: 'medium',
    description: 'Response is missing X-Frame-Options, CSP, and HSTS headers. Site is vulnerable to clickjacking.',
    found: false,
  },
  {
    id: 'hs5',
    x: 75,
    y: 10,
    width: 20,
    height: 25,
    vulnerability: 'Sensitive Data Exposure',
    severity: 'high',
    description: 'Server version and framework details exposed in error messages. Stack traces reveal internal paths.',
    found: false,
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff3366',
  high: '#ffaa00',
  medium: '#ffbd2e',
  low: '#00ff41',
};

interface Props {
  onComplete?: (score: number) => void;
}

export default function WebVulnHotspotPBQ({ onComplete }: Props) {
  const [hotspots, setHotspots] = useState<Hotspot[]>(INITIAL_HOTSPOTS);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [foundCount, setFoundCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const handleAreaClick = useCallback((id: string) => {
    const hotspot = hotspots.find(h => h.id === id);
    if (!hotspot) return;

    if (hotspot.found) {
      setShakeId(id);
      setTimeout(() => setShakeId(null), 500);
      return;
    }

    const updated = hotspots.map(h => h.id === id ? { ...h, found: true } : h);
    setHotspots(updated);
    setSelectedHotspot({ ...hotspot, found: true });
    const newCount = foundCount + 1;
    setFoundCount(newCount);
    const newScore = Math.round((newCount / hotspots.length) * 100);
    setScore(newScore);

    if (newCount >= hotspots.length) {
      setCompleted(true);
      onComplete?.(newScore);
    }
  }, [hotspots, foundCount, onComplete]);

  const totalVulns = hotspots.length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#00d4ff]" />
          <span className="text-caption text-[#7da0c4] font-display">http://vulnerable-app.local/login</span>
        </div>
        <ProgressTracker current={foundCount} total={totalVulns} score={score} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4">
        {/* Browser Mockup */}
        <div className="bg-[#1a1a2e] border border-[#1a2d45] rounded-xl overflow-hidden">
          {/* Browser chrome */}
          <div className="bg-[#0d0d1a] border-b border-[#1a2d45] px-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-[#1a1a2e] rounded-lg px-3 py-1 ml-4">
                <Lock size={12} className="text-[#ff3366]" />
                <span className="text-caption text-[#7da0c4] font-mono">http://vulnerable-app.local/login.php?page=admin/config</span>
              </div>
            </div>
            <div className="flex gap-4 text-[10px] text-[#4a6682] font-mono">
              <span>Elements</span>
              <span>Console</span>
              <span>Network</span>
              <span className="text-[#00d4ff] border-b border-[#00d4ff]">Security</span>
            </div>
          </div>

          {/* Mock webpage with hotspots */}
          <div className="relative bg-white text-black p-6 min-h-[420px] overflow-hidden">
            {/* Hotspot overlay layer */}
            {hotspots.map(hs => (
              <motion.div
                key={hs.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${hs.x}%`,
                  top: `${hs.y}%`,
                  width: `${hs.width}%`,
                  height: `${hs.height}%`,
                }}
                onClick={() => handleAreaClick(hs.id)}
                animate={shakeId === hs.id ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {/* Pulse effect for unfound hotspots */}
                {!hs.found && (
                  <motion.div
                    className="absolute inset-0 rounded border-2 border-dashed border-transparent"
                    animate={{
                      borderColor: ['rgba(255,51,102,0)', 'rgba(255,51,102,0.4)', 'rgba(255,51,102,0)'],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                )}
                {/* Found indicator */}
                {hs.found && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 z-10"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: SEVERITY_COLORS[hs.severity] }}
                    >
                      <AlertTriangle size={12} className="text-white" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}

            {/* Fake webpage content */}
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Globe size={32} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">Secure Login Portal</h1>
                <p className="text-xs text-gray-500">v2.4.1 — Apache/2.4.49 (Debian)</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                  <div className="w-full h-8 border border-gray-300 rounded bg-white px-2 text-sm flex items-center text-gray-400">
                    admin' OR '1'='1
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <div className="w-full h-8 border border-gray-300 rounded bg-white px-2 text-sm flex items-center text-gray-400">
                    123456
                  </div>
                </div>
                <button className="w-full h-8 bg-blue-600 text-white rounded text-sm font-medium">
                  Sign In
                </button>
                <p className="text-xs text-blue-600 text-center">Forgot password?</p>
              </div>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-mono">
                  Warning: Deprecated function mysql_query() used. Stack trace:<br />
                  /var/www/html/login.php:47<br />
                  /var/www/html/config.php:12
                </p>
              </div>
            </div>

            {/* Code snippet overlay */}
            <div className="absolute right-4 bottom-4 w-56 bg-[#0d1117] border border-[#1a2d45] rounded-lg p-3 text-[10px] font-mono opacity-80">
              <div className="text-[#4a6682] mb-1">// login.php</div>
              <div><span className="text-[#ff7b00]">$user</span> = <span className="text-[#00ff41]">"SELECT * FROM users WHERE username='"</span></div>
              <div>&nbsp;&nbsp;+ <span className="text-[#00d4ff]">$_POST</span>[<span className="text-[#00ff41]">'user'</span>] + <span className="text-[#00ff41]">"'"</span>;</div>
              <div><span className="text-[#a855f7]">mysql_query</span>(<span className="text-[#ff7b00]">$user</span>);</div>
            </div>
          </div>
        </div>

        {/* Vulnerability Panel */}
        <div className="space-y-3">
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-4">
            <h4 className="font-display font-semibold text-sm text-[#e0f2fe] mb-2">
              Find {totalVulns} Vulnerabilities
            </h4>
            <p className="text-body-sm text-[#7da0c4]">
              Click on suspicious areas of the web page. Look at forms, URLs, headers, and error messages.
            </p>
          </div>

          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-4">
            <h4 className="font-display font-semibold text-xs text-[#7da0c4] mb-3">
              FOUND ({foundCount}/{totalVulns})
            </h4>
            <div className="space-y-2">
              {hotspots.filter(h => h.found).map(hs => (
                <motion.div
                  key={hs.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-2 rounded bg-[#111d2e] border border-[#1a2d45] cursor-pointer hover:border-[#00d4ff]"
                  onClick={() => setSelectedHotspot(hs)}
                >
                  <AlertTriangle size={14} style={{ color: SEVERITY_COLORS[hs.severity] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#e0f2fe] font-display truncate">{hs.vulnerability}</p>
                    <p className="text-[10px] text-[#4a6682] uppercase">{hs.severity}</p>
                  </div>
                  <ChevronRight size={12} className="text-[#4a6682]" />
                </motion.div>
              ))}
              {foundCount === 0 && (
                <p className="text-caption text-[#4a6682]">No vulnerabilities found yet. Start clicking suspicious areas!</p>
              )}
            </div>
          </div>

          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-[#00ff41] bg-[rgba(0,255,65,0.05)] rounded-lg p-4"
            >
              <div className="flex items-center gap-2 text-[#00ff41]">
                <CheckCircle size={18} />
                <span className="font-display font-bold text-sm">All Found!</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedHotspot(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${SEVERITY_COLORS[selectedHotspot.severity]}20` }}
                >
                  <Eye size={20} style={{ color: SEVERITY_COLORS[selectedHotspot.severity] }} />
                </div>
                <div>
                  <h3 className="text-h4 text-[#e0f2fe] font-display">{selectedHotspot.vulnerability}</h3>
                  <span
                    className="text-caption px-2 py-0.5 rounded-full border"
                    style={{
                      color: SEVERITY_COLORS[selectedHotspot.severity],
                      borderColor: SEVERITY_COLORS[selectedHotspot.severity],
                    }}
                  >
                    {selectedHotspot.severity.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-body-sm text-[#7da0c4] mb-4">{selectedHotspot.description}</p>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="w-full px-4 py-2 border border-[#1a2d45] rounded-lg text-sm text-[#7da0c4] hover:border-[#00d4ff] hover:text-[#e0f2fe] transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
