export type SessionType = 'timer' | 'manual';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';
export type TaskRecurrence = 'none' | 'daily' | 'weekly';
export type EventType = 'study' | 'exam' | 'assignment' | 'event';
export type ResourceType = 'pdf' | 'pptx' | 'docx' | 'image' | 'link' | 'note';
export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';

export interface Subject {
  id: string;
  name: string;
  code?: string;
  color: string; // hex color or pastel token
  icon: string; // emoji or icon string
  weeklyGoalHours: number; // e.g. 5 hours
  overallTargetHours?: number; // e.g. 100 hours
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm or ISO
  endTime: string; // HH:mm or ISO
  durationMinutes: number; // integer or rounded float
  type: SessionType;
  notes?: string;
  createdAt: string;
}

export interface ActiveTimerData {
  isActive: boolean;
  isPaused: boolean;
  subjectId: string;
  startTime: number; // Date.now() timestamp
  pausedAt: number | null; // Date.now() timestamp when paused
  accumulatedPauseMs: number; // total ms paused so far
  notes?: string;
  mode: 'stopwatch' | 'pomodoro';
  pomodoroPhase: PomodoroPhase;
  pomodoroCyclesCompleted: number;
  pomodoroDurationMinutes: number;
}

export interface Task {
  id: string;
  subjectId?: string;
  title: string;
  description?: string;
  deadline?: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  isRecurring?: TaskRecurrence;
  completedAt?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  subjectId?: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  type: EventType;
  color?: string;
  completed?: boolean;
  createdAt: string;
}

export interface ResourceFolder {
  id: string;
  subjectId: string;
  name: string;
  createdAt: string;
}

export interface ResourceItem {
  id: string;
  subjectId: string;
  folderId?: string;
  name: string;
  type: ResourceType;
  sizeBytes?: number;
  urlOrData?: string; // Data URL for images, PDFs, etc.
  externalUrl?: string; // for links
  noteContent?: string; // for text notes
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'hours' | 'streak' | 'tasks' | 'subjects' | 'special';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number; // usually 4
  autoStartBreaks?: boolean;
  autoStartFocus?: boolean;
}

export interface UserSettings {
  userName: string;
  dailyGoalHours: number;
  weeklyGoalHours: number;
  pomodoroSettings: PomodoroConfig;
  soundEnabled: boolean;
  motivationalQuotesEnabled: boolean;
  ambientStarsEnabled: boolean;
  activeTab: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface StarspaceBackup {
  version: string;
  exportedAt: string;
  appName: 'STARSPACE';
  data: {
    subjects: Subject[];
    sessions: StudySession[];
    tasks: Task[];
    calendarEvents: CalendarEvent[];
    resources: ResourceItem[];
    resourceFolders: ResourceFolder[];
    settings: UserSettings;
    achievements: Achievement[];
  };
}
