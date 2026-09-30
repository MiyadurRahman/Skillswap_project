import React, { useState } from 'react';
import { useDialogBehavior } from '../hooks/useDialogBehavior';
import { useAuth } from '../context/auth';
import { adjustUserCredits } from '../services/realtime';

const signedAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

export const Modals = ({
  activeModal,
  onClose,
  selectedMentor,
  onShowToast,
  onProposeSwap,
  onDirectMessage,
  userProfile,
  creditTransactions = [],
}) => {
  const { isAdmin } = useAuth();
  const [filterType, setFilterType] = useState('all');
  const [adjustment, setAdjustment] = useState({ targetUid: '', amount: '', reason: '' });
  const [adjusting, setAdjusting] = useState(false);
  useDialogBehavior(Boolean(activeModal), onClose);

  if (!activeModal) return null;

  const transactions = creditTransactions;
  const visibleTransactions = transactions.filter(
    (entry) => filterType === 'all' || entry.type === filterType
  );
  const earned = transactions
    .filter((entry) => entry.type === 'earned')
    .reduce((total, entry) => total + signedAmount(entry.amount), 0);
  const spent = transactions
    .filter((entry) => entry.type === 'spent')
    .reduce((total, entry) => total + Math.abs(signedAmount(entry.amount)), 0);
  const balance = Number(userProfile?.timeCredits || 0);

  const submitAdjustment = async (event) => {
    event.preventDefault();
    if (adjusting) return;
    setAdjusting(true);
    try {
      const result = await adjustUserCredits(adjustment);
      onShowToast?.(`Balance adjusted to ${Number(result.balanceAfter).toFixed(1)} credits.`);
      setAdjustment({ targetUid: '', amount: '', reason: '' });
    } catch (error) {
      onShowToast?.(error?.message || 'Credit adjustment failed.');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={activeModal === 'wallet' ? 'Academic credit ledger' : 'Scholar profile'}
    >
      {activeModal === 'wallet' && (
        <section className="relative w-full max-w-2xl rounded-3xl border border-[#d9cdd5] bg-white p-6 text-[#201a1b] shadow-2xl sm:p-8">
          <button
            onClick={onClose}
            aria-label="Close credit ledger"
            className="absolute right-5 top-5 rounded-full p-2 text-[#7b757d] hover:bg-[#f7ebeb]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eadff0] text-[#57445f]">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Academic Credit Ledger</h3>
              <p className="text-xs text-[#705e69]">Live balance and immutable transaction history</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ['Balance', balance, 'account_balance'],
              ['Earned', earned, 'arrow_downward'],
              ['Spent', spent, 'arrow_upward'],
            ].map(([label, value, icon]) => (
              <div key={label} className="rounded-2xl border border-[#e5d9df] bg-[#fcf8fa] p-4">
                <span className="material-symbols-outlined text-lg text-[#675975]">{icon}</span>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#7b6d78]">{label}</p>
                <p className="text-xl font-bold">{Number(value).toFixed(1)}</p>
              </div>
            ))}
          </div>

          <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a454c]">Transactions</h4>
            <div className="flex rounded-xl bg-[#f7ebeb] p-1">
              {['all', 'earned', 'spent', 'adjustment'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium capitalize ${
                    filterType === type ? 'bg-white text-[#473b4b] shadow-sm' : 'text-[#7b6d78]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
            {visibleTransactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d8ccd2] bg-[#fcf8f8] p-6 text-center">
                <span className="material-symbols-outlined text-2xl text-[#786571]">receipt_long</span>
                <p className="mt-1 text-xs font-semibold">No wallet transactions yet</p>
              </div>
            ) : (
              visibleTransactions.map((entry) => {
                const amount = signedAmount(entry.amount);
                return (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl border border-[#e5d9df] p-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{entry.title || 'Credit transaction'}</p>
                      <p className="mt-0.5 truncate text-[11px] text-[#7b757d]">
                        {entry.reason || entry.partner || 'SkillSwap ledger'} · {entry.date || 'Recently'}
                      </p>
                    </div>
                    <span className={`ml-3 text-sm font-bold ${amount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {amount > 0 ? '+' : ''}{amount.toFixed(1)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {isAdmin && (
            <form onSubmit={submitAdjustment} className="mt-5 space-y-3 rounded-2xl border border-[#d9c9df] bg-[#faf5fc] p-4">
              <div>
                <h4 className="text-xs font-bold">Administrator credit adjustment</h4>
                <p className="text-[11px] text-[#7b6d78]">Every correction creates an immutable audit entry.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px]">
                <input
                  value={adjustment.targetUid}
                  onChange={(event) => setAdjustment((state) => ({ ...state, targetUid: event.target.value.trim() }))}
                  placeholder="Target Firebase UID"
                  required
                  className="rounded-xl border border-[#d9c9df] bg-white px-3 py-2 text-xs outline-none focus:border-[#675975]"
                />
                <input
                  type="number"
                  step="0.1"
                  value={adjustment.amount}
                  onChange={(event) => setAdjustment((state) => ({ ...state, amount: event.target.value }))}
                  placeholder="+ / - amount"
                  required
                  className="rounded-xl border border-[#d9c9df] bg-white px-3 py-2 text-xs outline-none focus:border-[#675975]"
                />
              </div>
              <div className="flex gap-2">
                <input
                  value={adjustment.reason}
                  onChange={(event) => setAdjustment((state) => ({ ...state, reason: event.target.value }))}
                  placeholder="Reason for adjustment"
                  minLength={5}
                  required
                  className="min-w-0 flex-1 rounded-xl border border-[#d9c9df] bg-white px-3 py-2 text-xs outline-none focus:border-[#675975]"
                />
                <button disabled={adjusting} className="rounded-xl bg-[#675975] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
                  {adjusting ? 'Saving…' : 'Apply'}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {activeModal === 'mentor' && selectedMentor && (
        <section className="relative w-full max-w-lg rounded-3xl border border-[#d9cdd5] bg-white p-6 text-[#201a1b] shadow-2xl sm:p-8">
          <button onClick={onClose} aria-label="Close scholar details" className="absolute right-5 top-5 rounded-full p-2 text-[#7b757d] hover:bg-[#f7ebeb]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="flex items-center gap-4 pr-8">
            <img src={selectedMentor.avatarUrl} alt={selectedMentor.name} className="h-16 w-16 rounded-full border-2 border-[#eadff0] object-cover" />
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold">{selectedMentor.name}</h3>
              <p className="truncate text-xs text-[#675975]">{selectedMentor.title || selectedMentor.field || 'Peer Scholar'}</p>
              <p className="truncate text-[11px] text-[#7b757d]">{selectedMentor.university || selectedMentor.institution || 'Institution not provided'}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {(selectedMentor.skillsTeach || selectedMentor.badges || []).map((badge) => (
              <span key={badge} className="rounded-full bg-[#eeddf2] px-3 py-1 text-xs font-medium text-[#5c4c62]">{badge}</span>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => onProposeSwap?.(selectedMentor)} className="rounded-full bg-[#675975] py-3 text-xs font-bold text-white hover:bg-[#52445f]">
              Propose Swap
            </button>
            <button onClick={() => onDirectMessage?.(selectedMentor)} className="rounded-full border border-[#d4c8d0] py-3 text-xs font-bold hover:bg-[#f7f1f5]">
              Direct Message
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
