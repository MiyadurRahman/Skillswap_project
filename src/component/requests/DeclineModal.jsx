// Decline-incoming-request confirmation modal.
export function DeclineModal({
  request,
  reason,
  onReasonChange,
  customNote,
  onCustomNoteChange,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#eddcd8] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-bold text-base text-[#201a1b]">Decline Session Request</h3>
        <p className="text-xs text-[#705e69]">
          Please select a professional academic reason for declining {request.requester.name}
          's request.
        </p>

        <div className="space-y-2 text-xs">
          {[
            'Schedule conflict during this time slot',
            'Topic outside my primary research specialization',
            'Currently at maximum weekly student capacity',
            'Other reason...',
          ].map((r) => (
            <label
              key={r}
              className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-[#fbf4f2] cursor-pointer border border-[#f0e4e1]"
            >
              <input
                type="radio"
                name="decline-reason"
                checked={reason === r}
                onChange={() => onReasonChange(r)}
              />
              <span>{r}</span>
            </label>
          ))}

          {reason === 'Other reason...' && (
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => onCustomNoteChange(e.target.value)}
              placeholder="Provide a brief explanation for the student..."
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl p-2.5 text-xs text-[#201a1b] mt-2"
            />
          )}
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
            className="px-4 py-2 bg-[#8c3d44] hover:bg-[#722e35] text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Confirm Decline
          </button>
        </div>
      </div>
    </div>
  );
}