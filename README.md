# VenuPass — Universal Smart QR-Based Crowd & Event Access Management Platform

> **Editorial Enterprise Event Operations Design**  
> Engineered for University Festivals, Technical Conventions, Hackathons, Cultural Programs, Conferences, Exhibitions, and Institutional Drives.

---

## 1. Product Overview

**VenuPass** is an end-to-end, universal event access and crowd management platform designed around high-throughput access points, operational clarity, and verified headcount integrity.

Unlike generic event ticket tools or AI-generated SaaS templates, VenuPass adopts an **editorial enterprise operations design language** reminiscent of modern flight control systems, high-frequency logistics consoles, and Linear-tier productivity tools.

### Core Workflow
```
EVENT CONFIGURATION
        ↓
PARTICIPANT REGISTRATION
        ↓
UNIQUE CRYPTOGRAPHIC QR PASS (Client-Side Integrity Token)
        ↓
UNIFIED SCAN PROCESSING PIPELINE
        ↓
GATE ENTRY / EXIT VALIDATION
        ↓
LIVE OCCUPANCY HEADCOUNT (Strictly Derived: State === INSIDE)
        ↓
REAL-TIME SCAN AUDIT LOGS & ANOMALY DETECTION
        ↓
OPERATIONAL ANALYTICS & CSV EXPORT
        ↓
EMERGENCY HEADCOUNT LOCKDOWN
```

---

## 2. Design System & Aesthetics

VenuPass completely discards generic AI website tropes (no purple gradient blobs, no floating 3D objects, no glassmorphism on normal cards, no endless neon buttons). Instead, it implements a **warm neutral light operations console** for administrative and public views, paired with an **ultra-clean dark mode terminal** for gate scanner operators.

### Color Tokens
- **Background**: `#F5F4F0` (Warm neutral canvas)
- **Surface**: `#FFFFFF` (Crisp editorial surface)
- **Secondary Surface**: `#F0EFEA` (Subtle container backing)
- **Border**: `#DDDCD6` (Hierarchy-defining structural borders)
- **Primary Text**: `#161616` (Deep charcoal, maximum contrast)
- **Secondary Text**: `#6F6F6A` (Balanced metadata tone)
- **Primary Brand Accent**: `#E86A00` (Warm operational amber-orange)
- **Primary Brand Dark**: `#B94D00`
- **Scanner Background**: `#0E0F10` (High contrast, low glare in dim light)
- **Scanner Surface**: `#17191B`
- **Scanner Accent**: `#FF7A00`
- **Status Meanings**:
  - Green (`#16794C`): Approved Entry / Exit
  - Red (`#C43D3D`): Denied / Capacity / Suspicious Cluster
  - Amber (`#A96500`): Duplicate Attempt / Warning / Cooldown
  - Blue (`#2864A8`): Re-entry / Info

### Shape & Depth Standards
- **Cards**: `12px` border radius
- **Dialogs & Overlays**: `14px` border radius
- **Inputs & Buttons**: `8px` border radius
- **Digital Event Pass**: `18px` ticket border radius with quiet zone
- **Status Badges**: `999px` full pill radius
- **Depth**: Level 1 (flat background), Level 2 (white surface with 1px border), Level 3 (active surface with subtle focus shadow).

---

## 3. Technology Stack

- **Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS (with centralized CSS variables and editorial typography tokens)
- **Routing**: React Router DOM (v7)
- **State & Persistence**: Zustand with `persist` middleware (`localStorage` namespace: `venupass:v1`)
- **QR Engine**: `react-qr-code` (SVG rendering + PNG high-res export) & `html5-qrcode` (low-level scanning API)
- **Data Visualization**: Recharts (restrained, single-palette, operational telemetry charts)
- **Micro-interactions**: Motion for React (`framer-motion`)
- **Icons**: Lucide React

---

## 4. Single Unified Scan Processing Pipeline (`processScanPipeline`)

Both the live camera scanner and the manual simulator invoke **one unified scan pipeline** located in `src/services/scanService.ts`. No access logic is duplicated across components.

### Pipeline Sequence:
1. **Decode & Resolve**: Resolves raw token payload or participant ID.
2. **Format & Signature Verification**: Checks version, token ID, event ID match, and cryptographic signature (`computeTokenSignature`).
3. **Expiry Check**: Verifies `exp > now`.
4. **Emergency Lockdown Check**: If `emergencyMode === true`, gate operations are frozen immediately.
5. **Cooldown Check**: Prevents accidental double scans within `scanCooldownSeconds` (default: 5s).
6. **State & Direction Validation**:
   - **ENTRY (`IN`)**:
     - Denied if `state === 'INSIDE'` (`DUPLICATE_ENTRY` — shows first entry gate and time).
     - Denied if `currentCrowd >= maxCapacity` (`CAPACITY_REACHED`).
     - If valid: transitions state to `INSIDE`, increments `entryCount`, logs entry.
   - **EXIT (`OUT`)**:
     - Allowed ONLY if `state === 'INSIDE'`.
     - Denied if `state !== 'INSIDE'` (`PARTICIPANT_NOT_INSIDE`).
     - If valid: transitions state to `EXITED`, increments `exitCount`, logs exit.
7. **Audit & Anomaly Cluster Detection**:
   - Creates immutable log record.
   - Flags suspicious clusters if ≥3 denials occur across any gate within a 60-second sliding window.

---

## 5. Judge Demonstration Script (12-Step Walkthrough)

To reproduce and verify every requirement of the hackathon evaluation:

