import React from 'react';

const formatDate = (ms) => {
  if (!ms) return 'Unscheduled';
  return new Date(ms).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const ScheduleHistoryList = ({ sessions = [], onSelectSession }) => {
  const completed = sessions
    .filter((s) => s.status === 'Completed')
    .sort((a, b) => (b.startMs || 0) - (a.startMs || 0));
  const cancelled = sessions
    .filter((s) => s.status === 'Cancelled')
    .sort((a, b) => (b.startMs || 0) - (a.startMs || 0));

  const history = [
    ...completed.map((s) => ({ ...s, kind: 'completed' })),
    ...cancelled.map((s) => ({ ...s, kind: 'cancelled' })),
  ];

  if (history.length === 0) {
    return (
      <div className="bg-white border border-[#ccc4cd]/40 rounded-2xl p-8 text-center space-y-2">
        <span className="material-symbols-outlined text-3xl text-[#b7a4b3]">history</span>
        <h3 className="text-sm font-bold text-[#201a1b]">No past sessions yet</h3>
        <p className="text-xs text-[#7b757d]">
          Completed and cancelled sessions will accumulate here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#ccc4cd]/40 rounded-2xl overflow-hidden">
      <div className="bg-[#fbf4f2] border-b border-[#eddcd8] px-5 py-3">
        <h3 className="text-sm font-bold text-[#201a1b]">Past &amp; Cancelled</h3>
        <p className="text-[11px] text-[#7b757d]">
          {completed.length} completed · {cancelled.length} cancelled
        </p>
      </div>
      <ul className="divide-y divide-[#f1e8ea]">
        {history.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => onSelectSession?.(s)}
              className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-[#fbf4f2] transition-colors cursor-pointer group"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  s.kind === 'completed'
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }`}
              >
                {s.kind === 'completed' ? 'task_alt' : 'block'}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-bold text-[#201a1b] truncate group-hover:text-[#675975] transition-colors ${
                    s.kind === 'cancelled' ? 'line-through text-[#8a7f86]' : ''
                  }`}
                >
                  {s.title}
                </p>
                <p className="text-xs text-[#7b757d] truncate">
                  {s.kind === 'completed' ? 'Completed · ' : 'Cancelled · '}
                  {formatDate(s.startMs)} · {s.partner?.name || 'Peer Scholar'}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                  s.kind === 'completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {s.kind}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};