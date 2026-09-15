import { useState, useRef, useEffect } from 'react';
import { formatTimeAgo } from '../services/realtime';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

export const NotificationBell = ({
  conversations,
  myUid,
  peers,
  onOpenChat,
  onNewChat,
}) => {
  const [open, setOpen] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [search, setSearch] = useState('');
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  // Close dropdown when clicking outside.
  useEffect(() => {
    const handle = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
        setShowNewChat(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const totalUnread = Object.values(
    conversations.reduce((acc, c) => {
      if (c.participantIds.includes(myUid)) acc[c.id] = (c.unread?.[myUid] || 0);
      return acc;
    }, {})
  ).reduce((sum, v) => sum + v, 0);

  const filteredPeers = peers.filter((p) => {
    if (!p || !p.uid || p.uid === myUid) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (p.name || '').toLowerCase().includes(q) || (p.title || '').toLowerCase().includes(q);
  });

  const handleOpenConvo = (convo) => {
    const peerId = convo.participantIds.find((id) => id !== myUid);
    const peerData = convo.peer || {
      name: convo.lastFromName || 'Scholar',
      title: 'Peer Scholar',
      avatarUrl: DEFAULT_AVATAR,
      uid: peerId,
    };
    onOpenChat({ conversation: convo, peer: { ...peerData, uid: peerId } });
    setOpen(false);
    setShowNewChat(false);
  };

  const handleStartNewChat = (peer) => {
    onNewChat(peer);
    setOpen(false);
    setShowNewChat(false);
    setSearch('');
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={() => {
          setOpen((v) => !v);
          setShowNewChat(false);
          setSearch('');
        }}
        className="relative w-9 h-9 rounded-full bg-[#473649] hover:bg-[#342636] text-white flex items-center justify-center transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[#d85a4e] text-white text-[10px] font-extrabold rounded-full px-1">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] max-h-[440px] bg-white border border-[#e8dfe4] rounded-2xl shadow-2xl z-[110] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-[#f4e8e5] flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-[#201a1b]">
              {showNewChat ? 'New Message' : 'Notifications'}
            </h3>
            {!showNewChat && (
              <button
                onClick={() => setShowNewChat(true)}
                className="text-xs font-semibold text-[#6a4d72] hover:text-[#4a2f55] flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>New Message</span>
              </button>
            )}
            {showNewChat && (
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setSearch('');
                }}
                className="text-xs font-semibold text-[#6a4d72] hover:text-[#4a2f55] cursor-pointer"
              >
                Back
              </button>
            )}
          </div>

          {/* New-message recipient picker */}
          {showNewChat && (
            <div className="shrink-0 border-b border-[#f4e8e5]">
              <div className="px-4 py-2.5">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-[#9a8992]">
                    search
                  </span>
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search scholars by name..."
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#fbf6f5] border border-[#ede4df] rounded-xl focus:outline-none focus:border-[#6a4d72]"
                  />
                </div>
              </div>
              <div className="max-h-[220px] overflow-y-auto">
                {filteredPeers.length === 0 && (
                  <div className="px-4 py-4 text-xs text-[#9a8992] text-center">
                    No scholars found
                  </div>
                )}
                {filteredPeers.map((peer) => (
                  <button
                    key={peer.uid}
                    onClick={() => handleStartNewChat(peer)}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#fbf6f5] transition-colors cursor-pointer text-left"
                  >
                    <img
                      src={peer.avatarUrl || DEFAULT_AVATAR}
                      alt={peer.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#ede4df]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#201a1b] truncate">{peer.name}</p>
                      <p className="text-[10px] text-[#8e7d87] truncate">{peer.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation list */}
          {!showNewChat && (
            <div className="overflow-y-auto flex-1">
              {conversations.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-[#9a8992]">
                  No conversations yet. Start one!
                </div>
              )}
              {conversations.map((convo) => {
                const peerId = convo.participantIds.find((id) => id !== myUid);
                const isUnread = (convo.unread?.[myUid] || 0) > 0;
                return (
                  <button
                    key={convo.id}
                    onClick={() => handleOpenConvo(convo)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#fbf6f5] transition-colors cursor-pointer text-left"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={convo.peer?.avatarUrl || DEFAULT_AVATAR}
                        alt={convo.peer?.name || 'Scholar'}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-[#ede4df]"
                      />
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#d85a4e] border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${isUnread ? 'font-bold text-[#201a1b]' : 'font-semibold text-[#705e69]'}`}>
                          {convo.peer?.name || convo.lastFromName || 'Scholar'}
                        </p>
                        <span className="text-[10px] text-[#b0a3a8] shrink-0">
                          {formatTimeAgo(convo.updatedAt)}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isUnread ? 'font-semibold text-[#201a1b]' : 'text-[#9a8992]'}`}>
                        {convo.lastFrom === myUid && 'You: '}
                        {convo.lastText || 'No messages yet'}
                      </p>
                    </div>
                    {isUnread && (
                      <span className="w-5 h-5 flex items-center justify-center bg-[#d85a4e] text-white text-[9px] font-extrabold rounded-full shrink-0">
                        {convo.unread?.[myUid] || 0}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};