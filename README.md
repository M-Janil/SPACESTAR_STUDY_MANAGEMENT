# 🌌 STARSPACE — Study Management Universe

A retro-futuristic, Y2K celestial study companion and gamified productivity universe built with **Next.js 16**, **Tailwind CSS**, and **TypeScript**.

STARSPACE blends deep cosmic aesthetics, ambient lo-fi soundscapes, interactive starfields, and gamified study tracking to help students stay immersed, organized, and motivated.

---

## ✨ Features

- **🚀 Cosmic Dashboard**:
  - Live study streak counter with stellar ranks (e.g. *Stardust Novice* → *Galactic Architect*).
  - Daily & weekly hour targets with progress rings and milestone tracking.
  - Quick action launcher for focus timers, subject management, and manual logging.
- **⏱️ Celestial Timer & Focus Mode**:
  - Pomodoro, 50/10 Focus, and custom study intervals.
  - Fullscreen distraction-free Cosmic Focus mode with ambient audio and interactive controls.
  - Audio cues for session completion, break countdowns, and level-ups.
- **📚 Subjects & Syllabus Management**:
  - Create color-coded celestial subjects with exam dates, target hours, and resource links.
  - Track topic-by-topic completion status and estimated mastery levels.
- **✅ Task & Checklist Matrix**:
  - Priority-based study tasks (Critical, Medium, Low) with subject tagging and deadlines.
  - Filter by status, due date, or subject with instantaneous search.
- **📅 Study Calendar & Planner**:
  - Visual monthly and weekly calendar with scheduled study blocks and exam countdowns.
  - Sync study goals directly to calendar days.
- **📊 Analytics & Constellation Insights**:
  - Study distribution charts by subject and time of day.
  - Daily consistency heatmaps and efficiency trends.
- **🏆 Achievements & Badges**:
  - Unlock celestial badges and constellations based on streaks, hours studied, and consistency.
- **💾 Local-First & Supabase Ready**:
  - Complete zero-latency offline persistence using client-side store and IndexedDB.
  - Optional Supabase integration schema included for cloud backup and multi-device sync (`supabase/starspace_schema.sql`).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with PostCSS & custom retro-futuristic cyan/purple palette
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Web Audio API ambient tone synthesizer & sound effects
- **Storage**: IndexedDB & Local Storage with zero mock data on fresh start

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/M-Janil/SPACESTAR_STUDY_MANAGEMENT.git
   cd SPACESTAR_STUDY_MANAGEMENT
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🪐 Database Schema (Optional)

If you wish to connect STARSPACE to Supabase:
1. Create a Supabase project.
2. Run the SQL script located at `supabase/starspace_schema.sql` in the Supabase SQL Editor.
3. Configure your `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

---

## 📜 License

MIT License. Designed and built for cosmic productivity.
