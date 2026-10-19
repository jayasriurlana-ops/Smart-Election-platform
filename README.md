# CivicVote — Smart Election Platform Prototype

A local-only demonstration prototype for non-government organizational elections.

## Requirements
- Node.js 20.9 or newer
- npm
- VS Code (recommended)

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Demo roles
Use the “Preview as” selector in the top bar:
- Super Admin — `superadmin@demo.com`
- Organization Admin — `admin@demo.com`
- Voter — `voter@demo.com`

No password is requested because this is only a UI/workflow prototype, not real authentication.

## What works
- Switch between demo roles
- Create elections and candidates
- Open/close elections
- Cast a demo vote once per demo account per election
- Publish results and view vote totals
- Search elections
- Persist demo data in browser local storage
- Reset demo data

## Important security limitation
This is NOT secure for real elections. Browser local storage is user-controlled, the demo role selector is not authentication, and vote totals can be modified by changing browser data. Before real use, replace this with server-side authentication, a database with strict authorization, one-vote constraints, privacy-preserving ballot storage, auditability, rate limiting, backups, security testing, and an independent review.

## Folder structure
```text
smart-election-prototype/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```
