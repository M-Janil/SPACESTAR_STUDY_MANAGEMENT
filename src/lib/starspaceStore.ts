import { 
  Subject, 
  StudySession, 
  ActiveTimerData, 
  Task, 
  CalendarEvent, 
  ResourceItem, 
  ResourceFolder, 
  Achievement, 
  UserSettings, 
  StarspaceBackup 
} from '@/types/starspace';
import { sounds } from './soundEffects';

const STORAGE_KEYS = {
  SUBJECTS: 'starspace_subjects_clean_zero',
  SESSIONS: 'starspace_sessions_clean_zero',
  TIMER: 'starspace_timer_clean_zero',
  TASKS: 'starspace_tasks_clean_zero',
  EVENTS: 'starspace_events_clean_zero',
  RESOURCES: 'starspace_resources_clean_zero',
  FOLDERS: 'starspace_folders_clean_zero',
  SETTINGS: 'starspace_settings_clean_zero',
  ACHIEVEMENTS: 'starspace_achievements_clean_zero',
};

// Default User Settings (Absolute Zero State)
export const DEFAULT_SETTINGS: UserSettings = {
  userName: '',
  dailyGoalHours: 0,
  weeklyGoalHours: 0,
  pomodoroSettings: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
  },
  soundEnabled: true,
  motivationalQuotesEnabled: true,
  ambientStarsEnabled: true,
  activeTab: 'dashboard',
};

// Helper to format date YYYY-MM-DD
export function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
// Achievement definitions (Starts at zero)
export const ACHIEVEMENTS_DEF: Achievement[] = [
  {
    id: 'ach-first-step',
    title: 'First Steps ✧',
    description: 'Record your very first study session in STARSPACE.',
    icon: '🌱',
    category: 'special',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
  },
  {
    id: 'ach-rising-star',
    title: 'Rising Star ⋆',
    description: 'Accumulate 5 total hours of focused study.',
    icon: '🌟',
    category: 'hours',
    progress: 0,
    maxProgress: 5,
    unlocked: false,
  },
  {
    id: 'ach-shooting-star',
    title: 'Shooting Star 💫',
    description: 'Accumulate 25 total hours of focused study.',
    icon: '🌠',
    category: 'hours',
    progress: 0,
    maxProgress: 25,
    unlocked: false,
  },
  {
    id: 'ach-superstar',
    title: 'Superstar 👑',
    description: 'Accumulate 100 total hours of deep cosmic learning.',
    icon: '🪐',
    category: 'hours',
    progress: 0,
    maxProgress: 100,
    unlocked: false,
  },
  {
    id: 'ach-consistency-queen',
    title: 'Consistency Queen 🌸',
    description: 'Achieve a 7-day continuous study streak.',
    icon: '✨',
    category: 'streak',
    progress: 0,
    maxProgress: 7,
    unlocked: false,
  },
  {
    id: 'ach-night-owl',
    title: 'Night Owl 🦉',
    description: 'Complete a productive study session between 10 PM and 4 AM.',
    icon: '🌙',
    category: 'special',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
  },
  {
    id: 'ach-early-bird',
    title: 'Early Bird ☀️',
    description: 'Start a morning study session before 8:00 AM.',
    icon: '🌅',
    category: 'special',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
  },
  {
    id: 'ach-deep-diver',
    title: 'Deep Diver 🌊',
    description: 'Complete a single study session lasting 2 hours or more.',
    icon: '⚡',
    category: 'special',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
  },
  {
    id: 'ach-task-master',
    title: 'Task Master ✦',
    description: 'Complete 10 study tasks.',
    icon: '🎯',
    category: 'tasks',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
  },
  {
    id: 'ach-scholar',
    title: 'Celestial Scholar 📚',
    description: 'Maintain 4 or more active subjects in your universe.',
    icon: '📖',
    category: 'subjects',
    progress: 0,
    maxProgress: 4,
    unlocked: false,
  },
];

// Empty Initial Timer State
export const INITIAL_TIMER_STATE: ActiveTimerData = {
  isActive: false,
  isPaused: false,
  subjectId: '',
  startTime: 0,
  pausedAt: null,
  accumulatedPauseMs: 0,
  notes: '',
  mode: 'stopwatch',
  pomodoroPhase: 'focus',
  pomodoroCyclesCompleted: 0,
  pomodoroDurationMinutes: 25,
};

