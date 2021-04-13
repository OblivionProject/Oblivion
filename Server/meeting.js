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
            'password': this.getPassword(role)
        });
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

    generateUserRole(id){
        if(id === 2){
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
        if(role == 'Admin'){
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

    static correctMeetingInfo(ws) {
        ws.send(JSON.stringify({
            'valid': true
        }));
    }
}

module.exports.Meeting = Meeting;