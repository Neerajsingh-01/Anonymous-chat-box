const socket = io();
const chatDiv = document.getElementById('chat');
const input = document.getElementById('input');

let roomId = null;

document.getElementById('start').onclick = () => {
  socket.emit('start');
}

socket.on('matched', ({ roomId: r }) => {
  roomId = r;
  chatDiv.innerHTML = "<i>Matched! Start chatting...</i><br>";
});

document.getElementById('send').onclick = sendMessage;
input.addEventListener('keypress', e => { if(e.key==='Enter') sendMessage(); });

function sendMessage() {
  const text = input.value.trim();
  if (!text || !roomId) return;
  socket.emit('message', { roomId, text });
  chatDiv.innerHTML += "<b>You:</b> " + text + "<br>";
  input.value = '';
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

socket.on('message', ({ text }) => {
  chatDiv.innerHTML += "<b>Partner:</b> " + text + "<br>";
  chatDiv.scrollTop = chatDiv.scrollHeight;
});

document.getElementById('next').onclick = () => {
  if (!roomId) return;
  socket.emit('next', { roomId });
  chatDiv.innerHTML = "<i>Waiting for next match...</i><br>";
  roomId = null;
  socket.emit('start');
}

socket.on('next-done', () => {
  chatDiv.innerHTML = "<i>Waiting for next match...</i><br>";
});
