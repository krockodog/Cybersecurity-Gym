import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Zap, Lock, Unlock, Radio, Target, ChevronRight } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const wirelessMetadata: PBQMetadata = {
  id: 'wireless-attack',
  title: 'Wireless Attack Visualizer',
  description: 'Simulate a wireless network assessment. Place attack tools, capture the WPA handshake, and crack the password through a visual interactive flow.',
  difficulty: 3,
  category: 'PenTest+',
  tags: ['wireless', 'wpa2', 'aircrack'],
  xpReward: 50,
  estimatedTime: '8 min',
};

interface AccessPoint {
  id: string;
  ssid: string;
  bssid: string;
  channel: number;
  signal: number;
  encryption: 'WPA2' | 'WPA3' | 'OPEN' | 'WEP';
  clients: number;
  x: number;
  y: number;
  targeted: boolean;
  handshakeCaptured: boolean;
  cracked: boolean;
}

interface AttackTool {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const ATTACK_TOOLS: AttackTool[] = [
  { id: 'airodump', name: 'Airodump-ng', icon: 'scan', description: 'Scan and discover nearby access points' },
  { id: 'aireplay', name: 'Aireplay-ng', icon: 'deauth', description: 'Send deauthentication packets to capture handshake' },
  { id: 'aircrack', name: 'Aircrack-ng', icon: 'crack', description: 'Crack WPA key using captured handshake' },
];

const ACCESS_POINTS: AccessPoint[] = [
  { id: 'ap1', ssid: 'CorpNet-5G', bssid: 'AA:BB:CC:11:22:33', channel: 36, signal: 85, encryption: 'WPA2', clients: 12, x: 30, y: 30, targeted: false, handshakeCaptured: false, cracked: false },
  { id: 'ap2', ssid: 'Guest-WiFi', bssid: 'AA:BB:CC:44:55:66', channel: 1, signal: 60, encryption: 'OPEN', clients: 25, x: 70, y: 25, targeted: false, handshakeCaptured: false, cracked: false },
  { id: 'ap3', ssid: 'SecureNet', bssid: 'AA:BB:CC:77:88:99', channel: 149, signal: 45, encryption: 'WPA3', clients: 3, x: 50, y: 60, targeted: false, handshakeCaptured: false, cracked: false },
  { id: 'ap4', ssid: 'Admin-Net', bssid: 'AA:BB:CC:AA:BB:CC', channel: 6, signal: 72, encryption: 'WPA2', clients: 5, x: 20, y: 70, targeted: false, handshakeCaptured: false, cracked: false },
];

const ENCRYPTION_COLORS: Record<string, string> = {
  WPA2: '#ffaa00',
  WPA3: '#00ff41',
  OPEN: '#ff3366',
  WEP: '#ff3366',
};

interface Props {
  onComplete?: (score: number) => void;
}

export default function WirelessAttackPBQ({ onComplete }: Props) {
  const [aps, setAps] = useState<AccessPoint[]>(ACCESS_POINTS);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [phase, setPhase] = useState<'scan' | 'deauth' | 'crack'>('scan');
  const [selectedAP, setSelectedAP] = useState<string | null>(null);
  const [crackProgress, setCrackProgress] = useState(0);
  const [isCracking, setIsCracking] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([
    '[*] Wireless Attack Framework initialized',
    '[*] wlan0mon interface ready',
    '[*] Select an attack tool to begin...',
  ]);

  const addLog = useCallback((line: string) => {
    setLogLines(prev => [...prev.slice(-20), line]);
  }, []);

  const selectAP = useCallback((apId: string) => {
    const ap = aps.find(a => a.id === apId);
    if (!ap) return;
    setSelectedAP(apId);

    if (phase === 'scan' && selectedTool === 'airodump') {
      setAps(prev => prev.map(a => a.id === apId ? { ...a, targeted: true } : a));
      addLog(`[+] Targeting AP: ${ap.ssid} (${ap.bssid}) CH:${ap.channel}`);
      addLog(`[+] ${ap.clients} clients connected`);
      addLog(`[+] Encryption: ${ap.encryption}`);
      setPhase('deauth');
      setSelectedTool(null);
    } else if (phase === 'deauth' && selectedTool === 'aireplay') {
      setAps(prev => prev.map(a => a.id === apId ? { ...a, handshakeCaptured: true } : a));
      addLog(`[*] Sending 128 deauth frames to ${ap.bssid}...`);
      addLog(`[+] WPA Handshake captured!`);
      addLog(`[+] File: capture_${ap.bssid.replace(/:/g, '')}.cap`);
      setPhase('crack');
      setSelectedTool(null);
    } else if (phase === 'crack' && selectedTool === 'aircrack') {
      startCrack(apId);
    }
  }, [aps, phase, selectedTool, addLog]);

  const startCrack = (apId: string) => {
    setIsCracking(true);
    const ap = aps.find(a => a.id === apId);
    addLog(`[*] Starting dictionary attack on ${ap?.ssid}...`);
    addLog(`[*] Using wordlist: rockyou.txt (14M entries)`);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setAps(prev => prev.map(a => a.id === apId ? { ...a, cracked: true } : a));
        addLog(`[+] KEY FOUND! [ CyberSec2024! ]`);
        addLog(`[*] Elapsed: 2m 34s | 847,293 passwords tested`);
        setIsCracking(false);
        setCompleted(true);
        setScore(100);
        onComplete?.(100);
      } else {
        addLog(`[*] Progress: ${Math.round(progress)}% | Testing ${Math.floor(Math.random() * 10000 + 5000)} p/s`);
      }
      setCrackProgress(progress);
    }, 600);
  };

  const toolForPhase = {
    scan: 'airodump',
    deauth: 'aireplay',
    crack: 'aircrack',
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wifi size={16} className="text-[#00d4ff]" />
          <span className="text-caption text-[#7da0c4] font-display">Wireless Assessment</span>
        </div>
        <ProgressTracker current={phase === 'scan' ? 0 : phase === 'deauth' ? 1 : 2} total={3} score={score} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4">
        {/* Floor Plan / AP Map */}
        <div className="relative bg-[#0a0e17] border border-[#1a2d45] rounded-xl overflow-hidden min-h-[420px]">
          <div className="absolute inset-0 grid-bg opacity-20" />

          {/* Phase indicator */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            {(['scan', 'deauth', 'crack'] as const).map((p, i) => (
              <div key={p} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  p === phase ? 'bg-[#00d4ff] animate-pulse' :
                  i < ['scan', 'deauth', 'crack'].indexOf(phase) ? 'bg-[#00ff41]' :
                  'bg-[#1a2d45]'
                }`} />
                <span className={`text-[10px] font-display uppercase ${
                  p === phase ? 'text-[#00d4ff]' :
                  i < ['scan', 'deauth', 'crack'].indexOf(phase) ? 'text-[#00ff41]' :
                  'text-[#4a6682]'
                }`}>
                  {p}
                </span>
              </div>
            ))}
          </div>

          {/* Access Points */}
          {aps.map(ap => (
            <motion.div
              key={ap.id}
              className="absolute cursor-pointer"
              style={{ left: `${ap.x}%`, top: `${ap.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={() => selectAP(ap.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Signal rings */}
              {ap.targeted && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border border-[#ff3366]"
                    style={{ width: 80, height: 80, left: -28, top: -28 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-[#ff3366]"
                    style={{ width: 60, height: 60, left: -18, top: -18 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  />
                </>
              )}

              {/* Deauth lightning */}
              {ap.handshakeCaptured && !ap.cracked && (
                <motion.div
                  className="absolute -top-8 left-1/2 -translate-x-1/2"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Zap size={16} className="text-[#ffaa00]" />
                </motion.div>
              )}

              {/* AP icon */}
              <div className={`relative w-6 h-6 rounded-full flex items-center justify-center ${
                ap.cracked ? 'bg-[#00ff41]' :
                ap.handshakeCaptured ? 'bg-[#ffaa00]' :
                ap.targeted ? 'bg-[#ff3366]' :
                'bg-[#1a2d45]'
              }`} style={{
                boxShadow: ap.targeted ? '0 0 15px rgba(255,51,102,0.5)' :
                           ap.handshakeCaptured ? '0 0 15px rgba(255,170,0,0.5)' :
                           ap.cracked ? '0 0 15px rgba(0,255,65,0.5)' : 'none'
              }}>
                <Wifi size={14} className={ap.cracked ? 'text-[#0a0e17]' : 'text-white'} />
              </div>

              {/* Label */}
              <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <p className="text-[9px] text-[#e0f2fe] font-display">{ap.ssid}</p>
                <p className="text-[8px] font-mono" style={{ color: ENCRYPTION_COLORS[ap.encryption] }}>{ap.encryption}</p>
                {ap.cracked && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[8px] text-[#00ff41] font-display"
                  >
                    CRACKED
                  </motion.p>
                )}
              </div>
            </motion.div>
          ))}

          {/* Floor plan outline */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="5" y="5" width="90" height="90" fill="none" stroke="#1a2d45" strokeWidth="0.3" rx="2" />
            <line x1="35" y1="5" x2="35" y2="95" stroke="#1a2d45" strokeWidth="0.2" />
            <line x1="65" y1="5" x2="65" y2="95" stroke="#1a2d45" strokeWidth="0.2" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="#1a2d45" strokeWidth="0.2" />
          </svg>
        </div>

        {/* Control Panel */}
        <div className="space-y-3">
          {/* Attack Tools */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
            <h4 className="text-caption text-[#7da0c4] font-display mb-3">ATTACK TOOLS</h4>
            <div className="space-y-2">
              {ATTACK_TOOLS.map(tool => {
                const isActive = phase === 'scan' && tool.id === 'airodump' ||
                                phase === 'deauth' && tool.id === 'aireplay' ||
                                phase === 'crack' && tool.id === 'aircrack';
                const isSelected = selectedTool === tool.id;
                return (
                  <motion.button
                    key={tool.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => isActive && setSelectedTool(tool.id)}
                    disabled={!isActive || completed}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.1)]'
                        : isActive
                          ? 'border-[#1a2d45] hover:border-[#00d4ff] bg-[#111d2e]'
                          : 'border-transparent bg-[#0a0e17] opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Radio size={14} className={isSelected ? 'text-[#00d4ff]' : isActive ? 'text-[#7da0c4]' : 'text-[#4a6682]'} />
                      <div>
                        <p className={`text-xs font-display ${isSelected ? 'text-[#00d4ff]' : 'text-[#e0f2fe]'}`}>{tool.name}</p>
                        <p className="text-[10px] text-[#4a6682]">{tool.description}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Terminal Output */}
          <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-xl p-3 font-mono text-[10px] h-[140px] overflow-y-auto scrollbar-thin">
            {logLines.map((line, i) => (
              <motion.div
                key={`${i}-${line.substring(0, 20)}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mb-0.5 ${
                  line.includes('[+]') ? 'text-[#00ff41]' :
                  line.includes('[-]') ? 'text-[#ff3366]' :
                  line.includes('KEY FOUND') ? 'text-[#ffaa00] font-bold' :
                  'text-[#7da0c4]'
                }`}
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* Crack Progress */}
          {isCracking && (
            <div className="bg-[#0d1526] border border-[#ffaa00] rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#ffaa00] font-display">CRACKING...</span>
                <span className="text-[10px] text-[#ffaa00] font-display">{Math.round(crackProgress)}%</span>
              </div>
              <div className="h-2 bg-[#1a2d45] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #ffaa00, #ff3366)' }}
                  animate={{ width: `${crackProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
