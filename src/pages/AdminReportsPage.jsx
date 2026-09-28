import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/auth';
import { subscribeAdminReports, updateReportReview } from '../services/realtime';

const FILTERS = ['all', 'open', 'reviewing', 'resolved', 'dismissed'];

const formatDate = (value) => {
  if (!Number.isFinite(Number(value))) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(Number(value)));
};

export const AdminReportsPage = ({ onNavigateScreen, onShowToast }) => {
  const { isAdmin } = useAuth();
  const [reportState, setReportState] = useState({ reports: [], loading: true, error: '' });
  const [filter, setFilter] = useState('open');
  const [savingId, setSavingId] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }
    return subscribeAdminReports(
      (nextReports) => {
        setReportState({ reports: nextReports, loading: false, error: '' });
      },
      (error) => {
        console.warn('Admin reports subscription failed:', error);
        setReportState({
          reports: [],
          loading: false,
          error: 'Reports could not be loaded. Check your admin access and try again.',
        });
      }
    );
  }, [isAdmin]);

  const loading = isAdmin && reportState.loading;
  const loadError = isAdmin ? reportState.error : '';

  const filteredReports = useMemo(
    () => {
      const reports = isAdmin ? reportState.reports : [];
      return filter === 'all' ? reports : reports.filter((report) => report.status === filter);
    },
    [filter, isAdmin, reportState.reports]
  );

  const handleStatus = async (reportId, status) => {
    setSavingId(reportId);
    try {
      await updateReportReview(reportId, status);
      onShowToast?.(`Report marked ${status}.`);
    } catch (error) {
      console.warn('Report update failed:', error);
      onShowToast?.(error?.message || 'Could not update the report.');
    } finally {
      setSavingId('');
    }
  };

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#fff8f7] px-5 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#201a1b]">Admin access required</h1>
        <p className="mt-2 text-sm text-[#705e69]">This report queue is available only to designated administrators.</p>
        <button onClick={() => onNavigateScreen('dashboard')} className="mt-6 rounded-full bg-[#473b4b] px-5 py-2.5 text-sm font-bold text-white">Back to dashboard</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f7] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button onClick={() => onNavigateScreen('dashboard')} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-[#705e69] hover:text-[#201a1b]">
              <span className="material-symbols-outlined text-base">arrow_back</span> Dashboard
            </button>
            <h1 className="text-2xl font-extrabold text-[#201a1b]">Safety reports</h1>
            <p className="mt-1 text-sm text-[#705e69]">Review the latest 100 reports and record an outcome.</p>
          </div>
          <label className="text-xs font-bold text-[#4a3b47]">
            Status
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="ml-2 rounded-lg border border-[#e5d6d3] bg-white px-3 py-2 text-xs">
              {FILTERS.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
            </select>
          </label>
        </header>

        {loading && <p className="rounded-2xl border border-[#ecd9d5] bg-white p-6 text-sm text-[#705e69]">Loading reports…</p>}
        {loadError && <p role="alert" className="rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-800">{loadError}</p>}
        {!loading && !loadError && filteredReports.length === 0 && (
          <p className="rounded-2xl border border-[#ecd9d5] bg-white p-6 text-sm text-[#705e69]">No {filter === 'all' ? '' : `${filter} `}reports in the latest 100.</p>
        )}

        <div className="space-y-4">
          {filteredReports.map((report) => (
            <article key={report.id} className="rounded-2xl border border-[#ecd9d5] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold capitalize text-[#201a1b]">{String(report.category || 'other').replaceAll('_', ' ')}</h2>
                    <span className="rounded-full bg-[#f3eaf4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#59465f]">{report.status}</span>
                    <span className="text-[11px] text-[#806f79]">{report.source || 'profile'} report</span>
                  </div>
                  <p className="mt-1 text-xs text-[#806f79]">Submitted {formatDate(report.createdAt)}</p>
                </div>
                <span className="text-[11px] text-[#806f79]">ID: {report.id}</span>
              </div>

              {report.details ? <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-[#fbf7f6] p-3 text-sm text-[#342b32]">{report.details}</p> : <p className="mt-4 text-xs italic text-[#806f79]">No additional details provided.</p>}
              <dl className="mt-4 grid gap-2 text-[11px] text-[#806f79] sm:grid-cols-2">
                <div><dt className="inline font-bold">Reporter: </dt><dd className="inline break-all">{report.reporterUid}</dd></div>
                <div><dt className="inline font-bold">Reported scholar: </dt><dd className="inline break-all">{report.reportedUid}</dd></div>
                {report.conversationId && <div className="sm:col-span-2"><dt className="inline font-bold">Conversation: </dt><dd className="inline break-all">{report.conversationId}</dd></div>}
              </dl>

              {report.status !== 'resolved' && report.status !== 'dismissed' && (
                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-[#f1e7e4] pt-4">
                  {report.status !== 'reviewing' && <button disabled={Boolean(savingId)} onClick={() => void handleStatus(report.id, 'reviewing')} className="rounded-lg border border-[#d9c8db] px-3 py-2 text-xs font-bold text-[#59465f] disabled:opacity-50">{savingId === report.id ? 'Saving…' : 'Mark reviewing'}</button>}
                  <button disabled={Boolean(savingId)} onClick={() => void handleStatus(report.id, 'dismissed')} className="rounded-lg border border-[#e5d6d3] px-3 py-2 text-xs font-bold text-[#594c54] disabled:opacity-50">Dismiss</button>
                  <button disabled={Boolean(savingId)} onClick={() => void handleStatus(report.id, 'resolved')} className="rounded-lg bg-[#473b4b] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Resolve</button>
                </div>
              )}
              {(report.reviewedAt || report.reviewedBy) && <p className="mt-3 text-[10px] text-[#806f79]">Last updated {formatDate(report.reviewedAt)} by {report.reviewedBy || 'unknown reviewer'}</p>}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};
