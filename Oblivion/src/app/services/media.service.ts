import {Injectable} from '@angular/core';
import {WebsocketService} from "./websocket.service";
import {Subject} from "rxjs";
import {MeetingStateService} from "./meeting-state.service";
import {Message, MESSAGE_TYPE} from "../../../modules/message";
import {MeetingInfo} from "../models/meeting-info";
import {Peer} from "../../../modules/peer";
import {User} from "../../../modules/user";

@Injectable()
export class MediaService {

  private user!: User;
  private meetingInfo!: MeetingInfo;
  private peers: {[key: number]: Peer};
  private localstream!: MediaStream;  // Local video
  private messageLog: Message[];
  public messageSubject : Subject<any> = new Subject<any>();
  private unreadMessageCount: number;
  // TODO: Why is this or undefined? Doesn't seem right... We should also get rid of all @ts-ignore
  private webSocket!: WebSocket; // Signalling server for connecting peers
  public mySubject : Subject<any> = new Subject<any>();
  public destroy : boolean = false;
  public messageUpdateSubject : Subject<any> = new Subject<any>();
  public roleChangeSubject : Subject<any> = new Subject<any>();

  constructor(private sharedService: MeetingStateService) {
    this.peers = {};
    this.messageLog = new Array<Message>();

    this.unreadMessageCount = 0;
  }

  // TODO: Should we get rid of this? Needed for the printSubtitle [change subtitle?]
  public getUserId(): number {
    return this.user.getUserID();
  }

  public setUpWebSocket(socket: WebsocketService): void {
    this.webSocket = socket.getWebSocket();
    this.webSocket.onmessage = (message: MessageEvent) => this.receivedRequestFromServer(message);
    this.webSocket.onclose = () => this.closedRequestFromServer();
    this.webSocket.onerror = (event: Event) => console.log(event);
    this.webSocket.onopen = () => this.webSocket.send(JSON.stringify({'start': true, 'meetingID': this.sharedService.meetingID}));
  }

  // This method is called on startup to join the current meeting
  public requestMeetingInformation(): void {
    const message = JSON.stringify({rmi: true});
    this.messageServer(message);
  }

  // Create a new RTCPeerConnection, add it to the list and return it
  private addNewRTCPeerConnection(userID: number, initSeq: boolean): Peer {
    const peer = new Peer(
      userID,
      initSeq,
      this.localstream,
      <WebSocket>this.webSocket,
      (message: Message) => this.receivedMessage(message)
    );
    this.peers[userID] = peer;
    const date = Date.now();
    this.messageUpdateSubject.next({
        'message': this.peers[userID].getPeerUser().getName()+ " has joined the meeting!",
        'timeStamp': date
      });
    return peer;
  }

  public getMessageLog(): Array<Message> {
    return this.messageLog;
  }

  public getChatLog(): Message[] {
    return this.messageLog.filter((message: Message) => message.type === MESSAGE_TYPE.chat);
  }

  public getUnreadMessageCount(): number {
    return this.unreadMessageCount;
  }

  public receivedMessage(message: Message) {
    this.messageLog.push(message);
    this.messageSubject.next(message);
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
      senderId: this.user.getUserID()
    };

    this.logAndDisplayChat(message);

    // Either broadcast the message to everyone or to the specified recipient
    if (recipientId) {
      this.peers[recipientId].sendMessage(message);

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
    if (signal.sdp && signal.userId != this.user.getUserID() && signal.recipientID == this.user.getUserID()) {
      const currentPeer = this.getPeerById(signal.userId);
      currentPeer.setRemoteDescription(
        new RTCSessionDescription(signal.sdp),
      signal.sdp.type == 'offer',
        this.webSocket  // TODO: Look at this
      );

      // Handle the ICE server information
    } else if (signal.ice && signal.userId != this.user.getUserID() && signal.recipientID == this.user.getUserID()) {
      const currentPeer: Peer = this.getPeerById(signal.userId);
      currentPeer.addIceCandidate(new RTCIceCandidate(signal.ice));

      // Handle the RMI response
    } else if (signal.rmi && !this.user) {
      this.user = new User(this.sharedService.userName, signal.userId, User.ROLE(signal.userRole));
      Peer.setUser(this.user);
      this.meetingInfo = new MeetingInfo(signal.meetingID, signal.name, this.user, signal.password);

      // Create new peer connection offers for each of the peers currently in the meeting
      signal.clientIDs.forEach((id: number) => {
        if (id != this.user.getUserID()) {
          this.getPeerById(id, true).createPeerOffer(this.webSocket);
        }
      });
    }

    else if (signal.res) {
      if (signal.left){
        console.log(this.peers[signal.userID]);
        this.peers[signal.userID].close();
        this.messageUpdateSubject.next(
          {
                  'message': this.peers[signal.userID].getPeerUser().getName()+ " has left the meeting!",
                  'timeStamp': Date.now()
          }
        );
        delete this.peers[signal.userID];
      }
    }

    else if (signal.role_change) {
      this.user.setRole(User.ROLE(signal.role));
      this.meetingInfo.setPassword(signal.password);
      this.roleChangeSubject.next({
        'message': "Your are now the owner of the meeting",
        'timeStamp': Date.now()
      });

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
    return this.webSocket.send(message);
  }

  public getStateService(): MeetingStateService{
    return this.sharedService;
  }

  public async loadLocalStream(): Promise<void> {
    this.localstream = new MediaStream();

    try {
      const videoStream: MediaStream = await navigator.mediaDevices.getUserMedia({video: true});
      videoStream.getVideoTracks().forEach((videoTrack: MediaStreamTrack) => {
        videoTrack.enabled = this.sharedService.video;
        this.localstream.addTrack(videoTrack);
      });

    } catch (error) {
      console.log('Unable to get video device');  // TODO: Add more robust catching
    }

    try {
      const audioStream: MediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
      audioStream.getAudioTracks().forEach((audioTrack: MediaStreamTrack) => {
        audioTrack.enabled = this.sharedService.audio;
        this.localstream.addTrack(audioTrack);
      });

    } catch (error) {
      console.log('Unable to get audio device');  // TODO: Add more robust catching
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
    this.messageServer(JSON.stringify({'res': true, 'end': true, 'meetingID': this.meetingInfo.meeting_id}));
  }

  public leaveMeeting(): void {
    this.messageServer(JSON.stringify({'res': true, 'end': false, 'meetingID': this.meetingInfo.meeting_id}));
  }

  public getMeetingInfo(): MeetingInfo {
    return this.meetingInfo;
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

    this.webSocket.close();
  }
}
