import React from 'react';

export const MentorCard = ({ mentor, onSelect, onShowToast }) => {
  return (
    <div
      id={`mentor-card-${mentor.id}`}
      className="bg-white rounded-2xl p-4 ambient-lift border border-[#ccc4cd]/40 hover:border-[#c5b3d3] transition-all flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={mentor.avatarUrl}
            alt={mentor.name}
            className="w-12 h-12 rounded-full object-cover border border-[#ccc4cd]/50 shadow-sm"
          />
          {mentor.isOnline && (
            <span
              title="Online now"
              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
            ></span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-[#201a1b] leading-tight">
              {mentor.name}
            </h4>
            <span className="material-symbols-outlined text-[14px] text-[#675975]">
              verified
            </span>
          </div>
          <p className="text-xs text-[#4a454c] mt-0.5">{mentor.field}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center text-[11px] font-bold text-amber-600">
              <span className="material-symbols-outlined text-[13px] fill mr-0.5 text-amber-500">
                star
              </span>
              {mentor.rating}
            </span>
            <span className="text-[10px] text-[#7b757d]">
              ({mentor.reviewsCount} reviews)
            </span>
            <span className="text-[10px] bg-[#f7ebeb] text-[#675975] px-1.5 py-0.5 rounded font-medium">
              {mentor.hourlyRateCredits} credit/hr
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => onSelect(mentor)}
          className="px-3.5 py-1.5 bg-[#675975] hover:bg-[#52445f] text-white rounded-full text-xs font-semibold transition-colors cursor-pointer shadow-sm text-center whitespace-nowrap"
        >
          Book Swap
        </button>
        <button
          onClick={() => onShowToast(`Sent connection invitation to ${mentor.name}`)}
          className="px-3 py-1 bg-[#fdf1f1] hover:bg-[#f7ebeb] text-[#675975] rounded-full text-[11px] font-medium transition-colors text-center"
        >
          Message
        </button>
      </div>
    </div>
  );
};