type StoreListener = () => void;
type SaveStatus = 'saved' | 'saving' | 'error';
type SaveStatusListener = (status: SaveStatus) => void;

class StarspaceStore {
  private subjects: Subject[] = [];
  private sessions: StudySession[] = [];
  private timer: ActiveTimerData = { ...INITIAL_TIMER_STATE };
  private tasks: Task[] = [];
  private events: CalendarEvent[] = [];
  private resources: ResourceItem[] = [];
  private folders: ResourceFolder[] = [];
  private settings: UserSettings = { ...DEFAULT_SETTINGS };
  private achievements: Achievement[] = [...ACHIEVEMENTS_DEF];

  private listeners: Set<StoreListener> = new Set();
  private saveStatusListeners: Set<SaveStatusListener> = new Set();
  private saveStatus: SaveStatus = 'saved';
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initFromLocalStorage();
    }
  }

  private notifySaveStatus(status: SaveStatus) {
    this.saveStatus = status;
    this.saveStatusListeners.forEach(listener => listener(status));
  }

  private triggerAutoSave() {
    this.notifySaveStatus('saving');
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistToLocalStorage();
      this.recalculateAchievements();
      this.notifySaveStatus('saved');
    }, 250);
  }

  public getSaveStatus(): SaveStatus {
    return this.saveStatus;
  }

  public subscribeSaveStatus(listener: SaveStatusListener): () => void {
    this.saveStatusListeners.add(listener);
    listener(this.saveStatus);
    return () => this.saveStatusListeners.delete(listener);
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Load from local storage or start completely from ZERO (fresh start)
  private initFromLocalStorage() {
    try {
      // Clear all legacy demo data keys to guarantee an absolute zero start
      if (typeof window !== 'undefined') {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('starspace_') && !k.includes('clean_zero')) {
              keysToRemove.push(k);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch {}
      }

      const rawSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const rawTimer = localStorage.getItem(STORAGE_KEYS.TIMER);
      const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const rawEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const rawResources = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      const rawFolders = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const rawAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);

      // Start fresh from zero: empty arrays
      this.subjects = rawSubjects ? JSON.parse(rawSubjects) : [];
      this.sessions = rawSessions ? JSON.parse(rawSessions) : [];
      this.tasks = rawTasks ? JSON.parse(rawTasks) : [];
      this.events = rawEvents ? JSON.parse(rawEvents) : [];
      this.resources = rawResources ? JSON.parse(rawResources) : [];
      this.folders = rawFolders ? JSON.parse(rawFolders) : [];

      if (rawTimer) {
        this.timer = JSON.parse(rawTimer);
        if (this.timer.isActive && this.timer.startTime <= 0) {
          this.timer = { ...INITIAL_TIMER_STATE };
        }
      } else {
        this.timer = { ...INITIAL_TIMER_STATE };
      }

      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          userName: parsed.userName || '',
          dailyGoalHours: Number(parsed.dailyGoalHours) || 0,
          weeklyGoalHours: Number(parsed.weeklyGoalHours) || 0,
        };
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
      }

      sounds.setEnabled(this.settings.soundEnabled);

      if (rawAchievements) {
        this.achievements = JSON.parse(rawAchievements);
      } else {
        this.achievements = ACHIEVEMENTS_DEF.map(a => ({
          ...a,
          progress: 0,
          unlocked: false,
          unlockedAt: undefined,
        }));
      }

      this.initialized = true;
      this.recalculateAchievements();
      this.persistToLocalStorage();
    } catch (e) {
      console.error('Error initializing STARSPACE store:', e);
      this.subjects = [];
      this.sessions = [];
      this.tasks = [];
      this.events = [];
      this.resources = [];
      this.folders = [];
      this.settings = { ...DEFAULT_SETTINGS };
      this.timer = { ...INITIAL_TIMER_STATE };
      this.achievements = ACHIEVEMENTS_DEF.map(a => ({
        ...a,
        progress: 0,
        unlocked: false,
        unlockedAt: undefined,
      }));
    }
  }

  private persistToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(this.subjects));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(this.sessions));
      localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(this.timer));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(this.resources));
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(this.folders));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(this.achievements));
    } catch (err) {
      console.error('Failed to persist to localStorage:', err);
      this.notifySaveStatus('error');
    }
  }

  // Recalculate achievement progress based on real session and task data
  private recalculateAchievements() {
    const totalMinutes = this.sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const streak = this.calculateStreak();
    const completedTasksCount = this.tasks.filter(t => t.status === 'completed').length;
    const subjectsCount = this.subjects.length;
    const hasLongSession = this.sessions.some(s => s.durationMinutes >= 120);

    let newlyUnlocked = false;

    this.achievements = this.achievements.map(ach => {
      let progress = ach.progress;
      let unlocked = ach.unlocked;

      if (ach.id === 'ach-first-step') {
        progress = this.sessions.length > 0 ? 1 : 0;
        if (progress >= 1 && !unlocked) { unlocked = true; newlyUnlocked = true; }
      } else if (ach.id === 'ach-rising-star') {
        progress = Math.min(ach.maxProgress, totalHours);
        if (totalHours >= 5 && !unlocked) { unlocked = true; newlyUnlocked = true; }
      } else if (ach.id === 'ach-shooting-star') {
        progress = Math.min(ach.maxProgress, totalHours);
        if (totalHours >= 25 && !unlocked) { unlocked = true; newlyUnlocked = true; }
      } else if (ach.id === 'ach-superstar') {
        progress = Math.min(ach.maxProgress, totalHours);
        if (totalHours >= 100 && !unlocked) { unlocked = true; newlyUnlocked = true; }
      } else if (ach.id === 'ach-consistency-queen') {
        progress = Math.min(ach.maxProgress, streak);
        if (streak >= 7 && !unlocked) { unlocked = true; newlyUnlocked = true; }
      } else if (ach.id === 'ach-deep-diver') {
        progress = hasLongSession ? 1 : 0;
        if (hasLongSession && !unlocked) { unlocked = true; newlyUnlocked = true; }
      } else if (ach.id === 'ach-task-master') {
        progress = Math.min(ach.maxProgress, completedTasksCount);
        if (completedTasksCount >= 10 && !unlocked) { unlocked = true; newlyUnlocked = true; }
      } else if (ach.id === 'ach-scholar') {
        progress = Math.min(ach.maxProgress, subjectsCount);
        if (subjectsCount >= 4 && !unlocked) { unlocked = true; newlyUnlocked = true; }
      }

      return {
        ...ach,
        progress,
        unlocked,
        unlockedAt: unlocked && !ach.unlockedAt ? new Date().toISOString() : ach.unlockedAt,
      };
    });

    if (newlyUnlocked) {
      sounds.playAchievement();
    }
  }

  // --- GETTERS ---
  public getSubjects(): Subject[] { return [...this.subjects]; }
  public getSubject(id: string): Subject | undefined { return this.subjects.find(s => s.id === id); }
  public getSessions(): StudySession[] { return [...this.sessions]; }
  public getActiveTimer(): ActiveTimerData { return { ...this.timer }; }
  public getTasks(): Task[] { return [...this.tasks]; }
  public getEvents(): CalendarEvent[] { return [...this.events]; }
  public getResources(): ResourceItem[] { return [...this.resources]; }
  public getFolders(): ResourceFolder[] { return [...this.folders]; }
  public getSettings(): UserSettings { return { ...this.settings }; }
  public getAchievements(): Achievement[] { return [...this.achievements]; }

  // --- SUBJECT OPERATIONS ---
  public addSubject(subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Subject {
    const newSubject: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.subjects.push(newSubject);
    this.triggerAutoSave();
    this.notify();
    return newSubject;
  }

  public updateSubject(id: string, updates: Partial<Subject>): void {
    const idx = this.subjects.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.subjects[idx] = {
        ...this.subjects[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.triggerAutoSave();
      this.notify();
    }
  }

  public deleteSubject(id: string): void {
    this.subjects = this.subjects.filter(s => s.id !== id);
    // clean up associated sessions, tasks, events, resources
    this.sessions = this.sessions.filter(s => s.subjectId !== id);
    this.tasks = this.tasks.filter(t => t.subjectId !== id);
    this.events = this.events.filter(e => e.subjectId !== id);
    this.resources = this.resources.filter(r => r.subjectId !== id);
    this.folders = this.folders.filter(f => f.subjectId !== id);
    if (this.timer.subjectId === id) {
      this.cancelTimer();
    }
    this.triggerAutoSave();
    this.notify();
  }

  // --- STUDY SESSIONS & TIMER OPERATIONS ---

  // Actual timestamp calculation for timer
  public getTimerCurrentElapsedMs(): number {
    if (!this.timer.isActive) return 0;
    const now = Date.now();
    if (this.timer.isPaused) {
      const pausedAt = this.timer.pausedAt || now;
      return Math.max(0, pausedAt - this.timer.startTime - this.timer.accumulatedPauseMs);
    }
    return Math.max(0, now - this.timer.startTime - this.timer.accumulatedPauseMs);
  }

  public startTimer(subjectId: string, mode: 'stopwatch' | 'pomodoro' = 'stopwatch', durationMinutes: number = 25): boolean {
    if (this.timer.isActive) {
      return false; // prevent multiple simultaneous active sessions
    }
    const now = Date.now();
    this.timer = {
      isActive: true,
      isPaused: false,
      subjectId,
      startTime: now,
      pausedAt: null,
      accumulatedPauseMs: 0,
      notes: '',
      mode,
      pomodoroPhase: 'focus',
      pomodoroCyclesCompleted: 0,
      pomodoroDurationMinutes: durationMinutes,
    };
    this.triggerAutoSave();
    this.notify();
    return true;
  }

  public pauseTimer(): void {
    if (!this.timer.isActive || this.timer.isPaused) return;
    this.timer.isPaused = true;
    this.timer.pausedAt = Date.now();
    this.triggerAutoSave();
    this.notify();
  }

  public resumeTimer(): void {
    if (!this.timer.isActive || !this.timer.isPaused) return;
    const now = Date.now();
    if (this.timer.pausedAt) {
      const pauseDuration = now - this.timer.pausedAt;
      this.timer.accumulatedPauseMs += pauseDuration;
    }
    this.timer.isPaused = false;
    this.timer.pausedAt = null;
    this.triggerAutoSave();
    this.notify();
  }

  public updateTimerNotes(notes: string): void {
    if (!this.timer.isActive) return;
    this.timer.notes = notes;
    this.triggerAutoSave();
    this.notify();
  }

  public stopAndSaveTimer(): StudySession | null {
    if (!this.timer.isActive) return null;

    const elapsedMs = this.getTimerCurrentElapsedMs();
    const durationMinutes = Math.max(1, Math.round(elapsedMs / 60000));
    const now = new Date();
    const startTimeObj = new Date(this.timer.startTime);

    const pad = (n: number) => String(n).padStart(2, '0');
    const startTimeStr = `${pad(startTimeObj.getHours())}:${pad(startTimeObj.getMinutes())}`;
    const endTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newSession: StudySession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subjectId: this.timer.subjectId,
      date: formatDateYMD(now),
      startTime: startTimeStr,
      endTime: endTimeStr,
      durationMinutes,
      type: 'timer',
      notes: this.timer.notes?.trim() || undefined,
      createdAt: now.toISOString(),
    };

    this.sessions.unshift(newSession);
    this.timer = { ...INITIAL_TIMER_STATE };

    sounds.playChime();
    this.triggerAutoSave();
    this.notify();
    return newSession;
  }

  public cancelTimer(): void {
    this.timer = { ...INITIAL_TIMER_STATE };
    this.triggerAutoSave();
    this.notify();
  }

  // --- MANUAL STUDY SESSION ENTRY ---
  public addManualSession(sessionData: {
    subjectId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    durationMinutes: number;
    notes?: string;
  }): StudySession {
    // Validate: duration must be positive
    const durationMinutes = Math.max(1, Math.round(sessionData.durationMinutes));

    // Validate date: cannot be future date
    const todayStr = formatDateYMD(new Date());
    const validDate = sessionData.date > todayStr ? todayStr : sessionData.date;

    const pad = (n: number) => String(n).padStart(2, '0');
    let startTime = sessionData.startTime || '12:00';
    let endTime = sessionData.endTime;

    if (!endTime && startTime) {
      const [h, m] = startTime.split(':').map(Number);
      const totalStartMin = (h || 0) * 60 + (m || 0);
      const totalEndMin = (totalStartMin + durationMinutes) % 1440;
      const endH = Math.floor(totalEndMin / 60);
      const endM = totalEndMin % 60;
      endTime = `${pad(endH)}:${pad(endM)}`;
    } else if (!endTime) {
      endTime = '13:00';
    }

    const newSession: StudySession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subjectId: sessionData.subjectId,
      date: validDate,
      startTime,
      endTime,
      durationMinutes,
      type: 'manual',
      notes: sessionData.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    this.sessions.unshift(newSession);
    // Sort sessions by date descending, then createdAt descending
    this.sessions.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    });

    sounds.playChime();
    this.triggerAutoSave();
    this.notify();
    return newSession;
  }

  public updateSession(id: string, updates: Partial<StudySession>): void {
    const idx = this.sessions.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.sessions[idx] = {
        ...this.sessions[idx],
        ...updates,
      };
      this.triggerAutoSave();
      this.notify();
    }
  }

  public deleteSession(id: string): void {
    this.sessions = this.sessions.filter(s => s.id !== id);
    this.triggerAutoSave();
    this.notify();
  }

  // --- TASKS OPERATIONS ---
  public addTask(taskData: Omit<Task, 'id' | 'status' | 'createdAt'>): Task {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    this.triggerAutoSave();
    this.notify();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): void {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.tasks[idx] = { ...this.tasks[idx], ...updates };
      this.triggerAutoSave();
      this.notify();
    }
  }

  public toggleTaskCompleted(id: string): void {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const isNowCompleted = this.tasks[idx].status !== 'completed';
      this.tasks[idx] = {
        ...this.tasks[idx],
        status: isNowCompleted ? 'completed' : 'pending',
        completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      };

      if (isNowCompleted) {
        sounds.playSparkle();
      }

      this.triggerAutoSave();
      this.notify();
    }
  }

  public deleteTask(id: string): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.triggerAutoSave();
    this.notify();
  }

  // --- CALENDAR EVENTS OPERATIONS ---
  public addCalendarEvent(eventData: Omit<CalendarEvent, 'id' | 'createdAt'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.events.push(newEvent);
    this.triggerAutoSave();
    this.notify();
    return newEvent;
  }

  public updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): void {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.events[idx] = { ...this.events[idx], ...updates };
      this.triggerAutoSave();
      this.notify();
    }
  }

  public deleteCalendarEvent(id: string): void {
    this.events = this.events.filter(e => e.id !== id);
    this.triggerAutoSave();
    this.notify();
  }

  // --- RESOURCES & NOTES OPERATIONS ---
  public addResource(item: Omit<ResourceItem, 'id' | 'createdAt'>): ResourceItem {
    const newRes: ResourceItem = {
      ...item,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.resources.unshift(newRes);
    this.triggerAutoSave();
    this.notify();
    return newRes;
  }

  public updateResource(id: string, updates: Partial<ResourceItem>): void {
    const idx = this.resources.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.resources[idx] = { ...this.resources[idx], ...updates };
      this.triggerAutoSave();
      this.notify();
    }
  }

  public deleteResource(id: string): void {
    this.resources = this.resources.filter(r => r.id !== id);
    this.triggerAutoSave();
    this.notify();
  }

  public addFolder(folderData: Omit<ResourceFolder, 'id' | 'createdAt'>): ResourceFolder {
    const newFolder: ResourceFolder = {
      ...folderData,
      id: `fld-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.folders.push(newFolder);
    this.triggerAutoSave();
    this.notify();
    return newFolder;
  }

  public deleteFolder(id: string): void {
    this.folders = this.folders.filter(f => f.id !== id);
    this.resources = this.resources.map(r => r.folderId === id ? { ...r, folderId: undefined } : r);
    this.triggerAutoSave();
    this.notify();
  }

  // --- SETTINGS OPERATIONS ---
  public updateSettings(updates: Partial<UserSettings>): void {
    this.settings = { ...this.settings, ...updates };
    if (updates.soundEnabled !== undefined) {
      sounds.setEnabled(updates.soundEnabled);
    }
    this.triggerAutoSave();
    this.notify();
  }

  // --- STATS & ANALYTICS CALCULATIONS ---

  // Today's total study minutes
  public getTodayMinutes(): number {
    const today = formatDateYMD(new Date());
    return this.sessions
      .filter(s => s.date === today)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }

  // Current calendar week's total study minutes (Monday to Sunday)
  public getWeeklyMinutes(): number {
    const now = new Date();
    // Monday of current week
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    const mondayStr = formatDateYMD(monday);

    return this.sessions
      .filter(s => s.date >= mondayStr)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }

  // Monthly minutes
  public getMonthlyMinutes(): number {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.sessions
      .filter(s => s.date.startsWith(monthPrefix))
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }

  // Lifetime total minutes
  public getLifetimeMinutes(): number {
    return this.sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  }

  // Subject study minutes for current week
  public getSubjectWeeklyMinutes(subjectId: string): number {
    const now = new Date();
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    const mondayStr = formatDateYMD(monday);

    return this.sessions
      .filter(s => s.subjectId === subjectId && s.date >= mondayStr)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }

  // Subject total all-time study minutes
  public getSubjectTotalMinutes(subjectId: string): number {
    return this.sessions
      .filter(s => s.subjectId === subjectId)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }

  // Study streak: consecutive days with at least 1 session ending today or yesterday
  public calculateStreak(): number {
    if (this.sessions.length === 0) return 0;

    const uniqueDates = Array.from(new Set(this.sessions.map(s => s.date))).sort().reverse();
    const todayStr = formatDateYMD(new Date());
    const yesterdayStr = formatDateYMD(new Date(Date.now() - 86400000));

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0; // Streak broken if neither today nor yesterday has a session
    }

    let streak = 1;
    let currentDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevExpectedDate = new Date(currentDate.getTime() - 86400000);
      const prevExpectedStr = formatDateYMD(prevExpectedDate);

      if (uniqueDates[i] === prevExpectedStr) {
        streak++;
        currentDate = prevExpectedDate;
      } else {
        break;
      }
    }

    return streak;
  }

  // Longest streak
  public calculateLongestStreak(): number {
    if (this.sessions.length === 0) return 0;
    const uniqueDates = Array.from(new Set(this.sessions.map(s => s.date))).sort();

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const nextExpected = formatDateYMD(new Date(prevDate.getTime() + 86400000));

      if (uniqueDates[i] === nextExpected) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  // Daily hours for last N days (for charts)
  public getDailyHoursData(daysCount: number = 7): { date: string; label: string; hours: number }[] {
    const result = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = formatDateYMD(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayMinutes = this.sessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      result.push({
        date: dateStr,
        label: `${dayName} ${d.getDate()}`,
        hours: Math.round((dayMinutes / 60) * 10) / 10,
      });
    }

    return result;
  }

  // Subject distribution for donut charts
  public getSubjectDistributionData(): { name: string; value: number; color: string; hours: number }[] {
    return this.subjects.map(sub => {
      const mins = this.getSubjectTotalMinutes(sub.id);
      const hours = Math.round((mins / 60) * 10) / 10;
      return {
        name: sub.name,
        value: mins,
        color: sub.color,
        hours,
      };
    }).filter(d => d.value > 0);
  }

  // --- EXPORT & BACKUP RESTORE ---

  // Export Study Sessions CSV
  public exportSessionsCsv(): string {
    const headers = ['ID', 'Subject Name', 'Date', 'Start Time', 'End Time', 'Duration (Minutes)', 'Duration (Hours)', 'Type', 'Notes'];
    const rows = this.sessions.map(s => {
      const sub = this.getSubject(s.subjectId);
      const subName = sub ? `"${sub.name.replace(/"/g, '""')}"` : 'Unknown';
      const notes = s.notes ? `"${s.notes.replace(/"/g, '""')}"` : '';
      return [
        s.id,
        subName,
        s.date,
        s.startTime,
        s.endTime,
        s.durationMinutes,
        (s.durationMinutes / 60).toFixed(2),
        s.type,
        notes,
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  // Export Subject Totals CSV
  public exportSubjectsCsv(): string {
    const headers = ['Subject ID', 'Name', 'Code', 'Weekly Goal (Hours)', 'Weekly Actual (Hours)', 'Total Lifetime (Hours)'];
    const rows = this.subjects.map(sub => {
      const weeklyHours = (this.getSubjectWeeklyMinutes(sub.id) / 60).toFixed(2);
      const totalHours = (this.getSubjectTotalMinutes(sub.id) / 60).toFixed(2);
      return [
        sub.id,
        `"${sub.name.replace(/"/g, '""')}"`,
        sub.code || '',
        sub.weeklyGoalHours,
        weeklyHours,
        totalHours,
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  // Export Tasks CSV
  public exportTasksCsv(): string {
    const headers = ['Task ID', 'Title', 'Subject', 'Priority', 'Status', 'Deadline', 'Completed At'];
    const rows = this.tasks.map(t => {
      const sub = t.subjectId ? this.getSubject(t.subjectId) : null;
      return [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        sub ? `"${sub.name.replace(/"/g, '""')}"` : 'None',
        t.priority,
        t.status,
        t.deadline || '',
        t.completedAt || '',
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  // Full JSON Backup
  public createBackupJson(): string {
    const backup: StarspaceBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'STARSPACE',
      data: {
        subjects: this.subjects,
        sessions: this.sessions,
        tasks: this.tasks,
        calendarEvents: this.events,
        resources: this.resources,
        resourceFolders: this.folders,
        settings: this.settings,
        achievements: this.achievements,
      },
    };
    return JSON.stringify(backup, null, 2);
  }

  // Restore from JSON backup with validation
  public restoreFromBackupJson(jsonString: string, mode: 'replace' | 'merge' = 'replace'): { success: boolean; error?: string; summary?: string } {
    try {
      const parsed = JSON.parse(jsonString) as StarspaceBackup;
      if (!parsed || !parsed.data || !Array.isArray(parsed.data.subjects) || !Array.isArray(parsed.data.sessions)) {
        return { success: false, error: 'Invalid backup file structure: missing subjects or sessions arrays.' };
      }

      if (mode === 'replace') {
        this.subjects = parsed.data.subjects;
        this.sessions = parsed.data.sessions;
        this.tasks = parsed.data.tasks || [];
        this.events = parsed.data.calendarEvents || [];
        this.resources = parsed.data.resources || [];
        this.folders = parsed.data.resourceFolders || [];
        this.settings = { ...DEFAULT_SETTINGS, ...(parsed.data.settings || {}) };
        this.achievements = parsed.data.achievements || [...ACHIEVEMENTS_DEF];
      } else {
        // Merge
        const existingSubjectIds = new Set(this.subjects.map(s => s.id));
        parsed.data.subjects.forEach(s => {
          if (!existingSubjectIds.has(s.id)) this.subjects.push(s);
        });

        const existingSessionIds = new Set(this.sessions.map(s => s.id));
        parsed.data.sessions.forEach(s => {
          if (!existingSessionIds.has(s.id)) this.sessions.push(s);
        });

        const existingTaskIds = new Set(this.tasks.map(t => t.id));
        (parsed.data.tasks || []).forEach(t => {
          if (!existingTaskIds.has(t.id)) this.tasks.push(t);
        });

        const existingEventIds = new Set(this.events.map(e => e.id));
        (parsed.data.calendarEvents || []).forEach(e => {
          if (!existingEventIds.has(e.id)) this.events.push(e);
        });
      }

      this.recalculateAchievements();
      this.triggerAutoSave();
      this.notify();

      return {
        success: true,
        summary: `Restored ${this.subjects.length} subjects, ${this.sessions.length} sessions, ${this.tasks.length} tasks!`,
      };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Failed to parse JSON backup.' };
    }
  }

  // Reset all data to absolute zero state
  public clearAllData(): void {
    this.subjects = [];
    this.sessions = [];
    this.tasks = [];
    this.events = [];
    this.resources = [];
    this.folders = [];
    this.timer = { ...INITIAL_TIMER_STATE };
    this.settings = { ...DEFAULT_SETTINGS };
    this.achievements = ACHIEVEMENTS_DEF.map(a => ({
      ...a,
      progress: 0,
      unlocked: false,
      unlockedAt: undefined,
    }));

    if (typeof window !== 'undefined') {
      try {
        Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      } catch {}
    }

    this.persistToLocalStorage();
    this.notify();
  }
}

export const starspaceStore = new StarspaceStore();
