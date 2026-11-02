'use client';

import React from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  PlusCircle, 
  Maximize2, 
  Play, 
  Pause, 
  Square,
  CheckCircle2,
  RefreshCw,
  Menu
} from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

interface StarspaceHeaderProps {
  onToggleMobileMenu?: () => void;
}

export function StarspaceHeader({ onToggleMobileMenu }: StarspaceHeaderProps) {
  const {
    activeTimer,
    formattedTimerTime,
    subjects,
    saveStatus,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    openManualModal,
    setIsFocusModeOpen,
    setActiveTab,
    settings,
    updateSettings,
  } = useStarspace();

  const activeSubject = subjects.find(s => s.id === activeTimer.subjectId);

  const toggleSound = () => {
    const newVal = !settings.soundEnabled;
    updateSettings({ soundEnabled: newVal });
    if (newVal) {
      sounds.playSparkle();
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[rgba(220,202,255,0.4)] px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Logo & Tagline */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-[#55436D] hover:bg-white/60 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FFDDF0] via-[#DCCAFF] to-[#D9EDFF] flex items-center justify-center shadow-[0_2px_10px_rgba(220,202,255,0.5)] border border-white/80 group-hover:rotate-6 transition-transform">
              <span className="text-lg">✧</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[#55436D] via-[#735D90] to-[#55436D] bg-clip-text text-transparent">
                  STARSPACE
                </span>
                <span className="text-xs text-[#735D90] font-semibold animate-twinkle">⋆｡°✩</span>
              </div>
              <p className="text-[11px] text-[#735D90]/80 hidden sm:block font-medium">
                Your little universe of productivity.
              </p>
            </div>
          </button>
        </div>

        {/* Center: Active Timer Floating Pill (Visible when active) */}
        {activeTimer.isActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-[#DCCAFF] shadow-[0_4px_15px_rgba(220,202,255,0.35)] animate-pulse-glow">
            <div 
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: activeSubject?.color || '#DCCAFF' }}
            />
            <span className="text-xs font-bold text-[#55436D] hidden md:inline">
              {activeSubject?.icon} {activeSubject?.name || 'Studying'}
            </span>
            <span className="font-timer text-sm sm:text-base font-bold text-[#55436D] tracking-wider px-1">
              {formattedTimerTime}
            </span>

            {/* Quick Play/Pause */}
            {activeTimer.isPaused ? (
              <button
                onClick={resumeTimer}
                title="Resume timer"
                className="p-1 rounded-full hover:bg-[#EDE2FF] text-[#55436D] transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                title="Pause timer"
                className="p-1 rounded-full hover:bg-[#EDE2FF] text-[#55436D] transition-colors"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            {/* Stop and Save */}
            <button
              onClick={stopAndSaveTimer}
              title="Stop and save session"
              className="p-1 rounded-full hover:bg-[#FFDDF0] text-[#55436D] transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>

            {/* Focus Mode button */}
            <button
              onClick={() => setIsFocusModeOpen(true)}
              title="Open distraction-free focus mode"
              className="p-1 rounded-full hover:bg-[#D9EDFF] text-[#55436D] transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right Actions: Date, Autosave status, Manual Session button, Sound toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Autosave status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/70 border border-[#DCCAFF]/50 text-[#735D90]">
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-[#735D90]" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'error' ? (
              <span className="text-red-500 font-semibold">Save failed</span>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-[#735D90]" />
                <span>All changes saved ✓</span>
              </>
            )}
          </div>

          {/* Current Date */}
          <div className="hidden sm:block text-xs font-semibold text-[#55436D] bg-[#EDE2FF]/60 px-2.5 py-1 rounded-full border border-white/80">
            {currentDateFormatted}
          </div>

          {/* Manual Entry Button */}
          <button
            onClick={() => openManualModal()}
            title="Forgot to start timer? Add session manually"
            className="btn-chrome flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-full"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#55436D]" />
            <span className="hidden sm:inline">Add Session</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Mute celestial sounds' : 'Enable celestial sounds'}
            className="p-2 rounded-xl text-[#55436D] hover:bg-white/80 border border-transparent hover:border-[#DCCAFF] transition-all"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#55436D]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#735D90]/60" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
