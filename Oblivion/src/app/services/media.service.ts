import {Injectable} from '@angular/core';
import {WebsocketService} from "./websocket.service";
import {Subject} from "rxjs";
import {MeetingStateService} from "./meeting-state.service";

const mediaConstraints = {
  audio: true,
  video: true
};

@Injectable()
export class MediaService{

  mySubject : Subject<any> = new Subject<any>();
  destroy : boolean = false ;
  private webSocket: WebSocket | undefined; // Server connection to get connected to peers
  private userId!: number; // This users ID
  private meetingID!: number; // Meeting ID
  private password!: string;
  private userRole!: string;
  private name!: string;
  private localstream!: MediaStream;  // Local video
  private remoteStreams: {[key: number]: MediaStream};  // Remote videos
  private peers: {[key: number]: RTCPeerConnection};    // WebRTC peer connections
  private peerConnectionConfig = {  // TODO: Verify the ice servers we want to use, add turn servers?
    'iceServers': [
      {'urls': 'stun:stun.stunprotocol.org:3478'},
      {'urls': 'stun:stun.l.google.com:19302'},
    ]
  };

  private dataChannels: {[key: number]: RTCDataChannel};  // Remote Data Channels
  private messageLog: JSON[];  // TODO: Make a message object?

  constructor(private websocketService: WebsocketService,private sharedService: MeetingStateService) {
    this.websocketService.getWebSocket().onmessage = (message: MessageEvent) => this.receivedRequestFromServer(message);
    this.websocketService.getWebSocket().onclose = (closeEvent: CloseEvent) => console.log(closeEvent);
    this.websocketService.getWebSocket().onerror = (event: Event) => console.log(event);
    this.remoteStreams = {};
    this.peers = {};

    this.dataChannels = {};
    this.messageLog = new Array<JSON>();
  }

  public setUpWebSocket(socket: WebsocketService){
    this.webSocket = socket.getWebSocket();
    this.webSocket.onmessage = (message: MessageEvent) => this.receivedRequestFromServer(message);
    this.webSocket.onclose = (closeEvent: CloseEvent) => console.log(closeEvent);
    this.webSocket.onerror = (event: Event) => console.log(event);
    // @ts-ignore
    this.webSocket.onopen = () => this.webSocket.send(JSON.stringify({'start': true, 'meetingID': this.sharedService.meetingID}));
  }

  // This method is called on startup to join the current meeting
  public requestMeetingInformation() {
    const message = JSON.stringify({'rmi': true});
    this.messageServer(message);
  }

  // Create a new RTCPeerConnection, add it to the list and return it
  private addNewRTCPeerConnection(userID: number, initSeq: boolean): RTCPeerConnection {
    let peer = new RTCPeerConnection(this.peerConnectionConfig);
    peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => this.gotIceCandidate(event, userID);
    peer.ontrack = (event: RTCTrackEvent) => this.gotRemoteStream(event, userID);
    peer.onconnectionstatechange = (event: Event) => this.handlePeerConnectionStateChange(event, userID);
    this.localstream.getTracks().forEach((track: MediaStreamTrack) => {
      peer.addTrack(track);  // Add The local audio and video tracks to the peer connection
    });

    // Add the new peer to the list
    this.peers[userID] = peer;

    // Only create the data channel if we are initializing it.
    if (initSeq) {
      const dataChannelLabel = this.userId + "-" + userID;
      let dataChannel = peer.createDataChannel(dataChannelLabel);
      dataChannel.onopen = (event: Event) => this.handleDataChannelStatusChange(event, userID);
      dataChannel.onclose = (event: Event) => this.handleDataChannelStatusChange(event, userID);
      dataChannel.onmessage = (event: MessageEvent) => this.receivedChat(event);

      this.dataChannels[userID] = dataChannel;

    } else {
      peer.ondatachannel = (event: RTCDataChannelEvent) => this.receiveChannelCallback(event, userID);
    }

    return peer;
  }

  private handleDataChannelStatusChange(event: Event, userId: number): void {
    if (this.dataChannels[userId]) {
      const state = this.dataChannels[userId].readyState;

      if (state === 'open') {
        // TODO: Unblock the sending of messages
      }
    }
  }

