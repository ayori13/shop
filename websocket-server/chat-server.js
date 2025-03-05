const WebSocket = require('ws');
const http = require('http');

class ChatServer {
  constructor(port = 8081) {
    this.port = port;
    this.clients = new Map();
    this.messages = [];
  }

  start() {
    this.httpServer = http.createServer();
    this.wss = new WebSocket.Server({ server: this.httpServer });

    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userType = url.searchParams.get('userType');
      const userId = url.searchParams.get('userId');

      this.clients.set(ws, { userType, userId });

      this.sendRecentMessages(ws);

      ws.on('message', (message) => {
        this.handleMessage(ws, message);
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });

    this.httpServer.listen(this.port, () => {
      console.log(`WebSocket chat server running on port ${this.port}`);
    });
  }

  sendRecentMessages(ws) {
    const recentMessages = this.messages.slice(-50);
    ws.send(JSON.stringify({
      type: 'history',
      data: recentMessages
    }));
  }

  handleMessage(ws, messageData) {
    try {
      const message = JSON.parse(messageData);
      const sender = this.clients.get(ws);

      const chatMessage = {
        id: Date.now(),
        ...message,
        sender: sender.userId,
        userType: sender.userType,
        timestamp: new Date().toISOString()
      };

      this.messages.push(chatMessage);
      this.broadcastMessage(chatMessage);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  broadcastMessage(message) {
    for (const [client, clientInfo] of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'message',
          data: message
        }));
      }
    }
  }
}

module.exports = ChatServer;