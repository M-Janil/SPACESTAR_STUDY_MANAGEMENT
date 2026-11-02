'use client';

import React, { useMemo } from 'react';
import { useStarspace } from '@/context/StarspaceContext';
import { 
  Award, 
  Sparkles, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Lock, 
  TrendingUp, 
  Star 
} from 'lucide-react';
import { Achievement } from '@/types/starspace';
import { sounds } from '@/lib/soundEffects';

export function AchievementsView() {
  const {
    achievements,
    currentStreak,
    longestStreak,
    lifetimeMinutes,
    triggerConfetti,
  } = useStarspace();

  const lifetimeHours = (lifetimeMinutes / 60).toFixed(1);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const collectionPercent = Math.round((unlockedCount / totalCount) * 100);

  // Next closest achievement to unlock
  const nextAchievement = useMemo(() => {
    const locked = achievements.filter(a => !a.unlocked);
    if (locked.length === 0) return null;
    // sort by percentage progress descending
    return locked.sort((a, b) => (b.progress / b.maxProgress) - (a.progress / a.maxProgress))[0];
  }, [achievements]);

  const handleCelebrate = () => {
    sounds.playAchievement();
    triggerConfetti();
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base text-[#55436D]">🏆</span>
            <span className="text-xs font-bold text-[#735D90] uppercase tracking-wider">
              Gamification & Cosmic Milestones
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#55436D]">
            Achievements ✧
          </h1>
          <p className="text-xs sm:text-sm text-[#735D90] font-medium">
            Earn badges and celebrate milestones as you build unbreakable study habits.
          </p>
        </div>

        <button
          onClick={handleCelebrate}
          className="btn-celestial-primary self-start sm:self-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#55436D]" />
          <span>Celebrate Progress ✧</span>
        </button>
      </div>

      {/* Hero Showcase Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FFDDF0]/80 via-[#EDE2FF]/90 to-[#D9EDFF]/80 border border-white shadow-[0_8px_30px_rgba(220,202,255,0.35)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-3xl bg-white/90 shadow-md flex items-center justify-center text-3xl border border-white">
            👑
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#735D90] uppercase tracking-wider">
              Universe Rank
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#55436D]">
              {unlockedCount >= 8 ? 'Superstar Prodigy ⋆ ˚｡⋆' :
               unlockedCount >= 5 ? 'Celestial Master ✦' :
               unlockedCount >= 2 ? 'Rising Scholar ⋆' :
               'Starlight Novice ✧'}
            </h2>
            <p className="text-xs text-[#55436D]/80 font-medium mt-0.5">
              {unlockedCount} of {totalCount} badges unlocked ({collectionPercent}% completed)
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white shadow-xs text-center">
            <span className="text-[10px] font-bold text-[#735D90] uppercase block">Streak</span>
            <span className="text-base font-extrabold text-[#55436D]">🔥 {currentStreak} Days</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white shadow-xs text-center">
            <span className="text-[10px] font-bold text-[#735D90] uppercase block">Lifetime</span>
            <span className="text-base font-extrabold font-timer text-[#55436D]">{lifetimeHours}h</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white shadow-xs text-center">
            <span className="text-[10px] font-bold text-[#735D90] uppercase block">Best Streak</span>
            <span className="text-base font-extrabold text-[#55436D]">✨ {longestStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Progress to Next Achievement */}
      {nextAchievement && (
        <div className="glass-panel p-5 rounded-3xl border border-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/90 border border-[#DCCAFF] flex items-center justify-center text-2xl shadow-xs">
              {nextAchievement.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#735D90] uppercase tracking-wider">
                  Next Milestone to Unlock
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#EDE2FF] text-[#55436D]">
                  {Math.round((nextAchievement.progress / nextAchievement.maxProgress) * 100)}%
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-[#55436D]">{nextAchievement.title}</h4>
              <p className="text-xs text-[#735D90] font-medium">{nextAchievement.description}</p>
            </div>
          </div>

          <div className="sm:w-64">
            <div className="flex justify-between text-[11px] font-bold text-[#55436D] mb-1">
              <span>Progress</span>
              <span>{nextAchievement.progress} / {nextAchievement.maxProgress}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#EDE2FF] overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#FFDDF0] via-[#DCCAFF] to-[#D9EDFF] transition-all duration-500"
                style={{ width: `${Math.min(100, (nextAchievement.progress / nextAchievement.maxProgress) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Achievement Badges Collection Grid */}
      <div>
        <h3 className="text-sm font-extrabold text-[#55436D] mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#735D90]" />
          <span>Badge Hall of Fame</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = ach.unlocked;
            const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                  isUnlocked
                    ? 'glass-panel border-white shadow-[0_4px_20px_rgba(220,202,255,0.3)] bg-gradient-to-b from-white/95 to-[#FAF6FF]/90'
                    : 'bg-white/40 border-[#DCCAFF]/30 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border ${
                      isUnlocked 
                        ? 'bg-gradient-to-tr from-[#FFDDF0] to-[#EDE2FF] border-white' 
                        : 'bg-gray-100 border-gray-200 grayscale'
                    }`}>
                      {ach.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-[#55436D]">{ach.title}</h4>
                        {isUnlocked && (
                          <span className="text-xs text-amber-500">✦</span>
                        )}
                      </div>
                      <p className="text-xs text-[#735D90] font-medium mt-0.5">
                        {ach.description}
                      </p>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <span className="shrink-0 p-1 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="shrink-0 p-1 rounded-full bg-gray-100 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Progress bar or Unlocked pill */}
                <div>
                  {isUnlocked ? (
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <span>Milestone Achieved ✓</span>
                      {ach.unlockedAt && (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          {new Date(ach.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-[#735D90] mb-1">
                        <span>Progress to unlock</span>
                        <span>{ach.progress} / {ach.maxProgress} ({percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#EDE2FF] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#DCCAFF] transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
