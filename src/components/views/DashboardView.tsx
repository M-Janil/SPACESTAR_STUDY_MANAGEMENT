'use client';

import React, { useState } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  PlusCircle, 
  Play, 
  Pause, 
  Square, 
  Maximize2, 
  BookOpen, 
  ChevronRight, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { starspaceStore } from '@/lib/starspaceStore';

const MOTIVATIONAL_QUOTES = [
  "You're becoming the person you promised yourself you'd be. ✧",
  "One more session, superstar! ⋆ ˚｡⋆",
  "Little progress is still progress. Every minute counts.",
  "Your focus creates your reality. Keep shining! ✦",
  "Consistency is the magic wand that transforms dreams into reality. 🪐",
];

export function DashboardView() {
  const {
    subjects,
    activeTimer,
    formattedTimerTime,
    tasks,
    events,
    settings,
    todayMinutes,
    weeklyMinutes,
    currentStreak,
    todayTasksCompletedCount,
    todayTotalTasksCount,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    openManualModal,
    setIsFocusModeOpen,
    setActiveTab,
    toggleTaskCompleted,
    setSelectedSubjectIdForWorkspace,
    addTask,
  } = useStarspace();

  // Quick subject select for idle timer
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.length > 0 ? subjects[0].id : ''
  );
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [quickTaskTitle, setQuickTaskTitle] = useState<string>('');

  const todayHours = Math.round((todayMinutes / 60) * 10) / 10;
  const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10;
  const dailyGoalHours = settings.dailyGoalHours || 0;
  const weeklyGoalHours = settings.weeklyGoalHours || 0;

  const dailyGoalPercent = dailyGoalHours > 0 ? Math.min(100, Math.round((todayHours / dailyGoalHours) * 100)) : 0;
  const weeklyGoalPercent = weeklyGoalHours > 0 ? Math.min(100, Math.round((weeklyHours / weeklyGoalHours) * 100)) : 0;

  // Current active subject
  const currentActiveSubject = subjects.find(s => s.id === activeTimer.subjectId);

  // Last 7 days chart data
  const chartData = starspaceStore.getDailyHoursData(7);

  // Today's tasks (due today or uncompleted)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const pendingOrTodayTasks = tasks.filter(t => t.deadline === todayDateStr || t.status === 'pending').slice(0, 5);

  // Upcoming deadlines (next 7 days)
  const upcomingEvents = events.slice(0, 4);

  const handleStartTimer = () => {
    if (subjects.length === 0) {
      setActiveTab('subjects');
      return;
    }
    if (!selectedSubjectId && subjects.length > 0) {
      startTimer(subjects[0].id, timerMode);
    } else if (selectedSubjectId) {
      startTimer(selectedSubjectId, timerMode);
    }
  };

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    addTask({
      title: quickTaskTitle.trim(),
      deadline: todayDateStr,
      priority: 'medium',
      subjectId: selectedSubjectId || undefined,
    });
    setQuickTaskTitle('');
  };

  // Pick quote based on day
  const quoteIndex = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
  const dailyQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Greeting & Motivational Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#FFDDF0]/80 via-[#EDE2FF]/90 to-[#D9EDFF]/80 border border-white shadow-[0_8px_30px_rgba(220,202,255,0.35)]">
        <div className="absolute top-2 right-4 text-3xl opacity-40 select-none animate-twinkle">⋆｡°✩</div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-[#735D90] uppercase tracking-wider">
                ✧ Starspace Universe
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/80 font-bold text-[#55436D]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#55436D] tracking-tight">
              {settings.userName ? `Welcome back, ${settings.userName} ✦` : 'Welcome to STARSPACE ✧'}
            </h1>
            <p className="text-xs sm:text-sm text-[#55436D]/80 font-medium mt-1">
              {dailyQuote}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openManualModal()}
              className="btn-chrome px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#55436D]" />
              <span>Add Past Session</span>
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className="btn-celestial-primary px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-[#55436D]" />
              <span>Full Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Productivity Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Study Time */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#735D90]">
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Study</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFDDF0] flex items-center justify-center text-xs">⏱️</div>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#55436D] font-timer">
              {todayHours}h
            </span>
            <span className="text-xs text-[#735D90] ml-1.5 font-medium">
              {dailyGoalHours > 0 ? `/ ${dailyGoalHours}h goal` : '/ 0h goal'}
            </span>
          </div>
          <div>
            <div className="w-full h-2 rounded-full bg-[#EDE2FF] overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#FFDDF0] to-[#DCCAFF]"
                style={{ width: `${dailyGoalPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#735D90] font-semibold mt-1">
              <span>Progress</span>
              <span>{dailyGoalPercent}%</span>
            </div>
          </div>
        </div>

        {/* Weekly Total */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#735D90]">
            <span className="text-xs font-bold uppercase tracking-wider">Weekly Hours</span>
            <div className="w-7 h-7 rounded-lg bg-[#D9EDFF] flex items-center justify-center text-xs">📅</div>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#55436D] font-timer">
              {weeklyHours}h
            </span>
            <span className="text-xs text-[#735D90] ml-1.5 font-medium">
              {weeklyGoalHours > 0 ? `/ ${weeklyGoalHours}h goal` : '/ 0h goal'}
            </span>
          </div>
          <div>
            <div className="w-full h-2 rounded-full bg-[#EDE2FF] overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#D9EDFF] to-[#DCCAFF]"
                style={{ width: `${weeklyGoalPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#735D90] font-semibold mt-1">
              <span>Goal Progress</span>
              <span>{weeklyGoalPercent}%</span>
            </div>
          </div>
        </div>

        {/* Tasks Completed Today */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#735D90]">
            <span className="text-xs font-bold uppercase tracking-wider">Daily Checklist</span>
            <div className="w-7 h-7 rounded-lg bg-[#EDE2FF] flex items-center justify-center text-xs">✓</div>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
              {todayTasksCompletedCount}
            </span>
            <span className="text-xs text-[#735D90] ml-1.5 font-medium">
              of {todayTotalTasksCount} done
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#735D90] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#DCCAFF]" />
            <span>Keep ticking off tasks!</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#735D90]">
            <span className="text-xs font-bold uppercase tracking-wider">Study Streak</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFDDF0] flex items-center justify-center text-xs">🔥</div>
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
              {currentStreak}
            </span>
            <span className="text-xs font-bold text-[#735D90]">Days Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#55436D]">
            <span>{currentStreak > 0 ? '⋆ Consistency Queen' : '⋆ New Explorer'}</span>
          </div>
        </div>
      </div>

      {/* 3. Prominent Study Timer Card */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-[0_10px_35px_rgba(220,202,255,0.3)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left info & Subject */}
          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#735D90]">
                {activeTimer.isActive ? 'Active Study Session ✦' : 'Quick Study Launch ✧'}
              </span>
              {activeTimer.isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFDDF0] text-[#55436D] animate-pulse">
                  Recording Live
                </span>
              )}
            </div>

            {activeTimer.isActive ? (
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#55436D] flex items-center justify-center md:justify-start gap-2">
                  <span>{currentActiveSubject?.icon}</span>
                  <span>{currentActiveSubject?.name}</span>
                </h3>
                {activeTimer.notes && (
                  <p className="text-xs text-[#735D90] italic mt-1 line-clamp-1">
                    &ldquo;{activeTimer.notes}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:w-auto">
                  <label className="text-[11px] font-bold text-[#735D90] block mb-1">
                    Select Subject
                  </label>
                  {subjects.length === 0 ? (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab('subjects')}
                        className="btn-chrome px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#55436D]" />
                        <span>+ Add Subject</span>
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] focus:outline-none"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.icon} {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="w-full sm:w-auto">
                  <label className="text-[11px] font-bold text-[#735D90] block mb-1">
                    Timer Mode
                  </label>
                  <div className="flex p-0.5 rounded-xl bg-[#EDE2FF] text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTimerMode('stopwatch')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        timerMode === 'stopwatch' ? 'bg-white shadow-xs text-[#55436D]' : 'text-[#735D90]'
                      }`}
                    >
                      Stopwatch
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimerMode('pomodoro')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        timerMode === 'pomodoro' ? 'bg-white shadow-xs text-[#55436D]' : 'text-[#735D90]'
                      }`}
                    >
                      Pomodoro 25m
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center: Glowing Monospace Timer */}
          <div className="text-center px-6 py-3 rounded-2xl bg-white/70 border border-[#DCCAFF]/60 shadow-inner">
            <div className="text-4xl sm:text-5xl font-extrabold font-timer text-[#55436D] tracking-wider">
              {activeTimer.isActive ? formattedTimerTime : (timerMode === 'pomodoro' ? '25:00' : '00:00:00')}
            </div>
            <div className="text-[10px] uppercase font-bold text-[#735D90] tracking-widest mt-1">
              {activeTimer.isActive 
                ? (activeTimer.isPaused ? 'Paused' : 'Accurate Timestamp Tracking')
                : 'Ready to focus'}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2.5">
            {activeTimer.isActive ? (
              <>
                {activeTimer.isPaused ? (
                  <button
                    onClick={resumeTimer}
                    className="btn-chrome p-3 rounded-2xl text-[#55436D]"
                    title="Resume"
                  >
                    <Play className="w-5 h-5 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="btn-chrome p-3 rounded-2xl text-[#55436D]"
                    title="Pause"
                  >
                    <Pause className="w-5 h-5 fill-current" />
                  </button>
                )}

                <button
                  onClick={stopAndSaveTimer}
                  className="btn-celestial-primary px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5"
                  title="Stop & Save"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop & Save</span>
                </button>

                <button
                  onClick={() => setIsFocusModeOpen(true)}
                  className="btn-chrome p-3 rounded-2xl text-[#55436D]"
                  title="Fullscreen Focus Sanctuary"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </>
            ) : subjects.length === 0 ? (
              <button
                type="button"
                onClick={() => setActiveTab('subjects')}
                className="btn-celestial-primary px-6 py-3.5 rounded-2xl text-sm font-extrabold flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Subject to Start ✧</span>
              </button>
            ) : (
              <button
                onClick={handleStartTimer}
                className="btn-celestial-primary px-6 py-3.5 rounded-2xl text-sm font-extrabold flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Studying ✧</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom helper prompt */}
        <div className="mt-4 pt-4 border-t border-[#DCCAFF]/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#735D90]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#DCCAFF]" />
            <span>Time tracking survives browser refresh & inactive tabs accurately!</span>
          </span>
          <button
            onClick={() => openManualModal()}
            className="text-[#55436D] font-bold underline hover:opacity-80 transition-opacity"
          >
            Forgot to start your timer? Add session manually &rarr;
          </button>
        </div>
      </div>

      {/* 4. Two-Column Layout: Today's Checklist & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Today's Checklist */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCCAFF]/40">
              <div className="flex items-center gap-2">
                <span className="text-base">✦</span>
                <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
                  Today&apos;s Checklist
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-bold text-[#735D90] hover:text-[#55436D] flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Add Task Input */}
            <form onSubmit={handleQuickAddTask} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a new study task for today..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs font-medium text-[#55436D] placeholder-[#735D90]/50 focus:outline-none"
              />
              <button
                type="submit"
                className="btn-chrome px-3 py-2 rounded-xl text-xs font-bold text-[#55436D]"
              >
                Add
              </button>
            </form>

            {/* Tasks List */}
            <div className="flex flex-col gap-2">
              {pendingOrTodayTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#735D90]">
                  No tasks due today. You&apos;re completely clear! ✧
                </div>
              ) : (
                pendingOrTodayTasks.map((t) => {
                  const sub = subjects.find(s => s.id === t.subjectId);
                  const isDone = t.status === 'completed';

                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isDone 
                          ? 'bg-white/40 border-transparent opacity-65 line-through text-[#735D90]'
                          : 'bg-white/80 border-[#DCCAFF]/60 text-[#55436D]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskCompleted(t.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isDone 
                              ? 'bg-[#55436D] border-[#55436D] text-white' 
                              : 'border-[#735D90] hover:bg-[#FFDDF0]'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{t.title}</p>
                          {sub && (
                            <span 
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5"
                              style={{ backgroundColor: `${sub.color}60` }}
                            >
                              {sub.icon} {sub.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        t.priority === 'high' ? 'bg-red-100 text-red-700' :
                        t.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Upcoming Deadlines & Calendar Events */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCCAFF]/40">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
                  Upcoming Deadlines & Exams
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-bold text-[#735D90] hover:text-[#55436D] flex items-center gap-1"
              >
                <span>Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {upcomingEvents.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#735D90]">
                  No upcoming deadlines scheduled! ⋆
                </div>
              ) : (
                upcomingEvents.map((evt) => {
                  const sub = subjects.find(s => s.id === evt.subjectId);
                  return (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl bg-white/70 border border-[#DCCAFF]/50 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-xs ${
                          evt.type === 'exam' ? 'bg-[#FFDDF0]' :
                          evt.type === 'assignment' ? 'bg-[#D9EDFF]' : 'bg-[#EDE2FF]'
                        }`}>
                          {evt.type === 'exam' ? '🎯' : evt.type === 'assignment' ? '📝' : '📖'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#55436D]">{evt.title}</h4>
                          <p className="text-[10px] text-[#735D90] font-medium">
                            {evt.date} {evt.startTime ? `• ${evt.startTime}` : ''} {sub ? `(${sub.name})` : ''}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-[#55436D] border border-[#DCCAFF]/60 uppercase">
                        {evt.type}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Weekly Study Activity Chart & Subject-wise Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Weekly Activity Chart */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCCAFF]/40">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#735D90]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
                  Weekly Study Activity (Past 7 Days)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs font-bold text-[#735D90] hover:text-[#55436D] flex items-center gap-1"
              >
                <span>Detailed Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#735D90', fontSize: 11, fontWeight: 600 }} 
                    axisLine={{ stroke: '#DCCAFF' }} 
                  />
                  <YAxis 
                    tick={{ fill: '#735D90', fontSize: 11 }} 
                    axisLine={{ stroke: '#DCCAFF' }} 
                    unit="h"
                  />
                  <Tooltip 
                    formatter={(val: unknown) => [`${val} hours`, 'Study Time']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '12px', 
                      borderColor: '#DCCAFF', 
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#55436D' 
                    }} 
                  />
                  <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === chartData.length - 1 ? '#DCCAFF' : '#FFDDF0'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right (1 col): Subject-wise Weekly Summary */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCCAFF]/40">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#735D90]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
                  Subjects Overview
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('subjects')}
                className="text-xs font-bold text-[#735D90] hover:text-[#55436D] flex items-center gap-1"
              >
                <span>Library</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {subjects.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center gap-2">
                  <span className="text-2xl animate-twinkle">✦</span>
                  <p className="text-xs font-bold text-[#55436D]">Your Universe is Clean & Ready!</p>
                  <p className="text-[11px] text-[#735D90]">Add your subjects to start tracking goals.</p>
                  <button
                    onClick={() => setActiveTab('subjects')}
                    className="btn-celestial-primary px-3.5 py-1.5 rounded-xl text-xs font-bold mt-1"
                  >
                    + Add Subject ✧
                  </button>
                </div>
              ) : (
                subjects.map((sub) => {
                  const subWeeklyMinutes = starspaceStore.getSubjectWeeklyMinutes(sub.id);
                  const subWeeklyHours = Math.round((subWeeklyMinutes / 60) * 10) / 10;
                  const percent = Math.min(100, Math.round((subWeeklyHours / sub.weeklyGoalHours) * 100));

                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubjectIdForWorkspace(sub.id);
                        setActiveTab('subjects');
                      }}
                      className="p-3 rounded-2xl bg-white/70 hover:bg-white border border-[#DCCAFF]/50 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{sub.icon}</span>
                          <span className="text-xs font-bold text-[#55436D] group-hover:text-[#735D90]">
                            {sub.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-[#55436D] font-timer">
                          {subWeeklyHours}h / {sub.weeklyGoalHours}h
                        </span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-[#EDE2FF] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: sub.color }}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
