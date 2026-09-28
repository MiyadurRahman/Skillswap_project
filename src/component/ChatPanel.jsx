import { useState, useRef, useEffect } from 'react';
import { academicAssets } from '../assets';
import { useDialogBehavior } from '../hooks/useDialogBehavior';

const DEFAULT_AVATAR = academicAssets.avatars.defaultFemaleScholar;

const formatBubbleTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${period}`;
};

export const ChatPanel = ({ conversation, peer, myUid, messages, onSend, onClose, onMarkRead, onReport, onBlock, isBlocked = false }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const sendingRef = useRef(false);
  const messagesEndRef = useRef(null);
  useDialogBehavior(true, onClose);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation read when it opens with new messages.
  const unreadCount = conversation?.unread?.[myUid] || 0;

  useEffect(() => {
    if (conversation?.id && unreadCount > 0) {
      onMarkRead?.(conversation.id, myUid);
    }
  }, [conversation?.id, myUid, onMarkRead, unreadCount]);

  const handleSend = async () => {
    const cleanText = text.trim();
    if (!cleanText || cleanText.length > 4000 || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setSendError('');
    try {
      const sent = await onSend(cleanText);
      if (sent === false) {
        setSendError('Message not sent. Your text is still here so you can retry.');
        return;
      }
      setText('');
    } catch {
      setSendError('Message not sent. Your text is still here so you can retry.');
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-[105] flex justify-end" style={{ pointerEvents: 'none' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Drawer */}
      <div
        className="relative w-full max-w-[380px] bg-white shadow-2xl flex flex-col h-full pointer-events-auto animate-slide-in"
        style={{ pointerEvents: 'auto' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Conversation with ${peer?.name || 'scholar'}`}
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-3.5 bg-[#3e313f] flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Close conversation"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
          <img
            src={peer?.avatarUrl || DEFAULT_AVATAR}
            alt={peer?.name || 'Scholar'}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover border-2 border-[#5e4d66]"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{peer?.name || 'Scholar'}</p>
            <p className="text-[10px] text-white/60">{peer?.title || 'Peer Scholar'}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => onReport?.(peer, conversation?.id)}
              aria-label={`Report ${peer?.name || 'scholar'}`}
              title="Report scholar"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/70 hover:text-white"
            ><span className="material-symbols-outlined text-[18px]">flag</span></button>
            <button
              type="button"
              onClick={() => onBlock?.(peer?.uid)}
              aria-label={`${isBlocked ? 'Unblock' : 'Block'} ${peer?.name || 'scholar'}`}
              title={`${isBlocked ? 'Unblock' : 'Block'} scholar`}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/70 hover:text-white"
            ><span className="material-symbols-outlined text-[18px]">{isBlocked ? 'person_check' : 'block'}</span></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#faf7f9]" aria-live="polite" aria-relevant="additions">
          {messages.length === 0 && (
            <div className="text-center text-xs text-[#b0a3a8] mt-10">
              Send the first message to start the conversation.
            </div>
          )}
          {messages.map((msg) => {
            const mine = msg.fromUid === myUid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[82%] ${mine ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    mine
                      ? 'bg-[#4a3850] text-white rounded-br-md'
                      : 'bg-white border border-[#ede4df] text-[#201a1b] rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-[#b0a3a8] mt-0.5 px-1">
                  {formatBubbleTime(msg.createdAt)}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-3 py-3 bg-white border-t border-[#ede4df] flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (sendError) setSendError('');
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={4000}
              placeholder="Type a message..."
              aria-label={`Message ${peer?.name || 'scholar'}`}
              aria-describedby={sendError ? 'chat-message-hint chat-send-error' : 'chat-message-hint'}
              className="w-full resize-none bg-[#fbf6f5] border border-[#ede4df] rounded-xl px-3.5 py-2.5 text-xs text-[#201a1b] placeholder:text-[#b0a3a8] focus:outline-none focus:border-[#6a4d72] max-h-[80px]"
            />
            <div className="mt-1 flex justify-between gap-2 px-1 text-[10px] text-[#8e7d87]">
              <span id="chat-message-hint">Enter sends; Shift+Enter adds a line</span>
              <span>{text.length}/4000</span>
            </div>
            {sendError && <p id="chat-send-error" role="alert" className="mt-1 px-1 text-[11px] text-red-700">{sendError}</p>}
          </div>
          <button
            onClick={() => void handleSend()}
            disabled={!text.trim() || sending || text.trim().length > 4000}
            aria-label={sending ? 'Sending message' : 'Send message'}
            className="w-9 h-9 rounded-full bg-[#4a3850] hover:bg-[#342636] disabled:bg-[#ddd] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">{sending ? 'progress_activity' : 'send'}</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.25s ease-out; }
      `}</style>
    </div>
  );
};
