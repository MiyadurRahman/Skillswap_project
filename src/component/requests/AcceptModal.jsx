// Accept-incoming-request confirmation modal.
export function AcceptModal({
  request,
  note,
  onNoteChange,
  platform,
  onPlatformChange,
  meetingLink,
  onMeetingLinkChange,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#eddcd8] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-[#f4e8e5] pb-4">
          <div className="flex items-center gap-3">
            <img
              src={request.requester.avatarUrl}
              alt={request.requester.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border-2 border-[#ebd8d4]"
            />
            <div>
              <h3 className="font-bold text-base text-[#201a1b]">
                Confirm Session with {request.requester.name}
              </h3>
              <p className="text-xs text-[#705e69]">
                {request.requestedSkill} • {request.formattedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[#8c7b86] hover:text-[#201a1b] p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-[#fcf7f6] p-3.5 rounded-xl border border-[#ebdcd8] space-y-1">
            <div className="font-bold text-[#201a1b]">Compensation Summary:</div>
            <div className="text-emerald-800 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                account_balance_wallet
              </span>
              <span>
                +{request.creditsOffered} Academic Credits credited upon session completion
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#201a1b] mb-1.5">
              Pre-Session Welcome Note / Preparation Instructions:
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl p-3 text-xs text-[#201a1b] focus:outline-none focus:border-[#524156]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#201a1b] mb-1.5">Video Platform:</label>
            <select
              value={platform}
              onChange={(e) => {
                onPlatformChange(e.target.value);
                onMeetingLinkChange(
                  e.target.value === 'Zoom Meeting Room'
                    ? 'https://zoom.us/j/new'
                    : 'https://meet.google.com/new'
                );
              }}
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3 py-2 text-xs text-[#201a1b]"
            >
              <option value="SkillSwap Connect">
                SkillSwap Connect (Integrated Audio/Video)
              </option>
              <option value="Zoom Meeting Room">University Zoom Room</option>
              <option value="Google Meet">Google Meet</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#201a1b] mb-1.5">
              Meeting Link (shared with the student):
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => onMeetingLinkChange(e.target.value)}
              placeholder="https://meet.google.com/new"
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3 py-2 text-xs text-[#201a1b] focus:outline-none focus:border-[#524156]"
            />
            <p className="text-[11px] text-[#705e69] mt-1">
              Paste your Google Meet, Zoom, or other video link. The student opens this when the
              session starts.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#f4e8e5]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-[#705e69]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 bg-[#473b4b] hover:bg-[#342738] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              id="btn-confirm-accept-request"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Confirm & Add to Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}