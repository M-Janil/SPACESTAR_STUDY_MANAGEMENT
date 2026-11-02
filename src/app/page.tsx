'use client';

import React, { useState, useEffect } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { StarspaceHeader } from '@/components/StarspaceHeader';
import { StarspaceSidebar } from '@/components/StarspaceSidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { TimerView } from '@/components/views/TimerView';
import { SubjectsView } from '@/components/views/SubjectsView';
import { TasksView } from '@/components/views/TasksView';
import { CalendarView } from '@/components/views/CalendarView';
import { HistoryView } from '@/components/views/HistoryView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { AchievementsView } from '@/components/views/AchievementsView';
import { SettingsView } from '@/components/views/SettingsView';
import { CelestialStarfield } from '@/components/CelestialStarfield';


export default function StarspaceApp() {
  const [mounted, setMounted] = useState<boolean>(false);
  const { activeTab } = useStarspace();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F4FF] text-[#55436D]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFDDF0] via-[#DCCAFF] to-[#D9EDFF] flex items-center justify-center text-2xl shadow-md animate-pulse">
            ✧
          </div>
          <span className="font-extrabold text-sm tracking-wider text-[#55436D]">
            STARSPACE ✧ Loading Universe...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F4FF] text-[#55436D] relative">
      {/* 70+ Twinkling Stars, Shooting Stars & Interactive Dust */}
      <CelestialStarfield />

      {/* Top Header */}
      <StarspaceHeader onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Main Body with Sidebar + Active View */}
      <div className="flex-1 flex w-full relative z-10">
        {/* Responsive Sidebar */}
        <StarspaceSidebar 
          isMobileOpen={isMobileMenuOpen} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
        />

        {/* Dynamic View Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl mx-auto w-full transition-all">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'timer' && <TimerView />}
          {activeTab === 'subjects' && <SubjectsView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'achievements' && <AchievementsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
