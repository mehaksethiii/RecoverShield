# RecoverShield (RazorShield) — Autonomous AI Revenue Recovery Engine 🛡️⚡

> **Built for the Razorpay AI Buildathon — AI Revenue Recovery Track**  
> *Transforming payment drop-offs & transaction failures into recovered revenue using autonomous, policy-bounded multi-model AI.*

---

## 🔗 Live Deployment

**🌐 Frontend (Vercel):** https://recovershield-beta.vercel.app

**⚙️ Backend (Render):** https://recovershield.onrender.com

**🎥 Demo Video:** [Watch on Google Drive](https://drive.google.com/file/d/1eot0FVxy8J8z8qbKwcSh5BDX1XEiU0zr/view?usp=drivesdk)

---

## 📌 Executive Summary
Every digital merchant loses **15% to 30% of addressable revenue** through friction points: transient bank network timeouts, issuer declines, card auth expirations, and abandoned payment links. 

Traditional approaches either do nothing or execute blunt, blind retry scripts that annoy users, trigger card network penalties, and waste merchant time.

**RecoverShield (RazorShield)** is an autonomous, explainable revenue recovery system built directly on Razorpay's rails. It intercepts failed payments in real-time, diagnoses the root cause using dual-model AI reasoning (Google Gemini + Groq LPU fallback), validates every action against strict merchant guardrails, and executes surgical recovery workflows (smart adaptive retries, custom WhatsApp/SMS payment links, or rail switching) — all with 100% auditability.

---

## 🚀 Fully Implemented Features (What is Live & Ready)

### 1. 🌐 3D Recovery Core & Real-Time Telemetry Pipeline
- **Interactive Three.js 3D Core**: Centerpiece visualization mapping the end-to-end recovery journey:
  $$\text{Failed Payments (Left)} \longrightarrow \text{AI Diagnosis Core (Center)} \longrightarrow \text{Strategy Routes} \longrightarrow \text{Recovered Revenue Zone (Right)}$$
- **Live Packet Physics & Raycasting**: Active transaction packets travel dynamically across glowing conduits with interactive click/hover inspection showing Transaction ID, Risk Score, Diagnosis, and Action Status.
- **HUD Live Metrics**: Real-time counters for Active Risks, Revenue at Risk, Recovered Today, and Recovery Rate Percentage.
- **Data Visualizations**: Recharts-powered analytics for 7-day Recovery Trends, Recovery Strategy Distribution (Donut Chart), and Top Failure Reasons (Bar Chart).

### 2. 🧠 Multi-Model AI Reasoning Architecture with Zero Downtime
- **Google Gemini 3.1 Pro (Preview)**: Primary deep contextual reasoning engine executing structured JSON extraction for failure classification, customer sentiment risk, and recommended action.
- **Groq LPU (GPT-OSS / LLaMA)**: High-speed zero-latency fallback engine (<400ms) seamlessly triggered if Gemini hits quota or rate limits.
- **Deterministic Offline Rule Engine**: Guarantees 100% system availability even in complete network or API degradation scenarios.

### 3. 🛡️ Deterministic Guardrails & Safety Policy Engine (`PolicyEngine`)
- Autonomous actions are strictly bounded by programmable merchant safety rules:
  - **High-Value Escalation Threshold**: Any transaction above ₹50,000 is automatically blocked from auto-retry and routed to human operator review.
  - **Velocity Caps**: Maximum 2 automated retry attempts within 24 hours per card/UPI handle to prevent issuer blocking.
  - **Action Blacklists**: Restricts specific high-risk execution methods for sensitive accounts.

### 4. 💳 Razorpay Test Mode & Webhook Integration
- Real-time webhook listener (`/webhooks/razorpay`) handling `payment.failed` and `order.paid` events.
- Test Mode integration leveraging live Razorpay API keys with automated recovery link generation.
- Instant simulator trigger to demo drop recovery live during evaluation.

### 5. 🔬 Synthetic Batch Simulator & Quantitative Impact Evaluator
- **Stress-Test Simulation**: Generates 10 to 100+ realistic transaction drops with diverse error types (UPI timeout, insufficient funds, authentication failure).
- **Mathematical Evaluation Engine**: Computes **Incremental Revenue Recovered (IRR)** over traditional naive retry baselines, quantifying the exact ROI generated for the merchant.

### 6. 💬 Merchant AI Copilot
- Conversational revenue analyst allowing merchants to ask natural-language questions like:
  - *"What is our biggest source of revenue leakage this week?"*
  - *"Which banks are showing peak UPI timeout rates?"*
  - *"How much money did Policy Guardrails save from high-risk chargebacks?"*
- Crisp, high-contrast, distraction-free merchant dashboard experience.

### 7. 📜 Immutable Audit Telemetry (`/audit`)
- Every autonomous decision is logged with AI model confidence, reasoning trace, guardrail evaluation result, and execution receipt.

---

## 🏗️ System Architecture

```
                 [ Razorpay Webhook Telemetry ]
                               │
                               ▼
               ┌───────────────────────────────┐
               │    Ingestion & Customer Mem   │
               └───────────────┬───────────────┘
                               │
                               ▼
               ┌───────────────────────────────┐
               │     Dual AI Reasoning Core    │
               │  Primary: Gemini 3.1 Pro      │
               │  Fallback: Groq LPU Engine    │
               └───────────────┬───────────────┘
                               │ (Proposes Action & Risk)
                               ▼
               ┌───────────────────────────────┐
               │  Deterministic Policy Gate    │
               │  • Max Retry Caps             │
               │  • High Value Guardrails      │
               └───────────────┬───────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
         [ PASS GUARDRAIL ]           [ BLOCKED / ESCALATED ]
                │                             │
                ▼                             ▼
       ┌─────────────────┐           ┌─────────────────┐
       │ Razorpay Action │           │ Operator Review │
       │ (Smart Retry /  │           │ (Merchant HUD)  │
       │  Payment Link)  │           └─────────────────┘
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Immutable Audit │
       │ & 3D Telemetry  │
       └─────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts |
| **3D Graphics & Canvas** | Three.js (WebGL), Custom Shaders & Bezier Raycasting |
| **Backend API** | Node.js, Express, TypeScript, Prisma ORM |
| **Database** | SQLite (Embedded zero-config storage for seamless local and container testing) |
| **AI Intelligence** | Google Gemini (`@google/genai`), Groq OpenAI SDK (`openai/gpt-oss-120b`) |
| **Fintech Gateway** | Razorpay Node.js SDK & Webhooks |

---

## 🚀 Future Scope & Commercial Impact

1. **Self-Healing Multi-PSP Smart Routing**: Dynamically switch merchant traffic to alternative gateways (e.g., Cashfree, Stripe, PayU) if Razorpay detects sustained banking outages on specific issuers.
2. **Predictive Churn & Drop-Off Mitigation**: Pre-emptively detect user hesitation during checkout using mouse telemetry to offer tailored payment alternatives before failure occurs.
3. **Automated WhatsApp Conversational Recovery**: Instantly deliver one-click UPI payment links directly to customer WhatsApp threads with natural-language assistance.
4. **Merchant Risk Credit Scoring**: Provide lenders with verifiable recovery telemetry to unlock working-capital credit lines based on recovered cash flow.

---

## 🏁 Hackathon Demo Pitch (Quick 5-Minute Guide)

1. **The Hook (0:00 - 0:45)**: Show how failed payments cost merchants billions, and how blunt retries ruin customer trust.
2. **The 3D Core in Action (0:45 - 2:00)**: Click `"Simulate Drop Webhook"` on the Dashboard. Walk through the 3D pipeline: from red failed nodes, into the glowing AI Core, branching to recovery routes, and ringing the emerald recovered zone.
3. **Safety & Policy Guardrails (2:00 - 3:00)**: Show how high-risk actions are blocked by deterministic policy gates. Explain why this is safe for financial production environments.
4. **Quantitative ROI & Copilot (3:00 - 4:15)**: Run the Batch Simulator to display incremental revenue recovery metrics and ask the Copilot for a real-time risk breakdown.
5. **Conclusion & Vision (4:15 - 5:00)**: Highlight how RecoverShield transforms payment infrastructure from passive pipes into an active, self-healing revenue protector.

---

## 📄 License
MIT License. Built with ❤️ for the Razorpay AI Buildathon.
