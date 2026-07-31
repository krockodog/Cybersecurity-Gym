import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, CheckCircle, XCircle, Terminal, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const containerLabMetadata: PBQMetadata = {
  id: 'container-lab',
  title: 'Container Management Lab',
  description: 'Manage containers with Docker: build images, run containers, configure networking, manage volumes, and orchestrate with compose.',
  difficulty: 3,
  category: 'Linux+',
  tags: ['docker', 'containers', 'compose', 'volumes', 'networking'],
  xpReward: 50,
  estimatedTime: '8 min',
};

interface Scenario {
  id: string;
  title: string;
  prompt: string;
  terminalOutput: string;
  options: { id: string; label: string; command: string }[];
  correctId: string;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'build-image',
    title: 'Build a Container Image',
    prompt: 'Build a Docker image from a Dockerfile in the current directory, tagging it as "webapp:v2.1" for deployment.',
    terminalOutput: '$ ls\nDockerfile  app.py  requirements.txt  static/\n\n$ cat Dockerfile\nFROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nEXPOSE 8080\nCMD ["python", "app.py"]',
    options: [
      { id: 'a', label: 'docker build -t webapp:v2.1 .', command: 'docker build -t webapp:v2.1 .' },
      { id: 'b', label: 'docker create webapp:v2.1', command: 'docker create --name webapp:v2.1 .' },
      { id: 'c', label: 'docker image build webapp', command: 'docker image build webapp v2.1' },
      { id: 'd', label: 'docker compose build webapp', command: 'docker compose build webapp:v2.1' },
    ],
    correctId: 'a',
    explanation: 'docker build -t tags the image with a name:tag format. The "." specifies the build context (current directory) where Docker looks for the Dockerfile and files to COPY.',
  },
  {
    id: 'run-container',
    title: 'Run with Port Mapping and Volume',
    prompt: 'Run the webapp container in detached mode, mapping host port 80 to container port 8080, and mount /data on the host to /app/data in the container.',
    terminalOutput: '$ docker images\nREPOSITORY   TAG     IMAGE ID       CREATED        SIZE\nwebapp       v2.1    a1b2c3d4e5f6   2 minutes ago  180MB\n\n$ ls /data\nconfig.json  database.db',
    options: [
      { id: 'a', label: 'docker run -d -p 80:8080 -v /data:/app/data webapp:v2.1', command: 'docker run -d -p 80:8080 -v /data:/app/data webapp:v2.1' },
      { id: 'b', label: 'docker run -p 8080:80 -v /data:/app/data webapp:v2.1', command: 'docker run -p 8080:80 -v /data:/app/data webapp:v2.1' },
      { id: 'c', label: 'docker start webapp -p 80:8080', command: 'docker start webapp -p 80:8080 -v /data:/app/data' },
      { id: 'd', label: 'docker run -d --expose 80 webapp:v2.1', command: 'docker run -d --expose 80 --mount /data webapp:v2.1' },
    ],
    correctId: 'a',
    explanation: 'The -d flag runs in detached mode, -p host:container maps ports (80 on host to 8080 in container), and -v host:container creates a bind mount for persistent data.',
  },
  {
    id: 'docker-network',
    title: 'Create Custom Network',
    prompt: 'Create a user-defined bridge network so two containers (webapp and redis) can communicate by container name.',
    terminalOutput: '$ docker network ls\nNETWORK ID     NAME      DRIVER    SCOPE\n1a2b3c4d5e6f   bridge    bridge    local\n7g8h9i0j1k2l   host      host      local\n3m4n5o6p7q8r   none      null      local\n\nContainers on the default bridge cannot resolve each other by name.',
    options: [
      { id: 'a', label: 'Create network and connect both', command: 'docker network create app-net && docker run -d --network app-net --name webapp webapp:v2.1 && docker run -d --network app-net --name redis redis:7' },
      { id: 'b', label: 'Use --link flag', command: 'docker run -d --name webapp --link redis:redis webapp:v2.1' },
      { id: 'c', label: 'Use host networking', command: 'docker run -d --network host --name webapp webapp:v2.1' },
      { id: 'd', label: 'Edit /etc/hosts in container', command: 'docker exec webapp sh -c "echo 172.17.0.3 redis >> /etc/hosts"' },
    ],
    correctId: 'a',
    explanation: 'User-defined bridge networks provide automatic DNS resolution between containers by name. The default bridge network does not support this. --link is deprecated.',
  },
  {
    id: 'manage-volumes',
    title: 'Manage Named Volumes',
    prompt: 'A database container crashed and lost its data. Set up a named volume so PostgreSQL data persists across container restarts and removals.',
    terminalOutput: '$ docker ps -a\nCONTAINER ID   IMAGE         STATUS                    NAMES\nc1d2e3f4a5b6   postgres:15   Exited (137) 5 min ago    db\n\n$ docker volume ls\nDRIVER    VOLUME NAME\n(no volumes)',
    options: [
      { id: 'a', label: 'Named volume for pgdata', command: 'docker volume create pgdata && docker run -d --name db -v pgdata:/var/lib/postgresql/data postgres:15' },
      { id: 'b', label: 'Tmpfs mount', command: 'docker run -d --name db --tmpfs /var/lib/postgresql/data postgres:15' },
      { id: 'c', label: 'Copy from container', command: 'docker cp db:/var/lib/postgresql/data ./pgdata' },
      { id: 'd', label: 'Docker commit', command: 'docker commit db postgres:15-with-data' },
    ],
    correctId: 'a',
    explanation: 'Named volumes are managed by Docker and persist beyond container lifecycle. Mounting to /var/lib/postgresql/data ensures database files survive container removal.',
  },
  {
    id: 'compose-stack',
    title: 'Docker Compose Stack',
    prompt: 'A docker-compose.yml defines webapp, redis, and postgres services. Which command starts the entire stack in the background and rebuilds changed images?',
    terminalOutput: '$ cat docker-compose.yml\nservices:\n  webapp:\n    build: .\n    ports:\n      - "80:8080"\n    depends_on:\n      - redis\n      - postgres\n  redis:\n    image: redis:7-alpine\n  postgres:\n    image: postgres:15\n    volumes:\n      - pgdata:/var/lib/postgresql/data\nvolumes:\n  pgdata:',
    options: [
      { id: 'a', label: 'docker compose up -d --build', command: 'docker compose up -d --build' },
      { id: 'b', label: 'docker compose start', command: 'docker compose start' },
      { id: 'c', label: 'docker compose run all', command: 'docker compose run --detach all' },
      { id: 'd', label: 'docker compose create && start', command: 'docker compose create && docker compose start' },
    ],
    correctId: 'a',
    explanation: 'docker compose up -d starts all services in detached mode. The --build flag forces a rebuild of images defined with "build:" before starting, ensuring code changes are applied.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function ContainerLabPBQ({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const scenario = SCENARIOS[step];

  const handleSelect = useCallback((optionId: string) => {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    const correct = optionId === scenario.correctId;
    const newResults = [...results, correct];
    setResults(newResults);
    if (correct) setStreak(s => s + 1); else setStreak(0);
    const newScore = Math.round((newResults.filter(Boolean).length / SCENARIOS.length) * 100);
    setScore(newScore);
    if (step === SCENARIOS.length - 1) { setCompleted(true); onComplete?.(newScore); }
  }, [answered, scenario, results, step, onComplete]);

  const handleNext = useCallback(() => {
    if (step < SCENARIOS.length - 1) { setStep(s => s + 1); setSelected(null); setAnswered(false); }
  }, [step]);

  const handleReset = useCallback(() => {
    setStep(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setStreak(0);
    setCompleted(false);
    setResults([]);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Container size={16} className="text-[#ff9500]" />
          <span className="text-sm text-[#7da0c4] font-semibold">Container Management Lab</span>
        </div>
        <ProgressTracker current={step + (answered ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[rgba(255,149,0,0.15)] text-[#ff9500] rounded text-xs font-semibold">
                Step {step + 1}/{SCENARIOS.length}
              </span>
              <h3 className="text-sm text-[#e0f2fe] font-semibold">{scenario.title}</h3>
            </div>
            <p className="text-sm text-[#c8dce8] mb-4">{scenario.prompt}</p>

            <div className="bg-[#050d18] border border-[#1a2d45] rounded-lg p-3 mb-4 font-mono text-xs text-[#00ff41] whitespace-pre-wrap">
              <div className="flex items-center gap-2 mb-2 text-[#4a6682]">
                <Terminal size={12} />
                <span>Terminal Output</span>
              </div>
              {scenario.terminalOutput}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scenario.options.map(option => {
                const isSelected = selected === option.id;
                const isCorrect = option.id === scenario.correctId;
                let borderColor = '#1a2d45';
                let bgColor = '#111d2e';
                if (answered) {
                  if (isCorrect) { borderColor = '#00ff41'; bgColor = 'rgba(0,255,65,0.05)'; }
                  else if (isSelected) { borderColor = '#ff3366'; bgColor = 'rgba(255,51,102,0.05)'; }
                }
                return (
                  <motion.button
                    key={option.id}
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(option.id)}
                    disabled={answered}
                    className="p-3 rounded-lg border text-left transition-all"
                    style={{ borderColor, backgroundColor: bgColor }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {answered && isCorrect && <CheckCircle size={14} className="text-[#00ff41]" />}
                      {answered && isSelected && !isCorrect && <XCircle size={14} className="text-[#ff3366]" />}
                      <span className="text-xs text-[#e0f2fe] font-semibold">{option.label}</span>
                    </div>
                    <code className="text-[10px] text-[#7da0c4] font-mono">{option.command}</code>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4">
                <p className="text-sm text-[#c8dce8]">{scenario.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e0f2fe] font-semibold">Lab Complete</p>
                  <p className="text-xs text-[#7da0c4]">
                    You scored {score}% ({results.filter(Boolean).length}/{SCENARIOS.length} correct)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold" style={{ color: score >= 80 ? '#00ff41' : score >= 60 ? '#ffaa00' : '#ff3366' }}>
                    {score}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end gap-3">
            {completed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1a2d45] text-[#7da0c4] text-sm hover:border-[#ff9500] transition-colors"
              >
                <RotateCcw size={14} />
                Retry
              </motion.button>
            )}
            {answered && !completed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff9500] text-[#0a1628] text-sm font-semibold hover:brightness-110 transition-all"
              >
                Next
                <ChevronRight size={14} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
