import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/auth';
import { subscribeMyReports } from '../services/realtime';

const STATUS_STYLES = {
  open: 'bg-amber-100 text-amber-900',
  reviewing: 'bg-blue-100 text-blue-900',
  resolved: 'bg-emerald-100 text-emerald-900',
  dismissed: 'bg-stone-200 text-stone-800',
};

const formatDate = (value) => {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp));
};

export const MySafetyReportsPage = ({ onNavigateScreen }) => {
  const { currentUser } = useAuth();
  const [reportState, setReportState] = useState({
    uid: null,
    reports: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (!currentUser?.uid) {
      return undefined;
    }
    return subscribeMyReports(
      currentUser.uid,
      (nextReports) => {
        setReportState({ uid: currentUser.uid, reports: nextReports, loading: false, error: '' });
      },
      (error) => {
        console.warn('Could not load the current scholar reports:', error);
        setReportState({
          uid: currentUser.uid,
          reports: [],
          loading: false,
          error: 'Your reports could not be loaded. Please try again later.',
        });
      }
    );
  }, [currentUser?.uid]);

  const stateMatchesUser = reportState.uid === currentUser?.uid;
  const loading = Boolean(currentUser?.uid) && (!stateMatchesUser || reportState.loading);
  const loadError = stateMatchesUser ? reportState.error : '';

  const sortedReports = useMemo(
    () => {
      const reports = stateMatchesUser ? reportState.reports : [];
      return [...reports].sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    },
    [stateMatchesUser, reportState.reports]
  );

  return (
    <main className="min-h-screen bg-[#fff8f7] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => onNavigateScreen('dashboard')} className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-[#705e69] hover:text-[#201a1b]">
          <span className="material-symbols-outlined text-base">arrow_back</span> Dashboard
        </button>
        <h1 className="text-2xl font-extrabold text-[#201a1b]">My safety reports</h1>
        <p className="mt-1 text-sm text-[#705e69]">Only you and designated administrators can see these reports.</p>

        {loading && <p className="mt-6 rounded-2xl border border-[#ecd9d5] bg-white p-6 text-sm text-[#705e69]">Loading your reports…</p>}
        {loadError && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-800">{loadError}</p>}
        {!loading && !loadError && sortedReports.length === 0 && (
          <div className="mt-6 rounded-2xl border border-[#ecd9d5] bg-white p-6 text-sm text-[#705e69]">You have not submitted any reports.</div>
        )}
        <div className="mt-6 space-y-3">
          {sortedReports.map((report) => (
            <article key={report.id} className="rounded-2xl border border-[#ecd9d5] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold capitalize text-[#201a1b]">{String(report.category || 'other').replaceAll('_', ' ')}</h2>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[report.status] || STATUS_STYLES.open}`}>
                  {report.status || 'open'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#806f79]">Submitted {formatDate(report.createdAt)}</p>
              {report.details && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-[#4c4048]">{report.details}</p>}
              {report.reviewedAt && <p className="mt-3 text-[11px] text-[#806f79]">Last reviewed {formatDate(report.reviewedAt)}</p>}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};
