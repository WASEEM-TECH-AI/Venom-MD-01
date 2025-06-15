js
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let latestPairingCode = null;

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '20.0'],
  });

  sock.ev.on('connection.update', async (update) => {
    if (update.pairingCode) {
      latestPairingCode = update.pairingCode;
      console.log('🔑 Pairing Code:', latestPairingCode);
    }

    if (update.connection === 'open') {
      console.log('✅ WhatsApp Connected!');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

start();

app.get('/getcode', (req, res) => {
  res.send({ code: latestPairingCode || 'Generating...' });
});

app.listen(port, () => console.log(`🌐 Server running on port ${port}`));
