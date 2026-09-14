import React, { useMemo, useState } from 'react';

const DAYNAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHNAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n) => String(n).padStart(2, '0');
const dayKeyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatTime = (ms) => {
  if (!ms) return 'All day';
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(ms));
};

const timeToMinutes = (ms) => {
  if (!ms) return 0;
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes();
};

const STATUS_STYLE = {
  Accepted: 'bg-[#eeddf2] text-[#5a3a68] border-[#d7c2e2]',
  Completed: 'bg-[#e3f2e5] text-[#2e5b3a] border-[#c9e6cf]',
};

// Professional month calendar with a Day Agenda panel.
// `events` are already-filtered (non-cancelled) sessions that carry startMs/dayKey.
export const CalendarView = ({
  events = [],
  onSelectSession,
  onReschedule,
  onCancel,
}) => {
  const todayKey = dayKeyOf(new Date());
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState(null);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      if (!ev.dayKey) continue;
      const list = map.get(ev.dayKey) || [];
      list.push(ev);
      map.set(ev.dayKey, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => timeToMinutes(a.startMs) - timeToMinutes(b.startMs));
    }
    return map;
  }, [events]);

  const monthEvents = useMemo(() => {
    const keys = [];
    const prefix = `${viewDate.getFullYear()}-${pad(viewDate.getMonth() + 1)}-`;
    for (const k of byDay.keys()) {
      if (k.startsWith(prefix)) keys.push(k);
    }
    return keys.sort();
  }, [byDay, viewDate]);

  const activeKey = selectedKey || (todayKey && byDay.has(todayKey) ? todayKey : monthEvents.find((k) => byDay.has(k)) || todayKey);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = firstDow - 1; i >= 0; i -= 1) cells.push(null); // placeholder for alignment
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const navigate = (delta) =>
    setViewDate(new Date(year, month + delta, 1));

  const goToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedKey(todayKey);
  };

  const agenda = (byDay.get(activeKey) || []).slice();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Month grid */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-bold text-[#201a1b] capitalize">
            {MONTHNAMES[month]} {year}
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-[#4a454c] hover:bg-[#ebe0e0] transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-xs font-bold text-[#675975] bg-[#eeddf2]/60 rounded-lg hover:bg-[#eeddf2] transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-2 rounded-lg text-[#4a454c] hover:bg-[#ebe0e0] transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ccc4cd]/40 overflow-hidden">
          <div className="grid grid-cols-7 bg-[#fbf4f2] border-b border-[#eddcd8]">
            {DAYNAMES.map((dn) => (
              <div
                key={dn}
                className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-[#887580]"
              >
                {dn}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`pad-${idx}`}
                    className="min-h-[92px] border-b border-r border-[#f1e8ea] bg-[#fcfaf9]"
                  />
                );
              }
              const key = `${year}-${pad(month + 1)}-${pad(day)}`;
              const dayEvents = byDay.get(key) || [];
              const isToday = key === todayKey;
              const isSelected = key === activeKey;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`relative text-left align-top min-h-[92px] p-1.5 border-b border-r border-[#f1e8ea] transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#f3e8f7] ring-2 ring-inset ring-[#8a6f9d]'
                      : isToday
                        ? 'bg-[#fbf4f2]'
                        : 'bg-white hover:bg-[#fbf4f2]'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${
                      isToday
                        ? 'bg-[#675975] text-white font-bold'
                        : 'text-[#4a454c] font-semibold'
                    }`}
                  >
                    {day}
                  </span>

                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold truncate ${
                          STATUS_STYLE[ev.status] || 'bg-[#f4f1f3] text-[#6e5d68] border-[#e4dde0]'
                        }`}
                        title={`${ev.title} · ${formatTime(ev.startMs)}`}
                      >
                        {formatTime(ev.startMs)} · {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="px-1.5 text-[10px] font-semibold text-[#675975]">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Agenda */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-white rounded-2xl border border-[#ccc4cd]/40 p-5">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#887580] mb-1">
            Day Agenda
          </p>
          <h4 className="text-base font-bold text-[#201a1b] capitalize mb-4">
            {activeKey
              ? new Date(`${activeKey}T00:00:00`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })
              : ''}
          </h4>

          {agenda.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <span className="material-symbols-outlined text-3xl text-[#b7a4b3]">event_available</span>
              <p className="text-xs text-[#7b757d]">No sessions on this day.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {agenda.map((ev) => {
                const isPast = ev.startMs && ev.startMs < Date.now() && ev.status !== 'Completed' && ev.status !== 'Accepted';
                return (
                  <li
                    key={ev.id}
                    className="rounded-xl border border-[#f1e8ea] bg-[#fcfaf9] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-[#675975]">
                            {formatTime(ev.startMs)}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                              STATUS_STYLE[ev.status] || 'bg-[#f4f1f3] text-[#6e5d68]'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </div>
                        <h5 className="mt-1 text-sm font-bold text-[#201a1b] leading-tight">
                          {ev.title}
                        </h5>
                        <p className="text-xs text-[#4a454c] mt-0.5 truncate">
                          {ev.partner?.name || 'Peer Scholar'}
                        </p>
                      </div>
                    </div>

                    {(!isPast || ev.status === 'Accepted') && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => onSelectSession?.(ev)}
                          className="px-3 py-1.5 rounded-lg bg-[#675975] hover:bg-[#52445f] text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Open Details
                        </button>
                        {ev.status === 'Accepted' && (
                          <>
                            <button
                              onClick={() => onReschedule?.(ev)}
                              className="px-3 py-1.5 rounded-lg text-[#675975] bg-[#eeddf2]/60 hover:bg-[#eeddf2] text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => onCancel?.(ev)}
                              className="px-3 py-1.5 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};