  private receiveChannelCallback(event: RTCDataChannelEvent, userId: number): void {
    const dataChannel = event.channel;
    dataChannel.onmessage = (event: MessageEvent) => this.receivedChat(event);
    dataChannel.onopen = (event: Event) => this.handleDataChannelStatusChange(event, userId);
    dataChannel.onclose = (event: Event) => this.handleDataChannelStatusChange(event, userId);

    this.dataChannels[userId] = dataChannel;
  }

  public sendChat(msg: string, recipientId?: number): void {
    // TODO: Add check to make sure message isn't too large

    // Format the message to send
    const timeInfo = new Date();
    const timestamp = timeInfo.getHours() + ":" + timeInfo.getMinutes();
    const formattedMessage = JSON.stringify({
      "message": msg,
      "timestamp": timestamp
    });

    // Either broadcast the message to everyone or to the specified recipient
    if (recipientId) {
      this.dataChannels[recipientId].send(formattedMessage);
      this.logAndDisplayChat(JSON.parse(formattedMessage));

    } else {
      Object.keys(this.dataChannels).forEach((key: string) => {
        const id = Number(key);
        if (this.dataChannels[id].readyState === "open") {
          this.dataChannels[id].send(formattedMessage);
          this.logAndDisplayChat(JSON.parse(formattedMessage));
        }
      });
    }
  }

  private receivedChat(event: MessageEvent): void {
    const data = JSON.parse(event.data);
    this.logAndDisplayChat(data);
  }

  // TODO: Make the JSON type more strictly defined
  // Appends the chat to the log and the html
  private logAndDisplayChat(data: JSON): void {
    const a = JSON.stringify(data);  // TODO: Remove this terrible workaround
    const b = JSON.parse(a);
    this.messageLog.push(data);  // Add the message data to the log
    const messageList = <HTMLUListElement>document.getElementById("chat-list");
    const message = document.createElement("li");
    message.appendChild(document.createTextNode(b["message"]));
    messageList.appendChild(message);
  }

  private createPeerOffer(peer: RTCPeerConnection, recipientID: number) {
    peer.createOffer()
      .then((description: RTCSessionDescriptionInit) => this.createdDescription(peer, recipientID, description))
      .catch(this.errorHandler);
  }

  public receivedRequestFromServer(message: MessageEvent) {

    const signal = JSON.parse(message.data);
    //console.log(signal);

    // Debugging Statements TODO: Remove
    //console.log('Request from Server:');
    //console.log(message);

    // Handle the Session Description Protocol messages
    if (signal.sdp && signal.userId != this.userId && signal.recipientID == this.userId) {
      const currentPeer: RTCPeerConnection = this.getPeerById(signal.userId);
      currentPeer.setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          // Only create answers in response to offers
          if(signal.sdp.type == 'offer') {
            currentPeer.createAnswer()
              .then((description: RTCSessionDescriptionInit) => this.createdDescription(currentPeer, signal.userId, description))
              .catch(this.errorHandler);
          }
        })
        .catch(this.errorHandler);

