// @ts-nocheck
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  FlaskConical,
  Cpu,
  MessageSquare,
  BarChart3,
  Layers,
  Shield,
  Terminal,
  Server,
  Lock,
  ChevronDown,
  ChevronRight,
  Search,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface NavItem {
  icon: ReactNode;
  label: string;
  route: string;
  isLinux?: boolean;
}

const mainNavItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', route: '/profile' },
  { icon: <GraduationCap size={20} />, label: 'Classroom', route: '/classroom' },
  { icon: <FlaskConical size={20} />, label: 'Quiz Lab', route: '/quiz' },
  { icon: <Cpu size={20} />, label: 'PBQ Arena', route: '/pbq' },
  { icon: <MessageSquare size={20} />, label: 'Tutor', route: '/tutor' },
  { icon: <BarChart3 size={20} />, label: 'Progress', route: '/progress' },
  { icon: <Layers size={20} />, label: 'Flashcards', route: '/flashcards' },
];

const linuxNavItems: NavItem[] = [
  { icon: <Terminal size={20} />, label: 'LPI 1', route: '/lpi1', isLinux: true },
  { icon: <Server size={20} />, label: 'Linux+ XK0-006', route: '/linux-plus', isLinux: true },
];

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [linuxExpanded, setLinuxExpanded] = useState(false);
  const [linuxPlusUnlocked, setLinuxPlusUnlocked] = useState(false);
  const [lpi1Mastery, setLpi1Mastery] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  /* Check if we're on a Linux route */
  const isLinuxRoute = location.pathname === '/lpi1' || location.pathname === '/linux-plus';

  /* Check unlock state from localStorage */
  useEffect(() => {
    const mastery = parseInt(localStorage.getItem('lpi1_mastery') || '0', 10);
    setLpi1Mastery(mastery);
    setLinuxPlusUnlocked(mastery >= 80);
  }, [location.pathname]);

  const isActive = (route: string) => {
    if (route === '/profile') return location.pathname === '/profile' || location.pathname === '/';
    return location.pathname.startsWith(route);
  };

  return (
    <nav
      className="fixed left-0 top-0 h-[100dvh] bg-[#0d1526] border-r border-[#1a2d45] z-50 flex flex-col transition-all duration-300 ease-[var(--ease-default)]"
      style={{ width: expanded ? 240 : 72 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-4 h-[72px] border-b border-[#1a2d45]">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <Shield size={28} className="text-[#00ff41]" />
        </div>
        <motion.div
          initial={false}
          animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden whitespace-nowrap"
        >
          <span className="font-display font-bold text-lg">
            <span className="text-[#00ff41]">trygit</span>
            <span className="text-[#e0f2fe]">.me</span>
          </span>
        </motion.div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const active = isActive(item.route);
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`
                relative flex items-center gap-3 h-14 px-4 mx-2 rounded-lg
                transition-all duration-200 ease-[var(--ease-default)]
                ${active
                  ? 'text-[#00ff41]'
                  : 'text-[#7da0c4] hover:text-[#e0f2fe] hover:bg-[rgba(0,212,255,0.05)]'
                }
              `}
            >
              {active && (
                <motion.div
                  layoutId="active-nav-border"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#00ff41] rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="flex-shrink-0">{item.icon}</span>
              <motion.span
                initial={false}
                animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
                className="font-body font-medium text-sm whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            </button>
          );
        })}

        {/* ── CySA+ & CASP+ LABS ── */}
        <div className="mt-2 pt-2 border-t border-[#1a2d45]">
          <button
            onClick={() => navigate('/quiz?cert=cysa')}
            className={`
              relative flex items-center gap-3 h-12 px-4 mx-2 rounded-lg w-full
              transition-all duration-200
              ${location.search.includes('cert=cysa')
                ? 'text-[#ec4899]'
                : 'text-[#7da0c4] hover:text-[#e0f2fe] hover:bg-[rgba(0,212,255,0.05)]'
              }
            `}
          >
            {location.search.includes('cert=cysa') && (
              <motion.div
                layoutId="active-nav-border-cysa"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#ec4899] rounded-r-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="flex-shrink-0"><Search size={20} /></span>
            <motion.span
              initial={false}
              animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
              className="font-body font-medium text-sm whitespace-nowrap overflow-hidden flex-1 text-left"
            >
              CySA+ Lab
            </motion.span>
          </button>

          <button
            onClick={() => navigate('/quiz?cert=casp')}
            className={`
              relative flex items-center gap-3 h-12 px-4 mx-2 rounded-lg w-full
              transition-all duration-200
              ${location.search.includes('cert=casp')
                ? 'text-[#14b8a6]'
                : 'text-[#7da0c4] hover:text-[#e0f2fe] hover:bg-[rgba(0,212,255,0.05)]'
              }
            `}
          >
            {location.search.includes('cert=casp') && (
              <motion.div
                layoutId="active-nav-border-casp"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#14b8a6] rounded-r-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="flex-shrink-0"><Lock size={20} /></span>
            <motion.span
              initial={false}
              animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
              className="font-body font-medium text-sm whitespace-nowrap overflow-hidden flex-1 text-left"
            >
              CASP+ Lab
            </motion.span>
          </button>
        </div>

        {/* ── LINUX SECTION ── */}
        <div className="mt-2 pt-2 border-t border-[#1a2d45]">
          {/* Linux Section Header */}
          <button
            onClick={() => expanded && setLinuxExpanded((v) => !v)}
            className={`
              relative flex items-center gap-3 h-12 px-4 mx-2 rounded-lg w-auto
              transition-all duration-200
              ${isLinuxRoute
                ? 'text-[#ff9500]'
                : 'text-[#7da0c4] hover:text-[#e0f2fe] hover:bg-[rgba(0,212,255,0.05)]'
              }
            `}
          >
            {isLinuxRoute && (
              <motion.div
                layoutId="active-nav-border-linux"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#ff9500] rounded-r-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="flex-shrink-0"><Terminal size={20} /></span>
            <motion.span
              initial={false}
              animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
              className="font-body font-medium text-sm whitespace-nowrap overflow-hidden flex-1 text-left"
            >
              Linux
            </motion.span>
            {expanded && (
              <motion.span
                initial={false}
                animate={{ opacity: expanded ? 1 : 0 }}
                className="flex-shrink-0"
              >
                {linuxExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </motion.span>
            )}
          </button>

          {/* Linux Sub-items */}
          <AnimatePresence>
            {(linuxExpanded || isLinuxRoute) && expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {linuxNavItems.map((item) => {
                  const active = isActive(item.route);
                  const isLocked = item.route === '/linux-plus' && !linuxPlusUnlocked;

                  return (
                    <button
                      key={item.route}
                      onClick={() => !isLocked && navigate(item.route)}
                      className={`
                        relative flex items-center gap-3 h-11 px-4 mx-2 rounded-lg w-full
                        transition-all duration-200
                        ${isLocked
                          ? 'opacity-50 cursor-not-allowed text-[#4a6682]'
                          : active
                            ? 'text-[#ff9500]'
                            : 'text-[#7da0c4] hover:text-[#e0f2fe] hover:bg-[rgba(0,212,255,0.05)]'
                        }
                      `}
                      title={isLocked ? `Linux+ XK0-006: 80% LPI 1 Mastery benoetigt (aktuell: ${lpi1Mastery}%)` : item.label}
                    >
                      <span className="flex-shrink-0 ml-2">{item.icon}</span>
                      <span className="font-body text-sm whitespace-nowrap overflow-hidden flex-1 text-left">
                        {item.label}
                      </span>
                      {isLocked && (
                        <span className="flex-shrink-0 flex items-center gap-1" title={`${lpi1Mastery}% / 80% benoetigt`}>
                          <Lock size={12} className="text-[#4a6682]" />
                          <span className="text-[10px] text-[#4a6682] font-terminal">80%</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed state: show indicators for Linux items */}
          {!expanded && (
            <>
              {linuxNavItems.map((item) => {
                const active = isActive(item.route);
                const isLocked = item.route === '/linux-plus' && !linuxPlusUnlocked;

                return (
                  <button
                    key={item.route}
                    onClick={() => !isLocked && navigate(item.route)}
                    className={`
                      relative flex items-center justify-center h-10 mx-2 rounded-lg w-auto
                      transition-all duration-200
                      ${isLocked
                        ? 'opacity-40 cursor-not-allowed'
                        : active
                          ? 'text-[#ff9500]'
                          : 'text-[#7da0c4] hover:text-[#e0f2fe] hover:bg-[rgba(0,212,255,0.05)]'
                      }
                    `}
                    title={isLocked ? `Linux+ Locked: 80% LPI 1 required (${lpi1Mastery}%)` : item.label}
                  >
                    {active && (
                      <motion.div
                        layoutId="active-nav-border-linux-collapsed"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#ff9500] rounded-r-full"
                      />
                    )}
                    <span className="flex-shrink-0 relative">
                      {item.icon}
                      {isLocked && (
                        <Lock size={8} className="absolute -bottom-0.5 -right-0.5 text-[#4a6682]" />
                      )}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-[#1a2d45] py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#162236] border-2 border-[#00ff41] flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-xs text-[#00ff41]">N</span>
          </div>
          <motion.div
            initial={false}
            animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            <div className="font-display font-medium text-xs text-[#00ff41]">4200 XP</div>
            <div className="text-caption text-[#4a6682]">Level 5</div>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
