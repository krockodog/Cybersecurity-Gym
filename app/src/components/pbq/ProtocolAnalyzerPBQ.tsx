import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, CheckCircle, XCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const protocolAnalyzerMetadata: PBQMetadata = {
  id: 'protocol-analyzer',
  title: 'Protocol Analyzer Lab',
  description: 'Analyze packet captures to identify protocols, flags, endpoints, and anomalies across TCP, DNS, HTTP, ARP, and ICMP traffic.',
  difficulty: 3,
  category: 'Network+',
  tags: ['packet-capture', 'wireshark', 'protocols', 'analysis'],
  xpReward: 55,
  estimatedTime: '10 min',
};

interface PacketQuestion {
  id: string;
  label: string;
  options: string[];
  correct: number;
}

interface PacketScenario {
  id: number;
  title: string;
  protocol: string;
  capture: string[];
  questions: PacketQuestion[];
}

const SCENARIOS: PacketScenario[] = [
  {
    id: 1, title: 'TCP Three-Way Handshake', protocol: 'TCP',
    capture: [
      'No.  Time       Source          Destination     Protocol  Info',
      '1    0.000000   192.168.1.10    10.0.0.5        TCP       54872 > 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
      '2    0.000342   10.0.0.5        192.168.1.10    TCP       443 > 54872 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0',
      '3    0.000567   192.168.1.10    10.0.0.5        TCP       54872 > 443 [ACK] Seq=1 Ack=1 Win=64240 Len=0',
    ],
    questions: [
      { id: '1a', label: 'What protocol is being used?', options: ['UDP', 'TCP', 'ICMP', 'ARP'], correct: 1 },
      { id: '1b', label: 'Which packet initiates the connection?', options: ['SYN, ACK', 'ACK', 'SYN', 'FIN'], correct: 2 },
      { id: '1c', label: 'What destination port is targeted?', options: ['54872', '80', '443', '22'], correct: 2 },
      { id: '1d', label: 'Is this traffic normal or anomalous?', options: ['Normal handshake', 'SYN flood', 'Port scan', 'RST attack'], correct: 0 },
    ],
  },
  {
    id: 2, title: 'DNS Query & Response', protocol: 'DNS',
    capture: [
      'No.  Time       Source          Destination     Protocol  Info',
      '1    0.000000   192.168.1.10    8.8.8.8         DNS       Standard query A www.example.com',
      '2    0.023411   8.8.8.8         192.168.1.10    DNS       Standard query response A 93.184.216.34',
    ],
    questions: [
      { id: '2a', label: 'What type of DNS record is queried?', options: ['AAAA', 'MX', 'CNAME', 'A'], correct: 3 },
      { id: '2b', label: 'What is the DNS resolver address?', options: ['192.168.1.10', '93.184.216.34', '8.8.8.8', '1.1.1.1'], correct: 2 },
      { id: '2c', label: 'What transport protocol does DNS use here?', options: ['TCP', 'UDP', 'ICMP', 'HTTP'], correct: 1 },
      { id: '2d', label: 'What is the resolved IP address?', options: ['8.8.8.8', '192.168.1.10', '10.0.0.1', '93.184.216.34'], correct: 3 },
    ],
  },
  {
    id: 3, title: 'HTTP GET Request', protocol: 'HTTP',
    capture: [
      'No.  Time       Source          Destination     Protocol  Info',
      '1    0.000000   192.168.1.10    203.0.113.50    HTTP      GET /api/users HTTP/1.1',
      '      Host: api.example.com',
      '      User-Agent: Mozilla/5.0',
      '      Authorization: Bearer eyJhbGciOi...',
      '2    0.045200   203.0.113.50    192.168.1.10    HTTP      HTTP/1.1 200 OK (application/json)',
    ],
    questions: [
      { id: '3a', label: 'What HTTP method is used?', options: ['POST', 'PUT', 'GET', 'DELETE'], correct: 2 },
      { id: '3b', label: 'What authentication method is present?', options: ['Basic Auth', 'Bearer Token', 'API Key', 'No Auth'], correct: 1 },
      { id: '3c', label: 'What is the server response code?', options: ['301', '404', '200', '403'], correct: 2 },
      { id: '3d', label: 'What security concern exists?', options: ['SQL injection', 'Token in cleartext HTTP', 'XSS payload', 'No concern'], correct: 1 },
    ],
  },
  {
    id: 4, title: 'ARP Request & Reply', protocol: 'ARP',
    capture: [
      'No.  Time       Source              Destination         Protocol  Info',
      '1    0.000000   aa:bb:cc:11:22:33   ff:ff:ff:ff:ff:ff   ARP       Who has 192.168.1.1? Tell 192.168.1.10',
      '2    0.000812   dd:ee:ff:44:55:66   aa:bb:cc:11:22:33   ARP       192.168.1.1 is at dd:ee:ff:44:55:66',
      '3    0.001200   dd:ee:ff:44:55:66   aa:bb:cc:11:22:33   ARP       192.168.1.1 is at dd:ee:ff:44:55:66',
      '4    0.001300   dd:ee:ff:44:55:66   aa:bb:cc:11:22:33   ARP       192.168.1.1 is at dd:ee:ff:44:55:66',
    ],
    questions: [
      { id: '4a', label: 'What does ff:ff:ff:ff:ff:ff represent?', options: ['Unicast', 'Multicast', 'Broadcast', 'Loopback'], correct: 2 },
      { id: '4b', label: 'What OSI layer does ARP operate at?', options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'], correct: 1 },
      { id: '4c', label: 'What anomaly is present in this capture?', options: ['Normal ARP', 'Gratuitous ARP', 'ARP spoofing (duplicate replies)', 'ARP timeout'], correct: 2 },
      { id: '4d', label: 'What attack could this indicate?', options: ['DNS poisoning', 'Man-in-the-Middle', 'DDoS', 'Brute force'], correct: 1 },
    ],
  },
  {
    id: 5, title: 'ICMP Traffic Analysis', protocol: 'ICMP',
    capture: [
      'No.  Time       Source          Destination     Protocol  Info',
      '1    0.000000   192.168.1.10    10.0.0.5        ICMP      Echo (ping) request  id=0x1234 seq=1 ttl=64 len=64',
      '2    0.003200   10.0.0.5        192.168.1.10    ICMP      Echo (ping) reply    id=0x1234 seq=1 ttl=62 len=64',
      '3    0.100000   192.168.1.10    10.0.0.5        ICMP      Echo (ping) request  id=0x1234 seq=2 ttl=64 len=1500',
      '4    0.100000   192.168.1.10    10.0.0.5        ICMP      Echo (ping) request  id=0x1234 seq=3 ttl=64 len=1500',
      '5    0.100001   192.168.1.10    10.0.0.5        ICMP      Echo (ping) request  id=0x1234 seq=4 ttl=64 len=1500',
    ],
    questions: [
      { id: '5a', label: 'How many routers are between source and dest?', options: ['0', '1', '2', '3'], correct: 2 },
      { id: '5b', label: 'What changed in packets 3-5?', options: ['TTL decreased', 'Payload size increased', 'Destination changed', 'Protocol changed'], correct: 1 },
      { id: '5c', label: 'What attack might packets 3-5 indicate?', options: ['Ping of Death', 'ICMP flood', 'Smurf attack', 'Traceroute'], correct: 1 },
      { id: '5d', label: 'What is the ICMP type for echo request?', options: ['Type 0', 'Type 3', 'Type 8', 'Type 11'], correct: 2 },
    ],
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function ProtocolAnalyzerPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const [stepScores, setStepScores] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const scenario = SCENARIOS[currentStep];
  const isLastStep = currentStep === SCENARIOS.length - 1;
  const isComplete = isLastStep && checked;

  const handleSelect = useCallback((questionId: string, optionIdx: number) => {
    if (checked) return;
    setSelections(prev => ({ ...prev, [questionId]: optionIdx }));
  }, [checked]);

  const checkAnswers = useCallback(() => {
    let correct = 0;
    scenario.questions.forEach(q => {
      if (selections[q.id] === q.correct) correct++;
    });
    const stepScore = Math.round((correct / scenario.questions.length) * 100);
    setStepScores(prev => [...prev, stepScore]);
    setStreak(stepScore === 100 ? streak + 1 : 0);
    setChecked(true);

    if (isLastStep) {
      const allScores = [...stepScores, stepScore];
      const finalScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      setScore(finalScore);
      onComplete?.(finalScore);
    }
  }, [scenario, selections, isLastStep, stepScores, streak, onComplete]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
    setChecked(false);
  }, []);

  const allAnswered = scenario.questions.every(q => selections[q.id] !== undefined);
  const totalScore = stepScores.length > 0
    ? Math.round(stepScores.reduce((a, b) => a + b, 0) / stepScores.length)
    : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-[#00d4ff]" />
          <span className="text-caption text-[#7da0c4] font-display">Protocol Analyzer</span>
        </div>
        <ProgressTracker current={currentStep + (checked ? 1 : 0)} total={SCENARIOS.length} score={totalScore} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
          {/* Scenario Header */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-[#00d4ff]" />
              <span className="text-xs text-[#00d4ff] font-display">CAPTURE {scenario.id}/{SCENARIOS.length}: {scenario.title}</span>
            </div>
            <span className="text-[10px] text-[#4a6682] font-display">Protocol: {scenario.protocol}</span>
          </div>

          {/* Packet Capture Display */}
          <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-xl p-4 mb-4 overflow-x-auto">
            <div className="font-mono text-[11px] leading-relaxed whitespace-pre min-w-[500px]">
              {scenario.capture.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`${i === 0 ? 'text-[#4a6682] border-b border-[#1a2d45] pb-1 mb-1' : 'text-[#c8dce8]'}`}
                >
                  {line.includes('SYN') || line.includes('request') || line.includes('query') || line.includes('GET') || line.includes('Who has') ? (
                    <span className="text-[#00d4ff]">{line}</span>
                  ) : line.includes('ACK') || line.includes('response') || line.includes('reply') || line.includes('200') || line.includes('is at') ? (
                    <span className="text-[#00ff41]">{line}</span>
                  ) : line.includes('Authorization') || line.includes('Bearer') ? (
                    <span className="text-[#ffaa00]">{line}</span>
                  ) : (
                    line
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenario.questions.map((q, qi) => {
              const selected = selections[q.id];
              const isCorrect = checked && selected === q.correct;
              const isWrong = checked && selected !== undefined && selected !== q.correct;

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qi * 0.1 }}
                  className={`bg-[#0d1526] border rounded-xl p-4 ${
                    isCorrect ? 'border-[#00ff41]' : isWrong ? 'border-[#ff3366]' : 'border-[#1a2d45]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#c8dce8] font-display">{q.label}</span>
                    {checked && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        {isCorrect ? <CheckCircle size={14} className="text-[#00ff41]" /> : <XCircle size={14} className="text-[#ff3366]" />}
                      </motion.div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const isSelected = selected === oi;
                      const isAnswer = checked && oi === q.correct;
                      return (
                        <button
                          key={oi}
                          onClick={() => handleSelect(q.id, oi)}
                          disabled={checked}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-display transition-all border ${
                            isAnswer
                              ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)] text-[#00ff41]'
                              : isSelected && isWrong
                                ? 'border-[#ff3366] bg-[rgba(255,51,102,0.1)] text-[#ff3366]'
                                : isSelected
                                  ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.1)] text-[#00d4ff]'
                                  : 'border-[#1a2d45] text-[#7da0c4] hover:border-[#00d4ff] hover:text-[#c8dce8]'
                          } disabled:cursor-default`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-3">
            {!checked ? (
              <button
                onClick={checkAnswers}
                disabled={!allAnswered}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm font-display uppercase hover:bg-[#00ff41] hover:text-[#0a1628] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Analyze <Search size={14} />
              </button>
            ) : !isLastStep ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#00d4ff] rounded-lg text-[#00d4ff] text-sm font-display uppercase hover:bg-[#00d4ff] hover:text-[#0a1628] transition-all"
              >
                Next Capture <ChevronRight size={14} />
              </button>
            ) : null}
          </div>

          {/* Final Results */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 border rounded-xl p-5 ${totalScore >= 80 ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]' : 'border-[#ffaa00] bg-[rgba(255,170,0,0.05)]'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {totalScore >= 80 ? <CheckCircle size={18} className="text-[#00ff41]" /> : <AlertTriangle size={18} className="text-[#ffaa00]" />}
                <span className={`font-display font-bold text-sm ${totalScore >= 80 ? 'text-[#00ff41]' : 'text-[#ffaa00]'}`}>
                  Analysis Complete: {totalScore}%
                </span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {stepScores.map((s, i) => (
                  <div key={i} className={`px-2 py-1 rounded text-[10px] font-display border ${
                    s === 100 ? 'border-[#00ff41] text-[#00ff41]' : s >= 50 ? 'border-[#ffaa00] text-[#ffaa00]' : 'border-[#ff3366] text-[#ff3366]'
                  }`}>
                    {SCENARIOS[i].protocol}: {s}%
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
