import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Wrench, Settings, GraduationCap } from 'lucide-react';
import { getClassroomStaff } from '../services/orchestrator';
import { getProfessorById } from '../services/professor-data';
import { getTutorById } from '../services/tutor-data';
import { getOrganizerForCert } from '../services/organizer-data';

interface ClassroomTeamProps {
  certification: string;
}

export function ClassroomTeam({ certification }: ClassroomTeamProps) {
  const staff = getClassroomStaff(certification);
  if (!staff) return null;

  const prof1 = getProfessorById(staff.professor1);
  const prof2 = getProfessorById(staff.professor2);
  const tutor1 = getTutorById(staff.tutor1);
  const tutor2 = getTutorById(staff.tutor2);
  const organizer = getOrganizerForCert(certification);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#0d1526] to-[#162236] border border-[#1a2d45] rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Users size={24} className="text-[#00ff41]" />
        <h3 className="text-xl font-bold text-[#e0f2fe]">
          Your {staff.certification} Team
        </h3>
        <span className="text-xs text-[#7da0c4] bg-[#162236] px-2 py-1 rounded-full">
          5 Agents
        </span>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Professor 1 -- Lead */}
        <TeamCard
          icon={GraduationCap}
          role="Lead Professor"
          name={prof1?.name || staff.professor1}
          color={prof1?.color || '#00ff41'}
          description="Domain expert, curriculum design, assessment"
          accent="border-t-2"
        />

        {/* Professor 2 -- Support */}
        <TeamCard
          icon={GraduationCap}
          role="Support Professor"
          name={prof2?.name || staff.professor2}
          color={prof2?.color || '#00d4ff'}
          description="Lab design, mentoring, exam strategy"
          accent="border-t-2"
        />

        {/* Tutor 1 -- Theory */}
        <TeamCard
          icon={BookOpen}
          role="Theory Tutor"
          name={tutor1?.name || staff.tutor1}
          color={tutor1?.color || '#8b5cf6'}
          description="Concept explanation, weakness fixing, 1-on-1"
          accent="border-l-2"
        />

        {/* Tutor 2 -- Practice */}
        <TeamCard
          icon={Wrench}
          role="Practice Tutor"
          name={tutor2?.name || staff.tutor2}
          color={tutor2?.color || '#f472b6'}
          description="Hands-on labs, tool training, PBQ guidance"
          accent="border-l-2"
        />

        {/* Organizer -- Full width on mobile, spans on larger */}
        <TeamCard
          icon={Settings}
          role="Background Organizer"
          name={organizer?.name || 'Auto Organizer'}
          color={organizer?.color || '#6b7280'}
          description="Progress tracking, adaptive scheduling, interventions"
          accent="border-2 border-dashed"
          className="md:col-span-2 lg:col-span-1"
          isOrganizer
        />
      </div>
    </motion.div>
  );
}

// Individual team member card
function TeamCard({
  icon: Icon,
  role,
  name,
  color,
  description,
  accent = '',
  className = '',
  isOrganizer = false,
}: {
  icon: LucideIcon;
  role: string;
  name: string;
  color: string;
  description: string;
  accent?: string;
  className?: string;
  isOrganizer?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-[#0a0e17]/60 rounded-lg p-4 ${accent} ${className} ${
        isOrganizer ? 'opacity-80' : ''
      }`}
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={20} color={color} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide" style={{ color }}>{role}</div>
          <div className="text-[#e0f2fe] font-semibold text-sm">{name}</div>
        </div>
      </div>
      <p className="text-xs text-[#7da0c4] mt-2">{description}</p>
    </motion.div>
  );
}
