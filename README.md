<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# SkillSwap Academic — Realtime Edition

Academic peer-to-peer skill exchange platform where **two real users** request,
accept, and join sessions with **real-time sync via Firebase (Cloud Firestore)**.

## Features

- Firebase Authentication (email/password + Google)
- Real-time session requests: User A sends a request → User B sees it instantly
- Accept / Decline / Propose Alternate responses flow back to the requester live
- Accepting a request atomically creates a confirmed `session` visible to both users
- Accepted sessions carry a Google Meet / Zoom link; both users click **Join Live Meeting**
- Shared pre-session notes sync between both participants
- Discover page shows **Live Scholars** (real users) you can request sessions from
- Demo mode (without signing in) uses seeded local data for exploring the UI

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. (Optional) Set `GEMINI_API_KEY` in `.env.local` for Gemini features.
3. Run the app:
   `npm run dev`

## Firebase setup (one-time)

1. In the [Firebase console](https://console.firebase.google.com) select the
   project `skillswap-45be2` (or your own project).
2. Enable **Cloud Firestore** and **Authentication** (Email/Password + Google).
3. Deploy the security rules so two-user requests/sessions can be shared safely:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore
   ```

4. The Firebase config in `src/firebase.js` already points at the project. If you
   use your own project, replace the `firebaseConfig` values there.

## Testing the realtime two-user flow

The demo login (`Explore as Demo`) still uses local seed data. To exercise the
real production flow you need **two real Firebase accounts**:

1. In your normal browser window: **Sign up** (email/password or Google) as User A.
2. Open an **incognito/private window** and **Sign up** as a different User B.
3. Confirm both profiles appear under **Discover → Live Scholars**.
4. As User A: open a Live Scholar's card → **Request Session** → fill the form → Send.
5. As User B (mentor): your **Requests → Incoming** list updates instantly →
   **Accept Session** → paste your Google Meet link → Confirm.
6. Both users now see the session on **Dashboard** and **My Sessions** with a
   **Join Live Meeting** button. Pre-session notes sync in real time.

> Product note: academic time credits settle only when a participant completes a
> session. Firestore records the immutable ledger entry and updates the user's
> balance transactionally; this is an in-app time bank, not a fiat payment system.

## Deploy to Firebase Hosting

```bash
npm run build
firebase login
firebase deploy --only hosting
```

## Project layout

- `src/services/realtime.js` — Firestore data model, live subscriptions, and
  request/session mutations (the realtime core)
- `src/firebase.js` — Firebase app, Auth, Firestore, Storage
- `src/context/AuthContext.jsx` — auth + Firestore profile sync
- `firestore.rules` — security rules (participants-only access)
- `firebase.json` / `.firebaserc` — hosting + Firestore config

## Scripts

| Script            | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Vite dev server on port 3000        |
| `npm run build`   | Production build to `dist/`         |
| `npm run preview` | Preview the production build        |
| `npm run lint`    | ESLint checks for the React source  |
| `npm run typecheck` | TypeScript/JSDoc consistency check |
| `npm run check`   | Lint, typecheck, and production build |
