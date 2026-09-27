# SkillSwap Academic

A Firebase-backed peer skill exchange. Authentication, scholar profiles,
requests, sessions, chat, reviews, achievements, leaderboard statistics, skill
wishlists, presence, and the time-credit ledger all use live Firestore data.

## Local development

```bash
npm install
npm run dev
```

Run the full verification suite with:

```bash
npm run check
```

## Firebase setup

The checked-in Firebase configuration targets `skillswap-45be2`. Enable Email /
Password and Google authentication in Firebase Authentication, then deploy the
rules and indexes:

```bash
firebase login
npm run deploy:rules
```

The real-time workflow works on Firebase's Spark plan. Credit settlement and
review aggregation use atomic Firestore transactions and are validated by
`firestore.rules`; clients cannot directly forge balances, swap totals, or
didratings.

## Manual wallet administration

Wallet corrections are only visible to accounts with the Firebase custom claim
`admin: true`. To grant that claim, create a Firebase service-account key,
provide it to Application Default Credentials, and run:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\skillswap-service-account.json"
npm run set-admin -- FIREBASE_USER_UID true
```

The administrator must sign out and back in after the claim changes. The wallet
then shows a manual adjustment form. Every correction requires a reason and
creates an immutable ledger entry. Revoke access with:

```powershell
npm run set-admin -- FIREBASE_USER_UID false
```

Keep the service-account file outside this repository and never commit it.

## Test the two-user flow

1. Sign in as User A in a normal browser window.
2. Sign in as User B in a private window.
3. Complete both profiles and add skills to teach and learn.
4. User A opens User B from Discover and sends a request.
5. User B accepts it and supplies a real meeting link.
6. After the session, both users confirm completion. The second confirmation
   transfers credits and updates both swap totals atomically.
7. Each participant can submit one review. Ratings, badges, profiles, wallet
   history, and leaderboard results update from Firestore snapshots.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite on port 3000 |
| `npm run check` | Lint, type-check, and production-build |
| `npm run deploy:rules` | Deploy Firestore rules and indexes |
| `npm run set-admin -- <uid> true` | Grant wallet-admin access |
| `npm run build` | Build `dist/` |

The main data contract is in `src/services/realtime.js`; authorization and
cross-document invariants are in `firestore.rules`.
