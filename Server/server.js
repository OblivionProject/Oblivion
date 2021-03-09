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
            this.hasPassword = true;
        }
    }

    // Create a response to the Request Meeting Information request & add to meeting
    // Assign the user an ID and send the current user ids
    generateRMIResponse(ws) {
        const id = this.generateUserID();
        const message = JSON.stringify({'rmi': true, 'clientIDs': this.getClientUserIDs(), 'userId': id});
        this.addUser(ws, id);
        return message;
    }

    onMessage(ws, message) {

        console.log('In new onMessage');
        const data = JSON.parse(message);

        // Handle WebRTC Connection Message (SDP or ICE candidates)
        if (data.sdp || data.ice) {
            this.getClients().forEach(function(client) {
                client.send(message);
            });

            // Request Meeting Information (When a client joins assign them an id and send them contact list)
        } else if (data.rmi) {
            const message = this.generateRMIResponse(ws);
            ws.send(message);
            console.log('Response:\n' + message);
        }
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
httpsServer.listen(8080);

const WebSocketServer = require('ws').Server;
const wsServer = new WebSocketServer({server: httpsServer});

// -----------------------------------------------------------------------------------
// Websocket Server
//

let meetings = {};      // Stores all the current meetings

wsServer.on('connection', connection);

function connection(ws, req) {
    //someone connect to server  TODO: This can be removed?
    const ip = req.socket.remoteAddress;
    console.log('Client Connected with IP : '+ ip);
    console.log("There are now: "+wsServer.clients.size+" Active Connections");

    // When a client disconnects TODO: Remove the client from the current meeting?
    ws.on('close',ws => {
        console.log("There are now: "+wsServer.clients.size+" Active Connections");
        console.log('Client Disconnected');
    });

    ws.on('message', (message) => {

        console.log("Received Message " + message);

        // Parse the message
        const data = JSON.parse(message);

        // Client join meeting request
        if (data.meetingType && data.meetingType === 'JOIN') {

            console.log("Join Meeting Request");

            const meetingID = data.meetingID;
            if (meetingID in meetings) {
                const meetingToJoin = meetings[meetingID];
                if (meetingToJoin.hasPassword) {
                    if (data.password === meetingToJoin.password) {
                        ws.on('message', (message) => meetingToJoin.onMessage(ws, message));

                    } else {
                        // TODO: Send incorrect password message to client
                    }

                    // Join if the meeting has no password
                } else {
                    ws.on('message', (message) => meetingToJoin.onMessage(ws, message));
                }

            } else {
                // TODO: Send a meeting not found message to client
            }

            // Client create meeting request
        } else if (data.meetingType && data.meetingType === 'CREATE') {
            console.log("Create Meeting Request");

            const newMeetingID = generateUniqueMeetingID();
            const newMeeting = new Meeting('New Meeting', newMeetingID); // TODO: Change 'New Meeting' to meeting name

            // Check if the meeting should have a password
            if (data.password !== '') {
                newMeeting.setPassword(data.password);
            }

            // Update the on message function to be specific to the meeting
            ws.on('message', (message) => newMeeting.onMessage(ws, message));

            newMeeting.generateRMIResponse(ws); // Generate RMI response is needed to create the new user
            meetings[newMeetingID] = newMeeting; // Add the meeting to the meetings array
            console.log('Meeting ID: ' + newMeetingID);
        }
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