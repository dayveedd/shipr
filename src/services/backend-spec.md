# ShipR — Backend API Specification & Developer 2 Handoff Guide

**Target Backend:** NestJS / Node.js + PostgreSQL (Prisma ORM) + Monnify Webhooks + Gemini 1.5 Pro AI Judge  
**Base URL:** `/api/v1`

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/github`
Processes GitHub OAuth code from frontend.

**Request Schema:**
```json
{
  "code": "string"
}
```

**Response Schema:**
```json
{
  "success": true,
  "message": "Authenticated successfully",
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "usr_cuid",
      "githubUsername": "alexdev",
      "name": "Alex Rivera",
      "avatarUrl": "https://...",
      "rank": "GOLD",
      "totalEarnedNgn": 87500,
      "sprintsCompleted": 12,
      "currentStreak": 7,
      "longestStreak": 9,
      "successRate": 94,
      "joinedAt": "2026-01-15T00:00:00.000Z"
    }
  }
}
```

---

## 2. Sprint Endpoints

### `GET /api/v1/sprints`
Returns all active, upcoming, and settled sprints.

**Response Schema:**
```json
{
  "success": true,
  "message": "Sprints retrieved successfully",
  "data": [
    {
      "id": "spr_react_01",
      "title": "React Landing Page 48h Sprint",
      "slug": "react-landing-page-sprint",
      "description": "Build a high-converting...",
      "commitmentNgn": 5000,
      "totalSlots": 20,
      "filledSlots": 16,
      "durationHours": 48,
      "status": "ACTIVE",
      "startTime": "2026-07-19T03:00:00.000Z",
      "endTime": "2026-07-21T03:00:00.000Z",
      "totalPoolNgn": 100000,
      "passCount": 0,
      "failCount": 0,
      "tags": ["React", "Tailwind CSS", "Frontend"],
      "definitionOfDone": [
        {
          "id": "dod_1",
          "title": "Hero Section",
          "description": "Hero with high-impact title and CTA",
          "category": "FRONTEND",
          "isRequired": true
        }
      ]
    }
  ]
}
```

### `GET /api/v1/sprints/:slug`
Fetch single sprint detail by slug.

### `POST /api/v1/sprints/:id/join`
Initiates Monnify commitment payment session.

**Response Schema:**
```json
{
  "success": true,
  "message": "Payment session created",
  "data": {
    "checkoutUrl": "https://sandbox.monnify.com/checkout/MNF_TX_12345",
    "transactionRef": "MNF_TX_12345"
  }
}
```

---

## 3. Submission & AI Judge Endpoints

### `POST /api/v1/submissions`
Submit project proof for AI evaluation.

**Request Schema:**
```json
{
  "sprintId": "spr_react_01",
  "githubRepoUrl": "https://github.com/username/repo",
  "deploymentUrl": "https://project.vercel.app",
  "notes": "Optional developer notes"
}
```

### `POST /api/v1/ai-judge/evaluate`
Triggers Gemini AI Judge analysis on submission.

**Response Schema:**
```json
{
  "success": true,
  "message": "AI Judge evaluation completed",
  "data": {
    "id": "eval_100",
    "submissionId": "sub_100",
    "result": "PASS",
    "confidenceScore": 97,
    "reasoning": [
      {
        "itemId": "dod_1",
        "itemTitle": "Hero Section",
        "isPassed": true,
        "details": "Detected Hero section with CTA button",
        "confidence": 99
      }
    ],
    "suggestions": [
      "Add meta tags for social preview."
    ],
    "evaluatedAt": "2026-07-19T15:00:00.000Z"
  }
}
```

---

## 4. Monnify Webhook Endpoint

### `POST /api/v1/monnify/webhook`
Receives signed Monnify payment notification webhooks.

**Expected Flow:**
1. Verify `monnify-signature` header against `MONNIFY_SECRET_KEY`.
2. Update `SprintParticipant` status to `JOINED`.
3. Increment `Sprint.filledSlots` and `Sprint.totalPoolNgn`.
