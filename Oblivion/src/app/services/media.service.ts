import {Injectable} from '@angular/core';
import {WebsocketService} from "./websocket.service";
import {Subject} from "rxjs";
import {MeetingStateService} from "./meeting-state.service";
import {Message, MESSAGE_TYPE} from "../../../modules/message";
import {MeetingInfo} from "../models/meeting-info";
import {Peer} from "../../../modules/peer";

@Injectable()
export class MediaService {

  public mySubject : Subject<any> = new Subject<any>();
  destroy : boolean = false;  // TODO: What is this?
  // TODO: Why is this or undefined? Doesn't seem right... We should also get rid of all @ts-ignore
  private webSocket: WebSocket | undefined; // Server connection to get connected to peers
  private userId!: number; // This users ID
  private meetingID!: number; // Meeting ID
  private password!: string;
  private userRole!: string;
  private name!: string;
  private localstream!: MediaStream;  // Local video
  private peers: {[key: number]: Peer};
  private messageLog: Message[];

  private unreadMessageCount: number;

  constructor(private websocketService: WebsocketService, private sharedService: MeetingStateService) {
    this.websocketService.getWebSocket().onmessage = (message: MessageEvent) => this.receivedRequestFromServer(message);
    this.websocketService.getWebSocket().onclose = (closeEvent: CloseEvent) => console.log(closeEvent);
    this.websocketService.getWebSocket().onerror = (event: Event) => console.log(event);
    this.peers = {};
    this.messageLog = new Array<Message>();

    this.unreadMessageCount = 0;
  }

  // TODO: Should we get rid of this? Needed for the printSubtitle [change subtitle?]
  public getUserId(): number {
    return this.userId;
  }

  public setUpWebSocket(socket: WebsocketService): void {
    this.webSocket = socket.getWebSocket();
    this.webSocket.onmessage = (message: MessageEvent) => this.receivedRequestFromServer(message);
    this.webSocket.onclose = () => this.closedRequestFromServer();
    this.webSocket.onerror = (event: Event) => console.log(event);
    // @ts-ignore
    this.webSocket.onopen = () => this.webSocket.send(JSON.stringify({'start': true, 'meetingID': this.sharedService.meetingID}));
  }

  // This method is called on startup to join the current meeting
  public requestMeetingInformation(): void {
    const message = JSON.stringify({rmi: true});
    this.messageServer(message);
  }

  // Create a new RTCPeerConnection, add it to the list and return it
  private addNewRTCPeerConnection(userID: number, initSeq: boolean): Peer {
    // @ts-ignore
    const peer = new Peer(userID, initSeq, this.localstream, this.webSocket, () => this.incrementUnreadMessageCount);
    this.peers[userID] = peer;
    return peer;
  }

  public getMessageLog(): Array<Message> {
    return this.messageLog;
  }

  public getUnreadMessageCount(): number {
    return this.unreadMessageCount;
  }

  public incrementUnreadMessageCount(): void {
    this.unreadMessageCount += 1;
  }

  public sendChat(msg: string, recipientId?: number): void {
    // TODO: Add check to make sure message isn't too large
    // Generate the Timestamp
    const timeInfo = new Date();
    const timestamp = timeInfo.getHours() + ':' + timeInfo.getMinutes();

    const message: Message = {
      type: MESSAGE_TYPE.chat,
      timestamp: timestamp,
      data: msg,
      broadcast: true,
      senderId: this.userId
    };

    // Either broadcast the message to everyone or to the specified recipient
    if (recipientId) {
      this.peers[recipientId].sendMessage(message);
      this.logAndDisplayChat(message);

      } else {
        Object.keys(this.peers).forEach((key: string) => {
          const id = Number(key);
          this.peers[id].sendMessage(message);
        });
      }
  }

  // TODO: Change function name
  private logAndDisplayChat(data: Message): void {
    console.log(data); // TODO: Remove the log
    this.messageLog.push(data);  // Add the message data to the log
  }

