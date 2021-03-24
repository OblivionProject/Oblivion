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
        const message = JSON.stringify({'rmi': true, 'clientIDs': this.getClientUserIDs(), 'userId': id});
        this.addUser(ws, id);
        return message;
    }

    onMessage(ws, message) {

        console.log('In new onMessage');
        const object = JSON.parse(message);

        // Handle WebRTC Connection Message (SDP or ICE candidates)
        if (object.sdp || object.ice) {
            this.getClients().forEach(function(client) {
                client.send(message);
            });

        // Request Meeting Information (When a client joins assign them an id and send them contact list)
        } else if (object.rmi) {
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
// let wsConnections = {}; // Used to quickly find which meeting the ws connection is in {WebSocket: Meeting}

// let meeting = new Meeting('Test');

wsServer.on('connection', connection);

function connection(ws, req) {
    //someone connect to server  TODO: This can be removed?
    console.log(req);
    const ip = req.socket.remoteAddress;
    console.log('Client Connected with IP : '+ ip);
    console.log("There are now: "+wsServer.clients.size+" Active Connections");

    // When a client disconnects TODO: Remove the client from the current meeting?
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
            console.log('IN BAD SDP/ICE');
            //wsServer.broadcast(message);
            // Send the connection messages to users currently in the meeting
            // TODO: Can be improved on by only sending to the desired clients
            // if (object.meetingID in meetings) {
            //     const meeting = meetings[object.meetingID];
            //     meeting.getClients().forEach(function(client) {
            //         client.send(message);
            //     });
            //
            // } else {
            //     // TODO: Add handling if a ws is making a call w/o being in a registered connection
            // }

        // Request Meeting Information (When a client joins assign them an id and send them contact list)
        } else if (object.rmi) {
            console.log('IN BAD RMI request received');
            // if (object.meetingID in meetings) {
            //     const meeting = meetings[object.meetingID];
            //     const message = meeting.generateRMIResponse(ws);
            //     ws.send(message);
            //     console.log('Response:\n' + message);
            // } else {
            //     // TODO: Add error handling?
            // }

        // Clears the meeting TESTING
        } else if (object.res) {
           //meeting = new Meeting('Test');


        // Client join meeting request
        } else if (object.meetingType && object.meetingType === 'JOIN') {  // Change to ==?

            console.log("Join Meeting Request");
            // TODO: Add password checking
            const meetingID = object.meetingID;
            if (meetingID in meetings) {
                const meetingToJoin = meetings[object.meetingID];
                ws.on('message', (message) => meetingToJoin.onMessage(ws, message));
                // const message = meetingToJoin.generateRMIResponse(ws);
                // ws.send(message);
                // wsConnections[ws] = meetingToJoin;
                // console.log('Join RMI response\n' + message);


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
            ws.on('message', (message) => newMeeting.onMessage(ws, message));
            newMeeting.generateRMIResponse(ws);
            meetings[newMeetingID] = newMeeting;
            // wsConnections[ws] = newMeeting;
            console.log('Meeting ID: ' + newMeetingID);
        }
    });
}

// wsServer.broadcast = function (message) {
//     // For each of the clients send the broadcast
//     this.clients.forEach(function (client) {
//         client.send(message);
//     });
// }

// Generates a random unique 5 digit meeting code
// This is guaranteed unique by checking the existing codes
function generateUniqueMeetingID() {
    let id = Math.floor(Math.random()*90000) + 10000;
    while (id in meetings) {
        id = Math.floor(Math.random()*90000) + 10000;
    }
    return id;
}
