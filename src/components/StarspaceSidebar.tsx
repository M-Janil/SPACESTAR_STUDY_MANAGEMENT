'use client';

import React from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  LayoutDashboard, 
  Timer, 
  BookOpen, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  History, 
  BarChart3, 
  Award, 
  Settings, 
  Flame, 
  X,
  Sparkles
} from 'lucide-react';

interface StarspaceSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function StarspaceSidebar({ isMobileOpen, onCloseMobile }: StarspaceSidebarProps) {
  const { 
    activeTab, 
    setActiveTab, 
    subjects, 
    tasks, 
    achievements, 
    currentStreak, 
    todayMinutes, 
    settings 
  } = useStarspace();

  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;
  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'timer', label: 'Study Timer', icon: Timer, badge: null },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen, badge: subjects.length },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : null },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, badge: null },
    { id: 'history', label: 'Study History', icon: History, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'achievements', label: 'Achievements', icon: Award, badge: unlockedAchievementsCount },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const todayHours = Math.round((todayMinutes / 60) * 10) / 10;
  const dailyGoalHours = settings.dailyGoalHours || 0;
  const dailyProgressPercent = dailyGoalHours > 0 ? Math.min(100, Math.round((todayHours / dailyGoalHours) * 100)) : 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#372A4A]/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 h-screen lg:h-[calc(100vh-57px)] w-64 glass-panel border-r border-[rgba(220,202,255,0.4)] flex flex-col justify-between p-4 z-50 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Mobile Header with close button */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-[#DCCAFF]/40">
            <div className="flex items-center gap-2">
              <span className="text-lg">✧</span>
              <span className="font-bold text-[#55436D]">STARSPACE</span>
            </div>
            <button 
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg hover:bg-white/60 text-[#55436D]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="p-3 rounded-2xl bg-white/70 border border-[#DCCAFF]/60 shadow-[0_2px_8px_rgba(220,202,255,0.2)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFDDF0] via-[#DCCAFF] to-[#D9EDFF] flex items-center justify-center font-bold text-base text-[#55436D] shadow-sm">
              ⋆
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#55436D] truncate">
                {settings.userName || 'My Study Space'}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-[#735D90] font-medium">
                <Sparkles className="w-3 h-3 text-[#DCCAFF]" />
                <span>Productivity Universe</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[#EDE2FF] to-[#FFDDF0] text-[#55436D] font-bold shadow-[0_2px_10px_rgba(220,202,255,0.4)] border border-white'
                      : 'text-[#735D90] hover:bg-white/60 hover:text-[#55436D]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#55436D]' : 'text-[#735D90]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span 
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#55436D] text-white'
                          : 'bg-[#EDE2FF] text-[#55436D]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Widgets: Streak & Daily Goal Progress */}
        <div className="pt-3 border-t border-[#DCCAFF]/40 flex flex-col gap-3">
          {/* Streak Badge */}
          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#FFDDF0]/60 to-[#EDE2FF]/60 border border-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <span className="text-xs font-bold text-[#55436D]">Study Streak</span>
            </div>
            <span className="text-xs font-extrabold text-[#55436D] px-2 py-0.5 rounded-full bg-white/90 shadow-xs">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>

          {/* Daily Goal Mini-Bar */}
          <div className="p-2.5 rounded-xl bg-white/60 border border-[#DCCAFF]/40 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#55436D]">
              <span>Today&apos;s Goal</span>
              <span>{todayHours}h / {dailyGoalHours}h</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EDE2FF] overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#FFDDF0] via-[#DCCAFF] to-[#D9EDFF] transition-all duration-500"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
