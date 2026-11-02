'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Subject, 
  StudySession, 
  ActiveTimerData, 
  Task, 
  CalendarEvent, 
  ResourceItem, 
  ResourceFolder, 
  Achievement, 
  UserSettings 
} from '@/types/starspace';
import { starspaceStore } from '@/lib/starspaceStore';
import { sounds } from '@/lib/soundEffects';

interface StarspaceContextType {
  // State
  subjects: Subject[];
  sessions: StudySession[];
  activeTimer: ActiveTimerData;
  tasks: Task[];
  events: CalendarEvent[];
  resources: ResourceItem[];
  folders: ResourceFolder[];
  settings: UserSettings;
  achievements: Achievement[];
  saveStatus: 'saved' | 'saving' | 'error';
  
  // Navigation & Modals
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isManualModalOpen: boolean;
  setIsManualModalOpen: (open: boolean) => void;
  manualModalSubjectId: string | undefined;
  setManualModalSubjectId: (id: string | undefined) => void;
  openManualModal: (preselectedSubjectId?: string) => void;
  isFocusModeOpen: boolean;
  setIsFocusModeOpen: (open: boolean) => void;
  selectedSubjectIdForWorkspace: string | null;
  setSelectedSubjectIdForWorkspace: (id: string | null) => void;

  // Real-time Timer values
  timerElapsedMs: number;
  formattedTimerTime: string;

  // Computed Stats
  todayMinutes: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  lifetimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  todayTasksCompletedCount: number;
  todayTotalTasksCount: number;

  // Actions
  addSubject: (data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  startTimer: (subjectId: string, mode?: 'stopwatch' | 'pomodoro', durationMinutes?: number) => boolean;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopAndSaveTimer: () => StudySession | null;
  cancelTimer: () => void;
  updateTimerNotes: (notes: string) => void;

  addManualSession: (data: {
    subjectId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    durationMinutes: number;
    notes?: string;
  }) => StudySession;
  updateSession: (id: string, updates: Partial<StudySession>) => void;
  deleteSession: (id: string) => void;

  addTask: (data: Omit<Task, 'id' | 'status' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskCompleted: (id: string) => void;
  deleteTask: (id: string) => void;

  addCalendarEvent: (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => CalendarEvent;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  addResource: (data: Omit<ResourceItem, 'id' | 'createdAt'>) => ResourceItem;
  updateResource: (id: string, updates: Partial<ResourceItem>) => void;
  deleteResource: (id: string) => void;
  addFolder: (data: Omit<ResourceFolder, 'id' | 'createdAt'>) => ResourceFolder;
  deleteFolder: (id: string) => void;

  updateSettings: (updates: Partial<UserSettings>) => void;
  exportSessionsCsv: () => string;
  exportSubjectsCsv: () => string;
  exportTasksCsv: () => string;
  createBackupJson: () => string;
  restoreFromBackupJson: (json: string, mode?: 'replace' | 'merge') => { success: boolean; error?: string; summary?: string };
  clearAllData: () => void;

  triggerConfetti: () => void;
}

const StarspaceContext = createContext<StarspaceContextType | null>(null);

export function StarspaceProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeTimer, setActiveTimer] = useState<ActiveTimerData>(starspaceStore.getActiveTimer());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [settings, setSettings] = useState<UserSettings>(starspaceStore.getSettings());
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualModalSubjectId, setManualModalSubjectId] = useState<string | undefined>(undefined);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState<boolean>(false);
  const [selectedSubjectIdForWorkspace, setSelectedSubjectIdForWorkspace] = useState<string | null>(null);

  // Live timer tick state
  const [timerElapsedMs, setTimerElapsedMs] = useState<number>(0);

  // Refresh all state from store
  const refreshFromStore = useCallback(() => {
    setSubjects(starspaceStore.getSubjects());
    setSessions(starspaceStore.getSessions());
    setActiveTimer(starspaceStore.getActiveTimer());
    setTasks(starspaceStore.getTasks());
    setEvents(starspaceStore.getEvents());
    setResources(starspaceStore.getResources());
    setFolders(starspaceStore.getFolders());
    setSettings(starspaceStore.getSettings());
    setAchievements(starspaceStore.getAchievements());
  }, []);

