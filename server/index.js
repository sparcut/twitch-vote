// --- Packages ---
const express = require('express');
const http = require('http');
const tmi = require('tmi.js');
const WebSocket = require('ws');

const vController = require('VoteController'); 

// --- Config ---
const CONFIG = require('../config.json');


// --- Setup ---
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const VoteController = new vController;
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
const ws = {
  handler: {
    onMessage(rawMsg) {
      const msg = JSON.parse(rawMsg);
      
      switch(msg.type) {
        case 'new':
          if(VoteController.new(msg.vote.title, msg.vote.time, msg.vote.questions, msg.vote.options)) {
            console.log(`Vote started - ${msg.vote.title}`);
          } else {
            console.log("Can't create vote when already running.");
          }
          break;
        case 'end':
          VoteController.endCurrent();
          break;
      }
    }
  },
  broadcast(msg, sender) {
    wss.clients.forEach(client => {
      if(client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    })
  }
}


wss.on('connection', client => {

  client.on('message', ws.onMessage); // May need to bind to this
});


// --- VoteController ---
VoteController.on('new', vote => {
  ws.broadcast(JSON.stringify({
    type: 'new',
    data: vote.args
  }));
});

VoteController.on('update', votes => {
  ws.broadcast(JSON.stringify({
    type: 'update',
    votes
  }));
});

VoteController.on('end', vote => {
  ws.broadcast(JSON.stringify({
    type: 'end',
    data: vote.args,
    votes: vote.votes
  }));
});


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
