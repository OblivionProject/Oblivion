import { Injectable } from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import {Meeting} from "../models/meeting.model";
import {PartialObserver, Subject} from 'rxjs';
import {webSocket} from 'rxjs/webSocket';

export const WS_ENDPOINT = 'ws://localhost:8080';//'ws://172.28.204.8:8080';//'ws://localhost:8080'; // TODO: Config file for this
@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  private socket$!: WebSocketSubject<Meeting>;
  private messagesSubject = new Subject<Meeting>();
  public messsage$ = this.messagesSubject.asObservable();

  private user_id!: number;

  private peerConnection!: RTCPeerConnection;

  // private serverConnection!: WebSocket;
  private peerConnectionConfig = {
    'iceServers': [
      {'urls': 'stun:stun.stunprotocol.org:3478'},
      {'urls': 'stun:stun.l.google.com:19302'},
    ]
  };

  constructor() { }

  public connect(): void{
    this.socket$ = this.getNewWebSocket();

    // this.socket$.subscribe(this.receivedMessage());

    this.socket$.subscribe(
      msg => {
        // console.log('Received message of type:' + msg.title);
        // this.messagesSubject.next(msg);
        this.receivedMessage(msg);
      }
    );
  }

  private receivedMessage(message: Meeting): void {
    // const signal = JSON.parse(message);
    //
    // if (signal.user_id == this.user_id) return;
    //
    // if(signal.sdp) {
    //   this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
    //     // Only create answers in response to offers
    //     if(signal.sdp.type == 'offer') {
    //       this.peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
    //     }
    //   }).catch(errorHandler);
    // } else if(signal.ice) {
    //   peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    // }

  }

  public disconnect(): void{
    this.socket$.unsubscribe();
  }

  sendMessage(msg: Meeting): void {
    console.log('Sending Message:' + msg.title);
    this.socket$.next(msg);
  }

  private getNewWebSocket(): WebSocketSubject<any> {
    return webSocket({
      url : WS_ENDPOINT,
      openObserver: {
        next: () => {
          console.log('DataService: connection OK');
        }
      },
      closeObserver: {
        next: () => {
          console.log('DataService: connection Closed');
          // this.socket$ = null;
          //this.connect(); // try to reconnect TODO: Ask Joe why this is here
        }
      }
    });
  }
}
