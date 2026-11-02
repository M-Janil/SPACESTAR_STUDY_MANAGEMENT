'use client';

import React, { useState, useEffect } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { X, Calendar, Clock, BookOpen, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDateYMD } from '@/lib/starspaceStore';

export function ManualSessionModal() {
  const {
    isManualModalOpen,
    setIsManualModalOpen,
    manualModalSubjectId,
    subjects,
    addManualSession,
    addSubject,
  } = useStarspace();

  const [subjectId, setSubjectId] = useState<string>('');
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [date, setDate] = useState<string>(formatDateYMD(new Date()));
  const [entryMode, setEntryMode] = useState<'duration' | 'timeRange'>('duration');
  
  // Duration mode states
  const [durationHours, setDurationHours] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);

  // Time range mode states
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('15:30');

  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Set default subject when modal opens
  useEffect(() => {
    if (manualModalSubjectId) {
      setSubjectId(manualModalSubjectId);
    } else if (subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0].id);
    }
    setDate(formatDateYMD(new Date()));
    setError(null);
  }, [isManualModalOpen, manualModalSubjectId, subjects, subjectId]);

  if (!isManualModalOpen) return null;

  const todayStr = formatDateYMD(new Date());

  // Calculate calculated duration in minutes
  const calculateTotalMinutes = (): number => {
    if (entryMode === 'duration') {
      return (Number(durationHours) || 0) * 60 + (Number(durationMinutes) || 0);
    } else {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const startMin = (sh || 0) * 60 + (sm || 0);
      let endMin = (eh || 0) * 60 + (em || 0);
      if (endMin < startMin) {
        // crossed midnight
        endMin += 1440;
      }
      return endMin - startMin;
    }
  };

  const calculatedMinutes = calculateTotalMinutes();
  const selectedSubject = subjects.find(s => s.id === subjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalSubjectId = subjectId;
    if (!finalSubjectId) {
      if (subjects.length > 0) {
        setError('Please select a subject.');
        return;
      } else {
        if (!newSubjectName.trim()) {
          setError('Please enter a subject name for this session.');
          return;
        }
        const created = addSubject({
          name: newSubjectName.trim(),
          color: '#DCCAFF',
          icon: '🪐',
          weeklyGoalHours: 0,
        });
        finalSubjectId = created.id;
      }
    }

    if (date > todayStr) {
      setError('Study date cannot be in the future.');
      return;
    }

    if (calculatedMinutes <= 0) {
      setError('Duration must be greater than 0 minutes.');
      return;
    }

    if (calculatedMinutes > 1440) {
      setError('Duration cannot exceed 24 hours in a single session.');
      return;
    }

    // Save session
    addManualSession({
      subjectId: finalSubjectId,
      date,
      startTime: entryMode === 'timeRange' ? startTime : undefined,
      endTime: entryMode === 'timeRange' ? endTime : undefined,
      durationMinutes: calculatedMinutes,
      notes: notes.trim() || undefined,
    });

    setIsManualModalOpen(false);
    setNotes('');
    setNewSubjectName('');
  };

  const setPresetDuration = (hours: number, minutes: number) => {
    setEntryMode('duration');
    setDurationHours(hours);
    setDurationMinutes(minutes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-white shadow-2xl overflow-hidden animate-slideUp">
        {/* Retro Header Bar */}
        <div className="retro-window-header px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">✦</span>
            <h3 className="font-bold text-sm text-[#55436D]">
              Forgot to start your timer? Add session manually
            </h3>
          </div>
          <button
            onClick={() => setIsManualModalOpen(false)}
            className="p-1 rounded-full hover:bg-white/60 text-[#55436D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#55436D] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#735D90]" />
              <span>Select Subject</span>
            </label>
            {subjects.length === 0 ? (
              <div>
                <input
                  type="text"
                  placeholder="Enter subject name (e.g. Physics, History)..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs sm:text-sm font-bold text-[#55436D] focus:outline-none focus:ring-2 focus:ring-[#DCCAFF]"
                />
                <span className="text-[10px] text-[#735D90] mt-1 block">
                  A new subject will be created automatically for this session! ✧
                </span>
              </div>
            ) : (
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs sm:text-sm font-medium text-[#55436D] focus:outline-none focus:ring-2 focus:ring-[#DCCAFF]"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.icon} {sub.name} {sub.code ? `(${sub.code})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#55436D] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#735D90]" />
              <span>Study Date</span>
            </label>
            <input
              type="date"
              max={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs sm:text-sm font-medium text-[#55436D] focus:outline-none focus:ring-2 focus:ring-[#DCCAFF]"
            />
          </div>

          {/* Mode Tabs: Duration vs Time Range */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#55436D] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#735D90]" />
                <span>Session Duration</span>
              </label>
              <div className="flex p-0.5 rounded-lg bg-[#EDE2FF]/80 text-[11px] font-semibold text-[#55436D]">
                <button
                  type="button"
                  onClick={() => setEntryMode('duration')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    entryMode === 'duration' ? 'bg-white shadow-xs font-bold' : 'text-[#735D90]'
                  }`}
                >
                  Enter Total Time
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('timeRange')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    entryMode === 'timeRange' ? 'bg-white shadow-xs font-bold' : 'text-[#735D90]'
                  }`}
                >
                  Start & End Time
                </button>
              </div>
            </div>

            {/* Total Duration Inputs */}
            {entryMode === 'duration' ? (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#735D90]">Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={durationHours}
                      onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-sm font-bold text-[#55436D]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#735D90]">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-sm font-bold text-[#55436D]"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-[#735D90] font-medium mr-1">Quick presets:</span>
                  {[
                    { label: '30m', h: 0, m: 30 },
                    { label: '45m', h: 0, m: 45 },
                    { label: '1h', h: 1, m: 0 },
                    { label: '1.5h', h: 1, m: 30 },
                    { label: '2h', h: 2, m: 0 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPresetDuration(p.h, p.m)}
                      className="px-2 py-0.5 rounded-lg bg-white/70 hover:bg-[#EDE2FF] border border-[#DCCAFF]/60 text-[10px] font-semibold text-[#55436D]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Start & End Time Inputs */
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#735D90]">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-sm font-bold text-[#55436D]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#735D90]">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-sm font-bold text-[#55436D]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Session Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#55436D] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#735D90]" />
              <span>Session Notes (Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="What did you study or accomplish in this session?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs sm:text-sm font-medium text-[#55436D] focus:outline-none focus:ring-2 focus:ring-[#DCCAFF] resize-none"
            />
          </div>

          {/* Live Summary Preview Pill */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FFDDF0]/40 via-[#EDE2FF]/50 to-[#D9EDFF]/40 border border-[#DCCAFF]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#735D90]" />
              <div className="text-xs">
                <span className="font-semibold text-[#55436D]">Adding: </span>
                <span className="font-bold text-[#55436D]">
                  {Math.floor(calculatedMinutes / 60)}h {calculatedMinutes % 60}m
                </span>
                {selectedSubject && (
                  <span className="text-[#735D90]"> to {selectedSubject.name}</span>
                )}
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-[#55436D] border border-[#DCCAFF]/50">
              Manual Entry
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#735D90] hover:bg-white/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-celestial-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5"
            >
              <span>Save Study Session ✧</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
