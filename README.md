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

The real-time workflow works on Firebase's Spark plan. New accounts receive 5
starter credits so the first exchange can be requested; starter credits are
separate from earned credits. Credit settlement and review aggregation use
atomic Firestore transactions and are validated by `firestore.rules`; clients
cannot directly forge balances, swap totals, or ratings.

## Profile and chat data

Scholar profiles are readable by signed-in users so Discover and public
profiles can work. Keep private account data, including email addresses and
credentials, out of `users/{uid}`; the Firestore rules allow only the public
profile fields written by the app when a profile is created. The sign-up flow
keeps email in Firebase Authentication.

Direct messages are limited to 4,000 characters. The app loads the latest 100
messages for an open conversation, keeps unsent text after a send failure, and
restricts message writes to the conversation's two participants. Deploy the
Firestore rules after updating the app so those checks are enforced remotely:

```bash
npm run deploy:rules
```

New session requests store a precise start time and the requester's IANA time
zone. Reschedule proposals store the proposing scholar's zone, and confirmed
session timestamps are shown in each participant's local time with the local
zone abbreviation. Requests created before time-zone support may have no
recorded zone; the app labels those as unknown and uses the accepting scholar's
zone as a compatibility fallback.

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

## Reports and blocking

Scholars can report a profile or chat participant, view report status under
**My Safety Reports**, and block/unblock scholars. Reports are immutable to
users and readable only by their reporter and an account with the Firebase
custom claim `admin: true`. Admins can open **Safety Reports** from the dashboard
to review the latest 100 reports and mark them reviewing, resolved, or
dismissed. New requests, sessions, and messages between either pair of blocked
scholars are rejected by Firestore rules. Existing records remain available to
their participants.

## Test the two-user flow

Run `npm run test:chat` with the Firebase CLI and Java 21 or later on your PATH
to check chat security rules against the Firestore emulator. It uses the real
chat services with simulated email/password and Google identities in a demo
project, covering first and repeated messages, replies, unread counts, and
blocked or unauthorized writes without touching production data.

1. Sign in as User A in a normal browser window.
2. Sign in as User B in a private window.
3. Complete both profiles and add skills to teach and learn.
4. User A opens User B from Discover and sends a request.
5. User B accepts it and supplies a real meeting link.
6. After the session, both users confirm completion. The second confirmation
   transfers credits and updates both swap totals atomically.
7. Each participant can submit one review. Ratings, badges, profiles, wallet
   history, and leaderboard results update from Firestore snapshots.

## Production release

The `production` Firebase alias points to `skillswap-45be2`. Run the complete
verification and deploy Hosting, Firestore rules, and indexes with:

```bash
npm run deploy
```

For a Hosting-only release, use `npm run deploy:hosting`. For rules and indexes
only, use `npm run deploy:rules`. The production site is
<https://skillswap-45be2.web.app>.

Firebase Hosting keeps prior releases. If a web release must be rolled back,
open **Firebase Console → Hosting → Release history**, select a known-good
release, and choose **Rollback**. Rules should be rolled back from version
control and redeployed.

### Separate development data

Do not point local feature work at production data. Create a second Firebase
project, copy `.env.example` to `.env.local`, and fill it with that project's
Firebase web-app configuration. Then add the project as a local CLI alias:

```bash
firebase use --add
firebase use <development-alias>
npm run dev
```

Switch back with `firebase use production` before a production deployment, or
pass `--project skillswap-45be2` explicitly. Firebase web configuration values
identify a project and are not service-account credentials; Firestore rules
remain the authorization boundary.

### Operations checklist

- Review Firebase Authentication users, Firestore usage, and Safety Reports
  regularly.
- Configure a Google Cloud Billing budget and email notifications before
  upgrading from the free tier.
- The current Firestore database is in `asia-south1` on the free tier. Managed
  backup schedules and point-in-time recovery are currently disabled; enable a
  billing plan before configuring them. Database delete protection is enabled.
- Keep service-account files outside the repository and rotate any credential
  that is ever exposed.
- Check the live Privacy Policy and Terms after material product or data-use
  changes.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite on port 3000 |
| `npm run check` | Lint, type-check, and production-build |
| `npm run deploy` | Verify and deploy Hosting plus Firestore |
| `npm run deploy:hosting` | Build and deploy Hosting only |
| `npm run deploy:rules` | Deploy Firestore rules and indexes |
| `npm run set-admin -- <uid> true` | Grant wallet-admin access |
| `npm run build` | Build `dist/` |

The main data contract is in `src/services/realtime.js`; authorization and
cross-document invariants are in `firestore.rules`.
