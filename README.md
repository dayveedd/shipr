# ShipR — Execution Pays. Excuses Don't.

> **ShipR** is an AI-powered execution platform where digital builders stake money on real coding challenges, prove they shipped, and earn pool rewards through verified execution.

[![ShipR Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/dayveedd/shipr)
[![Framework](https://img.shields.io/badge/Next.js-15.5-orange)](https://nextjs.org/)
[![Design System](https://img.shields.io/badge/Design%20Tokens-Light--First%20v1.0-ff5500)](https://github.com/dayveedd/shipr)
[![AI Engine](https://img.shields.io/badge/AI%20Judge-Gemini%201.5%20Pro-blue)](https://ai.google.dev/)
[![Escrow](https://img.shields.io/badge/Financial%20Escrow-Monnify-emerald)](https://monnify.com/)

---

## 1. Product Philosophy & Core Principles

Every day, thousands of developers promise themselves they'll ship a portfolio, deploy an API, or complete an MVP. Most never do — not due to lack of skill, but because there is **no immediate financial or social consequence for procrastination**.

ShipR replaces passive habit trackers with an **Execution Economy**:
- **Proof-of-Work Platform:** Builders join 48-hour coding sprints by staking NGN commitment funds via Monnify.
- **AI-Verified Execution:** Gemini 1.5 Pro inspects GitHub code repositories and live SSL deployment endpoints against strict Definition of Done (DoD) criteria.
- **Financial Commitment Pools:** Successful builders receive their initial stake back plus an equal redistribution bonus from unsuccessful submissions.
- **Permanent Builder Reputation:** Builders accumulate verified Execution Ranks (**Bronze 🥉**, **Silver 🥈**, **Gold 🥇**, **Elite 💎**) based on consistency and success rate.

---

## 2. Platform Feature Overview

### 🎨 Brand Identity & Design System
- **Light-First Aesthetics:** Clean stark white containers (`#FFFFFF`), subtle canvas (`#FAFAFA`), crisp borders (`#E4E4E7`), and Electric Ignite Orange (`#FF5500`) primary brand accent.
- **Typography System v3.0:** **Urbanist** display typography for high-impact UI elements + **JetBrains Mono** font for tabular financial numbers, countdown clocks, and terminal logs.

### 🛡️ Role-Based Access Control (RBAC) System
1. **Builder (`BUILDER`):** Discovers sprints, stakes NGN commitment funds, submits GitHub & deployment proof, receives line-by-line AI evaluation, and earns pool payouts.
2. **Verified Creator (`VERIFIED_CREATOR`):** Gated by an explicit Creator Verification Application process. Approved creators access the **Creator Studio (`/creator/create`)** to publish developer sprints, define DoD criteria, and set participant limits.
3. **Platform Admin (`ADMIN`):** Isolated high-security Admin Portal ([`/admin`](file:///c:/ShipR/src/app/admin/page.tsx)) for approving creator verification applications, monitoring Monnify Vault escrow health (`₦4,250,000`), and overriding AI verdict disputes.

### ⚡ Strict 2-Verdict Financial & Evaluation Lifecycle
- **Strict Binary Verdict Enforcement:** Financial & Evaluation Stage badges strictly display **`CHALLENGE PASSED`** (green badge with `View Disbursement Status` button) or **`SUBMISSION FAILED`** (red badge with `Resubmit Project` button).
- **Multi-Attempt History & Deduplication:** Tracks developer resubmissions sequentially (`Attempt v1`, `Attempt v2`, `Attempt v3`...) with deduplicated versioning across Supabase and client state.
- **Automated Monnify Escrow Payouts:** Winners gain instant access to their **Escrow Disbursement Status** on their proof certificate, showing original stake, 25% yield bonus, Monnify escrow sync, and live countdown timer.

### 🏆 Interactive Features
- **White Theme AI Inspection Console (`/sprints/[slug]/evaluating`):** Live terminal simulator streaming AI inspection logs with line-by-line DoD pass/fail checkmarks.
- **Public Proof Certificates (`/proof/[submissionId]`):** Native Web Share API integration with automatic fallback clipboard copying, custom X & LinkedIn share cards, and automated escrow disbursement status.
- **Global Leaderboard (`/leaderboard`):** Top 3 podium with timeframe filtering, net earnings, streak counters, and tabular statistics.

---

## 3. Technology Stack

- **Web Framework:** Next.js 15 App Router (React 19, TypeScript)
- **Styling:** Tailwind CSS + Custom Design System Tokens (`src/tokens/index.ts`)
- **Typography:** Google Fonts (Urbanist + JetBrains Mono)
- **Icons:** Lucide React
- **AI Inspection Pipeline:** Google Gemini 1.5 Pro AI Judge Service
- **Financial Escrow:** Monnify Payments & Transfer Webhook Services
- **Architecture:** Dual-Adapter Service Layer (`ISprintService`, `IUserService`, `ISubmissionService`, `ISettlementService`, `ILeaderboardService`)

---

## 4. Key Application Routes

| Route | Description | User Role |
| :--- | :--- | :---: |
| `/` | Landing Page with hero display, live locked pool ticker, & featured sprints | Public |
| `/sprints` | Discovery page with developer domain tabs (`Frontend`, `Backend`, `Mobile`, `AI`, `DevOps`) | Public |
| `/sprints/[slug]` | Sprint Detail with Definition of Done checklist & Monnify stake calculator | Public |
| `/sprints/[slug]/submit` | Proof of Work Submission form (GitHub Repo + Live Deployment URL) | Builder |
| `/sprints/[slug]/evaluating` | Stacked White AI Terminal & Asynchronous Financial Payout Timeline | Builder |
| `/dashboard` | Builder Dashboard displaying active commitments & live payout stage badges | Builder |
| `/profile/[username]` | Builder Execution Profile with rank badges, streak counters, & portfolio | Builder |
| `/leaderboard` | Global Builder Ranking Leaderboard with podium and timeframe filters | Public |
| `/proof/[submissionId]` | Public Proof of Work Certificate for sharing on social media | Public |
| `/creator/create` | Creator Studio gated by Creator Account Verification application | Verified Creator |
| `/admin` | Isolated Admin Governance Console for creator approvals & AI dispute overrides | Admin |

---

## 5. Local Setup & Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation Steps

1. **Clone Repository:**
   ```bash
   git clone https://github.com/dayveedd/shipr.git
   cd shipr
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the template environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project endpoints and Monnify API Keys inside `.env.local`.

4. **Initialize Supabase Database Schema:**
   Open the **SQL Editor** in your [Supabase Console](https://supabase.com/dashboard), create a new query page, paste the following SQL script, and run it to set up all tables and Row Level Security (RLS) policies:
   ```sql
   -- 1. Profiles Table (User Accounts)
   CREATE TABLE IF NOT EXISTS public.profiles (
       id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
       github_username TEXT,
       name TEXT,
       avatar_url TEXT,
       role TEXT DEFAULT 'BUILDER',
       rank TEXT DEFAULT 'BRONZE',
       total_earned_ngn NUMERIC DEFAULT 0,
       sprints_completed INTEGER DEFAULT 0,
       current_streak INTEGER DEFAULT 0,
       longest_streak INTEGER DEFAULT 0,
       success_rate NUMERIC DEFAULT 100,
       joined_at TIMESTAMPTZ DEFAULT NOW(),
       is_verified_creator BOOLEAN DEFAULT FALSE,
       creator_verification_status TEXT DEFAULT 'NONE'
   );

   -- Enable RLS for Profiles
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
   CREATE POLICY "Allow individual insert/update" ON public.profiles FOR ALL USING (auth.uid() = id);

   -- 2. Sprints Table (Challenges)
   CREATE TABLE IF NOT EXISTS public.sprints (
       id TEXT PRIMARY KEY,
       title TEXT NOT NULL,
       slug TEXT UNIQUE NOT NULL,
       description TEXT,
       category TEXT,
       commitment_ngn NUMERIC DEFAULT 5000,
       total_slots INTEGER DEFAULT 10,
       filled_slots INTEGER DEFAULT 0,
       duration_hours INTEGER DEFAULT 48,
       status TEXT DEFAULT 'ACTIVE',
       start_time TIMESTAMPTZ DEFAULT NOW(),
       end_time TIMESTAMPTZ,
       total_pool_ngn NUMERIC DEFAULT 0,
       pass_count INTEGER DEFAULT 0,
       fail_count INTEGER DEFAULT 0,
       tags TEXT[],
       definition_of_done JSONB,
       creator_id UUID REFERENCES public.profiles(id),
       creator_name TEXT,
       is_featured BOOLEAN DEFAULT FALSE,
       pool_accounts JSONB
   );

   -- Enable RLS for Sprints
   ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow public read sprints" ON public.sprints FOR SELECT USING (true);
   CREATE POLICY "Allow authenticated create sprints" ON public.sprints FOR INSERT WITH CHECK (auth.role() = 'authenticated');

   -- 3. Submissions Table (Proof of Work)
   CREATE TABLE IF NOT EXISTS public.submissions (
       id TEXT PRIMARY KEY,
       sprint_id TEXT REFERENCES public.sprints(id) ON DELETE CASCADE,
       user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
       github_repo_url TEXT,
       deployment_url TEXT,
       notes TEXT,
       submitted_at TIMESTAMPTZ DEFAULT NOW(),
       stage TEXT DEFAULT 'SUBMISSION_RECEIVED',
       payout_tx_hash TEXT,
       settled_at TIMESTAMPTZ
   );

   -- Enable RLS for Submissions
   ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow users read own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Allow users insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser.

6. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 6. Project Architecture Directory Structure

```
c:/ShipR/
├── src/
│   ├── app/                    <-- Next.js 15 App Router pages & API routes
│   │   ├── (auth) / login/     <-- Auth Modal & Login route
│   │   ├── admin/              <-- Isolated Admin Governance Layout & Console
│   │   ├── creator/create/     <-- Verified Creator Studio & Verification Gate
│   │   ├── dashboard/          <-- Builder Dashboard & Financial Badges
│   │   ├── leaderboard/        <-- Global Ranking Leaderboard
│   │   ├── profile/[username]/ <-- Public Builder Reputation Profile
│   │   ├── proof/[id]/         <-- Public Shareable Certificate Page
│   │   ├── sprints/            <-- Sprint Discovery, Detail, Submission & Evaluation
│   │   └── layout.tsx          <-- Root Light-First Layout
│   ├── components/             <-- UI Components (Button, Card, StatCard, Badges, etc.)
│   ├── services/               <-- Decoupled Service Adapters (Mock + Live API)
│   ├── tokens/                 <-- Master ShipR Design Tokens v1.0
│   ├── types/                  <-- TypeScript Models & Domain Interfaces
│   └── styles/                 <-- Global CSS & Typography tokens
├── README.md                   <-- Master Project Documentation
└── package.json
```

---

## 7. License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with discipline.** *Execution Pays. Excuses Don't.*
