'use client';

import React from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  Minimize2, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles,
  FileText
} from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

export function FocusModeModal() {
  const {
    isFocusModeOpen,
    setIsFocusModeOpen,
    activeTimer,
    formattedTimerTime,
    subjects,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    cancelTimer,
    updateTimerNotes,
    settings,
    updateSettings,
  } = useStarspace();

  if (!isFocusModeOpen) return null;

  const activeSubject = subjects.find(s => s.id === activeTimer.subjectId);

  const toggleSound = () => {
    const newVal = !settings.soundEnabled;
    updateSettings({ soundEnabled: newVal });
  };

  const handleStopAndSave = () => {
    stopAndSaveTimer();
    setIsFocusModeOpen(false);
  };

  const handleCancel = () => {
    if (confirm('Cancel this active study session? Unsaved progress will be discarded.')) {
      cancelTimer();
      setIsFocusModeOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-[#160E28] text-white overflow-hidden select-none animate-fadeIn">
      {/* Background Starry Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute top-1/4 left-1/5 text-xl text-[#FFDDF0] animate-twinkle">✦</div>
        <div className="absolute top-1/3 right-1/4 text-2xl text-[#DCCAFF] animate-twinkle" style={{ animationDelay: '1s' }}>✧</div>
        <div className="absolute bottom-1/4 left-1/3 text-lg text-[#D9EDFF] animate-twinkle" style={{ animationDelay: '2s' }}>⋆</div>
        <div className="absolute top-2/3 right-1/5 text-xl text-[#EDE2FF] animate-twinkle" style={{ animationDelay: '1.5s' }}>˚｡⋆</div>
        <div className="absolute top-1/10 right-1/10 text-3xl text-[#FFDDF0]/50 animate-float">✧</div>
        <div className="absolute bottom-1/10 left-1/10 text-2xl text-[#D9EDFF]/50 animate-float" style={{ animationDelay: '2.5s' }}>✦</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#55436D]/20 via-[#DCCAFF]/10 to-transparent blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl text-[#FFDDF0]">✧</span>
          <span className="font-extrabold tracking-wider text-sm sm:text-base text-[#EDE2FF]">
            FOCUS SANCTUARY
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Mute' : 'Unmute'}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#EDE2FF] transition-colors"
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </button>

          {/* Minimize / Exit Focus Mode */}
          <button
            onClick={() => setIsFocusModeOpen(false)}
            title="Exit Fullscreen Focus Mode"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#EDE2FF] transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Minimize2 className="w-5 h-5" />
            <span className="hidden sm:inline">Exit Focus</span>
          </button>
        </div>
      </div>

      {/* Center: Subject Badge + Giant Timer + Controls */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 max-w-2xl text-center">
        {/* Subject Card */}
        {activeSubject ? (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <span className="text-2xl">{activeSubject.icon}</span>
            <span className="font-bold text-sm sm:text-base text-white tracking-wide">
              {activeSubject.name}
            </span>
            {activeSubject.code && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-[#EDE2FF]">
                {activeSubject.code}
              </span>
            )}
          </div>
        ) : (
          <div className="px-4 py-1.5 rounded-full bg-white/10 text-xs text-[#EDE2FF]">
            No subject selected
          </div>
        )}

        {/* Mode & Pomodoro Phase Indicator */}
        {activeTimer.mode === 'pomodoro' && (
          <div className="text-xs font-semibold uppercase tracking-widest text-[#FFDDF0] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFDDF0]" />
            <span>
              {activeTimer.pomodoroPhase === 'focus' ? 'Focus Session' : activeTimer.pomodoroPhase === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </span>
            <span className="text-white/60">
              • Cycle {activeTimer.pomodoroCyclesCompleted + 1}
            </span>
          </div>
        )}

        {/* Huge Digital Timer Display */}
        <div className="relative">
          <div className="text-6xl sm:text-8xl md:text-9xl font-timer font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-[#EDE2FF] to-[#DCCAFF] drop-shadow-[0_0_35px_rgba(220,202,255,0.45)]">
            {formattedTimerTime}
          </div>
          {activeTimer.isPaused && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-[#FFDDF0] bg-white/15 px-3 py-1 rounded-full border border-white/20">
              Session Paused
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 sm:gap-6 pt-4">
          {/* Pause / Resume */}
          {activeTimer.isPaused ? (
            <button
              onClick={resumeTimer}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D9EDFF] to-[#EDE2FF] text-[#55436D] flex items-center justify-center shadow-[0_0_25px_rgba(217,237,255,0.5)] hover:scale-105 active:scale-95 transition-all"
              title="Resume Timer"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title="Pause Timer"
            >
              <Pause className="w-8 h-8 fill-current" />
            </button>
          )}

          {/* Stop and Save */}
          <button
            onClick={handleStopAndSave}
            className="px-6 py-4 rounded-full bg-gradient-to-r from-[#FFDDF0] via-[#DCCAFF] to-[#D9EDFF] text-[#55436D] font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-[0_0_30px_rgba(255,221,240,0.5)] hover:scale-105 active:scale-95 transition-all"
            title="Stop & Save Session"
          >
            <Square className="w-5 h-5 fill-current" />
            <span>Finish Session ✧</span>
          </button>

          {/* Cancel */}
          <button
            onClick={handleCancel}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-red-500/30 border border-white/20 text-white/80 hover:text-red-200 flex items-center justify-center transition-all"
            title="Discard Session"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Inline Notes Field */}
        <div className="w-full max-w-md pt-2">
          <div className="flex items-center gap-2 text-xs text-[#EDE2FF]/80 mb-1.5 justify-center">
            <FileText className="w-3.5 h-3.5" />
            <span>Session Notes</span>
          </div>
          <input
            type="text"
            placeholder="Add note for this focus session..."
            value={activeTimer.notes || ''}
            onChange={(e) => updateTimerNotes(e.target.value)}
            className="w-full px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm text-center text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#DCCAFF]"
          />
        </div>
      </div>

      {/* Motivational Affirmation Footer */}
      <div className="relative z-10 text-center">
        <p className="text-xs sm:text-sm text-[#EDE2FF]/80 italic font-medium">
          &ldquo;You&apos;re becoming the person you promised yourself you&apos;d be.&rdquo;
        </p>
      </div>
    </div>
  );
}
