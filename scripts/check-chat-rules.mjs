import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { deleteApp, initializeApp } from 'firebase/app';
import {
  collection, connectFirestoreEmulator, doc, getDoc, getDocs,
  getFirestore, increment, setDoc, setLogLevel, terminate, updateDoc,
} from 'firebase/firestore';

// Use the real application services with emulator clients injected in place
// of src/firebase.js. No production Firebase config or credentials are loaded.
const projectId = 'demo-skillswap-chat';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
assert.ok(emulatorHost, 'Run through npm run test:chat to start the Firestore emulator.');
const [host, port] = emulatorHost.split(':');
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const runId = randomUUID().replaceAll('-', '');
const bundlePath = join(root, 'node_modules', '.cache', `chat-rules-${runId}.mjs`);
const clients = [];
setLogLevel('silent');

const result = await build({
  stdin: {
    contents: "export * from './src/services/realtime.js'; export { useClient } from './src/firebase.js';",
    resolveDir: root,
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  write: false,
  plugins: [{
    name: 'emulator-firebase-client',
    setup(builder) {
      builder.onLoad({ filter: /[/\\]src[/\\]firebase\.js$/ }, () => ({
        contents: 'export let db; export let auth; export const useClient = (client) => { db = client.db; auth = { currentUser: { uid: client.uid } }; };',
        loader: 'js',
      }));
    },
  }],
});
await mkdir(dirname(bundlePath), { recursive: true });
await writeFile(bundlePath, result.outputFiles[0].text);
const service = await import(pathToFileURL(bundlePath).href);

const client = (label, provider) => {
  const uid = `${runId}_${label.replaceAll('.', '_')}`;
  const app = initializeApp({ projectId, apiKey: 'emulator-only' }, uid);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, host, Number(port), {
    mockUserToken: {
      sub: uid,
      email: `${label}@example.test`,
      firebase: { sign_in_provider: provider },
    },
  });
  const value = { uid, app, db };
  clients.push(value);
  return value;
};
const denied = (operation) => assert.rejects(operation, { code: 'permission-denied' });
const send = (from, to, conversation, text) => {
  service.useClient(from);
  return service.sendMessage({
    conversationId: conversation.id,
    participantIds: conversation.participantIds,
    fromUid: from.uid,
    toUid: to.uid,
    fromName: 'Scholar',
    text,
  });
};

try {
  for (const provider of ['password', 'google.com']) {
    const sender = client(`${provider}_sender`, provider);
    const peer = client(`${provider}_peer`, provider === 'password' ? 'google.com' : 'password');
    const outsider = client(`${provider}_outsider`, 'password');
    service.useClient(sender);
    if (provider === 'password') {
      await service.upsertUserProfile(sender.uid, { name: 'Scholar' });
    } else {
      await service.ensureUserProfile(sender.uid, { name: 'Scholar' });
    }
    assert.equal((await getDoc(doc(sender.db, 'users', sender.uid))).data().uid, sender.uid);
    const conversation = await service.ensureConversation(sender.uid, peer.uid);
    const convRef = doc(sender.db, 'conversations', conversation.id);
    assert.equal((await getDoc(convRef)).data().unread, undefined);

    // First message must work when the parent has no unread map yet.
    await send(sender, peer, conversation, 'Hello');
    assert.equal((await getDoc(convRef)).data().unread[peer.uid], 1);

    // Repeated sender, name, text, and timestamp are valid message metadata.
    const originalNow = Date.now;
    const sameTime = (await getDoc(convRef)).data().updatedAt;
    Date.now = () => sameTime;
    try {
      await send(sender, peer, conversation, 'Another message');
      await send(sender, peer, conversation, 'Another message');
    } finally {
      Date.now = originalNow;
    }
    assert.equal((await getDoc(convRef)).data().unread[peer.uid], 3);
    await send(peer, sender, conversation, 'Another message');
    const messageRefs = collection(peer.db, 'conversations', conversation.id, 'messages');
    assert.equal((await getDocs(messageRefs)).size, 4);
    console.log(`PASS ${provider}: new account, first send, consecutive/repeated messages, peer reply and history`);

    service.useClient(peer);
    await service.markConversationRead(conversation.id, peer.uid);
    const beforeDenied = (await getDoc(convRef)).data();
    assert.equal(beforeDenied.unread[peer.uid], 0);
    assert.equal(beforeDenied.unread[sender.uid], 1);

    await denied(getDocs(collection(outsider.db, 'conversations', conversation.id, 'messages')));
    await denied(send(outsider, peer, {
      ...conversation, participantIds: [outsider.uid, peer.uid],
    }, 'Unauthorized sender'));
    await denied(updateDoc(convRef, { participantIds: [sender.uid, outsider.uid] }));
    await denied(updateDoc(convRef, { [`unread.${peer.uid}`]: increment(1) }));
    await denied(updateDoc(convRef, { [`unread.${peer.uid}`]: -1 }));
    await denied(updateDoc(convRef, { lastText: 'Forged preview', [`unread.${peer.uid}`]: increment(1) }));
    const oldMessage = (await getDocs(messageRefs)).docs.find((entry) => entry.data().fromUid === sender.uid);
    await denied(updateDoc(convRef, {
      lastText: oldMessage.data().text,
      lastFrom: sender.uid,
      lastFromName: 'Scholar',
      lastMessageId: oldMessage.id,
      updatedAt: Date.now(),
      [`unread.${peer.uid}`]: increment(1),
    }));

    // Both directions of a block must stop the entire message batch.
    await setDoc(doc(peer.db, 'blocks', `${peer.uid}__${sender.uid}`), {
      blockerUid: peer.uid, blockedUid: sender.uid, createdAt: Date.now(),
    });
    await denied(send(sender, peer, conversation, 'Recipient blocked sender'));
    await denied(send(peer, sender, conversation, 'Sender blocked recipient'));
    assert.deepEqual((await getDoc(convRef)).data(), beforeDenied);
    assert.equal((await getDocs(messageRefs)).size, 4);
    console.log(`PASS ${provider}: unread reset, participant privacy, metadata integrity, blocks and atomic rejection`);

    // A read reset also needs to work before a conversation's first message.
    service.useClient(sender);
    const empty = await service.ensureConversation(sender.uid, outsider.uid);
    await service.markConversationRead(empty.id, sender.uid);
    assert.equal((await getDoc(doc(sender.db, 'conversations', empty.id))).data().unread[sender.uid], 0);
    console.log(`PASS ${provider}: unread reset on a new conversation`);
  }
} finally {
  await Promise.all(clients.map(async ({ db, app }) => {
    await terminate(db);
    await deleteApp(app);
  }));
  await rm(bundlePath, { force: true });
}
