import React from 'react';

export const ActiveSessionCard = ({ session, onJoin, onShowToast }) => {
  return (
    <div
      id={`session-${session.id}`}
      className="bg-white rounded-2xl p-5 ambient-lift border border-[#ccc4cd]/40 hover:border-[#675975]/40 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${session.bgCategoryColor || 'bg-[#ffdada]'} ${session.textCategoryColor || 'text-[#5c3f40]'}`}>
              {session.category}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[#7b757d] bg-[#f7ebeb] px-2 py-0.5 rounded-full">
              {session.type}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-[#4a454c] font-medium">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {session.dateStr}
          </span>
        </div>

        <h3 className="text-base font-bold text-[#201a1b] leading-snug mb-1">
          {session.title}
        </h3>
        <p className="text-xs text-[#4a454c]">
          With <span className="font-semibold text-[#675975]">{session.mentorName}</span>
        </p>
      </div>

      <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#ccc4cd]/20">
        <button
          onClick={() => onShowToast(`Reviewing preparation notes for ${session.title}`)}
          className="text-xs font-semibold text-[#675975] hover:text-[#4e4353] transition-colors"
        >
          View Materials
        </button>
        <button
          onClick={() => onJoin(session)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#c5b3d3] hover:bg-[#a992bb] text-[#52445f] hover:text-[#22162e] rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">videocam</span>
          Join Meeting
        </button>
      </div>
    </div>
  );
};
