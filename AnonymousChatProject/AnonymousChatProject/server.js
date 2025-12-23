const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let waitingQueue = [];
let rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('start', () => {
    waitingQueue.push(socket);

    if (waitingQueue.length >= 2) {
      const user1 = waitingQueue.shift();
      const user2 = waitingQueue.shift();
      const roomId = 'room-' + Date.now();
      rooms[roomId] = { users: [user1, user2], messages: [] };

      user1.join(roomId);
      user2.join(roomId);

      user1.emit('matched', { roomId });
      user2.emit('matched', { roomId });
    }
  });

  socket.on('message', ({ roomId, text }) => {
    if (rooms[roomId]) {
      rooms[roomId].messages.push({ from: socket.id, text });
      socket.to(roomId).emit('message', { text });
    }
  });

  socket.on('next', ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].users.forEach(user => user.leave(roomId));
      delete rooms[roomId];
    }
    socket.emit('next-done');
  });

  socket.on('disconnect', () => {
    waitingQueue = waitingQueue.filter(s => s.id !== socket.id);
    for (let roomId in rooms) {
      if (rooms[roomId].users.includes(socket)) {
        rooms[roomId].users.forEach(user => user.leave(roomId));
        delete rooms[roomId];
      }
    }
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
