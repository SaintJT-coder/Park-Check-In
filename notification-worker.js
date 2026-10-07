const admin = require("firebase-admin");

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://check-in-d31e8-default-rtdb.firebaseio.com"
});

const SITE_URL = "https://saintjt-coder.github.io/Park-Check-In/";
const TTL = 3 * 60 * 60 * 1000;

async function sendToAll(title, body, excludeUid) {
  const snap = await admin.database().ref("fcmTokens").once("value");
  const entries = Object.entries(snap.val() || {})
    .filter(([, v]) => !v || v.uid !== excludeUid);

  const tokens = entries.map(([token]) => token);

  if (!tokens.length) return;

  const response = await admin.messaging().sendEachForMulticast({
    tokens,
    data: {
      title,
      body,
      url: SITE_URL
    }
  });

  const dead = [];

  response.responses.forEach((r, i) => {
    const code = r.error && r.error.code;

    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      dead.push(tokens[i]);
    }
  });

  await Promise.all(
    dead.map(token =>
      admin.database().ref("fcmTokens/" + token).remove()
    )
  );
}

async function main() {
  const snap = await admin.database().ref("checkins").once("value");
  const all = snap.val() || {};

  const now = Date.now();

  for (const [userId, checkin] of Object.entries(all)) {
    if (!checkin || !checkin.park || !checkin.t) continue;

    if (now - checkin.t > TTL) continue;

    const othersHere = Object.entries(all).filter(
      ([id, c]) =>
        id !== userId &&
        c &&
        c.park === checkin.park &&
        c.t &&
        now - c.t < TTL
    ).length;

    const name = checkin.name || "Someone";

    if (othersHere === 0) {
      await sendToAll(
        `🔥 ${checkin.park} is now active`,
        `${name} just checked in. Come hoop!`,
        userId
      );
    } else {
      await sendToAll(
        `🏀 ${name} checked into ${checkin.park}`,
        `${othersHere + 1} players there now.`,
        userId
      );
    }

    break;
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
