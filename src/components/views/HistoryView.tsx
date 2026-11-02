'use client';

import React, { useState, useMemo } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  History, 
  PlusCircle, 
  Search, 
  Calendar, 
  Filter, 
  Trash2, 
  Edit3, 
  Clock, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  X,
  SlidersHorizontal
} from 'lucide-react';
import { StudySession } from '@/types/starspace';
import { formatDateYMD } from '@/lib/starspaceStore';

export function HistoryView() {
  const {
    sessions,
    subjects,
    openManualModal,
    updateSession,
    deleteSession,
  } = useStarspace();

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<'all' | 'timer' | 'manual'>('all');

  // Edit Modal State
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [editSubjectId, setEditSubjectId] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editDuration, setEditDuration] = useState<number>(60);
  const [editStartTime, setEditStartTime] = useState<string>('');
  const [editEndTime, setEditEndTime] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Filter Logic
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const todayStr = formatDateYMD(now);

    // Week start (Monday)
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    const mondayStr = formatDateYMD(monday);

    // Month start
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return sessions.filter((sess) => {
      // Subject filter
      if (selectedSubjectId !== 'all' && sess.subjectId !== selectedSubjectId) {
        return false;
      }

      // Time period filter
      if (timePeriod === 'today' && sess.date !== todayStr) {
        return false;
      }
      if (timePeriod === 'week' && sess.date < mondayStr) {
        return false;
      }
      if (timePeriod === 'month' && !sess.date.startsWith(monthPrefix)) {
        return false;
      }

      // Session type filter
      if (sessionTypeFilter !== 'all' && sess.type !== sessionTypeFilter) {
        return false;
      }

      // Search query in notes or subject name
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const sub = subjects.find(s => s.id === sess.subjectId);
        const subName = sub ? sub.name.toLowerCase() : '';
        const notes = sess.notes ? sess.notes.toLowerCase() : '';
        if (!subName.includes(query) && !notes.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, subjects, selectedSubjectId, timePeriod, sessionTypeFilter, searchQuery]);

  // Compute Total Time for Filtered Sessions
  const totalFilteredMinutes = useMemo(() => {
    return filteredSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [filteredSessions]);

  const totalFilteredHours = (totalFilteredMinutes / 60).toFixed(1);
  const timerSessionsCount = filteredSessions.filter(s => s.type === 'timer').length;
  const manualSessionsCount = filteredSessions.filter(s => s.type === 'manual').length;

  // Open Edit Modal
  const handleOpenEdit = (sess: StudySession) => {
    setEditingSession(sess);
    setEditSubjectId(sess.subjectId);
    setEditDate(sess.date);
    setEditDuration(sess.durationMinutes);
    setEditStartTime(sess.startTime);
    setEditEndTime(sess.endTime);
    setEditNotes(sess.notes || '');
  };

  // Save Session Edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    updateSession(editingSession.id, {
      subjectId: editSubjectId,
      date: editDate,
      durationMinutes: Math.max(1, Number(editDuration) || 1),
      startTime: editStartTime,
      endTime: editEndTime,
      notes: editNotes.trim() || undefined,
    });

    setEditingSession(null);
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    if (confirm('Delete this study session? This will recalculate all subject and weekly totals immediately.')) {
      deleteSession(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base text-[#55436D]">📜</span>
            <span className="text-xs font-bold text-[#735D90] uppercase tracking-wider">
              Study Session Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
            Study History ✧
          </h1>
          <p className="text-xs sm:text-sm text-[#735D90] font-medium">
            Complete verifiable log of every study session recorded via timer or added manually.
          </p>
        </div>

        <button
          onClick={() => openManualModal()}
          className="btn-celestial-primary self-start sm:self-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#55436D]" />
          <span>Add Missed Session ✧</span>
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-white shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Query */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#735D90] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in session notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] placeholder-[#735D90]/60 focus:outline-none"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Period Filter */}
          <div>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'all' | 'today' | 'week' | 'month')}
              className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] focus:outline-none"
            >
              <option value="all">All Recorded Dates</option>
              <option value="today">Today Only</option>
              <option value="week">Current Week</option>
              <option value="month">Current Month</option>
            </select>
          </div>

          {/* Session Type Filter */}
          <div>
            <select
              value={sessionTypeFilter}
              onChange={(e) => setSessionTypeFilter(e.target.value as 'all' | 'timer' | 'manual')}
              className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] focus:outline-none"
            >
              <option value="all">All Entry Types</option>
              <option value="timer">⏱️ Timer Recorded Only</option>
              <option value="manual">✏️ Manually Added Only</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Banner */}
        <div className="pt-3 border-t border-[#DCCAFF]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#735D90]">Filtered Total:</span>
            <span className="font-extrabold text-[#55436D] font-timer px-2.5 py-0.5 rounded-full bg-white border border-[#DCCAFF]">
              {totalFilteredHours} Hours ({totalFilteredMinutes} mins)
            </span>
            <span className="text-[#735D90]">across {filteredSessions.length} sessions</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#EDE2FF] text-[#55436D] font-bold text-[11px]">
              ⏱️ {timerSessionsCount} Timer
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FFDDF0] text-[#55436D] font-bold text-[11px]">
              ✏️ {manualSessionsCount} Manual
            </span>
          </div>
        </div>
      </div>

      {/* Session History List */}
      <div className="flex flex-col gap-3">
        {filteredSessions.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center gap-3">
            <span className="text-3xl">📜</span>
            <h4 className="text-sm font-bold text-[#55436D]">No study sessions found</h4>
            <p className="text-xs text-[#735D90]">
              No sessions match your search or filter criteria. Try adjusting the filters or adding a session manually.
            </p>
            <button
              onClick={() => openManualModal()}
              className="btn-celestial-primary px-4 py-2 rounded-xl text-xs font-bold mt-2"
            >
              Add Study Session Manually ✧
            </button>
          </div>
        ) : (
          filteredSessions.map((sess) => {
            const sub = subjects.find(s => s.id === sess.subjectId);
            const hours = Math.floor(sess.durationMinutes / 60);
            const mins = sess.durationMinutes % 60;
            const durationStr = `${hours > 0 ? `${hours}h ` : ''}${mins}m`;

            return (
              <div
                key={sess.id}
                className="glass-panel p-4 sm:p-5 rounded-2xl border border-white hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left: Subject Icon, Name, Date & Time, Notes */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs border border-white/80"
                    style={{ backgroundColor: sub?.color || '#DCCAFF' }}
                  >
                    {sub?.icon || '📖'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-[#55436D]">
                        {sub?.name || 'Unknown Subject'}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-[#735D90] border border-[#DCCAFF]/60">
                        {sess.date}
                      </span>
                      <span className="text-[10px] text-[#735D90] font-semibold">
                        {sess.startTime} - {sess.endTime}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sess.type === 'timer' 
                          ? 'bg-[#D9EDFF] text-[#55436D]' 
                          : 'bg-[#FFDDF0] text-[#55436D]'
                      }`}>
                        {sess.type === 'timer' ? '⏱️ Timer' : '✏️ Manual'}
                      </span>
                    </div>

                    {sess.notes ? (
                      <p className="text-xs text-[#55436D] mt-1 font-medium bg-white/60 p-2 rounded-xl border border-[#DCCAFF]/30">
                        {sess.notes}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#735D90]/70 italic mt-0.5">
                        No session notes recorded.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Duration Badge & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DCCAFF]/30">
                  <div className="text-right">
                    <span className="text-base font-extrabold font-timer text-[#55436D]">
                      {durationStr}
                    </span>
                    <span className="text-[10px] text-[#735D90] block font-semibold">
                      {sess.durationMinutes} minutes
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sess)}
                      className="p-1.5 rounded-lg text-[#735D90] hover:text-[#55436D] hover:bg-white/80 transition-colors"
                      title="Edit session details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(sess.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EDIT SESSION MODAL */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCCAFF]/40">
              <h3 className="font-extrabold text-sm text-[#55436D]">Edit Study Session Details</h3>
              <button onClick={() => setEditingSession(null)} className="p-1 text-[#55436D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-[#55436D]">Subject</label>
                <select
                  value={editSubjectId}
                  onChange={(e) => setEditSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={editDuration}
                    onChange={(e) => setEditDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Start Time</label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#55436D]">End Time</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#55436D]">Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#735D90]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-celestial-primary px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Save Changes ✧
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
