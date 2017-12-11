import Socket from 'src/Socket';

/* --- Init --- */
const socket = new Socket;


/* --- Function --- */
const onNewVote = data => {

}

const onVoteUpdate = data => {

}

const onSocketMessage = event => {
  const msg = JSON.parse(event.data);

  switch(msg.type) {
    case 'new':
      onNewVote(msg.data);
      break;
    case 'update':
      onVoteUpdate(msg.data);
      break;
    case 'end':
      break;
  }

}



/* --- Executed --- */
socket.on('open', () => {
  console.log('Socket Open...');
});

socket.on('message', event => {
  console.log(event);
});

socket.on('error', err => {
  console.error(err);
});