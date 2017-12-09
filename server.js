// --- Packages ---
const express = require('express');
const http = require('http');
const tmi = require('tmi.js');
const ws = require('ws');


// --- Config ---
const CONFIG = require('./config.json');

// --- Setup ---
const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server });
const TwitchClient = new tmi.client({
  identity: {
    username: CONFIG.twitch.username,
    password: CONFIG.twitch.password,
  },
  channels: CONFIG.twitch.channels
});

// --- Express ---
app.use('/', express.static('public'));

// --- WebSocket ---


// --- Twitch ---
TwitchClient.on('message', (channel, userstate, message, self) => {
  
  switch(userstate['message-type']) {
    case "action":
    break;
    case "chat":
    break;
    case "whisper":
    break;
  }
});

// TwitchClient.connect();


// --- Init ---
server.listen(CONFIG.server.port, () => console.log(`Listening on port: ${CONFIG.server.port}`));
