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

export const ChatPanel = ({ conversation, peer, myUid, messages, onSend, onClose, onMarkRead }) => {
  const [text, setText] = useState('');
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

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
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
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#faf7f9]">
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
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message..."
            aria-label={`Message ${peer?.name || 'scholar'}`}
            className="flex-1 resize-none bg-[#fbf6f5] border border-[#ede4df] rounded-xl px-3.5 py-2.5 text-xs text-[#201a1b] placeholder:text-[#b0a3a8] focus:outline-none focus:border-[#6a4d72] max-h-[80px]"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            aria-label="Send message"
            className="w-9 h-9 rounded-full bg-[#4a3850] hover:bg-[#342636] disabled:bg-[#ddd] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
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
