const express = require('express');
const ws = require('ws');

const app = express();

// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({ noServer: true },console.log("server.js is now listening on port 8080"));

wsServer.on('connection', socket => {
    socket.on('message', message => console.log(message));
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to fuck you application." });
});


// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(8080);
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});