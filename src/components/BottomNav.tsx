import React from 'react';
import { 
  Home, 
  Table,
  CalendarDays, 
  PlusCircle, 
  Trophy, 
  BarChart3, 
  Users 
} from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavProps {
  activeTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  onOpenQuickDuty: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenQuickDuty,
}) => {
  const tabs = [
    { id: 'dashboard' as NavigationTab, label: 'Home', icon: Home },
    { id: 'activity_matrix' as NavigationTab, label: 'Activity', icon: Table },
    { id: 'schedule' as NavigationTab, label: 'Schedule', icon: CalendarDays },
    { id: 'duty' as NavigationTab, label: 'Duty', icon: PlusCircle, isSpecial: true },
    { id: 'points' as NavigationTab, label: 'Points', icon: Trophy },
    { id: 'volunteers' as NavigationTab, label: 'Volunteers', icon: Users },
    { id: 'records' as NavigationTab, label: 'Log', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-1 sm:px-2 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-xl mx-auto flex items-center justify-around py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onChangeTab('duty');
                }}
                id={`bottom-nav-${tab.id}`}
                className="relative -top-2 flex flex-col items-center group focus:outline-hidden"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-700/30 group-active:scale-95 transition-transform">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-teal-800 tracking-tight mt-0.5">
                  + Record
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              id={`bottom-nav-${tab.id}`}
              className={`flex flex-col items-center justify-center min-w-[42px] sm:min-w-[48px] py-1 px-1 rounded-lg transition-colors min-h-[46px] ${
                isActive
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-md transition-colors ${isActive ? 'bg-teal-50 text-teal-700' : ''}`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

