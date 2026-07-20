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

### ⚡ 7-Stage Asynchronous Financial Lifecycle State Machine
```
SUBMISSION_RECEIVED ──> AI_REVIEW_IN_PROGRESS ──> AI_REVIEW_COMPLETE ──> SETTLEMENT_PROCESSING
                                                                              │
PAYMENT_SUCCESSFUL <── FUNDS_RELEASED <── PAYMENT_PROCESSING <────────────────┘
```

### 🏆 Interactive Features
- **White Theme AI Inspection Console (`/sprints/[slug]/evaluating`):** Live terminal simulator streaming Gemini 1.5 Pro inspection logs with line-by-line DoD pass/fail checkmarks.
- **Public Proof Certificates (`/proof/[submissionId]`):** Native Web Share API integration with automatic fallback clipboard copying and custom X (Twitter) & LinkedIn share cards.
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

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser.

4. **Build for Production:**
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
