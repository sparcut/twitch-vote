// --- Packages ---
const express = require('express');
const http = require('http');
const tmi = require('tmi.js');
const WebSocket = require('ws');

const voteController = require('./VoteController'); 

// --- Config ---
const CONFIG = require('../config.json');


// --- Setup ---
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const VoteController = new voteController;
const TwitchClient = new tmi.client({
  identity: {
    username: CONFIG.twitch.username,
    password: CONFIG.twitch.password,
  },
  channels: CONFIG.twitch.channels
});


// --- Express ---
app.use('/', express.static('build'));


// --- WebSocket ---
const ws = {
  handler: {
    onMessage(rawMsg) {
      // Blind hope that message is JSON (as it should), only other way to deal with this is try/catch DansGame
      const msg = JSON.parse(rawMsg); 
      
      switch(msg.type) {
        case 'new':
          if(VoteController.new(msg.data.title, msg.data.time, msg.data.questions, msg.data.options || null)) {
            console.log(`Vote started - ${msg.data.title}`);
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
        client.send(msg);
      }
    })
  }
}

wss.on('connection', client => {
  client.on('message', ws.handler.onMessage); // May need to bind to this
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
    data: votes
  }));
});

VoteController.on('end', voteInstance => {
  ws.broadcast(JSON.stringify({
    type: 'end',
    data: {
      info: voteInstance.args,
      votes: voteInstance.votes
    }
  }));
});


// --- Twitch ---
TwitchClient.on('message', (channel, userstate, message, self) => {
  
  switch(userstate['message-type']) {
    case "chat":
    case "whisper":
      VoteController.newMessage(message, userstate);
    break;
    // case "action":
    // break;
  }
});

TwitchClient.connect();


// --- Init ---
server.listen(CONFIG.server.port, () => console.log(`Listening on port: ${CONFIG.server.port}`));
