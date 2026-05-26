export default function Footer() {
  return (
    <footer className="border-t border-[#1a2d45] bg-[#0d1526] py-6 px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm">
            <span className="text-[#00ff41]">trygit</span>
            <span className="text-[#7da0c4]">.me</span>
          </span>
          <span className="text-[#4a6682] text-xs">|</span>
          <span className="text-[#4a6682] text-xs font-body">
            Cybersecurity Gymnasium
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-caption text-[#4a6682]">
            CompTIA PenTest+ PT0-003
          </span>
          <span className="text-caption text-[#4a6682]">
            727 Questions
          </span>
          <span className="text-caption text-[#4a6682]">
            v1.0.0
          </span>
        </div>

        <div className="text-caption text-[#4a6682]">
          &copy; 2025 trygit.me. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
