// TODO: Convert this to a node module
class Meeting {

    constructor(name, meetingID) {
        this.name = name;     // Name of the meeting
        this.clients = [];    // List of WebSocket connections
        this.clientIDs = [];  // List of client ID's DELETE?
        this.nextID = 0;
        this.hasPassword = false;
        this.password = '';
        this.meetingID = meetingID;
    }

    setPassword(password) {
        if (!this.hasPassword) {
            this.password = password;
        }
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
let meetings = {};
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
        } else if (object.meetingType && object.meetingType === 'JOIN') {  // Change to ==?

            console.log("Join Meeting Request");
            const meetingID = object.meetingID;
            if (meetingID in meetings) {
                const meetingToJoin = meetings[object.meetingID];
                const message = meetingToJoin.generateRMIResponse(ws);
                ws.send(message);
                console.log('Join RMI response\n' + message);


            } else {
                // TODO: Send a meeting not found message to client
            }

            // Client create meeting request
        } else if (object.meetingType && object.meetingType === 'CREATE') {
            console.log("Create Meeting Request");

            const newMeetingID = generateUniqueMeetingID();
            const newMeeting = new Meeting('New Meeting', newMeetingID);
            if (object.password) {
                newMeeting.setPassword(object.password);
            }
            meetings[newMeetingID] = newMeeting;
        }
    });
}

wsServer.broadcast = function (message) {
    // For each of the clients send the broadcast
    this.clients.forEach(function (client) {
        client.send(message);
    });
}

// Generates a random unique 5 digit meeting code
// This is guaranteed unique by checking the existing codes
function generateUniqueMeetingID() {
    let id = Math.floor(Math.random()*90000) + 10000;
    while (id in meetings) {
        id = Math.floor(Math.random()*90000) + 10000;
    }
    return id;
}
