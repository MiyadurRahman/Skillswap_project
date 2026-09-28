import React from 'react';
import { resolveAvatarForName } from '../assets';

export const MentorCard = ({ mentor, onSelect, onMessage, onShowToast }) => {
  return (
    <div
      id={`mentor-card-${mentor.id}`}
      className="bg-white rounded-2xl p-4 ambient-lift border border-[#ccc4cd]/40 hover:border-[#c5b3d3] transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#ccc4cd]/50 shadow-sm bg-[#eeddf2]">
            <img
              src={mentor.avatarUrl}
              alt={mentor.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = resolveAvatarForName(mentor.name);
              }}
              className="w-full h-full object-cover"
            />
          </div>
          {mentor.isOnline && (
            <span
              title="Online now"
              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
            ></span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-[#201a1b] leading-tight truncate">
              {mentor.name}
            </h4>
          </div>
          <p className="text-xs text-[#4a454c] mt-0.5 truncate">{mentor.field}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="flex items-center text-[11px] font-bold text-amber-600">
              <span className="material-symbols-outlined text-[13px] fill mr-0.5 text-amber-500">
                star
              </span>
              {Number(mentor.rating) > 0 ? Number(mentor.rating).toFixed(1) : 'New'}
            </span>
            <span className="text-[10px] text-[#7b757d]">
              ({mentor.reviewsCount} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row sm:flex-col gap-1.5 shrink-0 w-full sm:w-auto">
        <button
          onClick={() => onSelect(mentor)}
          className="flex-1 px-3.5 py-2 sm:py-1.5 bg-[#675975] hover:bg-[#52445f] text-white rounded-full text-xs font-semibold transition-colors cursor-pointer shadow-sm text-center whitespace-nowrap"
        >
          Book Swap
        </button>
        <button
          onClick={() => {
            if (onMessage) {
              onMessage(mentor);
            } else if (onShowToast) {
              onShowToast('Messaging is unavailable for this scholar right now.');
            }
          }}
          className="flex-1 px-3 py-2 sm:py-1 bg-[#fdf1f1] hover:bg-[#f7ebeb] text-[#675975] rounded-full text-[11px] font-medium transition-colors text-center cursor-pointer"
        >
          Message
        </button>
      </div>
    </div>
  );
};
