const EventEmitter = require('events');


const CONFIG = require('./config.json');

const VOTE_REGEXP = /!vote (\S*)/i; // Selects the first !vote in string
const DEFAULT_OPTIONS = {
  command: '!vote',
  caseSensitive: false,
  multipliers: {
    // Should be int, not float.
    // 0 = Vote not counted
    // Multipliers do NOT stack (on purpose), hierachy of user-types below. Highest applies.
    subscriber: 1, // Highest
    mod: 1,
    pleb: 1 // Lowest
  }
}

class VoteManager extends EventEmitter {
  constructor(title, time, questions, options) {
    super();

    this.title = title;
    this.lengthTime = (time || 60) * 1000; // time === seconds
    // questions = array of object. { text: 'Edna', option: 'A' }
    this.questions = questions;
    this.options = Object.assign({}, options, DEFAULT_OPTIONS);


    this.timer = this.lengthTime;
    this.voteRegex = new RegExp(`${this.options.command} (\\S*)`, 'i');
    this.voters = new Map();
    this.votes = {}

    this.state = 'preparing'; // preparing, ready, ended
  }

  init() {
    this.questions.forEach(q => {
      this.votes[q.option] = 0;
    });

    this.startTimer();

    this.state = 'ready';
    this.emit(this.state);

    console.log('VoteManager: Ready');
  }

  checkMessage(message, user) {
    const option = this.checkVote(message);

    // If message includes vote
    if(option) {
      if(this.voters.has(user['user-id'])) {
        this.changeVote(option, user);
      } else {
        this.addVote(option, user);
      }
    }

    console.log(`VoteManager: Checked ${user}'s message - ${message}`);
  }

  startTimer() {
    const decrementTimer = () => {
      // If vote not manually stopped or timer hit 0
      if(this.timer > 1 && this.state !== 'ended') {
        this.timer -= 1000;
        console.log(this.timer);
        setTimeout(decrementTimer, 1000);
        console.log(`VoteManager: Time - ${this.timer/1000}s`);
      } else {
        this.state = 'ended';
        this.emit(this.state, this.votes);
        console.log('VoteManager: Ended');
        console.log(this.votes);
        console.log(this.voters);
      }
    }

    decrementTimer.bind(this);
    decrementTimer();
  }

  
  // ---

  userType(user) {
    if(user.subscriber) return 'subscriber';
    if(user.mod) return 'mod';

    return 'pleb';
  }

  checkVote(message, user) {
    // Message contains !vote?
    const command = this.containsCommand(message);

    if(command) {

      // Vote valid?
      const option = command[1];
      if(this.votes.hasOwnProperty(option)) {
        return option;
      } else {
        return false;
      }
    }
  }

  containsCommand(text) {
    const regTest = VOTE_REGEXP.exec(text);
    
    if(regTest !== null && regTest[1] !== '') {
      return regTest;
    } else {
      return false;
    }
  }

  addVote(option, user) {
    const multiplier = this.options.multipliers[this.userType(user)];
    const voteWeight = 1 * multiplier;
    
    this.votes[option] += voteWeight;
    this.voters.set(user['user-id'], { voteWeight, option }); 

    this.votesUpdated();
  }

  changeVote(option, user) {
    const oldVote = this.voters.get(user['user-id']);
    const multiplier = this.options.multipliers[this.userType(user)]; // Re evaluate, incase changed (e.g. subbed)
    const voteWeight = 1 * multiplier;

    if(oldVote.option === option) {
      if(oldVote.voteWeight !== voteWeight) {
        // Change counter in 1 action (rather than taking away then adding)
        this.votes[option] += (-oldVote.voteWeight + voteWeight);
        this.votesUpdated();
      } else {
        // Same vote.
      }
    } else {
      // Take away previous votes
      this.votes[oldVote.option] -= oldVote.voteWeight;
      // Add to new option
      this.votes[option] += voteWeight;
      this.voters.set(user['user-id'], { voteWeight, option }); 
      
      this.votesUpdated();
    }
  }

  votesUpdated() {
    this.emit('update' ,this.votes);
  }
}

module.exports = VoteManager;