  // Listen to store changes
  useEffect(() => {
    refreshFromStore();
    const unsubStore = starspaceStore.subscribe(() => {
      refreshFromStore();
    });
    const unsubStatus = starspaceStore.subscribeSaveStatus((status) => {
      setSaveStatus(status);
    });

    return () => {
      unsubStore();
      unsubStatus();
    };
  }, [refreshFromStore]);

  // Live timer interval: updates every 200ms using actual timestamp delta!
  useEffect(() => {
    const updateTimer = () => {
      if (activeTimer.isActive) {
        const ms = starspaceStore.getTimerCurrentElapsedMs();
        setTimerElapsedMs(ms);
      } else {
        setTimerElapsedMs(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 200);
    return () => clearInterval(interval);
  }, [activeTimer.isActive, activeTimer.isPaused]);

  // Formatted timer string HH:MM:SS
  const formattedTimerTime = useMemo(() => {
    if (!activeTimer.isActive) {
      if (activeTimer.mode === 'pomodoro') {
        const totalSec = activeTimer.pomodoroDurationMinutes * 60;
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
      return '00:00:00';
    }

    if (activeTimer.mode === 'pomodoro') {
      const targetSec = activeTimer.pomodoroDurationMinutes * 60;
      const elapsedSec = Math.floor(timerElapsedMs / 1000);
      const remainingSec = Math.max(0, targetSec - elapsedSec);
      const m = Math.floor(remainingSec / 60);
      const s = remainingSec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    const totalSeconds = Math.floor(timerElapsedMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [activeTimer, timerElapsedMs]);

  // Auto-switch tabs if requested
  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openManualModal = useCallback((preselectedSubjectId?: string) => {
    setManualModalSubjectId(preselectedSubjectId);
    setIsManualModalOpen(true);
  }, []);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFDDF0', '#DCCAFF', '#D9EDFF', '#FFFFFF', '#EDE2FF'],
      });
    } catch {
      // ignore in non-browser env
    }
  }, []);

  // Mount state for SSR hydration safety
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Computed values
  const todayMinutes = useMemo(() => isMounted ? starspaceStore.getTodayMinutes() : 0, [sessions, isMounted]);
  const weeklyMinutes = useMemo(() => isMounted ? starspaceStore.getWeeklyMinutes() : 0, [sessions, isMounted]);
  const monthlyMinutes = useMemo(() => isMounted ? starspaceStore.getMonthlyMinutes() : 0, [sessions, isMounted]);
  const lifetimeMinutes = useMemo(() => isMounted ? starspaceStore.getLifetimeMinutes() : 0, [sessions, isMounted]);
  const currentStreak = useMemo(() => isMounted ? starspaceStore.calculateStreak() : 0, [sessions, isMounted]);
  const longestStreak = useMemo(() => isMounted ? starspaceStore.calculateLongestStreak() : 0, [sessions, isMounted]);

  const todayTasks = useMemo(() => {
    if (!isMounted) return [];
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.deadline === today || t.status === 'completed');
  }, [tasks, isMounted]);

  const todayTasksCompletedCount = useMemo(() => {
    return todayTasks.filter(t => t.status === 'completed').length;
  }, [todayTasks]);

  const todayTotalTasksCount = todayTasks.length;

  // Actions wrapped
  const addSubject = useCallback((data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    return starspaceStore.addSubject(data);
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    starspaceStore.updateSubject(id, updates);
  }, []);

  const deleteSubject = useCallback((id: string) => {
    starspaceStore.deleteSubject(id);
  }, []);

  const startTimer = useCallback((subjectId: string, mode?: 'stopwatch' | 'pomodoro', durationMinutes?: number) => {
    return starspaceStore.startTimer(subjectId, mode, durationMinutes);
  }, []);

  const pauseTimer = useCallback(() => {
    starspaceStore.pauseTimer();
  }, []);

  const resumeTimer = useCallback(() => {
    starspaceStore.resumeTimer();
  }, []);

  const stopAndSaveTimer = useCallback(() => {
    const session = starspaceStore.stopAndSaveTimer();
    if (session) {
      triggerConfetti();
    }
    return session;
  }, [triggerConfetti]);

  const cancelTimer = useCallback(() => {
    starspaceStore.cancelTimer();
  }, []);

  const updateTimerNotes = useCallback((notes: string) => {
    starspaceStore.updateTimerNotes(notes);
  }, []);

