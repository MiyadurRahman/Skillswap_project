import { useDialogBehavior } from '../../hooks/useDialogBehavior';

// "Request Session from Discover" modal.
export function RequestPeerModal({
  peer,
  topic,
  onTopicChange,
  slot,
  onSlotChange,
  offeredSkill,
  onOfferedSkillChange,
  note,
  onNoteChange,
  onSubmit,
  onViewProfile,
  onClose,
}) {
  useDialogBehavior(true, onClose);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
      role="presentation"
    >
      <div className="bg-white border border-[#eddcd8] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150" role="dialog" aria-modal="true" aria-labelledby="request-peer-title">
        {/* Modal Header with Peer Preview */}
        <div className="flex items-start justify-between border-b border-[#f4e8e5] pb-4">
          <div className="flex items-center gap-3.5">
            <img
              src={peer.avatarUrl}
              alt={peer.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border-2 border-[#ebd8d4]"
            />
            <div>
              <h3 id="request-peer-title" className="font-bold text-base text-[#201a1b]">
                Request Session with {peer.name}
              </h3>
              <p className="text-xs text-[#705e69]">
                {peer.title} • ★ {peer.rating}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close request dialog"
            className="text-[#8c7b86] hover:text-[#201a1b] p-1 rounded-lg hover:bg-[#fbf4f2]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Request Form */}
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Topic Select */}
          <div>
            <label className="block font-bold text-[#201a1b] mb-1.5">
              Academic Focus / Topic:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              placeholder="e.g. Structural Equation Modeling (SEM) in R"
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3.5 py-2.5 text-[#201a1b] focus:outline-none focus:border-[#57445f]"
              required
            />
          </div>

          {/* Proposed Slot */}
          <div>
            <label className="block font-bold text-[#201a1b] mb-1.5">
              Preferred Time Slot:
            </label>
            <input
              type="text"
              value={slot}
              onChange={(e) => onSlotChange(e.target.value)}
              placeholder="e.g. Next Wednesday (02:30 PM)"
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3.5 py-2.5 text-[#201a1b] focus:outline-none focus:border-[#57445f]"
              required
            />
            <p className="text-[11px] text-[#705e69] mt-1">
              Peer availability: {peer.nextAvailable || 'Flexible schedule'}
            </p>
          </div>

          {/* What You Offer */}
          <div>
            <label className="block font-bold text-[#201a1b] mb-1.5">
              Knowledge You Offer in Exchange:
            </label>
            <input
              type="text"
              value={offeredSkill}
              onChange={(e) => onOfferedSkillChange(e.target.value)}
              placeholder="e.g. Python Data Science / LaTeX Typesetting"
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3.5 py-2.5 text-[#201a1b] focus:outline-none focus:border-[#57445f]"
            />
          </div>

          {/* Pre-Session Notes */}
          <div>
            <label className="block font-bold text-[#201a1b] mb-1.5">
              Pre-Session Note or Agenda (Optional):
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Add specific dataset links, hypothesis questions, or syllabus references..."
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl p-3 text-xs text-[#201a1b] focus:outline-none focus:border-[#57445f]"
            />
          </div>

          {/* Modal Buttons */}
          <div className="pt-3 flex items-center justify-between border-t border-[#f4e8e5]">
            <button type="button" onClick={onViewProfile} className="text-xs font-semibold text-[#57445f] hover:underline">
              View Full Scholar Profile ›
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#705e69] hover:text-[#201a1b]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#473b4b] hover:bg-[#342738] text-white font-bold text-xs rounded-xl shadow-xs active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
                id="btn-confirm-discover-request"
              >
                <span className="material-symbols-outlined text-[16px]">event_available</span>
                <span>Confirm & View Details</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
