import {
  DisconnectReason,
  makeWASocket,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

let sock; // Store socket instance

// Initialize WhatsApp connection
export const startWhatsAppBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth/whatsapp"); // Saves session

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log("Disconnected. Reconnecting:", shouldReconnect);
      if (shouldReconnect) startWhatsAppBot();
    } else if (connection === "open") {
      console.log("✅ WhatsApp Connected!");
    }
  });
};

export const sendMessage = async (jid, text) => {
  if (!sock) {
    throw new Error("WhatsApp bot is not connected yet!");
  }
  await sock.sendMessage(jid, { text });
  console.log(`Message sent to ${jid}: ${text}`);
};
