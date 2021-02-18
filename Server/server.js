const express = require('express');
const ws = require('ws');

const app = express();

// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({ noServer: true });

wsServer.on('connection', function connection(ws,req) {

    //someone connect to server
    const ip = req.socket.remoteAddress;
    //const ipXforward = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];;
    console.log('Client Connected with IP : '+ ip);
    console.log("There are now: "+wsServer.clients.size+" Active Connections");


    //When client disconnects
    ws.on('close',ws => {
        console.log("There are now: "+wsServer.clients.size+" Active Connections");
        console.log('Client Disconnected');
    });

    ws.on('message', function message(message){
        console.log(message);
    });






});

// const PORT = process.env.PORT || 8080;
// app.listen(PORT,() => {
//     console.log('Server is running on port '+PORT);
// });

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
