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
        const role = this.generateUserRole(id);
        const message = JSON.stringify({
            'rmi': true,
            'clientIDs': this.getClientUserIDs(),
            'userId': id,
            'userRole': role,
            'meetingID': this.meetingID,
            'password': this.getPassword(role),
            'name': this.name
        });
        this.addUser(ws, id);
        return message;
    }

    generateLeaveMeetingResponse(id) {
        return JSON.stringify({
            'res': true,
            'left': true,
            'userID': id
        });
    }

    generateNewAdminCredentials() {
        return JSON.stringify({
            'role_change': true,
            'role': 'Admin',
            'password': this.password
        });
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
        else if (data.res) {
            if(data.end || this.getClients().length === 1){
                //const message = this.generateEndMeetingResponse(ws);
                this.getClients().forEach(function(client) {
                    client.close();
                });
            }
            else{
                const index = this.getClients().indexOf(ws);
                const clientID = this.getClientUserIDs()[index];
                ws.close();
                if (index > -1) {
                    this.getClients().splice(index, 1);
                    this.getClientUserIDs().splice(index, 1);
                }

                let new_admin = undefined;
                let messageForNewAdmin = undefined;
                if(index === 0){
                    new_admin = this.getClients()[0];
                    messageForNewAdmin = this.generateNewAdminCredentials();
                }
                const messageForPeopleInMeeting = this.generateLeaveMeetingResponse(clientID);
                this.getClients().forEach(function(client) {
                    if(new_admin !== undefined && client === new_admin && messageForNewAdmin !== undefined){
                        client.send(messageForNewAdmin);
                    }
                    client.send(messageForPeopleInMeeting);
                });
            }
            console.log('Response:\n' + message);
        }
    }

    generateUserID() {
        this.nextID = this.nextID + 1;
        return this.nextID;
    }

    generateUserRole(id){
        if(id === 1){
            return 'Admin';
        }
        else{
            return 'Guest'
        }
    }

    getClientUserIDs() {
        return this.clientIDs;
    }

    getClients() {
        return this.clients;
    }

    getPassword(role){
        if(role === 'Admin'){
            return this.password;
        }
        else{
            return '';
        }
    }

    addUser(ws, id) {
        this.clients.push(ws);
        this.clientIDs.push(id);
    }

    static incorrectMeetingInfo(ws, message) {
        if (message === 'Invalid ID'){
            ws.send(JSON.stringify({
                'error': true,
                'message': 'Invalid ID'
            }));
        }
        else if (message === 'Invalid Password'){
            ws.send(JSON.stringify({
                'error': true,
                'message': 'Invalid Password'
            }));
        }
    }

    correctMeetingInfo(ws) {
        ws.send(JSON.stringify({
            'valid': true,
            'meetingID': this.meetingID
        }));
    }
}

module.exports.Meeting = Meeting;