  const addManualSession = useCallback((data: {
    subjectId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    durationMinutes: number;
    notes?: string;
  }) => {
    const session = starspaceStore.addManualSession(data);
    triggerConfetti();
    return session;
  }, [triggerConfetti]);

  const updateSession = useCallback((id: string, updates: Partial<StudySession>) => {
    starspaceStore.updateSession(id, updates);
  }, []);

  const deleteSession = useCallback((id: string) => {
    starspaceStore.deleteSession(id);
  }, []);

  const addTask = useCallback((data: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    return starspaceStore.addTask(data);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    starspaceStore.updateTask(id, updates);
  }, []);

  const toggleTaskCompleted = useCallback((id: string) => {
    starspaceStore.toggleTaskCompleted(id);
    triggerConfetti();
  }, [triggerConfetti]);

  const deleteTask = useCallback((id: string) => {
    starspaceStore.deleteTask(id);
  }, []);

  const addCalendarEvent = useCallback((data: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    return starspaceStore.addCalendarEvent(data);
  }, []);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    starspaceStore.updateCalendarEvent(id, updates);
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    starspaceStore.deleteCalendarEvent(id);
  }, []);

  const addResource = useCallback((data: Omit<ResourceItem, 'id' | 'createdAt'>) => {
    return starspaceStore.addResource(data);
  }, []);

  const updateResource = useCallback((id: string, updates: Partial<ResourceItem>) => {
    starspaceStore.updateResource(id, updates);
  }, []);

  const deleteResource = useCallback((id: string) => {
    starspaceStore.deleteResource(id);
  }, []);

  const addFolder = useCallback((data: Omit<ResourceFolder, 'id' | 'createdAt'>) => {
    return starspaceStore.addFolder(data);
  }, []);

  const deleteFolder = useCallback((id: string) => {
    starspaceStore.deleteFolder(id);
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    starspaceStore.updateSettings(updates);
  }, []);

  const exportSessionsCsv = useCallback(() => starspaceStore.exportSessionsCsv(), []);
  const exportSubjectsCsv = useCallback(() => starspaceStore.exportSubjectsCsv(), []);
  const exportTasksCsv = useCallback(() => starspaceStore.exportTasksCsv(), []);
  const createBackupJson = useCallback(() => starspaceStore.createBackupJson(), []);
  const restoreFromBackupJson = useCallback((json: string, mode?: 'replace' | 'merge') => {
    return starspaceStore.restoreFromBackupJson(json, mode);
  }, []);
  const clearAllData = useCallback(() => {
    starspaceStore.clearAllData();
  }, []);

  const value = {
    subjects,
    sessions,
    activeTimer,
    tasks,
    events,
    resources,
    folders,
    settings,
    achievements,
    saveStatus,
    activeTab,
    setActiveTab,
    isManualModalOpen,
    setIsManualModalOpen,
    manualModalSubjectId,
    setManualModalSubjectId,
    openManualModal,
    isFocusModeOpen,
    setIsFocusModeOpen,
    selectedSubjectIdForWorkspace,
    setSelectedSubjectIdForWorkspace,
    timerElapsedMs,
    formattedTimerTime,
    todayMinutes,
    weeklyMinutes,
    monthlyMinutes,
    lifetimeMinutes,
    currentStreak,
    longestStreak,
    todayTasksCompletedCount,
    todayTotalTasksCount,
    addSubject,
    updateSubject,
    deleteSubject,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    cancelTimer,
    updateTimerNotes,
    addManualSession,
    updateSession,
    deleteSession,
    addTask,
    updateTask,
    toggleTaskCompleted,
    deleteTask,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    addResource,
    updateResource,
    deleteResource,
    addFolder,
    deleteFolder,
    updateSettings,
    exportSessionsCsv,
    exportSubjectsCsv,
    exportTasksCsv,
    createBackupJson,
    restoreFromBackupJson,
    clearAllData,
    triggerConfetti,
  };

  return (
    <StarspaceContext.Provider value={value}>
      {children}
    </StarspaceContext.Provider>
  );
}

export function useStarspace() {
  const context = useContext(StarspaceContext);
  if (!context) {
    throw new Error('useStarspace must be used within a StarspaceProvider');
  }
  return context;
}
