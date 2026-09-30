# SkillSwap Launch-Readiness Plan

## Status

Planned for later. No items in this document have been implemented as part of saving this plan.

## Summary

Harden the existing application before adding more features. Keep everything compatible with Firebase's free Spark tier and preserve the current design.

## Key Changes

- Add real URL routing with `react-router-dom`:
  - Public routes: `/`, `/login`, `/signup`, `/privacy`, `/terms`
  - Protected routes: `/dashboard`, `/discover`, `/requests`, `/schedule`, `/skills`
  - Detail routes: `/sessions/:sessionId`, `/scholars/:uid`
  - Support refresh, browser Back/Forward, protected redirects, and a 404 page.
- Enforce profile completion using name, institution, academic level, one teaching skill, and one learning goal. Incomplete accounts return to profile setup.
- Add email verification for password accounts:
  - Allow profile completion while unverified.
  - Require verification before sending requests or messages.
  - Add resend-verification controls and clear guidance.
  - Google accounts continue normally when Firebase reports them as verified.
- Move uploaded avatars to Firebase Storage:
  - Resize images to a maximum of 500px.
  - Accept JPEG, PNG, and WebP up to 5 MB.
  - Store files at `avatars/{uid}/profile`.
  - Save only the download URL in Firestore.
  - Add Storage security rules restricting writes to the profile owner.
- Add a free-tier account deactivation flow:
  - Require recent authentication and explicit confirmation.
  - Anonymize the public profile and exclude it from discovery.
  - Prevent new requests, messages, and sessions.
  - Preserve anonymous transaction and session records needed by other participants.
  - Delete the Firebase Authentication account after anonymization succeeds.
- Add automated quality protection:
  - Vitest and React Testing Library for hooks, forms, filters, and validation.
  - Firebase Emulator tests for Firestore and Storage rules.
  - Playwright tests for signup, profile setup, request acceptance, session completion, review, chat, blocking, and reporting.
  - Add `test`, `test:rules`, and `test:e2e` scripts and run them in CI.
- Complete a launch audit:
  - Keyboard navigation, modal focus management, field labels, contrast, and screen-reader states.
  - Mobile layouts at 320px, 375px, tablet, and desktop widths.
  - Loading, empty, offline, permission-denied, and Firestore failure states.
  - Lighthouse checks for accessibility and performance.

## Interfaces and Data

- Add URL-based route parameters for session and scholar IDs.
- Add profile fields such as `accountStatus` and `deactivatedAt`.
- Extend Firestore rules to recognize deactivated profiles and verified accounts.
- Add `storage.rules` and include Storage rules in Firebase deployment configuration.
- Existing active users remain active by default when `accountStatus` is absent.

## Test Plan

- Refresh and directly open every public and protected URL.
- Confirm unauthenticated users return to login and incomplete profiles return to setup.
- Confirm unverified password users cannot message or request sessions.
- Upload valid and invalid avatar files and verify Storage ownership rules.
- Test the full two-user request, session, credit settlement, review, and chat workflow.
- Confirm settlement and review operations remain idempotent.
- Deactivate an account and verify it disappears from discovery without breaking shared history.
- Run lint, type checking, unit tests, emulator rule tests, end-to-end tests, and production build.

## Assumptions

- Firebase remains on the free Spark tier; Cloud Functions, scheduled jobs, SMS, and server-generated reminders are excluded.
- Existing colors and layouts remain unchanged.
- Transaction, review, moderation, and shared session records are retained in anonymized form.
- Smart matching, calendar synchronization, push notifications, and advanced availability are post-launch enhancements.
