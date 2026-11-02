'use client';

import React, { useState, useRef } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Database, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Coffee, 
  Target, 
  User, 
  ShieldCheck, 
  FileSpreadsheet, 
  FileCode,
  X
} from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

export function SettingsView() {
  const {
    settings,
    updateSettings,
    subjects,
    updateSubject,
    exportSessionsCsv,
    exportSubjectsCsv,
    exportTasksCsv,
    createBackupJson,
    restoreFromBackupJson,
    clearAllData,
  } = useStarspace();

  // Local state for goals & pomodoro
  const [userName, setUserName] = useState<string>(settings.userName || '');
  const [dailyGoal, setDailyGoal] = useState<number | string>(settings.dailyGoalHours ?? 0);
  const [weeklyGoal, setWeeklyGoal] = useState<number | string>(settings.weeklyGoalHours ?? 0);

  const [focusMin, setFocusMin] = useState<number>(settings.pomodoroSettings?.focusMinutes || 25);
  const [shortBreakMin, setShortBreakMin] = useState<number>(settings.pomodoroSettings?.shortBreakMinutes || 5);
  const [longBreakMin, setLongBreakMin] = useState<number>(settings.pomodoroSettings?.longBreakMinutes || 15);

  // Cloud credentials
  const [supabaseUrl, setSupabaseUrl] = useState<string>(settings.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState<string>(settings.supabaseAnonKey || '');

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Restore backup state
  const [restoreModalData, setRestoreModalData] = useState<{ rawJson: string; summary: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim(),
      dailyGoalHours: Number(dailyGoal) || 0,
      weeklyGoalHours: Number(weeklyGoal) || 0,
    });
    showToast('Goal settings saved successfully! ✓');
  };

  const handleSavePomodoro = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      pomodoroSettings: {
        ...settings.pomodoroSettings,
        focusMinutes: Number(focusMin) || 25,
        shortBreakMinutes: Number(shortBreakMin) || 5,
        longBreakMinutes: Number(longBreakMin) || 15,
      }
    });
    showToast('Pomodoro intervals updated! ✓');
  };

  // CSV Exports
  const handleDownloadCsv = (type: 'sessions' | 'subjects' | 'tasks') => {
    let csvContent = '';
    let filename = '';

    if (type === 'sessions') {
      csvContent = exportSessionsCsv();
      filename = `starspace_study_sessions_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'subjects') {
      csvContent = exportSubjectsCsv();
      filename = `starspace_subject_totals_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      csvContent = exportTasksCsv();
      filename = `starspace_tasks_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename}! ✓`);
  };

  // JSON Full Backup
  const handleDownloadJsonBackup = () => {
    const jsonStr = createBackupJson();
    const filename = `starspace_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Full JSON Backup downloaded! Keep it safe. ✧');
  };

  // Import Backup File Selected
  const handleFileSelectedForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = event.target?.result as string;
        const parsed = JSON.parse(rawJson);
        if (!parsed || !parsed.data) {
          alert('Invalid STARSPACE backup file.');
          return;
        }

        const subCount = parsed.data.subjects?.length || 0;
        const sessCount = parsed.data.sessions?.length || 0;
        const taskCount = parsed.data.tasks?.length || 0;

        setRestoreModalData({
          rawJson,
          summary: `Contains ${subCount} subjects, ${sessCount} study sessions, and ${taskCount} tasks.`,
        });
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Confirm Restore
  const handleExecuteRestore = (mode: 'replace' | 'merge') => {
    if (!restoreModalData) return;
    const res = restoreFromBackupJson(restoreModalData.rawJson, mode);
    setRestoreModalData(null);
    if (res.success) {
      showToast(res.summary || 'Backup restored successfully! ✓');
    } else {
      alert(`Restore error: ${res.error}`);
    }
  };

  const handleTestChime = () => {
    sounds.playChime();
  };

  const handleSaveCloudConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      supabaseUrl: supabaseUrl.trim() || undefined,
      supabaseAnonKey: supabaseKey.trim() || undefined,
    });
    showToast('Cloud credentials saved to local settings! ✓');
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-white border border-[#DCCAFF] shadow-xl text-xs font-bold text-[#55436D] flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base text-[#55436D]">⚙️</span>
            <span className="text-xs font-bold text-[#735D90] uppercase tracking-wider">
              Control Center & Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
            Settings ✧
          </h1>
          <p className="text-xs sm:text-sm text-[#735D90] font-medium">
            Customize productivity targets, Pomodoro timers, sound ambience, and export or restore your data.
          </p>
        </div>
      </div>

      {/* SECTION 1: PERSONAL & STUDY GOALS */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#DCCAFF]/40">
          <Target className="w-4 h-4 text-[#735D90]" />
          <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
            Personal & Weekly Study Targets
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-[#55436D]">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#55436D]">Daily Study Goal (Hours)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseFloat(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#55436D]">Weekly Study Goal (Hours)</label>
            <input
              type="number"
              step="1"
              min="1"
              max="168"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-1">
            <button
              type="submit"
              className="btn-celestial-primary px-5 py-2 rounded-xl text-xs font-bold"
            >
              Save Goals ✧
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SUBJECT-WISE WEEKLY TARGETS CONFIGURATION */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCCAFF]/40">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#735D90]" />
            <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
              Subject-Wise Weekly Targets (Hours/Week)
            </h3>
          </div>
          <span className="text-xs text-[#735D90]">Edit target hours directly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="p-3.5 rounded-2xl bg-white/80 border border-[#DCCAFF]/60 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{sub.icon}</span>
                <div>
                  <h4 className="text-xs font-extrabold text-[#55436D]">{sub.name}</h4>
                  <span className="text-[10px] text-[#735D90] font-semibold">{sub.code || 'Course'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={sub.weeklyGoalHours}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    updateSubject(sub.id, { weeklyGoalHours: val });
                  }}
                  className="w-16 px-2.5 py-1 rounded-xl bg-white border border-[#DCCAFF] text-xs font-bold text-center text-[#55436D]"
                />
                <span className="text-xs font-bold text-[#735D90]">h/wk</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: POMODORO TIMER CONFIGURATION */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#DCCAFF]/40">
          <Coffee className="w-4 h-4 text-[#735D90]" />
          <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
            Pomodoro Interval Customization
          </h3>
        </div>

        <form onSubmit={handleSavePomodoro} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-[#55436D]">Focus Duration (Mins)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={focusMin}
              onChange={(e) => setFocusMin(parseInt(e.target.value) || 25)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#55436D]">Short Break (Mins)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={shortBreakMin}
              onChange={(e) => setShortBreakMin(parseInt(e.target.value) || 5)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#55436D]">Long Break (Mins)</label>
            <input
              type="number"
              min="5"
              max="60"
              value={longBreakMin}
              onChange={(e) => setLongBreakMin(parseInt(e.target.value) || 15)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-1">
            <button
              type="submit"
              className="btn-celestial-primary px-5 py-2 rounded-xl text-xs font-bold"
            >
              Update Pomodoro ✧
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 4: SOUND & CELESTIAL AMBIENCE PREFERENCES */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#DCCAFF]/40">
          <Sparkles className="w-4 h-4 text-[#735D90]" />
          <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
            Sound & Celestial Ambience Preferences
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 border border-[#DCCAFF]/50">
          <div>
            <h4 className="text-xs font-extrabold text-[#55436D]">Web Audio Synthesizer Chimes</h4>
            <p className="text-xs text-[#735D90]">
              Play gentle retro chimes when sessions finish, tasks complete, or achievements unlock.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestChime}
              className="btn-chrome px-3 py-1.5 rounded-xl text-xs font-bold"
            >
              Test Chime 🎵
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                settings.soundEnabled 
                  ? 'bg-gradient-to-r from-[#EDE2FF] to-[#FFDDF0] text-[#55436D] shadow-xs' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {settings.soundEnabled ? 'Enabled ✓' : 'Muted'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: DATA EXPORT & BACKUP RESTORATION */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#DCCAFF]/40">
          <Database className="w-4 h-4 text-[#735D90]" />
          <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
            Data Export & Backup Restoration
          </h3>
        </div>

        {/* CSV Exports */}
        <div>
          <h4 className="text-xs font-bold text-[#55436D] mb-2">CSV Spreadsheet Exports:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleDownloadCsv('sessions')}
              className="btn-chrome p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:border-[#DCCAFF]"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#55436D]" />
              <span>Study History CSV</span>
            </button>

            <button
              onClick={() => handleDownloadCsv('subjects')}
              className="btn-chrome p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:border-[#DCCAFF]"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#55436D]" />
              <span>Subject Totals CSV</span>
            </button>

            <button
              onClick={() => handleDownloadCsv('tasks')}
              className="btn-chrome p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:border-[#DCCAFF]"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#55436D]" />
              <span>Tasks Log CSV</span>
            </button>
          </div>
        </div>

        {/* JSON Full Backup & Restore */}
        <div className="pt-2 border-t border-[#DCCAFF]/40">
          <h4 className="text-xs font-bold text-[#55436D] mb-2">Full JSON Universe Backup:</h4>
          <p className="text-xs text-[#735D90] mb-3">
            Exports all subjects, study sessions, tasks, notes metadata, calendar events, settings and achievements.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadJsonBackup}
              className="btn-celestial-primary px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Full JSON Backup</span>
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelectedForRestore}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-chrome px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#55436D]" />
              <span>Restore from Backup File</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 6: UNIVERSE RESET & CLEAN SLATE */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧹</span>
          <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
            Clean Slate & Zero Reset
          </h3>
        </div>
        <p className="text-xs text-[#735D90]">
          Reset all your local data back to absolute zero. Permanently clears all subjects, sessions, tasks, calendar events, files, and achievements for a completely fresh start.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all universe data back to absolute zero? This cannot be undone.')) {
                clearAllData();
                showToast('All universe data reset to absolute zero! ✓');
              }
            }}
            className="p-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Universe to Absolute Zero</span>
          </button>
        </div>
      </div>

      {/* SECTION 7: SUPABASE CLOUD SYNC CONFIGURATION & GUIDE */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#DCCAFF]/40">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
            Cloud Sync & Supabase Integration Guide
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold">Local-First Architecture Active: </span>
            STARSPACE is currently functioning with full persistence in your browser (LocalStorage + IndexedDB). Your data is automatically saved locally with zero external network dependencies and survives tab closes and offline usage!
          </div>
        </div>

        {/* Cloud Credentials Form */}
        <form onSubmit={handleSaveCloudConfig} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#55436D]">Supabase Project URL</label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#55436D]">Supabase Anon Key</label>
              <input
                type="password"
                placeholder="eyJh..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-chrome px-4 py-2 rounded-xl text-xs font-bold"
            >
              Save Cloud Credentials
            </button>
          </div>
        </form>

        {/* Documentation details */}
        <div className="p-4 rounded-2xl bg-white/70 border border-[#DCCAFF]/40 flex flex-col gap-2 text-xs text-[#55436D]">
          <span className="font-bold">To configure Supabase PostgreSQL tables & Row Level Security:</span>
          <ol className="list-decimal list-inside space-y-1 text-[#735D90]">
            <li>Create a new project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-bold text-[#55436D]">supabase.com</a>.</li>
            <li>Run the SQL migration script located in <code className="bg-[#EDE2FF] px-1.5 py-0.5 rounded text-[#55436D] font-mono">supabase/migrations/starspace_schema.sql</code> in the Supabase SQL Editor.</li>
            <li>Enable Supabase Storage bucket <code className="bg-[#EDE2FF] px-1.5 py-0.5 rounded text-[#55436D] font-mono">starspace-resources</code> with public read / authenticated write.</li>
            <li>Copy your Project URL & Anon Key from Settings &gt; API into your <code className="bg-[#EDE2FF] px-1.5 py-0.5 rounded text-[#55436D] font-mono">.env.local</code> or the fields above.</li>
          </ol>
        </div>
      </div>

      {/* MODAL: RESTORE BACKUP CONFIRMATION */}
      {restoreModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCCAFF]/40">
              <h3 className="font-extrabold text-sm text-[#55436D]">Restore Backup File</h3>
              <button onClick={() => setRestoreModalData(null)} className="p-1 text-[#55436D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EDE2FF]/60 border border-[#DCCAFF]/50 text-xs text-[#55436D]">
              <span className="font-bold block mb-1">File Preview:</span>
              <span>{restoreModalData.summary}</span>
            </div>

            <p className="text-xs text-[#735D90]">
              How would you like to restore this backup?
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => handleExecuteRestore('replace')}
                className="btn-celestial-primary p-3 rounded-2xl text-xs font-bold text-center"
              >
                Replace All Existing Data with Backup
              </button>
              <button
                onClick={() => handleExecuteRestore('merge')}
                className="btn-chrome p-3 rounded-2xl text-xs font-bold text-center"
              >
                Merge with Existing Data (Keep both)
              </button>
              <button
                onClick={() => setRestoreModalData(null)}
                className="p-2 text-xs font-semibold text-[#735D90] hover:text-[#55436D]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
