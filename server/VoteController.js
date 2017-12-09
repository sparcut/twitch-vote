const EventEmitter = require('events');
const Vote = require('./Vote');

class VoteController extends EventEmitter {
  constructor() {
    super();

    this.current = null;
  }

  init() {}

  new(title, time, questions, options) {
    if(this.current === null) {
      this.current = new Vote(title, time, questions, options);
      this.watchVote();
      return true;
    } else {
      return false;
    }
  }

  endCurrent() {
    if(this.current !== null) {
      this.current.timer = 0;
    }
  }

  watchVote() {
    this.current.on('ready', () => {
      this.emit('new', this.current);
    });

    this.current.on('update', (votes) => {
      this.emit('update', votes);
    });

    this.current.on('end', () => {
      this.emit('end');
      this.current.removeAllListeners();
      this.current = null;
    });
  }

  newMessage(message, user) {
    if(this.current !== null) {
      this.current.checkMessage(message, user);
    }
  }
}