  public closedRequestFromServer(): void {
    this.destroy = true;
    this.mySubject.next(this.destroy);
  }

  public receivedRequestFromServer(message: MessageEvent): void {

    const signal = JSON.parse(message.data);

    // Handle the Session Description Protocol messages
    if (signal.sdp && signal.userId != this.userId && signal.recipientID == this.userId) {
      const currentPeer = this.getPeerById(signal.userId);
      // @ts-ignore
      currentPeer.setRemoteDescription(
        new RTCSessionDescription(signal.sdp),
      signal.sdp.type == 'offer',
        <WebSocket>this.webSocket  // TODO: Look at this....
      );

      // Handle the ICE server information
    } else if (signal.ice && signal.userId != this.userId && signal.recipientID == this.userId) {
      const currentPeer: Peer = this.getPeerById(signal.userId);
      currentPeer.addIceCandidate(new RTCIceCandidate(signal.ice));

      // Handle the RMI response
    } else if (signal.rmi && this.userId == undefined) {
      this.userId = signal.userId;
      Peer.setUserID(this.userId);
      this.meetingID = signal.meetingID;
      this.password = signal.password;
      this.userRole = signal.userRole;
      this.name = signal.name;

      // Create new peer connection offers for each of the peers currently in the meeting
      signal.clientIDs.forEach((id: number) => {
        if (id != this.userId) {
          // @ts-ignore
          this.getPeerById(id, true).createPeerOffer(this.webSocket);
        }
      });
    }

    else if (signal.res) {
      if(signal.left){
        console.log(this.peers[signal.userID]);
        this.peers[signal.userID].close();
        delete this.peers[signal.userID];
      }
    }

    else if (signal.role_change) {
      this.userRole = signal.role;
      this.password = signal.password;
    }
  }

  private getPeerById(id: number, initSeq: boolean = false): Peer {
    if (id in this.peers) {
      return this.peers[id];
    }
    return this.addNewRTCPeerConnection(id, initSeq);
  }

  private messageServer(message: string): void {
    // TODO: Does this need error handling?
    // @ts-ignore
    return this.webSocket.send(message);
  }

  public async loadLocalStream(): Promise<void> {
    try {
      this.localstream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      this.localstream.getTracks().forEach(track => {
        track.enabled = true;
      });

    } catch (e) {
      console.log(e);
      this.localstream = new MediaStream();  // TODO: Replace this blank MediaStream w/ a static image + name?
    }
  }

  public getLocalStream(): MediaStream {
    return this.localstream;
  }

  public getRemoteStreams(): {[key: number]: MediaStream} {
    const remote: {[key: number]: MediaStream} = {};
    Object.keys(this.peers).forEach((key: string) => {
      const id = Number(key);
      remote[id] = this.peers[id].getRemoteStream();
    });

    return remote;
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

  public endMeetingForAll(): void {
    this.messageServer(JSON.stringify({'res': true, 'end': true, 'meetingID': this.meetingID}));
  }

  public leaveMeeting(): void {
    this.messageServer(JSON.stringify({'res': true, 'end': false, 'meetingID': this.meetingID}));
  }

  public getMeetingInfo(): MeetingInfo {
    const meetingInfo = new MeetingInfo();
    meetingInfo.setData(
      {
        'userRole': this.userRole,
        'meetingID': this.meetingID,
        'password': this.password,
        'name': this.name
      }
    );
    return meetingInfo;
  }

  public terminate(): void {
    console.log('Destroy Media Service');

    // Close Peer Connections
    Object.values(this.peers).forEach((peer: Peer) => {
      peer.close();
    });
    this.peers = {};

    // Close local tracks
    this.localstream.getTracks().forEach(function(track: MediaStreamTrack) {
      track.stop();
    });

    // @ts-ignore
    this.webSocket.close();
  }
}
