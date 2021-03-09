// TODO: Convert this to a node module
class Meeting {

    constructor(name) {
        this.name = name;     // Name of the meeting
        this.clients = [];    // List of WebSocket connections
        this.clientIDs = [];  // List of client ID's DELETE?
        this.nextID = 0;
    }

    // Create a response to the Request Meeting Information request & add to meeting
    // Assign the user an ID and send the current user ids
    generateRMIResponse(ws) {
        const id = this.generateUserID();
        const message = JSON.stringify({'rmi': true, 'clientIDs': meeting.getClientUserIDs(), 'userId': id});
        this.addUser(ws, id);
        return message;
    }

    generateUserID() {
        this.nextID = this.nextID + 1;
        return this.nextID;
    }

    getClientUserIDs() {
        return this.clientIDs;
    }

    getClients() {
        return this.clients;
    }

    addUser(ws, id) {
        this.clients.push(ws);
        this.clientIDs.push(id);
    }
}


const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');

const credentials = {
    key: fs.readFileSync(''),
    cert: fs.readFileSync(''),
}

console.log(credentials);

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port=8080);

const WebSocketServer = require('ws').Server;
const wsServer = new WebSocketServer({server: httpsServer});

// -----------------------------------------------------------------------------------
// Websocket Server
//

// Stores all the current meetings
// let meetings = [];
let meeting = new Meeting('Test');

wsServer.on('connection', connection);

function connection(ws, req) {
    //someone connect to server  TODO: This can be removed?
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

        // Request Meeting Information (When a client joins assign them an id and send them contact list)
        } else if (object.rmi) {
            console.log('RMI request received');
            //meeting.addUser(ws)
            const message = meeting.generateRMIResponse(ws);
            ws.send(message);
            console.log('Response:\n' + message);

        // Clears the meeting TESTING
        } else if (object.res) {
           meeting = new Meeting('Test');

        // Client join meeting request
        } else if(object.join) {
            console.log("Join Meeting Request");

            // Client create meeting request
        } else {
            console.log("Create Meeting Request");
            //meeting = new Meeting('Test');
        }
    });
}

wsServer.broadcast = function (message) {
    // For each of the clients send the broadcast
    this.clients.forEach(function (client) {
        client.send(message);
    });
}
