# RecoverAI — Autonomous AI Revenue Recovery Agent for Merchants 🛡️💰

> Built for the **Razorpay AI Buildathon** under the **"AI Revenue Recovery"** Track.

---

## 🎯 The Problem
Merchants lose up to **15-30% of addressable digital revenue** from payment drop-offs, transient network timeouts, issuer declines, abandoned checkouts, and missed renewals. 
Existing recovery tools rely on blind, blunt retry loops that spam customers, damage issuer risk scores, and trigger account bans without auditability.

## 🚀 The Solution: RecoverAI
**RecoverAI** is an autonomous, explainable revenue recovery agent.
It monitors revenue at risk, analyzes failure telemetry with multi-model AI (Google Gemini + Groq LLaMA-3.3 fallback), subjects every financial intervention to deterministic policy guardrails, and executes bounded recovery actions (such as intelligent retries or custom Razorpay Payment Links) with full auditability.

> *"RecoverAI doesn't just identify where revenue is being lost. It autonomously recovers what it safely can, knows when to stop, escalates what it shouldn't touch, and proves exactly how much revenue it saved."*

---

## 🏗️ System Architecture & Workflow

```
Razorpay Webhook / Telemetry
            │
            ▼
┌───────────────────────────┐
│     Ingestion & Detect    │ ─── Logs risk into SQLite & identifies source
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│     Customer Memory       │ ─── Retrieves previous customer failure patterns
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│    AI Root Cause Engine   │ ─── Gemini 3.1 Pro / Groq LLaMA-3.3
│    (Structured Output)    │     Diagnoses failure & proposes action + confidence
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ Deterministic Guardrails  │ ─── Hard policy limits: High-Value Thresholds,
│     (PolicyEngine)        │     Max Retry Limits, Action Blacklists
└───────────┬───────────────┘
            │
    ┌───────┴───────┐
    │               │
[ALLOW]      [BLOCK / ESCALATE]
    │               │
    ▼               ▼
┌───────────┐ ┌───────────┐
│ Razorpay  │ │   Human   │
│ Execution │ │  Review   │
└─────┬─────┘ └───────────┘
      │
      ▼
┌───────────────────────────┐
│  Verify & Audit Logging   │ ─── Records outcome in AgentMemory & AuditLog
└───────────────────────────┘
```

---

## 🌟 Key Innovations

1. **Stateful Agent Memory Engine (`AgentMemory`)**
   - The AI remembers past customer outcomes across transactions. If a customer repeatedly encounters UPI timeouts, the AI skips redundant retries and directly generates alternative payment links.
2. **Deterministic Guardrails & Bounded Execution (`PolicyEngine`)**
   - No financial action is ever blind or unbounded. Dynamic policies allow merchants to set high-value thresholds and strict retry caps.
3. **Multi-Model AI Redundancy (Gemini + Groq Fallback)**
   - Primary: **Google Gemini (3.1 Pro Preview)** structured schema inference.
   - Secondary: **Groq (LLaMA-3.3-70B-Versatile)** ultra-low latency fallback.
   - Tertiary: Offline deterministic rule engine ensuring 100% uptime during demos and high traffic.
4. **Synthetic Batch Simulator & Evaluator (`SimulationEngine` & `EvaluationEngine`)**
   - Simulates 10 to 100+ realistic failure scenarios and computes mathematical proof of **Incremental Revenue Recovered** over baseline recovery.
5. **Interactive Merchant Copilot & Live Pipeline UI**
   - Real-time animated pipeline visualization on the dashboard and natural-language telemetry querying.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, React Router v6.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite.
- **AI / LLM**: `@google/genai` (Google Gemini), Groq OpenAI-compatible API (LLaMA-3.3-70B).
- **Payment & Webhooks**: Razorpay Test Mode SDK & Webhook verification.

---

## ⚡ Quickstart Guide

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd recoverai

# Install backend dependencies
cd backend
npm install
npx prisma generate
npx prisma db push

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
In `backend/.env`:
```env
PORT=3001
DATABASE_URL="file:./dev.db"

# Razorpay Test Mode Credentials
RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_HERE"
RAZORPAY_KEY_SECRET="YOUR_SECRET_HERE"
RAZORPAY_WEBHOOK_SECRET="test_secret"

# AI Inference Keys (Gemini with Groq Fallback)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
GROQ_API_KEY="gsk_YOUR_GROQ_API_KEY_HERE"
```

### 3. Run the Application
```bash
# Start Backend (from /backend directory)
npm run dev

# Start Frontend (from /frontend directory)
npm run dev
```
Open **http://localhost:5173** to view the live RecoverAI Dashboard.

---

## 🏆 Hackathon Demo Walkthrough

1. **Live Pipeline Test**: On the **Dashboard**, click `"Demo: Trigger Failure"`. Watch the pipeline light up: `Detected → AI Diagnosis → Policy Gate → Executed`.
2. **Configuring Guardrails**: Navigate to **Guardrails** (`/policies`) and toggle a rule like `High Value Threshold = 100000 -> Require Human Review`. Trigger another high-value failure and see the Policy Gate intercept the action!
3. **Batch Simulator**: Go to **Simulation** (`/simulation`) and click `"Run 10 Events"`. View the measured **Incremental Revenue Saved** compared to default baseline rules.
4. **Audit Trail**: Check the immutable timeline (`/audit`) documenting every AI confidence score, decision reason, and policy evaluation.
5. **AI Copilot**: Ask questions in natural language like *"What is my biggest revenue risk right now?"*.

---

## 📄 License
MIT License. Built for Razorpay AI Buildathon 2026.
