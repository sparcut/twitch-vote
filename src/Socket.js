import EventEmitter from 'events';

// Simple wrapper for WebSocket, making it easier to interface with.
class Socket {
  constructor(url = null) {
    const port = window.location.port !== '' ? ':' + window.location.port : '';
    url = url || `ws://${window.location.hostname}${port}`;
    this.ws = new WebSocket(url);
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