| Step | Action | Expected System Response |
|------|--------|--------------------------|
| **1** | Open `http://127.0.0.1:5173/` | Landing page displays dynamic event info, live verified crowd counter, editorial grid, and ticket pass preview. |
| **2** | Navigate to `/register` | Register new participant (e.g. `Rahul Patel`, ID: `STU1024`). Form validates required fields and unique ID. |
| **3** | Submit Registration | Instant confirmation screen showing ticket details with action buttons to view or download pass. |
| **4** | Open Digital Pass `/pass/STU1024` | Minimalist digital ticket with QR quiet zone, subtle 3D tilt on desktop, download PNG action, and attendance audit log. |
| **5** | Open Gate Scanner `/gate` | High-contrast dark operational console. Select Gate 1, ensure **ENTRY MODE** is active. |
| **6** | Scan Pass (`STU1024`) | **ENTRY APPROVED**: Green badge, state becomes `INSIDE`, entryCount becomes `1`. Crowd headcount increases by +1. |
| **7** | Scan Same Pass Again in ENTRY MODE | **ALREADY INSIDE**: Amber warning, duplicate entry blocked. Shows initial entry gate and timestamp. Headcount remains unchanged. |
| **8** | Switch to **EXIT MODE** & Scan (`STU1024`) | **EXIT RECORDED**: Blue/green confirmation. State transitions to `EXITED`, exitCount becomes `1`. Crowd headcount decreases by -1. |
| **9** | Test Unknown QR (`UNKNOWN999`) | **ENTRY DENIED**: Red status badge with human-readable reason `QR_NOT_REGISTERED` ("Pass Not Found"). |
| **10** | Test Tampered QR (TEST 8 Shortcut) | **SECURITY DENIED**: `INVALID_SIGNATURE` ("Digital signature verification failed. Token integrity compromise detected."). |
| **11** | Open Admin Console `/admin/login` | Log in with `admin` / `venupass2026`. Verify dominant **CURRENT CROWD** focal headcount, live activity stream, and 8 horizontal KPI counters. |
| **12** | Emergency Headcount `/admin/emergency` | Activate Emergency Lockdown. Scans freeze instantly across all gates, displaying verified roll-call list of attendees currently inside with one-click emergency CSV export. |

---

## 6. Admin Credentials & Navigation

- **Login Route**: `/admin/login`
- **Username**: `admin`
- **Password**: `venupass2026`
- **Console Routes**:
  - `/admin/dashboard`: Live crowd focal point, live activity rail, 8 KPIs, hourly flow.
  - `/admin/participants`: Searchable, filterable attendee directory with QR drawer and movement history.
  - `/admin/logs`: Audit trail with gate, direction, result, and suspicious anomaly markers.
  - `/admin/analytics`: Recharts operational telemetry (occupancy trend, gate traffic, department breakdown).
  - `/admin/reports`: One-click CSV downloads for attendance, scan logs, and emergency headcount.
  - `/admin/emergency`: High-contrast crisis management interface with gate freeze controls.
  - `/admin/settings`: Dynamic event configuration (capacity, gates, cooldown, demo data reset).

---

## 7. Automated Test Suite

VenuPass includes an automated pipeline verification script that programmatically tests all 13 core access control and security rules:

```bash
# Run automated pipeline test suite
npm run test:pipeline
```

Test coverage includes:
- [x] Token structure & cryptographic signature validity
- [x] Tampered token rejection (`INVALID_SIGNATURE`)
- [x] Expired token rejection (`QR_EXPIRED`)
- [x] Normal entry state transition (`NOT_ENTERED` → `INSIDE`)
- [x] Duplicate entry prevention (`ALREADY_INSIDE`)
- [x] Valid exit transition (`INSIDE` → `EXITED`)
- [x] Invalid exit rejection (`PARTICIPANT_NOT_INSIDE`)
- [x] Re-entry flow (`EXITED` → `INSIDE`)
- [x] Emergency lockdown scan rejection (`EMERGENCY_MODE_ACTIVE`)
- [x] Hard venue capacity limit enforcement (`CAPACITY_REACHED`)
- [x] Non-registered/unknown token rejection (`QR_NOT_REGISTERED`)
- [x] Rapid scan cooldown enforcement (`SCAN_COOLDOWN`)
- [x] Real-time crowd headcount mathematical derivation

---

## 8. Security Disclosure & Architecture Roadmap

### Prototype Disclosure
This version of VenuPass is a **frontend-only hackathon prototype**. 
- Token signatures are computed client-side using deterministic hashing and salt tokens for demonstration purposes.
- Audit logs and participant states are persisted in browser `localStorage` (`venupass:v1`).
- This prototype is designed to prove UI/UX usability, high-throughput gate operations, real-time crowd mathematics, and edge-case handling.

### Production Migration Pathway
To transition VenuPass to a production deployment:
1. **Asymmetric QR Cryptography**: Sign tokens using private Ed25519 keys on a Node.js/Go backend; verify with public keys on offline-capable gate scanners.
2. **Database Engine**: Replace Zustand `localStorage` with PostgreSQL + Redis (for millisecond gate cooldown checks and atomic crowd counters).
3. **WebSockets**: Stream live entry/exit events to admin consoles via Redis Pub/Sub or WebSocket clusters.
4. **Hardware Gate Integration**: Interface with physical turnstiles via standard relay controllers and MQTT.

---

## 9. Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm run test:pipeline

# 3. Start local development server
npm run dev

# 4. Open in browser
http://127.0.0.1:5173/
```
