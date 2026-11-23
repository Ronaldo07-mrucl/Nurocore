import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationDestination } from '../../types';
import { BottomStudyTargetPanel } from './BottomStudyTargetPanel';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Dumbbell,
  CheckSquare,
  Calendar,
  BarChart3,
  Brain,
} from 'lucide-react';

interface NavItem {
  id: NavigationDestination;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'study-log', label: 'Study Log', icon: BookOpen },
  { id: 'test-error-log', label: 'Test & Error Log', icon: ClipboardCheck },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'habit-tracking', label: 'Habit Tracking', icon: CheckSquare },
  { id: 'planning', label: 'Planning', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'reflection', label: 'Reflection', icon: Brain },
];

export const RightNavRail: React.FC = () => {
  const { activePage, setActivePage, activeTestDetailId, returnToDashboard } = useApp();

  const handleNavClick = (id: NavigationDestination) => {
    if (activeTestDetailId) {
      returnToDashboard();
    }
    setActivePage(id);
  };

  return (
    <aside
      className="w-16 md:w-56 shrink-0 bg-[#14141D] border-l border-[#292936] flex flex-col justify-between h-screen sticky top-0 z-30 transition-all select-none"
      aria-label="Application navigation rail"
    >
      {/* Top Branding */}
      <div className="h-16 md:h-20 shrink-0 flex items-center justify-center px-1.5 md:px-2 border-b border-[#292936] overflow-hidden">
        {/* Compact brain icon for collapsed mobile rail */}
        <div className="md:hidden w-12 h-12 overflow-hidden relative shrink-0">
          <img
            src="/assets/aistudio/Neurocore_Futuristic_Brain_Logo_cf4bb19f.png"
            alt="NEUROCORE"
            className="h-[68px] max-w-none absolute left-[-13px] top-1/2 -translate-y-1/2 mix-blend-screen"
          />
        </div>

        {/* Full horizontal logo for desktop rail */}
        <img
          src="Nurocore/src/assets/images/Neurocore_Logo.png"
          alt="NEUROCORE"
          className="hidden md:block w-full h-16 object-contain scale-[1.22] mix-blend-screen"
        />
      </div>

      {/* Navigation Links (Scrollable if screen height is constrained) */}
      <nav className="flex-1 overflow-y-auto p-2 md:p-3 space-y-1.5 min-h-0">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id && !activeTestDetailId;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-2.5 md:px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-[#9B7BFF]/15 text-[#9B7BFF] font-semibold border border-[#9B7BFF]/30'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] border border-transparent'
              }`}
              title={item.label}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-[#9B7BFF]' : 'text-[#8E8EA0] group-hover:text-[#F3F3F7]'
                }`}
              />
              <span className="hidden md:inline truncate">{item.label}</span>

              {/* Subtle active pill indicator on right */}
              {isActive && (
                <span
                  className="absolute right-0 top-2 bottom-2 w-1 bg-[#9B7BFF] rounded-l-full hidden md:block"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Fixed Bottom Section: Study Target Widget & Status */}
      <div className="shrink-0 border-t border-[#292936] bg-[#14141D] p-2 md:p-3 space-y-2">
        <BottomStudyTargetPanel />

        <div className="hidden md:flex px-2.5 py-1.5 rounded-lg bg-[#0B0B10]/70 border border-[#292936] items-center justify-between text-[11px] text-[#8E8EA0]">
          <span className="truncate">Local Vault</span>
          <span className="text-[10px] text-[#43D9A3] font-mono">ACTIVE</span>
        </div>
      </div>
    </aside>
  );
};

