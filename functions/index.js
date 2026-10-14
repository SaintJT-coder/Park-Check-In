// Firebase Cloud Functions (v2). Requires the Blaze plan.
// Setup: `firebase init functions` (JavaScript) in your project folder,
// replace functions/index.js with this file, then `firebase deploy --only functions`.

const { onValueWritten } = require("firebase-functions/v2/database");
const admin = require("firebase-admin");
admin.initializeApp();

const SITE_URL = "https://saintjt-coder.github.io/Park-Check-In/"; // <- change
const TTL = 3 * 3600 * 1000; // same 3-hour expiry as the app

async function sendToAll(title, body, excludeUid) {
  const snap = await admin.database().ref("fcmTokens").once("value");
  const entries = Object.entries(snap.val() || {}).filter(([, v]) => !v || v.uid !== excludeUid);
  const tokens = entries.map(([t]) => t);
  if (!tokens.length) return;

  const res = await admin.messaging().sendEachForMulticast({
    tokens,
    data: { title, body, url: SITE_URL } // data-only; the service worker shows it
  });

  const dead = [];
  res.responses.forEach((r, i) => {
    const code = r.error && r.error.code;
    if (code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token") dead.push(tokens[i]);
  });
  await Promise.all(dead.map((t) => admin.database().ref("fcmTokens/" + t).remove()));
}

// Fires when someone checks in (or moves to a different court).
// Data shape from the app: /checkins/{userId} = { park, name, t }
exports.onCheckIn = onValueWritten("/checkins/{userId}", async (event) => {
  const before = event.data.before.val();
  const after = event.data.after.val();
  if (!after) return; // check-out, nothing to send
  if (before && before.park === after.park) return; // not a new check-in

  const all = (await admin.database().ref("checkins").once("value")).val() || {};
  const now = Date.now();
  const othersHere = Object.entries(all).filter(([id, c]) =>
    id !== event.params.userId && c && c.park === after.park && now - c.t < TTL
  ).length;

  const name = after.name || "Someone";
  if (othersHere === 0) {
    await sendToAll(`🔥 ${after.park} is now active`, `${name} just checked in. Come hoop!`, event.params.userId);
  } else {
    await sendToAll(`🏀 ${name} checked into ${after.park}`, `${othersHere + 1} players there now.`, event.params.userId);
  }
});
