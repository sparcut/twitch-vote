import EventEmitter from 'events';

// Simple wrapper for WebSocket, making it easier to interface with.
class Socket {
  constructor(url = null) {
    url = url || `ws://${window.location.hostname}`;
    this.ws = new WebSocket(`ws://${window.location.hostname}`);
  }

  on(event, callback) {
    return this.ws.addEventListener(event, callback);
  }

  send(data) {
    this.ws.send(data);
  }

  close() {
    this.ws.close();
  }
}

export default Socket;