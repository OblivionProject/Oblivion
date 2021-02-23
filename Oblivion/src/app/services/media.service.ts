import { Injectable } from '@angular/core';
import {MeetingService, WS_ENDPOINT} from "./meeting.service";
import {WebSocketSubject} from "rxjs/internal-compatibility";
import {Meeting} from "../models/meeting.model";
import {Subject} from "rxjs";
import {webSocket} from "rxjs/webSocket";

const mediaConstraints = {
  audio: true,
  video: true// {width: 720, height: 540},  // TODO: Make this dynamic
};

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private localstream!: MediaStream;
  private remoteStreams!: Array<MediaStream>;

  //----- Adding for webrtc prototype -----
  // private socket$!: WebSocketSubject<Meeting>;
  // private messagesSubject = new Subject<Meeting>();
  // public messsage$ = this.messagesSubject.asObservable();
  // TODO: Verify the ice servers we want to do
  private peerConnectionConfig = {
    'iceServers': [
      {'urls': 'stun:stun.stunprotocol.org:3478'},
      {'urls': 'stun:stun.l.google.com:19302'},
    ]
  };

  private server!: WebSocket;
  private userId!: number;
  private remoteStream!: MediaStream;
  private peer!: RTCPeerConnection;
  //----- End new vars for webrtc proto-----

  constructor(private meetingService: MeetingService) {
    this.remoteStreams = [];
    this.userId = this.createUserID();
    this.remoteStream = new MediaStream();
  }

  // ----- WebRTC prototype functions -----
  public setupWebRTC(): void {
    this.server = new WebSocket('ws://localhost:8080');
    this.server.onmessage = (message: MessageEvent) => this.receivedRequestFromServer(message);
  }

  public start(isCaller: boolean): void {
    this.peer = new RTCPeerConnection(this.peerConnectionConfig);
    this.peer.onicecandidate = (event) => this.gotIceCandidate(event);
    this.peer.ontrack = (event) => this.gotRemoteStream(event);
    this.localstream.getTracks().forEach((track) => {
      this.peer.addTrack(track);
    });


    if(isCaller) {
      this.peer.createOffer()
        .then((description) => this.createdDescription(description))
        .catch(this.errorHandler);
    }
  }

  private receivedRequestFromServer(message: MessageEvent) {
    if(!this.peer) {
      this.start(false);
    }

    const signal = JSON.parse(message.data);

    // Ignore messages from ourself
    if(signal.userId == this.userId) return;

    console.log('Request from Server:');
    console.log(message);

    if(signal.sdp) {
      this.peer.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
        // Only create answers in response to offers
        if(signal.sdp.type == 'offer') {
          this.peer.createAnswer()
            .then((description: RTCSessionDescriptionInit) => this.createdDescription(description))
            .catch(this.errorHandler);
        }
        })
        .catch(this.errorHandler);
    } else if(signal.ice) {
      this.peer.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(this.errorHandler);
    }
  }

  private createdDescription(description: RTCSessionDescriptionInit): void {
    this.peer.setLocalDescription(description)
      .then(() => this.sendDescription())
      .catch(this.errorHandler);
  }

  private sendDescription(): void {
    const message = JSON.stringify({'sdp': this.peer.localDescription, 'userId': this.userId});
    this.messageServer(message);
  }

  private messageServer(message: string) {
    // TODO: Does this need error handling?
    return this.server.send(message);
  }

  private gotIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate != null) {
      this.server.send(JSON.stringify({'ice': event.candidate, 'userId': this.userId}));
    }
  }

  private gotRemoteStream(event: RTCTrackEvent) {
    console.log('Received Track Event');
    console.log(event);
    this.remoteStream.addTrack(event.track);
    this.remoteStreams[0] = this.remoteStream;
    this.remoteStreams[0].getTracks().forEach(track => {
      track.enabled = true;
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

  loadRemoteStreams() {

    // this.remoteStreams[0] = this.localstream;
    // this.remoteStreams[1] = this.remoteStreams[0];
    // this.remoteStreams[2] = this.remoteStreams[0];
  }

 public getLocalStream(): MediaStream {
    return this.localstream;
  }

  public getRemoteStreams(): Array<MediaStream> {
    return this.remoteStreams;
  }

  public muteLocalVideo(): void{
    this.localstream.getTracks().forEach(track => {
      track.enabled = false;
    });
  }

  public unmuteLocalVideo(): void {
    this.localstream.getTracks().forEach(track => {
      track.enabled = true;
    })
  }

  // TODO: Replace this, terrible implementation for just getting 2 peers working TESTING ONLY
  // Selects a random number number from 0-1
  private createUserID(): number {
    return Math.random();
  }

}
