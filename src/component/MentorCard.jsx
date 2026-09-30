import React from 'react';
import { AvatarImage } from './AvatarImage';

export const MentorCard = ({ mentor, onRequest, onViewProfile, onMessage }) => {
  const skillsTeach = Array.isArray(mentor.skillsTeach) ? mentor.skillsTeach : [];
  const visibleSkills = skillsTeach.slice(0, 3);
  const remainingSkills = Math.max(skillsTeach.length - visibleSkills.length, 0);
  const rating = Number(mentor.rating || 0);
  const reviewsCount = Number(mentor.reviewsCount || 0);
  const completedSwaps = Number(mentor.completedSwaps || 0);
  const statusLabel = mentor.isOnline ? 'Online' : 'Offline';
  const actionClassName =
    'min-h-10 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675975] focus-visible:ring-offset-2 flex items-center justify-center gap-1.5';

  return (
    <article
      id={`mentor-card-${mentor.id}`}
      className="h-full min-w-0 rounded-2xl border border-[#ddd1dc] bg-white p-5 ambient-lift hover:border-[#bda9c4] flex flex-col"
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="shrink-0 rounded-full bg-[#eeddf2] p-0.5 shadow-sm">
          <AvatarImage
            src={mentor.avatarUrl}
            name={mentor.name}
            className="h-14 w-14 rounded-full border-2 border-white object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="truncate text-base font-bold leading-tight text-[#201a1b]"
              title={mentor.name}
            >
              {mentor.name}
            </h3>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                mentor.isOnline
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
              aria-label={`${mentor.name} is ${statusLabel.toLowerCase()}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${mentor.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}
                aria-hidden="true"
              />
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 truncate text-xs font-semibold text-[#675975]" title={mentor.title}>
            {mentor.title}
          </p>
          <p
            className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-[#726b73]"
            title={mentor.institution}
          >
            <span className="material-symbols-outlined shrink-0 text-[14px] leading-none" aria-hidden="true">
              school
            </span>
            <span className="truncate">{mentor.institution}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-[#eee4ea] bg-[#fdf9fb]">
        <div className="flex items-center justify-center gap-2 border-r border-[#eee4ea] px-3 py-2.5">
          <span
            className="material-symbols-outlined shrink-0 text-[17px] leading-none text-amber-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            star
          </span>
          <div>
            <p className="text-xs font-bold text-[#201a1b]">
              {rating > 0 ? rating.toFixed(1) : 'New'}
            </p>
            <p className="text-[10px] text-[#7b757d]">
              {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 px-3 py-2.5">
          <span className="material-symbols-outlined shrink-0 text-[17px] leading-none text-[#675975]" aria-hidden="true">
            sync_alt
          </span>
          <div>
            <p className="text-xs font-bold text-[#201a1b]">{completedSwaps}</p>
            <p className="text-[10px] text-[#7b757d]">
              {completedSwaps === 1 ? 'swap' : 'swaps'} completed
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b6874]">
          Teaches
        </p>
        {visibleSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                title={skill}
                className="max-w-full truncate rounded-lg bg-[#f7d6cd] px-2.5 py-1 text-[10px] font-bold text-[#5e3831]"
              >
                {skill}
              </span>
            ))}
            {remainingSkills > 0 && (
              <span
                className="rounded-lg border border-[#d9cbd7] bg-[#f8f3f8] px-2.5 py-1 text-[10px] font-bold text-[#675975]"
                title={`${remainingSkills} more teaching ${remainingSkills === 1 ? 'skill' : 'skills'}`}
              >
                +{remainingSkills} more
              </span>
            )}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-[#ddd1dc] bg-[#fdf9fb] px-3 py-2 text-[11px] text-[#7b757d]">
            Teaching skills have not been added yet.
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-[#eee4ea] pt-4">
        <button
          type="button"
          onClick={() => onRequest?.(mentor)}
          disabled={!onRequest}
          title={onRequest ? `Request a session with ${mentor.name}` : 'Session requests are unavailable'}
          aria-label={
            onRequest
              ? `Request a session with ${mentor.name}`
              : `Session requests are unavailable for ${mentor.name}`
          }
          className={`${actionClassName} w-full bg-[#675975] px-4 text-white shadow-sm hover:bg-[#52445f] disabled:hover:bg-[#675975]`}
        >
          <span className="material-symbols-outlined shrink-0 text-[17px] leading-none" aria-hidden="true">
            calendar_add_on
          </span>
          Request Session
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onViewProfile?.(mentor)}
            disabled={!onViewProfile}
            title={onViewProfile ? `View ${mentor.name}'s profile` : 'Profile viewing is unavailable'}
            aria-label={
              onViewProfile
                ? `View ${mentor.name}'s profile`
                : `Profile viewing is unavailable for ${mentor.name}`
            }
            className={`${actionClassName} border border-[#d5c6d5] bg-white px-3 text-[#514354] hover:bg-[#f8f3f8] disabled:hover:bg-white`}
          >
            <span className="material-symbols-outlined shrink-0 text-[16px] leading-none" aria-hidden="true">
              person
            </span>
            View Profile
          </button>
          <button
            type="button"
            onClick={() => onMessage?.(mentor)}
            disabled={!onMessage}
            title={onMessage ? `Message ${mentor.name}` : 'Messaging is unavailable'}
            aria-label={
              onMessage ? `Message ${mentor.name}` : `Messaging is unavailable for ${mentor.name}`
            }
            className={`${actionClassName} bg-[#eeddf2] px-3 text-[#514354] hover:bg-[#e3cae8] disabled:hover:bg-[#eeddf2]`}
          >
            <span className="material-symbols-outlined shrink-0 text-[16px] leading-none" aria-hidden="true">
              chat_bubble
            </span>
            Message
          </button>
        </div>
      </div>
    </article>
  );
};
