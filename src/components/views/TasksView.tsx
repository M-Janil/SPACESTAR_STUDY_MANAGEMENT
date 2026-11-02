'use client';

import React, { useState, useMemo } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  CheckSquare, 
  PlusCircle, 
  Filter, 
  Trash2, 
  Edit3, 
  Calendar, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Repeat, 
  X,
  CheckCircle2
} from 'lucide-react';
import { Task, TaskPriority, TaskRecurrence } from '@/types/starspace';
import { formatDateYMD } from '@/lib/starspaceStore';

export function TasksView() {
  const {
    tasks,
    subjects,
    addTask,
    updateTask,
    toggleTaskCompleted,
    deleteTask,
  } = useStarspace();

  // Active Category Filter
  const [activeCategory, setActiveCategory] = useState<'today' | 'upcoming' | 'overdue' | 'completed' | 'all'>('today');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [quickTitle, setQuickTitle] = useState<string>('');

  // Add/Edit Task Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formSubjectId, setFormSubjectId] = useState<string>('');
  const [formDeadline, setFormDeadline] = useState<string>(formatDateYMD(new Date()));
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formRecurring, setFormRecurring] = useState<TaskRecurrence>('none');

  const todayStr = formatDateYMD(new Date());

  // Categorize tasks
  const categorizedTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Subject filter
      if (subjectFilter !== 'all' && t.subjectId !== subjectFilter) {
        return false;
      }

      const isCompleted = t.status === 'completed';
      const deadline = t.deadline;

      if (activeCategory === 'completed') {
        return isCompleted;
      }

      if (activeCategory === 'today') {
        return !isCompleted && deadline === todayStr;
      }

      if (activeCategory === 'overdue') {
        return !isCompleted && deadline && deadline < todayStr;
      }

      if (activeCategory === 'upcoming') {
        return !isCompleted && deadline && deadline > todayStr;
      }

      return true; // 'all'
    });
  }, [tasks, activeCategory, subjectFilter, todayStr]);

  // Daily completion stats
  const todayTasksAll = tasks.filter(t => t.deadline === todayStr);
  const todayCompletedCount = todayTasksAll.filter(t => t.status === 'completed').length;
  const todayTotalCount = todayTasksAll.length;
  const todayPercent = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  // Counts for tabs
  const countToday = tasks.filter(t => t.status !== 'completed' && t.deadline === todayStr).length;
  const countOverdue = tasks.filter(t => t.status !== 'completed' && t.deadline && t.deadline < todayStr).length;
  const countUpcoming = tasks.filter(t => t.status !== 'completed' && t.deadline && t.deadline > todayStr).length;
  const countCompleted = tasks.filter(t => t.status === 'completed').length;

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormSubjectId(subjects.length > 0 ? subjects[0].id : '');
    setFormDeadline(todayStr);
    setFormPriority('medium');
    setFormRecurring('none');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormSubjectId(task.subjectId || '');
    setFormDeadline(task.deadline || todayStr);
    setFormPriority(task.priority);
    setFormRecurring(task.isRecurring || 'none');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        subjectId: formSubjectId || undefined,
        deadline: formDeadline || undefined,
        priority: formPriority,
        isRecurring: formRecurring,
      });
    } else {
      addTask({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        subjectId: formSubjectId || undefined,
        deadline: formDeadline || undefined,
        priority: formPriority,
        isRecurring: formRecurring,
      });
    }

    setIsModalOpen(false);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
      deadline: todayStr,
      priority: 'medium',
    });

    setQuickTitle('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base text-[#55436D]">✦</span>
            <span className="text-xs font-bold text-[#735D90] uppercase tracking-wider">
              Productivity Action Items
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
            Daily Task Manager ✧
          </h1>
          <p className="text-xs sm:text-sm text-[#735D90] font-medium">
            Keep track of assignments, problem sets, and review goals with sparkle celebrations!
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-celestial-primary self-start sm:self-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#55436D]" />
          <span>New Study Task ✧</span>
        </button>
      </div>

      {/* Daily Progress Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#55436D] mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#DCCAFF]" />
              <span>Today&apos;s Task Completion Rate</span>
            </span>
            <span className="font-timer">
              {todayCompletedCount} / {todayTotalCount} completed ({todayPercent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#EDE2FF] overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#FFDDF0] via-[#DCCAFF] to-[#D9EDFF] transition-all duration-500"
              style={{ width: `${todayPercent}%` }}
            />
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs font-bold text-[#735D90]">Filter Subject:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D]"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex p-1 rounded-2xl bg-white/70 border border-[#DCCAFF] shadow-xs flex-wrap gap-1">
        {[
          { id: 'today', label: "Today's Tasks", count: countToday },
          { id: 'upcoming', label: 'Upcoming', count: countUpcoming },
          { id: 'overdue', label: 'Overdue', count: countOverdue },
          { id: 'completed', label: 'Completed', count: countCompleted },
          { id: 'all', label: 'All Tasks', count: tasks.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as 'today' | 'upcoming' | 'overdue' | 'completed' | 'all')}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === tab.id
                ? 'bg-gradient-to-r from-[#EDE2FF] to-[#FFDDF0] text-[#55436D] shadow-xs'
                : 'text-[#735D90] hover:text-[#55436D]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategory === tab.id ? 'bg-[#55436D] text-white' : 'bg-[#EDE2FF] text-[#55436D]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Quick Add Inline Form */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="Quick add a new task for today (Press Enter)..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl bg-white/90 border border-[#DCCAFF] text-xs sm:text-sm font-bold text-[#55436D] placeholder-[#735D90]/50 focus:outline-none focus:ring-2 focus:ring-[#DCCAFF] shadow-xs"
        />
        <button
          type="submit"
          className="btn-celestial-primary px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shrink-0"
        >
          Add Task
        </button>
      </form>

      {/* Tasks List */}
      <div className="flex flex-col gap-3">
        {categorizedTasks.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center gap-3">
            <span className="text-3xl">✨</span>
            <h4 className="text-sm font-bold text-[#55436D]">
              {activeCategory === 'completed' ? 'No completed tasks yet' :
               activeCategory === 'overdue' ? 'No overdue tasks! You are right on schedule.' :
               activeCategory === 'today' ? 'No tasks scheduled for today. Take a breather or add one!' :
               'No tasks found in this view.'}
            </h4>
            <p className="text-xs text-[#735D90]">
              Stay productive by creating your study checklist!
            </p>
          </div>
        ) : (
          categorizedTasks.map((t) => {
            const isDone = t.status === 'completed';
            const sub = subjects.find(s => s.id === t.subjectId);
            const isOverdue = !isDone && t.deadline && t.deadline < todayStr;

            return (
              <div
                key={t.id}
                className={`glass-panel p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  isDone 
                    ? 'bg-white/40 border-transparent opacity-65' 
                    : isOverdue 
                    ? 'border-red-300 bg-red-50/30' 
                    : 'border-white hover:shadow-md'
                }`}
              >
                {/* Left: Checkbox + Title + Description + Tags */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => toggleTaskCompleted(t.id)}
                    className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                      isDone 
                        ? 'bg-[#55436D] border-[#55436D] text-white shadow-xs' 
                        : 'border-[#735D90] hover:bg-[#FFDDF0] bg-white'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm font-extrabold text-[#55436D] ${isDone ? 'line-through text-[#735D90]' : ''}`}>
                      {t.title}
                    </p>

                    {t.description && (
                      <p className="text-xs text-[#735D90] mt-0.5 font-medium line-clamp-1">
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {sub && (
                        <span 
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-white"
                          style={{ backgroundColor: `${sub.color}80` }}
                        >
                          <span>{sub.icon}</span>
                          <span>{sub.name}</span>
                        </span>
                      )}

                      {t.deadline && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isOverdue 
                            ? 'bg-red-100 text-red-700 font-bold' 
                            : 'bg-white/80 text-[#735D90] border border-[#DCCAFF]/50'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          <span>{isOverdue ? `Overdue (${t.deadline})` : `Due: ${t.deadline}`}</span>
                        </span>
                      )}

                      {t.isRecurring && t.isRecurring !== 'none' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EDE2FF] text-[#55436D] flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          <span className="capitalize">{t.isRecurring}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Priority Badge & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DCCAFF]/30 shrink-0">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    t.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                    t.priority === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {t.priority}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 rounded-lg text-[#735D90] hover:text-[#55436D] hover:bg-white/80 transition-colors"
                      title="Edit Task"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Task"
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

      {/* MODAL: ADD / EDIT TASK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCCAFF]/40">
              <h3 className="font-extrabold text-sm text-[#55436D]">
                {editingTask ? 'Edit Study Task' : 'Create New Study Task ✧'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#55436D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#55436D]">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Complete Problem Set 3, Read Chapter 5"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#55436D]">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional instructions or notes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#55436D]">Subject</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                >
                  <option value="">No specific subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#55436D]">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  >
                    <option value="low">Low 🟢</option>
                    <option value="medium">Medium 🟡</option>
                    <option value="high">High 🔴</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#55436D]">Recurrence</label>
                <select
                  value={formRecurring}
                  onChange={(e) => setFormRecurring(e.target.value as TaskRecurrence)}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                >
                  <option value="none">One-time task</option>
                  <option value="daily">Repeats Daily</option>
                  <option value="weekly">Repeats Weekly</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#735D90]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-celestial-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  {editingTask ? 'Update Task' : 'Create Task ✧'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
