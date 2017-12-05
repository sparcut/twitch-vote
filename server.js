// --- Packages ---
const express = require('express');
const http = require('http');
const tmi = require('tmi.js');
const ws = require('ws');

const VoteManager = require('./VoteManager');

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
const currentVote = new VoteManager('Kappa', 10, [ { text: 'Eat', option: 'A'  }, { text: 'Sleep', option: 'B' } ]);
var voteActive = false;

currentVote.on('ready', () => {
  voteActive = true; 
});

currentVote.on('end', () => {
  voteActive = false;
})

currentVote.init();


TwitchClient.connect();

TwitchClient.on('message', (channel, userstate, message, self) => {
  if(!voteActive) return;
  
  switch(userstate['message-type']) {
    case "action":
      break;
    case "chat":
      currentVote.checkMessage(message, userstate);
      break;
    case "whisper":
      currentVote.checkMessage(message, userstate);
      break;
  }
});



// --- Init ---
server.listen(CONFIG.server.port, () => console.log(`Listening on port: ${CONFIG.server.port}`));
