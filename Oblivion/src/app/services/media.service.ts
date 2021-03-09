import { Injectable } from '@angular/core';
import {WebsocketService} from "./websocket.service";

const mediaConstraints = {
  audio: true,
  video: true
};

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private webSocket: WebSocket; // Server connection to get connected to peers
  private userId!: number;    // This users ID
  private localstream!: MediaStream;  // Local video
  private remoteStreams: {[key: number]: MediaStream};  // Remote videos
  private peers: {[key: number]: RTCPeerConnection};    // WebRTC peer connections
  private peerConnectionConfig = {  // TODO: Verify the ice servers we want to use, add turn servers?
    'iceServers': [
      {'urls': 'stun:stun.stunprotocol.org:3478'},
      {'urls': 'stun:stun.l.google.com:19302'},
    ]
  };

  constructor(websocketService: WebsocketService) {
    this.webSocket = websocketService.getWebSocket();
    this.webSocket.onmessage = (message: MessageEvent) => this.receivedRequestFromServer(message);
    this.webSocket.onclose = (closeEvent: CloseEvent) => console.log(closeEvent);
    this.webSocket.onerror = (event: Event) => console.log(event);
    this.remoteStreams = {};
    this.peers = {};
  }

  // This method is called on startup to join the current meeting
  public requestMeetingInformation() {
    const message = JSON.stringify({'rmi': true});
    this.messageServer(message);
  }

  // Create a new RTCPeerConnection, add it to the list and return it
  private addNewRTCPeerConnection(userID: number): RTCPeerConnection {
    let peer = new RTCPeerConnection(this.peerConnectionConfig);
    peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => this.gotIceCandidate(event, userID);
    peer.ontrack = (event: RTCTrackEvent) => this.gotRemoteStream(event, userID);
    this.localstream.getTracks().forEach((track: MediaStreamTrack) => {
      peer.addTrack(track);  // Add The local audio and video tracks to the peer connection
    });

    // Add the new peer to the list
    this.peers[userID] = peer;

    return peer;
  }

  private createPeerOffer(peer: RTCPeerConnection, recipientID: number) {
    peer.createOffer()
      .then((description: RTCSessionDescriptionInit) => this.createdDescription(peer, recipientID, description))
      .catch(this.errorHandler);
  }

  public receivedRequestFromServer(message: MessageEvent) {

    const signal = JSON.parse(message.data);
    console.log(signal);

    // Debugging Statements TODO: Remove
    console.log('Request from Server:');
    console.log(message);

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
    } else if (signal.rmi && this.userId == undefined) {
      this.userId = signal.userId;
      // Create new peer connection offers for each of the peers currently in the meeting
      signal.clientIDs.forEach((id: number) => {
        if (id != this.userId) {
          const currentPeer: RTCPeerConnection = this.getPeerById(id);
          this.createPeerOffer(currentPeer, id);
        }
      });
    }
  }

  // Tries to retrieve peer by id
  // If no such peer exists create it and return
  private getPeerById(id: number) {
    if (id in this.peers) {
      return this.peers[id];
    }
    return this.addNewRTCPeerConnection(id);
  }

  //-----------------------------------------------------------------------------
  // TODO: Delete
  public getPeers() {
    return this.peers;
  }

  public clearMeeting() {
    this.messageServer(JSON.stringify({'res': true}));
    this.peers = {};
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
    return this.webSocket.send(message);
  }

  private gotIceCandidate(event: RTCPeerConnectionIceEvent, recipientID: number) {
    if (event.candidate != null) {
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
      console.log(track);
    });
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
    this.localstream.getTracks().forEach(track => {
      track.enabled = false;
    });
  }

  public unmuteLocalVideo(): void {
    this.localstream.getTracks().forEach(track => {
      track.enabled = true;
    });
  }
}
