'use client';

import React, { useState, useMemo } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  BarChart3, 
  Clock, 
  Flame, 
  TrendingUp, 
  PieChart as PieIcon, 
  Award, 
  Calendar, 
  Sparkles 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { starspaceStore } from '@/lib/starspaceStore';

export function AnalyticsView() {
  const {
    sessions,
    subjects,
    todayMinutes,
    weeklyMinutes,
    monthlyMinutes,
    lifetimeMinutes,
    currentStreak,
    longestStreak,
  } = useStarspace();

  const [periodDays, setPeriodDays] = useState<7 | 14 | 30>(7);

  // Stats
  const todayHours = (todayMinutes / 60).toFixed(1);
  const weeklyHours = (weeklyMinutes / 60).toFixed(1);
  const monthlyHours = (monthlyMinutes / 60).toFixed(1);
  const lifetimeHours = (lifetimeMinutes / 60).toFixed(1);

  // Average daily study time (over distinct active days)
  const uniqueDatesCount = useMemo(() => {
    return new Set(sessions.map(s => s.date)).size || 1;
  }, [sessions]);

  const averageDailyMinutes = Math.round(lifetimeMinutes / uniqueDatesCount);
  const averageDailyHours = (averageDailyMinutes / 60).toFixed(1);

  // Longest study session
  const longestSessionMinutes = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.max(...sessions.map(s => s.durationMinutes));
  }, [sessions]);
  const longestSessionHours = (longestSessionMinutes / 60).toFixed(1);

  // Chart Data 1: Daily Hours for chosen period (7, 14, 30)
  const dailyChartData = useMemo(() => {
    return starspaceStore.getDailyHoursData(periodDays);
  }, [periodDays, sessions]);

  // Chart Data 2: Subject-wise Donut distribution
  const subjectDistributionData = useMemo(() => {
    return starspaceStore.getSubjectDistributionData();
  }, [subjects, sessions]);

  // Chart Data 3: Subject comparison (Actual Weekly vs Target Weekly)
  const subjectComparisonData = useMemo(() => {
    return subjects.map(s => {
      const actualMins = starspaceStore.getSubjectWeeklyMinutes(s.id);
      const actualHours = Math.round((actualMins / 60) * 10) / 10;
      return {
        name: s.code || s.name.substring(0, 10),
        fullName: s.name,
        actual: actualHours,
        target: s.weeklyGoalHours,
        color: s.color,
      };
    });
  }, [subjects, sessions]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base text-[#55436D]">📊</span>
            <span className="text-xs font-bold text-[#735D90] uppercase tracking-wider">
              Study Intelligence & Metrics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
            Analytics ✧
          </h1>
          <p className="text-xs sm:text-sm text-[#735D90] font-medium">
            Real-time visualization calculated directly from your recorded and manual study logs.
          </p>
        </div>

        {/* Period Switcher */}
        <div className="flex p-1 rounded-2xl bg-white/80 border border-[#DCCAFF] shadow-xs self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setPeriodDays(7)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              periodDays === 7 ? 'bg-[#55436D] text-white shadow-xs' : 'text-[#735D90]'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setPeriodDays(14)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              periodDays === 14 ? 'bg-[#55436D] text-white shadow-xs' : 'text-[#735D90]'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setPeriodDays(30)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              periodDays === 30 ? 'bg-[#55436D] text-white shadow-xs' : 'text-[#735D90]'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Top Core Metrics Grid (8 metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#735D90] uppercase">Today&apos;s Hours</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#55436D] font-timer my-1">{todayHours}h</p>
          <span className="text-[10px] text-[#735D90]">{todayMinutes} minutes logged</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#735D90] uppercase">Weekly Hours</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#55436D] font-timer my-1">{weeklyHours}h</p>
          <span className="text-[10px] text-[#735D90]">current calendar week</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#735D90] uppercase">Monthly Hours</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#55436D] font-timer my-1">{monthlyHours}h</p>
          <span className="text-[10px] text-[#735D90]">this calendar month</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#735D90] uppercase">Lifetime Hours</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#55436D] font-timer my-1">{lifetimeHours}h</p>
          <span className="text-[10px] text-[#735D90]">{sessions.length} total sessions</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#735D90] uppercase">Daily Average</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#55436D] font-timer my-1">{averageDailyHours}h</p>
          <span className="text-[10px] text-[#735D90]">per active study day</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#735D90] uppercase">Longest Session</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#55436D] font-timer my-1">{longestSessionHours}h</p>
          <span className="text-[10px] text-[#735D90]">{longestSessionMinutes} minutes</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#735D90] uppercase">Current Streak</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#55436D] my-1">🔥 {currentStreak}</p>
          <span className="text-[10px] text-[#735D90]">consecutive study days</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-[#735D90] uppercase">Longest Streak</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#55436D] my-1">👑 {longestStreak}</p>
          <span className="text-[10px] text-[#735D90]">personal best streak</span>
        </div>
      </div>

      {/* Row 1: Daily Study Hours Bar Chart & Subject Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Daily Hours Bar Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-3xl border border-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DCCAFF]/40">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#735D90]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
                  Daily Study Hours (Past {periodDays} Days)
                </h3>
              </div>
              <span className="text-xs font-bold text-[#735D90]">Hours / Day</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    formatter={(val: unknown) => [`${val} hours`, 'Studied']}
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
                    {dailyChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === dailyChartData.length - 1 ? '#DCCAFF' : '#FFDDF0'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Subject Donut Chart (1 col) */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DCCAFF]/40">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#735D90]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
                  Subject Distribution
                </h3>
              </div>
              <span className="text-xs font-bold text-[#735D90]">All-time</span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {subjectDistributionData.length === 0 ? (
                <p className="text-xs text-[#735D90] italic">No study data logged yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {subjectDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#DCCAFF'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: unknown, name: unknown) => [
                        `${((Number(val) || 0) / 60).toFixed(1)} hours`,
                        String(name)
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '12px', 
                        borderColor: '#DCCAFF', 
                        fontSize: '12px',
                        color: '#55436D' 
                      }} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Subject Target vs Actual Comparison & Cumulative Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Target vs Actual Comparison */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DCCAFF]/40">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#735D90]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
                  Subject Weekly Target vs Actual
                </h3>
              </div>
              <span className="text-xs font-bold text-[#735D90]">Comparison</span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#735D90', fontSize: 11, fontWeight: 600 }} />
                  <YAxis tick={{ fill: '#735D90', fontSize: 11 }} unit="h" />
                  <Tooltip 
                    formatter={(val: unknown, name: unknown) => [
                      `${val} hours`,
                      name === 'actual' ? 'Actual Studied' : 'Weekly Goal Target'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '12px', 
                      borderColor: '#DCCAFF', 
                      fontSize: '12px',
                      color: '#55436D' 
                    }} 
                  />
                  <Bar dataKey="actual" fill="#DCCAFF" name="Actual" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" fill="#D9EDFF" name="Target" radius={[6, 6, 0, 0]} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Study Progress Trend Area Chart */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DCCAFF]/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#735D90]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#55436D]">
                  Study Consistency Curve
                </h3>
              </div>
              <span className="text-xs font-bold text-[#735D90]">Daily Rhythm</span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DCCAFF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFDDF0" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: '#735D90', fontSize: 11, fontWeight: 600 }} />
                  <YAxis tick={{ fill: '#735D90', fontSize: 11 }} unit="h" />
                  <Tooltip 
                    formatter={(val: unknown) => [`${val} hours`, 'Hours Studied']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '12px', 
                      borderColor: '#DCCAFF', 
                      fontSize: '12px',
                      color: '#55436D' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#55436D" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorHours)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
