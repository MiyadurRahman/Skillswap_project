import { useState } from 'react';
import { useDialogBehavior } from '../hooks/useDialogBehavior';

const REASONS = [
  ['harassment', 'Harassment or bullying'],
  ['spam', 'Spam or unwanted contact'],
  ['impersonation', 'Impersonation or misleading profile'],
  ['unsafe', 'Unsafe or inappropriate behavior'],
  ['other', 'Something else'],
];

export const ReportScholarModal = ({ scholar, onSubmit, onClose }) => {
  const [category, setCategory] = useState('harassment');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  useDialogBehavior(true, onClose);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ category, details: details.trim() });
    } catch (submitError) {
      setError(submitError?.message || 'Could not submit this report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      role="presentation"
    >
      <section
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-scholar-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="report-scholar-title" className="text-lg font-bold text-[#201a1b]">
              Report {scholar?.name || 'scholar'}
            </h2>
            <p className="mt-1 text-xs text-[#705e69]">
              Reports are private. Our moderation team will review the details.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close report dialog" className="text-[#705e69]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="report-category" className="mb-1 block text-xs font-bold text-[#201a1b]">
              What happened?
            </label>
            <select
              id="report-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-[#eddcd8] bg-[#fcf6f5] px-3 py-2.5 text-sm"
            >
              {REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="report-details" className="mb-1 block text-xs font-bold text-[#201a1b]">
              Details <span className="font-normal text-[#887580]">(optional)</span>
            </label>
            <textarea
              id="report-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Share enough context for us to review the report."
              className="w-full resize-y rounded-xl border border-[#eddcd8] bg-[#fcf6f5] px-3 py-2.5 text-sm"
            />
            <p className="mt-1 text-right text-[10px] text-[#887580]">{details.length}/2000</p>
          </div>

          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-[#f4e8e5] pt-4">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-[#705e69]">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-[#473b4b] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
