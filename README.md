# RecoverShield — Autonomous AI Revenue Recovery Engine

> **Built for the Razorpay AI Buildathon — AI Revenue Recovery Track**  
> *Transforming payment drop-offs and transaction failures into recovered revenue using autonomous, policy-bounded multi-model AI.*

---

<img width="849" height="476" alt="Screenshot 2026-09-05 182345" src="https://github.com/user-attachments/assets/e37a85e4-582b-4c9a-8ff1-f74a438a48ad" />


## Live Deployment

**Live URL to Test:** https://recovershield-beta.vercel.app

**Frontend (Vercel):** https://recovershield-beta.vercel.app

**Backend (Render):** https://recovershield.onrender.com

**Demo Video:** [Watch on Google Drive](https://drive.google.com/file/d/1eot0FVxy8J8z8qbKwcSh5BDX1XEiU0zr/view?usp=drivesdk)

> Click the **"Simulate Payment Failure"** button on the dashboard to trigger the full AI recovery pipeline. Each click generates a synthetic failed payment, runs it through AI diagnosis, policy evaluation, and recovery execution — and updates all charts and metrics in real time.

---

## Executive Summary

Every digital merchant loses **15% to 30% of addressable revenue** through friction points: transient bank network timeouts, issuer declines, card auth expirations, and abandoned payment links.

Traditional approaches either do nothing or execute blunt, blind retry scripts that annoy users, trigger card network penalties, and waste merchant time.

**RecoverShield** is an autonomous, explainable revenue recovery system built directly on Razorpay's rails. It intercepts failed payments in real-time, diagnoses the root cause using dual-model AI reasoning (Google Gemini + Groq LPU fallback), validates every action against strict merchant guardrails, and executes surgical recovery workflows — smart adaptive retries, custom payment links, or rail switching — all with full auditability.

---

## Fully Implemented Features

### 1. 3D Recovery Core and Real-Time Telemetry Pipeline
- **Interactive Three.js 3D Core**: Centerpiece visualization mapping the end-to-end recovery journey from failed payments through AI diagnosis to recovered revenue.
- **Live Packet Physics**: Active transaction packets travel dynamically across conduits with click/hover inspection showing Transaction ID, Risk Score, Diagnosis, and Action Status.
- **HUD Live Metrics**: Real-time counters for Active Risks, Revenue at Risk, Recovered Today, and Recovery Rate.
- **Data Visualizations**: Recharts-powered analytics for 7-day Recovery Trends, Recovery Strategy Distribution, and Top Failure Reasons — all live from the database.

### 2. Multi-Model AI Reasoning Architecture
- **Google Gemini 2.0 Flash**: Primary contextual reasoning engine for failure classification, customer risk scoring, and recommended action in structured JSON.
- **Groq LPU**: High-speed fallback engine triggered automatically if Gemini hits quota or rate limits.
- **Deterministic Rule Engine**: Guarantees 100% system availability even under complete API degradation.

### 3. Deterministic Guardrails and Safety Policy Engine
Autonomous actions are strictly bounded by programmable merchant safety rules:
- **High-Value Escalation Threshold**: Transactions above a configured limit are blocked from auto-retry and routed to human review.
- **Velocity Caps**: Maximum retry attempts per card or UPI handle within a 24-hour window.
- **Action Blacklists**: Restrict specific high-risk execution methods for sensitive accounts.

### 4. Razorpay Integration
- Real-time webhook listener handling `payment.failed` and `payment.captured` events.
- Live Razorpay Test Mode with automated payment link generation and smart retry via new order creation.
- Instant simulator trigger for live demo during evaluation.

### 5. Synthetic Batch Simulator and Evaluation Engine
- Generates 10 to 100+ realistic transaction failures with diverse error types.
- Computes Incremental Revenue Recovered over traditional naive retry baselines, quantifying exact ROI.

### 6. Merchant AI Copilot
- Conversational revenue analyst for natural-language questions such as:
  - "What is our biggest source of revenue leakage this week?"
  - "Which banks are showing peak UPI timeout rates?"
  - "How much did policy guardrails save from high-risk chargebacks?"

### 7. Immutable Audit Telemetry
- Every autonomous decision is logged with AI model confidence, reasoning trace, guardrail evaluation result, and execution receipt.

---

## System Architecture

```
                 [ Razorpay Webhook Telemetry ]
                               |
                               v
               +-------------------------------+
               |    Ingestion & Customer Mem   |
               +---------------+---------------+
                               |
                               v
               +-------------------------------+
               |     Dual AI Reasoning Core    |
               |  Primary: Gemini 2.0 Flash    |
               |  Fallback: Groq LPU Engine    |
               +---------------+---------------+
                               | (Proposes Action & Risk)
                               v
               +-------------------------------+
               |  Deterministic Policy Gate    |
               |  - Max Retry Caps             |
               |  - High Value Guardrails      |
               +---------------+---------------+
                               |
                +──────────────+──────────────+
                v                             v
         [ PASS GUARDRAIL ]           [ BLOCKED / ESCALATED ]
                |                             |
                v                             v
       +-----------------+           +-----------------+
       | Razorpay Action |           | Operator Review |
       | (Smart Retry /  |           | (Merchant HUD)  |
       |  Payment Link)  |           +-----------------+
       +--------+--------+
                |
                v
       +-----------------+
       | Immutable Audit |
       | & 3D Telemetry  |
       +-----------------+
```

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS, Lucide Icons, Recharts |
| 3D Graphics | Three.js (WebGL) |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | SQLite |
| AI | Google Gemini 2.0 Flash, Groq LPU |
| Payments | Razorpay Node.js SDK and Webhooks |
| Deployment | Vercel (frontend), Render (backend) |

---

## Future Scope

1. **Multi-PSP Smart Routing**: Dynamically switch traffic to alternative gateways if sustained outages are detected on specific issuers.
2. **Predictive Drop-Off Mitigation**: Detect user hesitation during checkout and offer alternatives before failure occurs.
3. **WhatsApp Conversational Recovery**: Deliver one-click UPI payment links directly to customer WhatsApp threads.
4. **Merchant Risk Credit Scoring**: Provide lenders with verifiable recovery telemetry to unlock working-capital credit lines.

---

## Hackathon Demo Guide (5 Minutes)

1. **(0:00 - 0:45)** Show how failed payments cost merchants billions and how blunt retries damage customer trust.
2. **(0:45 - 2:00)** Click "Simulate Payment Failure" on the Dashboard. Walk through the 3D pipeline from failed nodes through the AI core to the recovery zone.
3. **(2:00 - 3:00)** Show how high-risk actions are blocked by policy gates and routed to human review.
4. **(3:00 - 4:15)** Run the Batch Simulator to show incremental revenue recovery metrics. Ask the Copilot for a real-time risk breakdown.
5. **(4:15 - 5:00)** Highlight how RecoverShield transforms payment infrastructure from passive pipes into an active, self-healing revenue engine.

---

## Demo Assumptions

This deployment is a single-tenant proof-of-concept built for the hackathon. The following assumptions apply:

- All visitors share the same database. There is no user authentication or session isolation.
- All users see the same data. Simulated payment failures triggered by any visitor appear on the dashboard for everyone.
- There are no merchant accounts or login flows. The app operates as a single shared demo environment.
- All payment data is synthetic. The "Simulate Payment Failure" button generates fake payment IDs that do not correspond to real Razorpay transactions.
- Razorpay API calls (payment link creation, order creation) run in test mode using a single set of demo credentials.
- The Render free tier uses an ephemeral compute instance. The backend may take 30–60 seconds to wake up after inactivity.

---

## Enhancing for Production

To evolve RecoverShield from a demo into a production-grade system, the following changes would be prioritised:

- **Multi-tenancy and authentication**: Each merchant gets their own account, isolated database partition, and OAuth-based login. Razorpay credentials are stored per merchant.
- **Real webhook ingestion**: Connect each merchant's live Razorpay account so actual payment failures trigger the recovery pipeline automatically without manual simulation.
- **Persistent storage**: Replace the shared demo database with per-merchant isolated PostgreSQL instances or row-level security policies.
- **Role-based access control**: Separate views for merchant owners, finance teams, and support operators with appropriate permission levels.
- **Production AI keys**: Each deployment uses dedicated API quotas for Gemini and Groq to avoid rate-limit sharing across merchants.
- **Observability**: Add structured logging, error tracking (Sentry), and uptime monitoring to meet financial-grade reliability standards.
- **Compliance**: Add audit log export, data retention policies, and PCI-DSS aligned data handling for cardholder information.

---

## License

MIT License. Built for the Razorpay AI Buildathon.
