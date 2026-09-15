import { useCallback, useEffect, useMemo, useState } from 'react';
import { demoChatPeers, initialMessages } from '../data/chatData';
import {
  ensureConversation,
  getConversationId,
  markConversationRead,
  sendMessage,
  subscribeConversationMessages,
} from '../services/realtime';

// Chat state + handlers: conversations and the globally shared chat drawer.
// `conversations` / `chatMessages` are owned by the caller so Firestore
// subscriptions can write into them too.
export function useChat({
  isRealtime,
  myUid,
  myProfile,
  realtimeUsers,
  conversations,
  setConversations,
  chatMessages,
  setChatMessages,
  showToast,
}) {
  const [activeChat, setActiveChat] = useState(null);

  // Live messages for the currently open chat (realtime mode only).
  useEffect(() => {
    const convId = activeChat?.conversation?.id;
    if (!isRealtime || !myUid || !convId) return;

    const unsubscribe = subscribeConversationMessages(convId, (msgs) => {
      console.info(
        '[chat] subscription',
        convId,
        `${msgs.length} msgs`,
        msgs.map((m) => `${(m.fromUid || '?').slice(0, 6)}`).join(', ')
      );
      setChatMessages((prev) => ({ ...prev, [convId]: msgs }));
    });
    return () => unsubscribe();
  }, [isRealtime, myUid, activeChat?.conversation?.id, setChatMessages]);

  // Enrich conversations with the peer's live profile (avatar/name/title).
  const conversationsWithPeers = useMemo(() => {
    const userMap = {};
    realtimeUsers.forEach((u) => {
      userMap[u.uid || u.id] = u;
    });
    return conversations.map((c) => {
      const peerUid = c.participantIds?.find((id) => id !== myUid);
      const u = userMap[peerUid];
      if (u) {
        return {
          ...c,
          peer: {
            uid: peerUid,
            name: u.name,
            title: u.title,
            avatarUrl: u.avatarUrl,
          },
        };
      }
      return c;
    });
  }, [conversations, realtimeUsers, myUid]);

  // Peers selectable for a new chat.
  const chatPeers = useMemo(() => {
    return isRealtime
      ? realtimeUsers.filter((u) => u.uid && u.uid !== myUid)
      : demoChatPeers;
  }, [isRealtime, realtimeUsers, myUid]);

  const openChatSeed = useCallback(
    (convo, peer) => {
      setActiveChat({ conversation: convo, peer });
      if (!isRealtime) {
        setChatMessages((prev) => {
          const convId = convo.id;
          const seeded =
            (() => {
              try {
                return JSON.parse(
                  localStorage.getItem('skillswap_chat_messages') || '{}'
                )[convId];
              } catch (e) {
                return undefined;
              }
            })() || initialMessages[convId] || [];
          return { ...prev, [convId]: prev[convId] || seeded };
        });
      }
    },
    [isRealtime, setChatMessages]
  );

  const handleOpenChat = useCallback(
    ({ conversation, peer }) => {
      openChatSeed(conversation, peer);
      if (isRealtime && (conversation.unread?.[myUid] || 0) > 0) {
        markConversationRead(conversation.id, myUid).catch((e) =>
          console.warn('Mark conversation read failed:', e)
        );
      }
    },
    [isRealtime, myUid, openChatSeed]
  );

  const handleNewChat = useCallback(
    (peer) => {
      if (!peer?.uid) return;
      const convId = getConversationId(myUid, peer.uid);
      const convo = {
        id: convId,
        participantIds: [myUid, peer.uid],
        peer: {
          uid: peer.uid,
          name: peer.name || 'Scholar',
          title: peer.title || 'Peer Scholar',
          avatarUrl: peer.avatarUrl,
        },
        unread: { [myUid]: 0, [peer.uid]: 0 },
        updatedAt: Date.now(),
      };
      openChatSeed(convo, convo.peer);
      if (isRealtime) {
        ensureConversation(myUid, peer.uid).catch((e) =>
          console.warn('Could not create conversation:', e)
        );
      }
    },
    [isRealtime, myUid, openChatSeed]
  );

  const handleSendChatMessage = useCallback(
    async (text) => {
      const chat = activeChat;
      if (!chat?.conversation?.id) return;
      const { conversation, peer } = chat;
      const convId = conversation.id;
      const peerUid =
        peer?.uid || conversation.participantIds?.find((id) => id !== myUid);
      if (!peerUid || !myUid) return;

      if (isRealtime) {
        try {
          await sendMessage({
            conversationId: convId,
            fromUid: myUid,
            toUid: peerUid,
            fromName: myProfile?.name || 'Scholar',
            text,
          });
          console.info('[chat] sent ->', {
            convId,
            fromUid: myUid,
            toUid: peerUid,
            text,
          });
        } catch (e) {
          console.warn(
            '[chat] send failed:',
            { convId, fromUid: myUid, toUid: peerUid },
            e
          );
          showToast('Could not send message. Please try again.');
        }
        return;
      }

      const msg = {
        id: `msg-${Date.now()}`,
        conversationId: convId,
        participantIds: [myUid, peerUid],
        fromUid: myUid,
        toUid: peerUid,
        text,
        createdAt: Date.now(),
        read: false,
      };
      setChatMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), msg],
      }));
      const updatedConv = {
        ...conversation,
        lastText: text,
        lastFrom: myUid,
        lastFromName: myProfile?.name || 'You',
        updatedAt: msg.createdAt,
        unread: {
          ...(conversation.unread || {}),
          [peerUid]: (conversation.unread?.[peerUid] || 0) + 1,
        },
      };
      setConversations((prev) => [
        updatedConv,
        ...prev.filter((c) => c.id !== convId),
      ]);
    },
    [
      activeChat,
      isRealtime,
      myUid,
      myProfile,
      showToast,
      setChatMessages,
      setConversations,
    ]
  );

  const handleMarkChatRead = useCallback(
    (convId, uid) => {
      if (isRealtime) {
        markConversationRead(convId, uid).catch((e) =>
          console.warn('Mark conversation read failed:', e)
        );
        return;
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, unread: { ...(c.unread || {}), [uid]: 0 } } : c
        )
      );
    },
    [isRealtime, setConversations]
  );

  const handleCloseChat = useCallback(() => {
    setActiveChat(null);
    setChatMessages({});
  }, [setChatMessages]);

  return {
    activeChat,
    chatPeers,
    conversationsWithPeers,
    handleOpenChat,
    handleNewChat,
    handleSendChatMessage,
    handleMarkChatRead,
    handleCloseChat,
  };
}