      // Handle the ICE server information
    } else if (signal.ice && signal.userId != this.userId && signal.recipientID == this.userId) {
      const currentPeer: RTCPeerConnection = this.getPeerById(signal.userId);
      currentPeer.addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch(this.errorHandler);

      // Handle the RMI response
    } else if (signal.rmi && (this.userId < 0 || this.userId == undefined)) {
      this.userId = signal.userId;
      this.meetingID = signal.meetingID;
      this.password = signal.password;
      this.userRole = signal.userRole;
      this.name = signal.name;
      // Create new peer connection offers for each of the peers currently in the meeting
      signal.clientIDs.forEach((id: number) => {
        if (id != this.userId) {
          const currentPeer: RTCPeerConnection = this.getPeerById2(id, true);
          this.createPeerOffer(currentPeer, id);
        }
      });
    }
    else if (signal.res) {
      if(signal.left){
        this.peers[signal.userID].close();
        delete this.peers[signal.userID];
        delete this.remoteStreams[signal.userID];
      }
      else{
        this.destroy = true;
        this.mySubject.next(this.destroy);
      }
    }
  }

  // Tries to retrieve peer by id
  // If no such peer exists create it and return
  private getPeerById(id: number): RTCPeerConnection {
    if (id in this.peers) {
      return this.peers[id];
    }
    return this.addNewRTCPeerConnection(id, false);
  }

  private getPeerById2(id: number, initSeq: boolean): RTCPeerConnection {
    if (id in this.peers) {
      return this.peers[id];
    }
    return this.addNewRTCPeerConnection(id, initSeq);
  }

  //-----------------------------------------------------------------------------
  // TODO: Delete
  public getPeers() {
    return this.peers;
  }

  //-----------------------------------------------------------------------------

  private createdDescription(peer: RTCPeerConnection, recipientID: number, description: RTCSessionDescriptionInit): void {
    peer.setLocalDescription(description)
      .then(() => this.sendDescription(peer, recipientID))
      .catch(this.errorHandler);
  }

  private sendDescription(peer: RTCPeerConnection, recipientID: number): void {
    const message = JSON.stringify(
      {
        'sdp': peer.localDescription,
        'userId': this.userId,
        'recipientID': recipientID
      });
    this.messageServer(message);
  }

  private messageServer(message: string) {
    // TODO: Does this need error handling?
    // @ts-ignore
    return this.webSocket.send(message);
  }

  private gotIceCandidate(event: RTCPeerConnectionIceEvent, recipientID: number) {
    if (event.candidate != null) {
      // @ts-ignore
      this.webSocket.send(
        JSON.stringify(
          {
            'ice': event.candidate,
            'userId': this.userId,
            'recipientID': recipientID
          }));
    }
  }

  private gotRemoteStream(event: RTCTrackEvent, peerId: number) {
    // console.log('Received Track Event');
    // console.log(event);
    if (!(peerId in this.remoteStreams)) {
      this.remoteStreams[peerId] = new MediaStream();
    }

    this.remoteStreams[peerId].addTrack(event.track);
    this.remoteStreams[peerId].getTracks().forEach(track => {
      track.enabled = true;
      //console.log(track);
    });
  }


  private handlePeerConnectionStateChange(event: Event, userID: number): void {
    //console.log('in handle state change');
    //console.log('UserID: '+userID);
    //console.log(event);

    const peer = this.peers[userID];
    if (peer) {
      switch (peer.connectionState) {
        // Removes the peer and stream from their respective objects if the connection fails
        case "disconnected":
        case "failed":
        case "closed":
          this.peers[userID].close();
          delete this.peers[userID];
          delete this.remoteStreams[userID];
          break;
      }
    }
  }

  private errorHandler(error: Error) {
    console.log(error);
  }
  // ----- End webrtc proto-----

  async loadLocalStream() {
    try {
      this.localstream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      this.localstream.getTracks().forEach(track => {
        track.enabled = true;
      });
      // TODO: Improve error handling
    } catch (e) {
      console.log(e);
    }
  }

  public getLocalStream(): MediaStream {
    return this.localstream;
  }

  public getRemoteStreams(): {[key: number]: MediaStream} {
    return this.remoteStreams;
  }

  public muteLocalVideo(): void {
    this.localstream.getVideoTracks().forEach(videoTrack => {
      videoTrack.enabled = false;
    });
  }

  public unmuteLocalVideo(): void {
    this.localstream.getVideoTracks().forEach(videoTrack => {
      videoTrack.enabled = true;
    });
  }

  public muteLocalAudio(): void {
    this.localstream.getAudioTracks().forEach(audioTrack => {
      audioTrack.enabled = false;
    });
  }

  public unmuteLocalAudio(): void {
    this.localstream.getAudioTracks().forEach(audioTrack => {
      audioTrack.enabled = true;
    });
  }

  public endMeetingForAll(): void{
    console.log("END MEETING FOR ALL IS HAPPENING");
    this.messageServer(JSON.stringify({'res': true, 'end': true, 'meetingID': this.meetingID}));
  }

  public leaveMeeting(): void{
    this.messageServer(JSON.stringify({'res': true, 'end': false, 'meetingID': this.meetingID, 'userID': this.userId}));
  }

  public getMeetingInfo() {
    return {
      'userRole': this.userRole,
      'meetingID': this.meetingID,
      'password': this.password,
      'name': this.name
    }
  }

  terminate() {
    console.log('Destroy Media Service');
    //Close Peer Connections
    Object.values(this.peers).forEach(peer => {
      peer.close();
    });
    //Close local tracks
    this.localstream.getTracks().forEach(function(track) {
      track.stop();
    });
    //Clear remote streams
    this.remoteStreams= {};
    // @ts-ignore
    this.webSocket.close();
  }
}
