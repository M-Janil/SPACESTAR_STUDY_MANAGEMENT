'use client';

import React, { useState } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Maximize2, 
  PlusCircle, 
  BookOpen, 
  Sparkles, 
  FileText, 
  Coffee, 
  Clock, 
  Settings2 
} from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

export function TimerView() {
  const {
    subjects,
    activeTimer,
    formattedTimerTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    cancelTimer,
    updateTimerNotes,
    openManualModal,
    setIsFocusModeOpen,
    settings,
    updateSettings,
    addSubject,
    setActiveTab,
  } = useStarspace();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.length > 0 ? subjects[0].id : ''
  );
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>(activeTimer.mode || 'stopwatch');
  const [pomodoroMinutes, setPomodoroMinutes] = useState<number>(settings.pomodoroSettings?.focusMinutes || 25);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const activeSubject = subjects.find(s => s.id === (activeTimer.isActive ? activeTimer.subjectId : selectedSubjectId));

  const handleStart = () => {
    let subId = selectedSubjectId;
    if (!subId && subjects.length > 0) {
      subId = subjects[0].id;
    }
    if (!subId) {
      setActiveTab('subjects');
      return;
    }
    startTimer(subId, mode, pomodoroMinutes);
  };

  const handleCancel = () => {
    if (confirm('Discard this ongoing study session?')) {
      cancelTimer();
    }
  };

  const handlePomodoroPresetChange = (mins: number) => {
    setPomodoroMinutes(mins);
    updateSettings({
      pomodoroSettings: {
        ...settings.pomodoroSettings,
        focusMinutes: mins,
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base text-[#55436D]">⏱️</span>
            <span className="text-xs font-bold text-[#735D90] uppercase tracking-wider">
              Deep Cosmic Focus
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
            Study Timer ✧
          </h1>
          <p className="text-xs sm:text-sm text-[#735D90] font-medium">
            Accurate timestamp-based tracking that survives page refresh and background tabs.
          </p>
        </div>

        <button
          onClick={() => openManualModal(selectedSubjectId)}
          className="btn-chrome self-start sm:self-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#55436D]" />
          <span>Forgot to start timer? Add manually</span>
        </button>
      </div>

      {/* Main Celestial Timer Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white shadow-[0_12px_40px_rgba(220,202,255,0.4)] flex flex-col items-center gap-8 relative overflow-hidden">
        {/* Ambient star decorations */}
        <div className="absolute top-4 left-6 text-xl opacity-40 select-none animate-twinkle">✦</div>
        <div className="absolute bottom-6 right-8 text-2xl opacity-40 select-none animate-twinkle" style={{ animationDelay: '1.2s' }}>✧</div>
        <div className="absolute top-10 right-14 text-sm opacity-30 select-none animate-float">⋆</div>

        {/* Top Controls: Mode Switcher (Stopwatch vs Pomodoro) */}
        {!activeTimer.isActive ? (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-between z-10">
            {/* Mode Switcher */}
            <div className="flex p-1 rounded-2xl bg-white/80 border border-[#DCCAFF] shadow-xs w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setMode('stopwatch')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mode === 'stopwatch' 
                    ? 'bg-gradient-to-r from-[#EDE2FF] to-[#FFDDF0] text-[#55436D] shadow-xs' 
                    : 'text-[#735D90] hover:text-[#55436D]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Stopwatch</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('pomodoro')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mode === 'pomodoro' 
                    ? 'bg-gradient-to-r from-[#EDE2FF] to-[#D9EDFF] text-[#55436D] shadow-xs' 
                    : 'text-[#735D90] hover:text-[#55436D]'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Pomodoro</span>
              </button>
            </div>

            {/* Pomodoro Duration Config Toggle */}
            {mode === 'pomodoro' && (
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="btn-chrome px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5 text-[#55436D]" />
                <span>{pomodoroMinutes}m Interval</span>
              </button>
            )}
          </div>
        ) : (
          /* Active Mode Indicator */
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] shadow-xs z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {activeTimer.mode === 'pomodoro' 
                ? `Pomodoro Focus (${activeTimer.pomodoroDurationMinutes}m)` 
                : 'Continuous Stopwatch'}
            </span>
          </div>
        )}

        {/* Pomodoro Quick Configuration Drawer */}
        {!activeTimer.isActive && mode === 'pomodoro' && showConfig && (
          <div className="w-full max-w-md p-4 rounded-2xl bg-white/90 border border-[#DCCAFF] shadow-sm flex flex-col gap-3 animate-fadeIn z-10">
            <span className="text-xs font-bold text-[#55436D]">Custom Focus Duration:</span>
            <div className="flex gap-2">
              {[15, 20, 25, 30, 45, 50].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handlePomodoroPresetChange(mins)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pomodoroMinutes === mins 
                      ? 'bg-[#55436D] text-white shadow-xs' 
                      : 'bg-[#EDE2FF] text-[#55436D] hover:bg-[#DCCAFF]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject Selector */}
        <div className="w-full max-w-md z-10">
          <label className="text-xs font-bold text-[#55436D] block mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#735D90]" />
            <span>{activeTimer.isActive ? 'Active Subject' : 'Select Subject to Study'}</span>
          </label>

          {activeTimer.isActive ? (
            <div className="p-3.5 rounded-2xl bg-white/90 border border-[#DCCAFF] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activeSubject?.icon}</span>
                <div>
                  <h3 className="text-sm font-extrabold text-[#55436D]">{activeSubject?.name}</h3>
                  <p className="text-[11px] text-[#735D90] font-semibold">{activeSubject?.code}</p>
                </div>
              </div>
              <span 
                className="text-xs font-bold px-3 py-1 rounded-full text-[#55436D] border border-white"
                style={{ backgroundColor: activeSubject?.color || '#DCCAFF' }}
              >
                In Session
              </span>
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-3.5 rounded-2xl bg-white/90 border border-[#DCCAFF] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪐</span>
                <span className="text-xs font-bold text-[#55436D]">No subjects created yet</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('subjects')}
                className="btn-celestial-primary px-3 py-1.5 rounded-xl text-xs font-bold"
              >
                + Create Subject ✧
              </button>
            </div>
          ) : (
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-[#DCCAFF] text-sm font-bold text-[#55436D] focus:outline-none focus:ring-2 focus:ring-[#DCCAFF] shadow-xs"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.icon} {sub.name} {sub.code ? `(${sub.code})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Giant Glowing Retro Digital Timer Box */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/95 to-[#FAF6FF]/95 border-2 border-[#DCCAFF]/70 shadow-[inset_0_2px_6px_rgba(220,202,255,0.4),0_8px_30px_rgba(85,67,109,0.08)] flex flex-col items-center justify-center relative min-w-[280px] sm:min-w-[420px]">
          <div className="text-5xl sm:text-7xl font-extrabold font-timer tracking-widest text-[#55436D] drop-shadow-sm">
            {activeTimer.isActive 
              ? formattedTimerTime 
              : (mode === 'pomodoro' ? `${String(pomodoroMinutes).padStart(2, '0')}:00` : '00:00:00')}
          </div>

          <div className="mt-2 text-xs font-bold uppercase tracking-widest text-[#735D90] flex items-center gap-1.5">
            {activeTimer.isActive ? (
              activeTimer.isPaused ? (
                <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Timer Paused
                </span>
              ) : (
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Recording Time
                </span>
              )
            ) : (
              <span>Ready for Launch</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 sm:gap-6 z-10">
          {activeTimer.isActive ? (
            <>
              {/* Pause or Resume */}
              {activeTimer.isPaused ? (
                <button
                  onClick={resumeTimer}
                  className="btn-chrome px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current text-[#55436D]" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="btn-chrome px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2"
                >
                  <Pause className="w-4 h-4 fill-current text-[#55436D]" />
                  <span>Pause</span>
                </button>
              )}

              {/* Stop and Save */}
              <button
                onClick={stopAndSaveTimer}
                className="btn-celestial-primary px-7 py-3.5 rounded-2xl text-sm sm:text-base font-extrabold flex items-center gap-2"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop & Save ✧</span>
              </button>

              {/* Cancel */}
              <button
                onClick={handleCancel}
                className="p-3.5 rounded-2xl text-[#735D90] hover:text-red-500 hover:bg-white/80 transition-colors"
                title="Discard Session"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Focus Sanctuary Fullscreen */}
              <button
                onClick={() => setIsFocusModeOpen(true)}
                className="btn-chrome p-3.5 rounded-2xl text-[#55436D]"
                title="Launch Distraction-Free Focus Sanctuary"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </>
          ) : subjects.length === 0 ? (
            <button
              onClick={() => setActiveTab('subjects')}
              className="btn-celestial-primary px-8 py-4 rounded-2xl text-base font-extrabold flex items-center gap-2.5 shadow-[0_6px_20px_rgba(220,202,255,0.6)]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Your First Subject ✧</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleStart}
                className="btn-celestial-primary px-8 py-4 rounded-2xl text-base font-extrabold flex items-center gap-2.5 shadow-[0_6px_20px_rgba(220,202,255,0.6)]"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Studying ✧</span>
              </button>

              <button
                onClick={() => {
                  handleStart();
                  setIsFocusModeOpen(true);
                }}
                className="btn-chrome px-5 py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2"
                title="Start directly in fullscreen Focus Sanctuary"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Launch Sanctuary</span>
              </button>
            </>
          )}
        </div>

        {/* Live Session Notes */}
        {activeTimer.isActive && (
          <div className="w-full max-w-md flex flex-col gap-1.5 z-10">
            <label className="text-xs font-bold text-[#55436D] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#735D90]" />
              <span>Session Accomplishments / Notes</span>
            </label>
            <input
              type="text"
              placeholder="E.g., Solved 5 calculus integration problems, reviewed neural network weights..."
              value={activeTimer.notes || ''}
              onChange={(e) => updateTimerNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-[#DCCAFF] text-xs sm:text-sm font-medium text-[#55436D] focus:outline-none focus:ring-2 focus:ring-[#DCCAFF]"
            />
          </div>
        )}
      </div>

      {/* Pomodoro Explainer / Feature Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFDDF0] flex items-center justify-center text-sm">
            🧠
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#55436D]">25m Focus Cycles</h4>
            <p className="text-[11px] text-[#735D90]">Peak cognitive retention</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D9EDFF] flex items-center justify-center text-sm">
            ☕
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#55436D]">5m Rest Intervals</h4>
            <p className="text-[11px] text-[#735D90]">Mental replenishment</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EDE2FF] flex items-center justify-center text-sm">
            🛡️
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#55436D]">Tamper-Proof Timers</h4>
            <p className="text-[11px] text-[#735D90]">Resistant to tab sleep</p>
          </div>
        </div>
      </div>
    </div>
  );
}
