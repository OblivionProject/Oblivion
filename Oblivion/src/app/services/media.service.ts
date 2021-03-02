import { Injectable } from '@angular/core';
import {MeetingService} from "./meeting.service";
import {WebSocketSubject} from "rxjs/internal-compatibility";
import {Meeting} from "../models/meeting.model";
import {Subject} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {ignoreElements} from "rxjs/operators";

export const WS_ENDPOINT = 'ws://localhost:8080';//'ws://172.28.204.8:8080';  // 'ws://localhost:8080';

const mediaConstraints = {
  audio: true,
  video: true
};

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private server!: WebSocket;
  private userId!: number;
  private remoteStreams: {[key: number]: MediaStream};
  private peers: {[key: number]: RTCPeerConnection};
  private localstream!: MediaStream;
  private peerConnectionConfig = {  // TODO: Verify the ice servers we want to use
    'iceServers': [
      {'urls': 'stun:stun.stunprotocol.org:3478'},
      {'urls': 'stun:stun.l.google.com:19302'},
    ]
  };

  constructor() {
    this.remoteStreams = {};
    this.peers = {};
  }

  // ----- WebRTC prototype functions -----
  public setupWebRTC(): void {
    this.server = new WebSocket(WS_ENDPOINT);
    this.server.onmessage = (message: MessageEvent) => this.receivedRequestFromServer(message);
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
      peer.addTrack(track);  // Add The local audio and video tracks to the peer conneciton
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

  private receivedRequestFromServer(message: MessageEvent) {

    const signal = JSON.parse(message.data);

    // Debugging Statements TODO: Remove
    // console.log('Request from Server:');
    // console.log(message);

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
    const message = JSON.stringify({'sdp': peer.localDescription, 'userId': this.userId, 'recipientID': recipientID});
    this.messageServer(message);
  }

  private messageServer(message: string) {
    // TODO: Does this need error handling?
    return this.server.send(message);
  }

  private gotIceCandidate(event: RTCPeerConnectionIceEvent, recipientID: number) {
    if (event.candidate != null) {
      this.server.send(JSON.stringify({'ice': event.candidate, 'userId': this.userId, 'recipientID': recipientID }));
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

  public getRemoteStreams(): {[key: number]: MediaStream} {//Array<MediaStream> {
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
    })
  }
}
