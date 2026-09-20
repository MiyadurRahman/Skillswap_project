import { toDateInput } from '../../utils/dateUtils';
import { useDialogBehavior } from '../../hooks/useDialogBehavior';

// Propose-an-alternate-time modal for incoming requests.
export function RescheduleModal({
  request,
  date,
  onDateChange,
  slot,
  onSlotChange,
  note,
  onNoteChange,
  onCancel,
  onConfirm,
}) {
  useDialogBehavior(true, onCancel);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={(event) => event.target === event.currentTarget && onCancel()} role="presentation">
      <div className="bg-white border border-[#eddcd8] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150" role="dialog" aria-modal="true" aria-labelledby="reschedule-request-title">
        <h3 id="reschedule-request-title" className="font-bold text-base text-[#201a1b]">
          Propose Alternate Time to {request.requester.name}
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[#201a1b] mb-1">
              Proposed Alternate Date:
            </label>
            <input
              type="date"
              value={date}
              min={toDateInput(1)}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-[#201a1b] mb-1">
              Proposed Alternate Time Slot:
            </label>
            <select
              value={slot}
              onChange={(e) => onSlotChange(e.target.value)}
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3 py-2 text-xs"
            >
              <option value="Morning (09:00 - 11:00)">Morning (09:00 - 11:00)</option>
              <option value="Afternoon (14:00 - 15:30)">Afternoon (14:00 - 15:30)</option>
              <option value="Evening (17:00 - 18:30)">Evening (17:00 - 18:30)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#201a1b] mb-1">Note to Scholar:</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl p-2.5 text-xs text-[#201a1b]"
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#f4e8e5]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-[#705e69]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#473b4b] text-white font-bold text-xs rounded-xl"
          >
            Send Proposal
          </button>
        </div>
      </div>
    </div>
  );
}
