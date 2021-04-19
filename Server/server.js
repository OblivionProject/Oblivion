const m = require("./modules/meeting");
const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');

const credentials = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert'),
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
        console.log(meetings);
        // Parse the message
        const data = JSON.parse(message);

        // Client join meeting request
        if (data.meetingType && data.meetingType === 'JOIN') {
            console.log(data);
            const meetingID = data.meetingID;
            if (meetingID in meetings) {
                const meetingToJoin = meetings[meetingID];
                if (meetingToJoin.hasPassword) {
                    if (data.password === meetingToJoin.password) {
                        meetingToJoin.correctMeetingInfo(ws);
                    }
                    else {
                        meetingToJoin.incorrectMeetingInfo(ws, 'Invalid Password');
                    }

                // Join if the meeting has no password
                } else {
                    console.log("MATT this shit is ")
                    meetingToJoin.correctMeetingInfo(ws);
                }

            }
            else {
                m.Meeting.incorrectMeetingInfo(ws, 'Invalid ID');
            }

            // Client create meeting request
        }
        else if (data.meetingType && data.meetingType === 'CREATE') {
            console.log("Create Meeting Request");

            const newMeetingID = generateUniqueMeetingID();
            const newMeeting = new m.Meeting(data.name, newMeetingID);

            // Check if the meeting should have a password
            if (data.password !== '') {
                newMeeting.setPassword(data.password);
            }

            meetings[newMeetingID] = newMeeting;
            console.log('Meeting ID: ' + newMeetingID);

            const message = JSON.stringify({
                'success': true,
                'meeting': newMeetingID
            });
            console.log(meetings);
            ws.send(message);
        }
        //Starting or joining a meeting
        else if(data.meetingID && data.start){
            if (data.meetingID in meetings) {
                const meetingToJoin = meetings[data.meetingID];
                ws.on('message', (message) => meetingToJoin.onMessage(ws, message));
            }
        }
        //Needed to delete the meeting object
        else if (data.res) {
            const meetingID = data.meetingID;
            if(meetingID in meetings){
                if(data.end){
                    delete meetings[meetingID];
                }
                else{
                    const meetingToLeave = meetings[data.meetingID];
                    if(meetingToLeave.getClients().length === 1){
                        delete meetings[meetingID];
                    }
                }
            }
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

module.exports = httpsServer;
