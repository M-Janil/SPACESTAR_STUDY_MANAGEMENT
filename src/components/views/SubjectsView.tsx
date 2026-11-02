'use client';

import React, { useState, useRef } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  BookOpen, 
  PlusCircle, 
  FolderPlus, 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Download, 
  Eye, 
  ArrowLeft, 
  Calendar, 
  Sparkles, 
  X,
  Target
} from 'lucide-react';
import { Subject, ResourceType } from '@/types/starspace';
import { starspaceStore } from '@/lib/starspaceStore';
import { saveFileToIndexedDb, getFileFromIndexedDb } from '@/lib/indexedDb';

const PASTEL_COLORS = [
  '#FFDDF0', // Baby Pink
  '#DCCAFF', // Lavender
  '#D9EDFF', // Baby Blue
  '#EDE2FF', // Light Purple
  '#FFE6D9', // Peach
  '#D9FFE5', // Mint
  '#FFF2B2', // Butter
  '#E0D9FF', // Periwinkle
];

const ICONS = ['💻', '📐', '🧠', '📜', '🧪', '🎨', '🔬', '📚', '🌐', '📊', '⚡', '🪐', '🧬', '🎵', '🏛️', '💡'];

export function SubjectsView() {
  const {
    subjects,
    sessions,
    tasks,
    resources,
    folders,
    addSubject,
    updateSubject,
    deleteSubject,
    selectedSubjectIdForWorkspace,
    setSelectedSubjectIdForWorkspace,
    addResource,
    deleteResource,
    addFolder,
    deleteFolder,
    addTask,
    toggleTaskCompleted,
    deleteTask,
    startTimer,
    openManualModal,
    setActiveTab,
  } = useStarspace();

  // Modal states
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Add/Edit Subject form
  const [subjectName, setSubjectName] = useState<string>('');
  const [subjectCode, setSubjectCode] = useState<string>('');
  const [subjectColor, setSubjectColor] = useState<string>(PASTEL_COLORS[0]);
  const [subjectIcon, setSubjectIcon] = useState<string>(ICONS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(5);
  const [overallTarget, setOverallTarget] = useState<number>(50);

  // Workspace sub-tab state
  const [workspaceTab, setWorkspaceTab] = useState<'overview' | 'resources' | 'tasks'>('overview');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // New Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');

  // New Link Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [linkTitle, setLinkTitle] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');

  // New Folder Modal
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>('');

  // New Task for Subject Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDeadline, setTaskDeadline] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Preview Resource Modal
  const [previewingResource, setPreviewingResource] = useState<{ name: string; content?: string; url?: string; type: ResourceType } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Subject in workspace
  const activeWorkspaceSubject = subjects.find(s => s.id === selectedSubjectIdForWorkspace);

  // Open Subject Modal for Create
  const handleOpenAdd = () => {
    setEditingSubject(null);
    setSubjectName('');
    setSubjectCode('');
    setSubjectColor(PASTEL_COLORS[0]);
    setSubjectIcon(ICONS[0]);
    setWeeklyGoal(5);
    setOverallTarget(50);
    setIsAddSubjectOpen(true);
  };

  // Open Subject Modal for Edit
  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectName(sub.name);
    setSubjectCode(sub.code || '');
    setSubjectColor(sub.color);
    setSubjectIcon(sub.icon);
    setWeeklyGoal(sub.weeklyGoalHours);
    setOverallTarget(sub.overallTargetHours || 50);
    setIsAddSubjectOpen(true);
  };

  // Save Subject
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name: subjectName.trim(),
        code: subjectCode.trim() || undefined,
        color: subjectColor,
        icon: subjectIcon,
        weeklyGoalHours: Number(weeklyGoal) || 5,
        overallTargetHours: Number(overallTarget) || 50,
      });
    } else {
      addSubject({
        name: subjectName.trim(),
        code: subjectCode.trim() || undefined,
        color: subjectColor,
        icon: subjectIcon,
        weeklyGoalHours: Number(weeklyGoal) || 5,
        overallTargetHours: Number(overallTarget) || 50,
      });
    }
    setIsAddSubjectOpen(false);
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? All associated study sessions, tasks, and notes will also be deleted.`)) {
      deleteSubject(id);
      if (selectedSubjectIdForWorkspace === id) {
        setSelectedSubjectIdForWorkspace(null);
      }
    }
  };

  // Handle File Upload to IndexedDB
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedSubjectIdForWorkspace) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        // Determine type
        let type: ResourceType = 'pdf';
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') type = 'pdf';
        else if (ext === 'ppt' || ext === 'pptx') type = 'pptx';
        else if (ext === 'doc' || ext === 'docx') type = 'docx';
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) type = 'image';

        // Store file binary in IndexedDB
        await saveFileToIndexedDb({
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          createdAt: new Date().toISOString(),
        });

        // Add resource metadata in Store
        addResource({
          subjectId: selectedSubjectIdForWorkspace,
          folderId: selectedFolderId || undefined,
          name: file.name,
          type,
          sizeBytes: file.size,
          urlOrData: fileId, // reference to indexedDb
        });
      };

      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Preview or Download file
  const handleViewOrDownloadResource = async (res: { id: string; name: string; type: ResourceType; noteContent?: string; externalUrl?: string; urlOrData?: string }) => {
    if (res.type === 'note') {
      setPreviewingResource({ name: res.name, content: res.noteContent, type: 'note' });
    } else if (res.type === 'link') {
      if (res.externalUrl) window.open(res.externalUrl, '_blank');
    } else if (res.urlOrData) {
      const stored = await getFileFromIndexedDb(res.urlOrData);
      if (stored && stored.dataUrl) {
        if (res.type === 'image') {
          setPreviewingResource({ name: res.name, url: stored.dataUrl, type: 'image' });
        } else {
          // Trigger download
          const a = document.createElement('a');
          a.href = stored.dataUrl;
          a.download = res.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        alert('File content preview available via download.');
      }
    }
  };

  // Save Text Note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !selectedSubjectIdForWorkspace) return;

    addResource({
      subjectId: selectedSubjectIdForWorkspace,
      folderId: selectedFolderId || undefined,
      name: noteTitle.endsWith('.md') ? noteTitle : `${noteTitle}.md`,
      type: 'note',
      noteContent,
    });

    setIsNoteModalOpen(false);
    setNoteTitle('');
    setNoteContent('');
  };

  // Save Link
  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim() || !selectedSubjectIdForWorkspace) return;

    addResource({
      subjectId: selectedSubjectIdForWorkspace,
      folderId: selectedFolderId || undefined,
      name: linkTitle,
      type: 'link',
      externalUrl: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`,
    });

    setIsLinkModalOpen(false);
    setLinkTitle('');
    setLinkUrl('');
  };

  // Save Folder
  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || !selectedSubjectIdForWorkspace) return;

    addFolder({
      subjectId: selectedSubjectIdForWorkspace,
      name: folderName.trim(),
    });

    setIsFolderModalOpen(false);
    setFolderName('');
  };

  // Save Task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedSubjectIdForWorkspace) return;

    addTask({
      title: taskTitle.trim(),
      subjectId: selectedSubjectIdForWorkspace,
      deadline: taskDeadline || undefined,
      priority: taskPriority,
    });

    setIsTaskModalOpen(false);
    setTaskTitle('');
    setTaskDeadline('');
  };

  // =========================================================
  // VIEW 1: DEDICATED SUBJECT WORKSPACE
  // =========================================================
  if (activeWorkspaceSubject) {
    const subWeeklyMinutes = starspaceStore.getSubjectWeeklyMinutes(activeWorkspaceSubject.id);
    const subWeeklyHours = Math.round((subWeeklyMinutes / 60) * 10) / 10;
    const subTotalMinutes = starspaceStore.getSubjectTotalMinutes(activeWorkspaceSubject.id);
    const subTotalHours = Math.round((subTotalMinutes / 60) * 10) / 10;
    const weeklyPercent = Math.min(100, Math.round((subWeeklyHours / activeWorkspaceSubject.weeklyGoalHours) * 100));
    const remainingHours = Math.max(0, Math.round((activeWorkspaceSubject.weeklyGoalHours - subWeeklyHours) * 10) / 10);

    const subjectSessions = sessions.filter(s => s.subjectId === activeWorkspaceSubject.id);
    const subjectTasks = tasks.filter(t => t.subjectId === activeWorkspaceSubject.id);
    const subjectFolders = folders.filter(f => f.subjectId === activeWorkspaceSubject.id);
    const subjectResources = resources.filter(r => 
      r.subjectId === activeWorkspaceSubject.id && 
      (selectedFolderId ? r.folderId === selectedFolderId : true)
    );

    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
        {/* Workspace Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSubjectIdForWorkspace(null)}
            className="btn-chrome px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Subjects</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEdit(activeWorkspaceSubject)}
              className="btn-chrome px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Subject</span>
            </button>
            <button
              onClick={() => handleDeleteSubject(activeWorkspaceSubject.id, activeWorkspaceSubject.name)}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
              title="Delete Subject"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subject Header Banner */}
        <div 
          className="p-6 sm:p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgba(220,202,255,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          style={{ background: `linear-gradient(135deg, ${activeWorkspaceSubject.color} 0%, #FFFFFF 100%)` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/90 border border-white/80 shadow-md flex items-center justify-center text-3xl">
              {activeWorkspaceSubject.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/80 text-[#55436D]">
                  {activeWorkspaceSubject.code || 'SUBJECT'}
                </span>
                <span className="text-xs text-[#735D90] font-semibold">
                  Dedicated Workspace ✧
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
                {activeWorkspaceSubject.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                startTimer(activeWorkspaceSubject.id);
                setActiveTab('timer');
              }}
              className="btn-celestial-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Study Now</span>
            </button>
            <button
              onClick={() => openManualModal(activeWorkspaceSubject.id)}
              className="btn-chrome px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Past Time</span>
            </button>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="flex p-1 rounded-2xl bg-white/70 border border-[#DCCAFF] shadow-xs max-w-md">
          <button
            onClick={() => setWorkspaceTab('overview')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              workspaceTab === 'overview'
                ? 'bg-gradient-to-r from-[#EDE2FF] to-[#FFDDF0] text-[#55436D] shadow-xs'
                : 'text-[#735D90] hover:text-[#55436D]'
            }`}
          >
            A. Overview
          </button>
          <button
            onClick={() => setWorkspaceTab('resources')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              workspaceTab === 'resources'
                ? 'bg-gradient-to-r from-[#EDE2FF] to-[#D9EDFF] text-[#55436D] shadow-xs'
                : 'text-[#735D90] hover:text-[#55436D]'
            }`}
          >
            B. Notes & Files ({subjectResources.length})
          </button>
          <button
            onClick={() => setWorkspaceTab('tasks')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              workspaceTab === 'tasks'
                ? 'bg-gradient-to-r from-[#EDE2FF] to-[#DCCAFF] text-[#55436D] shadow-xs'
                : 'text-[#735D90] hover:text-[#55436D]'
            }`}
          >
            C. Tasks ({subjectTasks.length})
          </button>
        </div>

        {/* TAB A: OVERVIEW */}
        {workspaceTab === 'overview' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Stats Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-[#735D90] uppercase">This Week</span>
                <p className="text-2xl font-extrabold text-[#55436D] font-timer my-1">{subWeeklyHours}h</p>
                <span className="text-[10px] text-[#735D90]">of {activeWorkspaceSubject.weeklyGoalHours}h weekly goal</span>
              </div>

              <div className="glass-panel p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-[#735D90] uppercase">Remaining</span>
                <p className="text-2xl font-extrabold text-[#55436D] font-timer my-1">{remainingHours}h</p>
                <span className="text-[10px] text-[#735D90]">left to reach target</span>
              </div>

              <div className="glass-panel p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-[#735D90] uppercase">Lifetime Total</span>
                <p className="text-2xl font-extrabold text-[#55436D] font-timer my-1">{subTotalHours}h</p>
                <span className="text-[10px] text-[#735D90]">all recorded sessions</span>
              </div>

              <div className="glass-panel p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-[#735D90] uppercase">Sessions</span>
                <p className="text-2xl font-extrabold text-[#55436D] my-1">{subjectSessions.length}</p>
                <span className="text-[10px] text-[#735D90]">recorded learning blocks</span>
              </div>
            </div>

            {/* Weekly Goal Progress Bar Card */}
            <div className="glass-panel p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#735D90]" />
                  <span className="text-xs font-bold text-[#55436D]">Weekly Target Progress</span>
                </div>
                <span className="text-xs font-bold text-[#55436D]">{weeklyPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#EDE2FF] overflow-hidden mb-2">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${weeklyPercent}%`, backgroundColor: activeWorkspaceSubject.color }}
                />
              </div>
              <p className="text-xs text-[#735D90]">
                {weeklyPercent >= 100 
                  ? '🎉 Outstanding work! You have achieved your weekly goal for this subject!' 
                  : `Need ${remainingHours} more hours this week to reach your ${activeWorkspaceSubject.weeklyGoalHours}h target.`}
              </p>
            </div>

            {/* Recent Sessions List for this subject */}
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-sm font-extrabold text-[#55436D] mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#735D90]" />
                <span>Recent Study Sessions</span>
              </h3>

              {subjectSessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#735D90]">
                  No study sessions recorded for this subject yet. Start studying above!
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {subjectSessions.slice(0, 5).map(s => (
                    <div 
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-white/70 border border-[#DCCAFF]/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm">⏱️</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#55436D]">{s.date}</span>
                            <span className="text-[10px] text-[#735D90]">
                              {s.startTime} - {s.endTime}
                            </span>
                          </div>
                          {s.notes && (
                            <p className="text-xs text-[#735D90] italic mt-0.5 line-clamp-1">
                              &ldquo;{s.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-timer text-[#55436D] px-2.5 py-1 rounded-full bg-white border border-[#DCCAFF]/60">
                          {Math.floor(s.durationMinutes / 60)}h {s.durationMinutes % 60}m
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EDE2FF] text-[#55436D]">
                          {s.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB B: NOTES & RESOURCES */}
        {workspaceTab === 'resources' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Action Bar: Upload File, Create Note, Add Link, New Folder */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.ppt,.pptx,.doc,.docx,image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-celestial-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File (PDF/PPT/DOC/Image)</span>
                </button>

                <button
                  onClick={() => setIsNoteModalOpen(true)}
                  className="btn-chrome px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#55436D]" />
                  <span>Create Text Note</span>
                </button>

                <button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="btn-chrome px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-[#55436D]" />
                  <span>Add External Link</span>
                </button>

                <button
                  onClick={() => setIsFolderModalOpen(true)}
                  className="btn-chrome px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-[#55436D]" />
                  <span>New Folder</span>
                </button>
              </div>

              {/* Folder Filter Pill */}
              {subjectFolders.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#735D90] font-semibold">Folder:</span>
                  <select
                    value={selectedFolderId || ''}
                    onChange={(e) => setSelectedFolderId(e.target.value || null)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D]"
                  >
                    <option value="">All Folders</option>
                    {subjectFolders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Resource Items Grid */}
            <div className="glass-panel p-6 rounded-3xl">
              {subjectResources.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center gap-2 text-xs text-[#735D90]">
                  <span className="text-2xl">📁</span>
                  <span>No documents, notes or resources stored yet.</span>
                  <span>Upload slides, PDFs, or write study notes using the buttons above!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {subjectResources.map((res) => {
                    const iconEmoji = 
                      res.type === 'pdf' ? '📄' :
                      res.type === 'pptx' ? '📊' :
                      res.type === 'docx' ? '📝' :
                      res.type === 'image' ? '🖼️' :
                      res.type === 'link' ? '🔗' : '📜';

                    return (
                      <div
                        key={res.id}
                        className="p-4 rounded-2xl bg-white/80 border border-[#DCCAFF]/60 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl shrink-0">{iconEmoji}</span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-[#55436D] truncate" title={res.name}>
                                {res.name}
                              </h4>
                              <span className="text-[10px] text-[#735D90] uppercase font-semibold">
                                {res.type} {res.sizeBytes ? `• ${(res.sizeBytes / 1024).toFixed(0)} KB` : ''}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => deleteResource(res.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Delete resource"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {res.type === 'note' && res.noteContent && (
                          <p className="text-[11px] text-[#735D90] line-clamp-2 bg-[#EDE2FF]/40 p-2 rounded-xl italic">
                            {res.noteContent.substring(0, 100)}...
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[#DCCAFF]/40 text-xs font-bold">
                          <button
                            onClick={() => handleViewOrDownloadResource(res)}
                            className="text-[#55436D] hover:text-[#735D90] flex items-center gap-1"
                          >
                            {res.type === 'note' || res.type === 'image' ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </>
                            ) : res.type === 'link' ? (
                              <>
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Link</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </>
                            )}
                          </button>

                          <span className="text-[10px] text-[#735D90]">
                            {new Date(res.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB C: TASKS */}
        {workspaceTab === 'tasks' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#55436D]">
                Tasks for {activeWorkspaceSubject.name}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="btn-celestial-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Subject Task</span>
              </button>
            </div>

            <div className="glass-panel p-6 rounded-3xl">
              {subjectTasks.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#735D90]">
                  No tasks assigned to this subject yet. Click &quot;Add Subject Task&quot; above!
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {subjectTasks.map(t => {
                    const isDone = t.status === 'completed';
                    return (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isDone 
                            ? 'bg-white/40 border-transparent opacity-65 line-through text-[#735D90]'
                            : 'bg-white/80 border-[#DCCAFF]/60 text-[#55436D]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => toggleTaskCompleted(t.id)}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                              isDone ? 'bg-[#55436D] border-[#55436D] text-white' : 'border-[#735D90] hover:bg-[#FFDDF0]'
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{t.title}</p>
                            {t.deadline && (
                              <span className="text-[10px] text-[#735D90]">Due: {t.deadline}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            t.priority === 'high' ? 'bg-red-100 text-red-700' :
                            t.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {t.priority}
                          </span>
                          <button
                            onClick={() => deleteTask(t.id)}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: Create Text Note */}
        {isNoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCCAFF]/40">
                <h3 className="font-bold text-sm text-[#55436D]">Create Study Note</h3>
                <button onClick={() => setIsNoteModalOpen(false)} className="p-1 text-[#55436D]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveNote} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Note Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Chapter 4 Key Theorems"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Note Content (Markdown supported)</label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Write key equations, formulas, concepts, or lecture summaries..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-[#735D90]">
                    Cancel
                  </button>
                  <button type="submit" className="btn-celestial-primary px-5 py-2 rounded-xl text-xs font-bold">
                    Save Note ✧
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Add External Link */}
        {isLinkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCCAFF]/40">
                <h3 className="font-bold text-sm text-[#55436D]">Add External Link / Resource</h3>
                <button onClick={() => setIsLinkModalOpen(false)} className="p-1 text-[#55436D]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveLink} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Title / Resource Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., MIT OpenCourseWare Lecture 12"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#55436D]">URL Link</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-[#735D90]">
                    Cancel
                  </button>
                  <button type="submit" className="btn-celestial-primary px-5 py-2 rounded-xl text-xs font-bold">
                    Save Link ✧
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: New Folder */}
        {isFolderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCCAFF]/40">
                <h3 className="font-bold text-sm text-[#55436D]">Create Folder</h3>
                <button onClick={() => setIsFolderModalOpen(false)} className="p-1 text-[#55436D]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveFolder} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Folder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Past Exams, Lecture Slides"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsFolderModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-[#735D90]">
                    Cancel
                  </button>
                  <button type="submit" className="btn-celestial-primary px-5 py-2 rounded-xl text-xs font-bold">
                    Create Folder ✧
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Add Subject Task */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCCAFF]/40">
                <h3 className="font-bold text-sm text-[#55436D]">Add Task for {activeWorkspaceSubject.name}</h3>
                <button onClick={() => setIsTaskModalOpen(false)} className="p-1 text-[#55436D]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveTask} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Complete Chapter 3 Problem Set"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#55436D]">Deadline</label>
                    <input
                      type="date"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#55436D]">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full px-3 py-2 rounded-xl bg-white/80 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-[#735D90]">
                    Cancel
                  </button>
                  <button type="submit" className="btn-celestial-primary px-5 py-2 rounded-xl text-xs font-bold">
                    Add Task ✧
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Resource Preview (Note or Image) */}
        {previewingResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/50 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCCAFF]/40">
                <h3 className="font-extrabold text-sm text-[#55436D] flex items-center gap-2">
                  <span>{previewingResource.type === 'image' ? '🖼️' : '📜'}</span>
                  <span>{previewingResource.name}</span>
                </h3>
                <button onClick={() => setPreviewingResource(null)} className="p-1 text-[#55436D]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {previewingResource.type === 'note' && (
                <div className="p-4 rounded-2xl bg-white/90 border border-[#DCCAFF]/40 font-mono text-xs whitespace-pre-wrap text-[#55436D] leading-relaxed">
                  {previewingResource.content}
                </div>
              )}

              {previewingResource.type === 'image' && previewingResource.url && (
                <div className="flex justify-center p-2 rounded-2xl bg-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewingResource.url} alt={previewingResource.name} className="max-h-[60vh] object-contain rounded-xl" />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPreviewingResource(null)}
                  className="btn-chrome px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // VIEW 2: SUBJECT LIBRARY GRID & WEEKLY GOALS OVERVIEW
  // =========================================================
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base text-[#55436D]">📚</span>
            <span className="text-xs font-bold text-[#735D90] uppercase tracking-wider">
              Subject Library & Workspaces
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
            My Subjects ✧
          </h1>
          <p className="text-xs sm:text-sm text-[#735D90] font-medium">
            Manage your academic subjects, set weekly study targets, and access dedicated workspaces.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-celestial-primary self-start sm:self-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#55436D]" />
          <span>Add New Subject ✧</span>
        </button>
      </div>

      {/* SECTION 1: WEEKLY SUBJECT-WISE GOALS SUMMARY */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-[0_8px_30px_rgba(220,202,255,0.3)]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DCCAFF]/40">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#735D90]" />
            <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
              Weekly Subject-Wise Goals
            </h3>
          </div>
          <span className="text-xs font-bold text-[#735D90]">
            Resets smoothly every week
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((sub) => {
            const subWeeklyMinutes = starspaceStore.getSubjectWeeklyMinutes(sub.id);
            const actualHours = Math.round((subWeeklyMinutes / 60) * 10) / 10;
            const targetHours = sub.weeklyGoalHours;
            const remainingHours = Math.max(0, Math.round((targetHours - actualHours) * 10) / 10);
            const percent = Math.min(100, Math.round((actualHours / targetHours) * 100));

            return (
              <div 
                key={sub.id}
                className="p-4 rounded-2xl bg-white/70 border border-[#DCCAFF]/50 flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sub.icon}</span>
                    <span className="text-xs font-bold text-[#55436D] truncate max-w-[120px]">{sub.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#DCCAFF]/60 text-[#55436D]">
                    {percent}%
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline justify-between text-xs font-timer font-bold text-[#55436D] mb-1">
                    <span>{actualHours}h studied</span>
                    <span className="text-[#735D90]">{targetHours}h / week</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EDE2FF] overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: sub.color }}
                    />
                  </div>
                  <div className="text-[10px] text-[#735D90] font-semibold mt-1">
                    {percent >= 100 ? 'Goal Completed! 🎉' : `${remainingHours}h remaining`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: SUBJECT CARDS GRID */}
      <div>
        <h3 className="text-sm font-extrabold text-[#55436D] mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#735D90]" />
          <span>Subject Workspaces & Libraries ({subjects.length})</span>
        </h3>

        {subjects.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center gap-3">
            <span className="text-3xl">🪐</span>
            <h4 className="text-sm font-bold text-[#55436D]">No subjects created yet!</h4>
            <p className="text-xs text-[#735D90]">Create your first study subject to begin tracking progress and notes.</p>
            <button
              onClick={handleOpenAdd}
              className="btn-celestial-primary px-5 py-2.5 rounded-xl text-xs font-bold mt-2"
            >
              Add Your First Subject ✧
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {subjects.map((sub) => {
              const subWeeklyMinutes = starspaceStore.getSubjectWeeklyMinutes(sub.id);
              const subWeeklyHours = Math.round((subWeeklyMinutes / 60) * 10) / 10;
              const subTotalMinutes = starspaceStore.getSubjectTotalMinutes(sub.id);
              const subTotalHours = Math.round((subTotalMinutes / 60) * 10) / 10;
              const subSessionsCount = sessions.filter(s => s.subjectId === sub.id).length;
              const subTasksCount = tasks.filter(t => t.subjectId === sub.id).length;
              const subResourcesCount = resources.filter(r => r.subjectId === sub.id).length;
              const percent = Math.min(100, Math.round((subWeeklyHours / sub.weeklyGoalHours) * 100));

              return (
                <div
                  key={sub.id}
                  className="glass-panel p-5 sm:p-6 rounded-3xl border border-white hover:shadow-xl transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/80"
                        style={{ backgroundColor: sub.color }}
                      >
                        {sub.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-[#55436D]">{sub.name}</h4>
                          {sub.code && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#735D90] border border-[#DCCAFF]/60">
                              {sub.code}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#735D90] font-semibold mt-0.5">
                          Weekly Target: {sub.weeklyGoalHours}h
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(sub)}
                        className="p-1.5 rounded-lg text-[#735D90] hover:text-[#55436D] hover:bg-white/60 transition-colors"
                        title="Edit Subject"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(sub.id, sub.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Weekly Goal Progress */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[#55436D] mb-1.5">
                      <span>Weekly Goal Progress</span>
                      <span className="font-timer font-bold">{subWeeklyHours}h / {sub.weeklyGoalHours}h ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#EDE2FF] overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: sub.color }}
                      />
                    </div>
                  </div>

                  {/* Summary Stats Badges */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#DCCAFF]/40">
                    <div className="p-2 rounded-xl bg-white/60 border border-[#DCCAFF]/30">
                      <span className="text-[10px] text-[#735D90] block font-semibold">Total Time</span>
                      <span className="text-xs font-bold font-timer text-[#55436D]">{subTotalHours}h</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/60 border border-[#DCCAFF]/30">
                      <span className="text-[10px] text-[#735D90] block font-semibold">Sessions</span>
                      <span className="text-xs font-bold text-[#55436D]">{subSessionsCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/60 border border-[#DCCAFF]/30">
                      <span className="text-[10px] text-[#735D90] block font-semibold">Files / Notes</span>
                      <span className="text-xs font-bold text-[#55436D]">{subResourcesCount}</span>
                    </div>
                  </div>

                  {/* Open Dedicated Workspace Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedSubjectIdForWorkspace(sub.id)}
                      className="w-full btn-chrome py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 hover:border-[#DCCAFF]"
                    >
                      <span>Open Subject Workspace & Documents &rarr;</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT SUBJECT */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#372A4A]/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-white p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCCAFF]/40">
              <h3 className="font-extrabold text-sm text-[#55436D]">
                {editingSubject ? 'Edit Subject' : 'Add New Subject ✧'}
              </h3>
              <button onClick={() => setIsAddSubjectOpen(false)} className="p-1 text-[#55436D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#55436D]">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Quantum Physics, Data Structures"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#55436D]">Course Code (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., PHYS-301, CS-202"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-medium text-[#55436D] mt-1"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-xs font-bold text-[#55436D]">Pick an Icon</label>
                <div className="grid grid-cols-8 gap-1.5 mt-1">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setSubjectIcon(ic)}
                      className={`h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        subjectIcon === ic 
                          ? 'bg-[#55436D] text-white shadow-xs scale-110' 
                          : 'bg-white/70 hover:bg-white text-[#55436D]'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pastel Color Picker */}
              <div>
                <label className="text-xs font-bold text-[#55436D]">Pick Pastel Accent Color</label>
                <div className="flex items-center gap-2 mt-1">
                  {PASTEL_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSubjectColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        subjectColor === col ? 'scale-125 border-[#55436D] shadow-sm' : 'border-white'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Weekly Goal Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Weekly Target (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#55436D]">Overall Target (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={overallTarget}
                    onChange={(e) => setOverallTarget(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#DCCAFF] text-xs font-bold text-[#55436D] mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#735D90]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-celestial-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  {editingSubject ? 'Update Subject' : 'Create Subject ✧'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
