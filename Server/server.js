const m = require("./meeting");
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
            const newMeeting = new m.Meeting('New Meeting', newMeetingID); // TODO: Change 'New Meeting' to meeting name

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
    let id = Math.floor(Math.random() * 90000) + 10000;
    while (id in meetings) {
        id = Math.floor(Math.random() * 90000) + 10000;
    }
    return id;
}
