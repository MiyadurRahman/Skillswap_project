const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const uid = process.argv[2];
const enabled = process.argv[3] !== 'false';

if (!uid) {
  console.error('Usage: npm run set-admin -- <firebase-uid> [true|false]');
  process.exitCode = 1;
} else {
  initializeApp();
  getAuth()
    .getUser(uid)
    .then((user) =>
      getAuth().setCustomUserClaims(uid, {
        ...(user.customClaims || {}),
        admin: enabled,
      })
    )
    .then(() => {
      console.log(`Admin claim ${enabled ? 'enabled' : 'disabled'} for ${uid}.`);
      console.log('The user must sign out and back in to refresh their token.');
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
