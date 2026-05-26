import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useTTS } from '../hooks/useTTS';

interface SpeakerButtonProps {
  text: string;
  size?: number;
  professorId?: string;
}

export function SpeakerButton({ text, size = 18, professorId }: SpeakerButtonProps) {
  const { speaking, loading, speak, stop } = useTTS(professorId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speaking || loading) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex-shrink-0 p-2 rounded-[8px] bg-[#111d2e] border border-[#1a2d45] text-[#00d4ff] hover:border-[#00d4ff] transition-all disabled:opacity-50"
      title={speaking ? 'Stop speaking' : loading ? 'Loading voice...' : 'Read aloud'}
      disabled={!text.trim()}
    >
      {loading ? (
        <Loader2 size={size} className="animate-spin" />
      ) : speaking ? (
        <VolumeX size={size} />
      ) : (
        <Volume2 size={size} />
      )}
    </button>
  );
}
