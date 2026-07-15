# NursingMocks

NursingMocks is a Next.js application for nursing exam practice resources, including TEAS, HESI A2, nursing test banks, and nursing exit exam content.

## Stack

- Next.js 15
- React 19
- Firebase Auth, Firestore, and Storage
- Resend email
- TikTok Pixel tracking
- Vercel deployment

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
copy .env.example .env.local
```

3. Fill `.env.local` with values from the independent NursingMocks Firebase, Resend, analytics, and site configuration.

4. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Important Configuration

This repository should not depend on the previous TEAS Gurus Firebase, GitHub, Vercel, analytics, or payment setup.

Required environment values:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO`
- `SUPPORT_EMAIL`
- `EMAIL_WORKER_SECRET`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `NEXT_PUBLIC_TIKTOK_PIXEL_ID`

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run generate:sidebar
```

`npm run build` runs `scripts/generate-sidebar-data.js` first and may update generated sidebar data files.
