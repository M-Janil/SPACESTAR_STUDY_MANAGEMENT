'use client';

import React, { useState, useMemo } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Clock, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { CalendarEvent, EventType } from '@/types/starspace';
import { formatDateYMD } from '@/lib/starspaceStore';

export function CalendarView() {
  const {
    events,
    subjects,
    tasks,
    sessions,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    openManualModal,
  } = useStarspace();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Selected date for detailed Day Inspection
  const [selectedDayYMD, setSelectedDayYMD] = useState<string>(formatDateYMD(new Date()));
  const [isDayInspectorOpen, setIsDayInspectorOpen] = useState<boolean>(false);

  // Add/Edit Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventType, setEventType] = useState<EventType>('study');
  const [eventSubjectId, setEventSubjectId] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>(formatDateYMD(new Date()));
  const [eventStartTime, setEventStartTime] = useState<string>('10:00');
  const [eventEndTime, setEventEndTime] = useState<string>('11:30');
  const [eventDescription, setEventDescription] = useState<string>('');

  const todayStr = formatDateYMD(new Date());

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
    setSelectedDayYMD(todayStr);
  };

  // Month calendar grid computation
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const totalDays = lastDay.getDate();

    const days = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        date: prevDate,
        dateStr: formatDateYMD(prevDate),
        isCurrentMonth: false,
        dayNum: d,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const thisDate = new Date(year, month, d);
      days.push({
        date: thisDate,
        dateStr: formatDateYMD(thisDate),
        isCurrentMonth: true,
        dayNum: d,
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        date: nextDate,
        dateStr: formatDateYMD(nextDate),
        isCurrentMonth: false,
        dayNum: d,
      });
    }

    return days;
  }, [currentDate]);

  // Open Add Event modal
  const handleOpenAdd = (targetDate?: string) => {
    setEditingEvent(null);
    setEventTitle('');
    setEventType('exam');
    setEventSubjectId(subjects.length > 0 ? subjects[0].id : '');
    setEventDate(targetDate || selectedDayYMD || todayStr);
    setEventStartTime('10:00');
    setEventEndTime('12:00');
    setEventDescription('');
    setIsEventModalOpen(true);
  };

  // Open Edit Event modal
  const handleOpenEdit = (evt: CalendarEvent) => {
    setEditingEvent(evt);
    setEventTitle(evt.title);
    setEventType(evt.type);
    setEventSubjectId(evt.subjectId || '');
    setEventDate(evt.date);
    setEventStartTime(evt.startTime || '10:00');
    setEventEndTime(evt.endTime || '12:00');
    setEventDescription(evt.description || '');
    setIsEventModalOpen(true);
  };

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, {
        title: eventTitle.trim(),
        type: eventType,
        subjectId: eventSubjectId || undefined,
        date: eventDate,
        startTime: eventStartTime,
        endTime: eventEndTime,
        description: eventDescription.trim() || undefined,
      });
    } else {
      addCalendarEvent({
        title: eventTitle.trim(),
        type: eventType,
        subjectId: eventSubjectId || undefined,
        date: eventDate,
        startTime: eventStartTime,
        endTime: eventEndTime,
        description: eventDescription.trim() || undefined,
      });
    }

    setIsEventModalOpen(false);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDayYMD(dateStr);
    setIsDayInspectorOpen(true);
  };

  // Data for the inspector drawer
  const inspectorEvents = events.filter(e => e.date === selectedDayYMD);
  const inspectorTasks = tasks.filter(t => t.deadline === selectedDayYMD);
  const inspectorSessions = sessions.filter(s => s.date === selectedDayYMD);
  const inspectorTotalMinutes = inspectorSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base text-[#55436D]">📅</span>
            <span className="text-xs font-bold text-[#735D90] uppercase tracking-wider">
              Academic Calendar & Schedule
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
            Calendar ✧
          </h1>
          <p className="text-xs sm:text-sm text-[#735D90] font-medium">
            Schedule exams, assignment deadlines, and review study session timelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenAdd()}
            className="btn-celestial-primary px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-[#55436D]" />
            <span>Add Event / Exam ✧</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls & Month Title Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#55436D]">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={jumpToToday}
            className="btn-chrome px-2.5 py-1 rounded-xl text-xs font-bold text-[#55436D]"
          >
            Today
          </button>
        </div>

        {/* Navigation & View Switcher */}
        <div className="flex items-center gap-3">
          {/* View Mode Buttons */}
          <div className="flex p-1 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs font-bold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'month' ? 'bg-[#55436D] text-white shadow-xs' : 'text-[#735D90]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'week' ? 'bg-[#55436D] text-white shadow-xs' : 'text-[#735D90]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'day' ? 'bg-[#55436D] text-white shadow-xs' : 'text-[#735D90]'
              }`}
            >
              Day
            </button>
          </div>

          {/* Month Prev/Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-white/80 border border-[#DCCAFF] hover:bg-white text-[#55436D]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-white/80 border border-[#DCCAFF] hover:bg-white text-[#55436D]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgba(220,202,255,0.3)]">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-extrabold text-[#735D90] uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {daysInMonth.map((dayObj) => {
              const isToday = dayObj.dateStr === todayStr;
              const isSelected = dayObj.dateStr === selectedDayYMD;

              // Events on this day
              const dayEvents = events.filter(e => e.date === dayObj.dateStr);
              const dayTasks = tasks.filter(t => t.deadline === dayObj.dateStr);
              const daySessions = sessions.filter(s => s.date === dayObj.dateStr);
              const totalDayMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

              return (
                <div
                  key={dayObj.dateStr}
                  onClick={() => handleDayClick(dayObj.dateStr)}
                  className={`min-h-[90px] sm:min-h-[115px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-[#55436D] bg-white shadow-md'
                      : isToday
                      ? 'bg-gradient-to-b from-[#FFDDF0]/40 to-white/90 border-[#DCCAFF] shadow-xs'
                      : dayObj.isCurrentMonth
                      ? 'bg-white/70 hover:bg-white border-[#DCCAFF]/40'
                      : 'bg-white/25 border-transparent opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-full ${
                      isToday ? 'bg-[#55436D] text-white' : 'text-[#55436D]'
                    }`}>
                      {dayObj.dayNum}
                    </span>

                    {totalDayMinutes > 0 && (
                      <span className="text-[10px] font-timer font-bold px-1.5 py-0.2 rounded-full bg-[#EDE2FF] text-[#55436D]">
                        {(totalDayMinutes / 60).toFixed(1)}h
                      </span>
                    )}
                  </div>

                  {/* Badges Preview */}
                  <div className="flex flex-col gap-1 overflow-hidden my-1">
                    {dayEvents.slice(0, 2).map(evt => {
                      const sub = subjects.find(s => s.id === evt.subjectId);
                      return (
                        <div
                          key={evt.id}
                          className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 shadow-xs"
                          style={{ 
                            backgroundColor: evt.type === 'exam' ? '#FFDDF0' : evt.type === 'assignment' ? '#D9EDFF' : '#EDE2FF',
                            color: '#55436D'
                          }}
                        >
                          <span>{evt.type === 'exam' ? '🎯' : '📝'}</span>
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    })}

                    {dayTasks.length > 0 && (
                      <div className="text-[9px] font-bold px-1 py-0.2 rounded bg-white text-[#735D90] border border-[#DCCAFF]/40 truncate">
                        ✓ {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                      </div>
                    )}
                  </div>

                  <div className="text-[9px] text-[#735D90] text-right font-medium">
                    {dayEvents.length > 2 && `+${dayEvents.length - 2} more`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-extrabold text-[#55436D] mb-4">
            Weekly Activity Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {daysInMonth.slice(0, 7).map((d) => {
              const dayEvents = events.filter(e => e.date === d.dateStr);
              const dayTasks = tasks.filter(t => t.deadline === d.dateStr);
              const daySessions = sessions.filter(s => s.date === d.dateStr);

              return (
                <div 
                  key={d.dateStr} 
                  onClick={() => handleDayClick(d.dateStr)}
                  className="p-3.5 rounded-2xl bg-white/80 border border-[#DCCAFF]/60 cursor-pointer hover:shadow-md transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between border-b border-[#DCCAFF]/30 pb-1.5">
                    <span className="text-xs font-bold text-[#55436D]">
                      {d.date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                    </span>
                    {d.dateStr === todayStr && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#55436D] text-white">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 min-h-[100px]">
                    {dayEvents.map(e => (
                      <div key={e.id} className="text-[10px] font-bold p-1.5 rounded-lg bg-[#FFDDF0] text-[#55436D]">
                        🎯 {e.title}
                      </div>
                    ))}
                    {dayTasks.map(t => (
                      <div key={t.id} className="text-[10px] font-semibold p-1.5 rounded-lg bg-[#D9EDFF] text-[#55436D]">
                        ✓ {t.title}
                      </div>
                    ))}
                    {daySessions.length > 0 && (
                      <div className="text-[10px] font-bold p-1.5 rounded-lg bg-[#EDE2FF] text-[#55436D]">
                        ⏱️ {daySessions.length} sessions logged
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCCAFF]/40">
            <div>
              <span className="text-xs font-bold text-[#735D90] uppercase">Selected Day Timeline</span>
              <h3 className="text-xl font-extrabold text-[#55436D]">{selectedDayYMD}</h3>
            </div>
            <button
              onClick={() => handleOpenAdd(selectedDayYMD)}
              className="btn-celestial-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Event on this Day</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Events */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase text-[#735D90]">Scheduled Events & Exams</h4>
              {inspectorEvents.length === 0 ? (
                <p className="text-xs text-[#735D90] italic py-4">No events scheduled.</p>
              ) : (
                inspectorEvents.map(e => (
                  <div key={e.id} className="p-3 rounded-2xl bg-white border border-[#DCCAFF]/60 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-[#55436D]">{e.title}</p>
                      <span className="text-[10px] text-[#735D90]">{e.startTime} - {e.endTime}</span>
                    </div>
                    <button onClick={() => deleteCalendarEvent(e.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Tasks */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase text-[#735D90]">Tasks Due on this Day</h4>
              {inspectorTasks.length === 0 ? (
                <p className="text-xs text-[#735D90] italic py-4">No tasks due.</p>
              ) : (
                inspectorTasks.map(t => (
                  <div key={t.id} className="p-3 rounded-2xl bg-white border border-[#DCCAFF]/60">
                    <p className="text-xs font-bold text-[#55436D]">{t.title}</p>
                    <span className="text-[10px] text-[#735D90] capitalize">Priority: {t.priority}</span>
                  </div>
                ))
              )}
            </div>

            {/* Sessions */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase text-[#735D90]">Study Sessions Logged</h4>
              {inspectorSessions.length === 0 ? (
                <p className="text-xs text-[#735D90] italic py-4">No study sessions logged.</p>
              ) : (
                inspectorSessions.map(s => (
                  <div key={s.id} className="p-3 rounded-2xl bg-white border border-[#DCCAFF]/60">
                    <div className="flex justify-between items-center text-xs font-bold text-[#55436D]">
                      <span>⏱️ {s.startTime} - {s.endTime}</span>
                      <span className="font-timer">{(s.durationMinutes / 60).toFixed(1)}h</span>
                    </div>
                    {s.notes && <p className="text-[11px] text-[#735D90] mt-1 italic">{s.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DAY INSPECTION MODAL (When clicking any day cell) */}
      {isDayInspectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCCAFF]/40">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <div>
                  <h3 className="font-extrabold text-sm text-[#55436D]">
                    Schedule for {selectedDayYMD}
                  </h3>
                  <span className="text-[11px] text-[#735D90]">
                    {inspectorTotalMinutes > 0 ? `${(inspectorTotalMinutes / 60).toFixed(1)}h studied on this date` : 'No study logged yet'}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsDayInspectorOpen(false)} className="p-1 text-[#55436D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsDayInspectorOpen(false);
                  handleOpenAdd(selectedDayYMD);
                }}
                className="btn-celestial-primary flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Event / Exam</span>
              </button>
              <button
                onClick={() => {
                  setIsDayInspectorOpen(false);
                  openManualModal();
                }}
                className="btn-chrome flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[#55436D]" />
                <span>Add Past Session</span>
              </button>
            </div>

            {/* Scheduled Events */}
            <div>
              <h4 className="text-xs font-bold uppercase text-[#735D90] mb-2">Exams & Events ({inspectorEvents.length})</h4>
              {inspectorEvents.length === 0 ? (
                <p className="text-xs text-[#735D90] italic bg-white/50 p-3 rounded-xl">No events scheduled.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {inspectorEvents.map(e => (
                    <div key={e.id} className="p-3 rounded-2xl bg-white border border-[#DCCAFF]/50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#55436D]">{e.title}</span>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.2 rounded-full bg-[#EDE2FF] text-[#55436D]">
                            {e.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#735D90] mt-0.5">{e.startTime} - {e.endTime} {e.description ? `• ${e.description}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleOpenEdit(e)} className="p-1 text-[#735D90] hover:text-[#55436D]">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteCalendarEvent(e.id)} className="p-1 text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks Due */}
            <div>
              <h4 className="text-xs font-bold uppercase text-[#735D90] mb-2">Tasks Due ({inspectorTasks.length})</h4>
              {inspectorTasks.length === 0 ? (
                <p className="text-xs text-[#735D90] italic bg-white/50 p-3 rounded-xl">No tasks due on this date.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {inspectorTasks.map(t => (
                    <div key={t.id} className="p-3 rounded-2xl bg-white border border-[#DCCAFF]/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#55436D]">{t.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDE2FF] text-[#55436D] capitalize">{t.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Study Sessions Logged */}
            <div>
              <h4 className="text-xs font-bold uppercase text-[#735D90] mb-2">Study Sessions Logged ({inspectorSessions.length})</h4>
              {inspectorSessions.length === 0 ? (
                <p className="text-xs text-[#735D90] italic bg-white/50 p-3 rounded-xl">No study sessions logged.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {inspectorSessions.map(s => {
                    const sub = subjects.find(sub => sub.id === s.subjectId);
                    return (
                      <div key={s.id} className="p-3 rounded-2xl bg-white border border-[#DCCAFF]/50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{sub?.icon || '📖'}</span>
                            <span className="text-xs font-bold text-[#55436D]">{sub?.name || 'Subject'}</span>
                          </div>
                          <span className="text-[10px] text-[#735D90]">{s.startTime} - {s.endTime}</span>
                        </div>
                        <span className="text-xs font-extrabold font-timer text-[#55436D]">
                          {(s.durationMinutes / 60).toFixed(1)}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT EVENT MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCCAFF]/40">
              <h3 className="font-extrabold text-sm text-[#55436D]">
                {editingEvent ? 'Edit Calendar Event' : 'Add Calendar Event / Exam ✧'}
              </h3>
              <button onClick={() => setIsEventModalOpen(false)} className="p-1 text-[#55436D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#55436D]">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Calculus Midterm Exam, AI Project Milestone"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  >
                    <option value="exam">🎯 Exam Date</option>
                    <option value="assignment">📝 Assignment Deadline</option>
                    <option value="study">⏱️ Scheduled Study</option>
                    <option value="event">📅 Academic Event</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#55436D]">Subject</label>
                  <select
                    value={eventSubjectId}
                    onChange={(e) => setEventSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  >
                    <option value="">General (No subject)</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#55436D]">Date</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Start Time</label>
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#55436D]">End Time</label>
                  <input
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#55436D]">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Location, materials to bring, syllabus coverage..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#735D90]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-celestial-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  {editingEvent ? 'Update Event' : 'Schedule Event ✧'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
