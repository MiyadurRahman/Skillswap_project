import React from 'react';

const SUPPORT_URL = 'https://github.com/MiyadurRahman/Skillswap_project/issues';

const privacySections = [
  ['Information we collect', 'SkillSwap stores your account identifier, public scholar profile, skills, availability, requests, sessions, messages, reviews, safety reports, block list, and time-credit activity. Firebase Authentication manages sign-in credentials.'],
  ['How we use information', 'We use this information to authenticate you, show the scholar directory, match and schedule sessions, deliver messages, maintain the credit ledger, prevent abuse, and respond to safety reports.'],
  ['Who can see information', 'Signed-in scholars can see public profile fields. Request, session, and conversation data is limited to its participants. Your block list is private to you. Safety reports are visible to you and authorized moderators.'],
  ['Service providers', 'The app uses Google Firebase for authentication, hosting, and Firestore storage. Data may be processed where Google operates its services.'],
  ['Retention and control', 'Records are retained while needed to operate the service, protect users, and preserve the credit ledger. You may update your profile in the app. For account deletion or a privacy request, contact project support.'],
  ['Security', 'SkillSwap uses Firebase Authentication and Firestore security rules. No internet service can guarantee absolute security, so do not put passwords, financial details, or highly sensitive information in profiles or messages.'],
];

const termsSections = [
  ['Using SkillSwap', 'You must provide accurate account information, keep access to your account secure, and use the service only for lawful academic peer exchange.'],
  ['Scholar conduct', 'Do not harass, impersonate, spam, exploit, or endanger another person. Do not share content you lack permission to share. Use blocking and reporting tools when needed.'],
  ['Sessions and credits', 'Time credits are in-app units for arranging peer sessions. They are not money, cannot be redeemed for cash, and transfer only when the app records both participants’ completion confirmations.'],
  ['User content', 'You keep ownership of content you submit. You allow SkillSwap to store and display it as needed to provide the service, including profiles, messages, session notes, and reviews.'],
  ['Availability', 'The service may change, experience interruptions, or remove content and accounts that threaten users or violate these terms. Keep your own copy of information you need.'],
  ['Academic responsibility', 'Peer guidance does not replace instruction from your university. You remain responsible for your work and for following academic integrity rules.'],
];

export const LegalPage = ({ type = 'privacy', onBack }) => {
  const isPrivacy = type === 'privacy';
  const sections = isPrivacy ? privacySections : termsSections;

  return (
    <div className="min-h-screen bg-[#fff8f7] text-[#201a1b]">
      <header className="sticky top-0 z-20 border-b border-white/15 bg-[#4e4353] text-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-8">
          <button type="button" onClick={onBack} className="flex items-center gap-2 font-bold text-[#efdbfd]">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            SkillSwap
          </button>
          <span className="text-sm font-semibold">{isPrivacy ? 'Privacy Policy' : 'Terms of Use'}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-14">
        <div className="rounded-3xl border border-[#ccc4cd]/70 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#675975]">Effective September 28, 2026</p>
          <h1 className="mt-2 text-3xl font-extrabold">{isPrivacy ? 'Privacy Policy' : 'Terms of Use'}</h1>
          <p className="mt-4 text-sm leading-7 text-[#4a454c]">
            {isPrivacy
              ? 'This policy explains how SkillSwap Academic handles information when you use the service.'
              : 'These terms govern your use of SkillSwap Academic.'}
          </p>

          <div className="mt-8 space-y-7">
            {sections.map(([title, body]) => (
              <section key={title}>
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#4a454c]">{body}</p>
              </section>
            ))}
          </div>

          <section className="mt-9 rounded-2xl bg-[#f7effa] p-5">
            <h2 className="font-bold">Support and policy requests</h2>
            <p className="mt-2 text-sm leading-6 text-[#4a454c]">
              Open a support issue without including passwords, private messages, or other sensitive information.
            </p>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#675975] underline"
            >
              Contact project support
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </section>
        </div>
      </main>
    </div>
  );
};
