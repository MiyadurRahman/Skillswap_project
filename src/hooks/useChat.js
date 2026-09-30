import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureConversation,
  getConversationId,
  subscribeBlockedUsers,
  blockScholar,
  unblockScholar,
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
  const [subscribedBlockedUserIds, setSubscribedBlockedUserIds] = useState([]);
  const blockedUserIds = useMemo(
    () => (isRealtime && myUid ? subscribedBlockedUserIds : []),
    [isRealtime, myUid, subscribedBlockedUserIds]
  );

  useEffect(() => {
    if (!isRealtime || !myUid) {
      return undefined;
    }
    return subscribeBlockedUsers(myUid, setSubscribedBlockedUserIds, (error) => {
      console.warn('Blocked scholar list unavailable:', error);
    });
  }, [isRealtime, myUid]);

  // Live messages for the currently open chat (realtime mode only).
  useEffect(() => {
    const convId = activeChat?.conversation?.id;
    if (!isRealtime || !myUid || !convId) return;
    const participantIds = activeChat.conversation.participantIds || [];
    if (!participantIds.includes(myUid)) {
      showToast('This conversation is not available to the current account.', 'warning');
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
            : 'Chat history is temporarily unavailable.',
          'error'
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
    () => realtimeUsers.filter((u) => u.uid && u.uid !== myUid && !blockedUserIds.includes(u.uid)),
    [realtimeUsers, myUid, blockedUserIds]
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
      if (blockedUserIds.includes(peer.uid)) {
        showToast('Unblock this scholar before starting a new conversation.', 'warning');
        return;
      }
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
          showToast('Could not start this conversation. Please try again.', 'error');
        });
    },
    [myUid, openChatSeed, showToast, blockedUserIds]
  );

  const handleBlockScholar = useCallback(async (peerUid) => {
    try {
      await blockScholar(myUid, peerUid);
      showToast('Scholar blocked. New requests and messages are disabled.', 'success');
      if (activeChat?.peer?.uid === peerUid) setActiveChat(null);
    } catch (error) {
      console.warn('Could not block scholar:', error);
      showToast(error?.message || 'Could not block this scholar. Please try again.', 'error');
    }
  }, [myUid, activeChat, showToast]);

  const handleUnblockScholar = useCallback(async (peerUid) => {
    try {
      await unblockScholar(myUid, peerUid);
      showToast('Scholar unblocked.', 'success');
    } catch (error) {
      console.warn('Could not unblock scholar:', error);
      showToast(error?.message || 'Could not unblock this scholar. Please try again.', 'error');
    }
  }, [myUid, showToast]);

  const handleSendChatMessage = useCallback(
    async (text) => {
      const chat = activeChat;
      if (!chat?.conversation?.id) return false;
      const { conversation, peer } = chat;
      const convId = conversation.id;
      const peerUid =
        peer?.uid || conversation.participantIds?.find((id) => id !== myUid);
      if (!peerUid || !myUid) return false;
      if (
        !conversation.participantIds?.includes(myUid) ||
        !conversation.participantIds.includes(peerUid)
      ) {
        showToast('This conversation is not available to the current account.', 'warning');
        return false;
      }

      try {
        await sendMessage({
          conversationId: convId,
          participantIds: conversation.participantIds,
          fromUid: myUid,
          toUid: peerUid,
          fromName: myProfile?.name || 'Scholar',
          text,
        });
        return true;
      } catch (e) {
        console.warn('[chat] send failed:', { convId, fromUid: myUid, toUid: peerUid }, e);
        showToast(e?.message || 'Could not send message. Please try again.', 'error');
        return false;
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
    blockedUserIds,
    chatPeers,
    conversationsWithPeers,
    handleOpenChat,
    handleNewChat,
    handleSendChatMessage,
    handleMarkChatRead,
    handleCloseChat,
    handleBlockScholar,
    handleUnblockScholar,
  };
}
