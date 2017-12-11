import Socket from 'src/Socket';

/* --- Init --- */
const socket = new Socket;
const newVoteSubmit = document.getElementById('new-vote-submit'); 

/* --- Functions --- */
const newVote = (title, time, questions) => {
  socket.send(JSON.stringify({
    type: 'new',
    data: {
      title,
      time,
      questions
    }
  }));
}

/* --- Executed --- */

socket.on('message', (event) => {
  console.log(event);
});

newVoteSubmit.addEventListener('click', () => {
  const title = document.getElementById('new-vote-title').value;
  const time = document.getElementById('new-vote-time').value;
  const questions = [];

  // Get questions (hacky method until proper question creation is added)
  for(let i = 1, numOfQuestions = 4; i < numOfQuestions; i++) {
    const option = document.getElementById(`new-vote-q${i}-option`).value;
    const text = document.getElementById(`new-vote-q${i}-text`).value;

    questions[i-1] = { option, text }
  }

  newVote(title, time, questions);

  console.log(title, time, questions);
});
