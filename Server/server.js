const express = require('express');
const ws = require('ws');
const app = express();

// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({ noServer: true });


// -----------------------------------------------------------------------------------
// HTTP Server
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Oblivion Web Conferencing." });
});


// -----------------------------------------------------------------------------------
// Websocket Server
wsServer.on('connection', function connection(ws,req) {

    //someone connect to server
    const ip = req.socket.remoteAddress;
    console.log('Client Connected with IP : '+ ip);
    console.log("There are now: "+wsServer.clients.size+" Active Connections");


    //When client disconnects
    ws.on('close',ws => {
        console.log("There are now: "+wsServer.clients.size+" Active Connections");
        console.log('Client Disconnected');
    });

    ws.on('message', (message) => {
        console.log(typeof message);
        console.log("Received Message " + message);

        //pares the message string and keep track of current users
        const object = JSON.parse(message);

        // Determine Message Type/Contents
        // WebRTC Connection Message (SDP or ICE candidates)
        if (object.sdp || object.ice) {
            wsServer.broadcast(message);

        // Client join meeting request
        } else if(object.join) {
            console.log("Join Meeting Request");

        // Client create meeting request
        } else {
            console.log("Create Meeting Request");
        }
    });
});

wsServer.broadcast = function (message) {
    // For each of the clients send the broadcast
    this.clients.forEach(function (client) {
        client.send(message);
    });
}


// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(8080);
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});
