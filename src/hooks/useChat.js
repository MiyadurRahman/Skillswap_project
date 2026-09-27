import { useCallback, useEffect, useMemo, useState } from 'react';
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
  setChatMessages,
  showToast,
}) {
  const [activeChat, setActiveChat] = useState(null);

  // Live messages for the currently open chat (realtime mode only).
  useEffect(() => {
    const convId = activeChat?.conversation?.id;
    if (!isRealtime || !myUid || !convId) return;
    const participantIds = activeChat.conversation.participantIds || [];
    if (!participantIds.includes(myUid)) {
      showToast('This conversation is not available to the current account.');
      return undefined;
    }

    const unsubscribe = subscribeConversationMessages(
      convId,
      (msgs) => {
        setChatMessages((prev) => ({ ...prev, [convId]: msgs }));
      },
      (error) => {
        const permissionDenied = String(error?.code || '').includes('permission-denied');
        showToast(
          permissionDenied
            ? 'Chat access needs the latest Firestore rules. Deploy the project rules and reopen this conversation.'
            : 'Chat history is temporarily unavailable.'
        );
      }
    );
    return () => unsubscribe();
  }, [isRealtime, myUid, activeChat, setChatMessages, showToast]);

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

  const chatPeers = useMemo(
    () => realtimeUsers.filter((u) => u.uid && u.uid !== myUid),
    [realtimeUsers, myUid]
  );

  const openChatSeed = useCallback(
    (convo, peer) => {
      setActiveChat({ conversation: convo, peer });
    },
    []
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
      if (!peer?.uid || !myUid) return;
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
      ensureConversation(myUid, peer.uid)
        .then((persistedConversation) => {
          openChatSeed(
            { ...convo, ...persistedConversation, peer: convo.peer },
            convo.peer
          );
        })
        .catch((error) => {
          console.warn('Could not create conversation:', error);
          showToast('Could not start this conversation. Please try again.');
        });
    },
    [myUid, openChatSeed, showToast]
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

      try {
        await sendMessage({
          conversationId: convId,
          participantIds: conversation.participantIds,
          fromUid: myUid,
          toUid: peerUid,
          fromName: myProfile?.name || 'Scholar',
          text,
        });
      } catch (e) {
        console.warn('[chat] send failed:', { convId, fromUid: myUid, toUid: peerUid }, e);
        showToast('Could not send message. Please try again.');
      }
    },
    [
      activeChat,
      myUid,
      myProfile,
      showToast,
    ]
  );

  const handleMarkChatRead = useCallback(
    (convId, uid) => {
      markConversationRead(convId, uid).catch((e) =>
        console.warn('Mark conversation read failed:', e)
      );
    },
    []
  );

  const handleCloseChat = useCallback(() => {
    setActiveChat(null);
  }, []);

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
