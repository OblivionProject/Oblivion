import {Message, MESSAGE_TYPE, verifyMessageFormat} from "./message";
import {User, USER_ROLE} from "./user";

export class Peer {

  private static user: User;  // This user shared by all peers
  private peer: RTCPeerConnection;
  private remoteStream: MediaStream;
  private audio: boolean;  // MediaStream Audio is disabled or enabled
  private video: boolean;  // MediaStream Video is disabled or enabled
  private dataChannel!: RTCDataChannel;
  private messageLog: Message[];
  private peerUser!: User;
  private peerConnectionConfig: RTCConfiguration = {  // TODO: Verify the ice servers we want to use, add turn servers?
    iceServers: [
      {urls: 'stun:stun.stunprotocol.org:3478'},
      {urls: 'stun:stun.l.google.com:19302'},
    ]
  };

  constructor(
    peerID: number,
    initSeq: boolean,
    localStream: MediaStream,
    webSocket: WebSocket,
    receivedMessageNotify: (message: Message) => void
  ) {

    // if (Peer.userID == 'undefined') {
    //   // TODO: Do something here
    // }

    this.peerUser = new User('', peerID, USER_ROLE.guest);

    this.remoteStream = new MediaStream();
    this.audio = true;
    this.video = true;
    this.messageLog = [];

    this.peer = new RTCPeerConnection(this.peerConnectionConfig);
    this.peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => this.gotIceCandidate(event, webSocket);
    this.peer.ontrack = (event: RTCTrackEvent) => this.gotRemoteStream(event);
    this.peer.onconnectionstatechange = (event: Event) => this.handlePeerConnectionStateChange(event, webSocket);
    this.peer.oniceconnectionstatechange = (event: Event) => this.handleIceConnectionStateChange(event, webSocket);
    localStream.getTracks().forEach((track: MediaStreamTrack) => {
      this.peer.addTrack(track);  // Add The local audio and video tracks to the peer connection
    });

    // Only create the data channel if we are initializing it.
    if (initSeq) {
      const dataChannelLabel = Peer.user.getUserID() + '-' + this.peerUser.getUserID();//this.peerId;
      this.dataChannel = this.peer.createDataChannel(dataChannelLabel);
      this.dataChannel.onopen = (event: Event) => this.handleDataChannelStatusChange(event);
      this.dataChannel.onclose = (event: Event) => this.handleDataChannelStatusChange(event);
      this.dataChannel.onmessage = (event: MessageEvent) => this.receivedMessage(event, receivedMessageNotify);

    } else {
      this.peer.ondatachannel = (event: RTCDataChannelEvent) => this.receiveChannelCallback(event, receivedMessageNotify);
    }
  }

  public static setUser(user: User): void {
    this.user = user;
  }

  public setRemoteStream(stream: MediaStream): void {
    this.remoteStream = stream;
  }

  public setPeerUser(peerUser: User): void {
    this.peerUser = peerUser;
  }

  public getPeerUser(): User {
    return this.peerUser;
  }

  public getAudio(): boolean {
    return this.audio;
  }

  public getVideo(): boolean {
    return this.video;
  }

  // TODO: Add a return type of boolean to make sure it sends or add error checking?
  public sendMessage(message: Message): void {
    if (this.dataChannel.readyState === "open") {
      this.messageLog.push(message);
      this.dataChannel.send(JSON.stringify(message));
    }
  }

  public getRemoteStream(): MediaStream {
    return this.remoteStream;
  }

  public close(): void {
    this.peer.close();
  }

  public createPeerOffer(webSocket: WebSocket): void {
    this.peer.createOffer()
      .then((description: RTCSessionDescriptionInit) => this.createdDescription(description, webSocket))
      .catch(this.errorHandler);
  }

  public addIceCandidate(candidate: RTCIceCandidateInit | RTCIceCandidate): void {
    this.peer.addIceCandidate(candidate)
      .catch(this.errorHandler);
  }

  public setRemoteDescription(
    description: RTCSessionDescriptionInit,
    isOffer: boolean,
    webSocket: WebSocket
  ): void {
    this.peer.setRemoteDescription(description)
      .then(() => {
        if (isOffer) {
          this.peer.createAnswer()
            .then((descriptionInit: RTCSessionDescriptionInit) => this.createdDescription(descriptionInit, webSocket))
            .catch(this.errorHandler);
        }
      })
      .catch(this.errorHandler);
  }

  private createdDescription(description: RTCSessionDescriptionInit, webSocket: WebSocket): void {
    this.peer.setLocalDescription(description)
      .then(() => this.sendDescription(webSocket))
      .catch(this.errorHandler);
  }

  private sendDescription(webSocket: WebSocket): void {
    const message = JSON.stringify(
      {
        sdp: this.peer.localDescription,
        userId: Peer.user.getUserID(),
        recipientID: this.peerUser.getUserID()//this.peerId
      });
    webSocket.send(message);
  }

  private gotIceCandidate(
    event: RTCPeerConnectionIceEvent,
    webSocket: WebSocket
  ): void {
    if (event.candidate != null) {
      webSocket.send(
        JSON.stringify(
          {
            ice: event.candidate,
            userId: Peer.user.getUserID(),
            recipientID: this.peerUser.getUserID()//this.peerId
          }));
    }
  }

  private gotRemoteStream(event: RTCTrackEvent): void {
    this.remoteStream.addTrack(event.track);
    this.remoteStream.getTracks().forEach(track => {
      track.enabled = true;
    });
  }

  private handleIceConnectionStateChange(event: Event, webSocket: WebSocket): void {
    switch (this.peer.iceConnectionState) {
      case "failed":
      case "disconnected":
        this.iceRestart(webSocket);  // Attempt to restart the connection
        break;
      case "closed":
        this.peer.close();  // Removes the peer and stream from their respective objects if the connection fails
    }
  }

  private handlePeerConnectionStateChange(event: Event, webSocket: WebSocket): void {
    switch (this.peer.connectionState) {
      case "failed":
      case "disconnected":
        this.iceRestart(webSocket);  // Attempt to restart the connection
        break;
      case "closed":
        this.peer.close();  // Removes the peer and stream from their respective objects if the connection fails
    }
  }

  private iceRestart(webSocket: WebSocket): void {
    this.peer.createOffer({iceRestart: true})
      .then((description: RTCSessionDescriptionInit) => this.createdDescription(description, webSocket))
      .catch(this.errorHandler);
  }

  private handleDataChannelStatusChange(event: Event): void {
    const state = this.dataChannel.readyState;

    if (state === 'open') {
      // TODO: Unblock the sending of messages
      const timestamp = '';
      const data = {
        setPeerUser: true,
        name: Peer.user.getName(),
        role: Peer.user.getRole(),
        userID: Peer.user.getUserID()
      };
      const message: Message = {
        type: MESSAGE_TYPE.info,
        timestamp: timestamp,
        data: JSON.stringify(data),
        broadcast: false,
        senderId: Peer.user.getUserID(),
        recipientId: -1
      };
      this.sendMessage(message);
    }
  }

  private receiveChannelCallback(event: RTCDataChannelEvent, receiveMessageNotify: (message: Message) => void): void {
    this.dataChannel = event.channel;
    this.dataChannel.onmessage = (event: MessageEvent) => this.receivedMessage(event, receiveMessageNotify);
    this.dataChannel.onopen = (event: Event) => this.handleDataChannelStatusChange(event);
    this.dataChannel.onclose = (event: Event) => this.handleDataChannelStatusChange(event);
  }

  private receivedMessage(event: MessageEvent, notify: (message: Message) => void): void {
    const data = JSON.parse(event.data);

    if (verifyMessageFormat(data)) {
      const message = <Message>data;
      this.logMessage(message);

      switch (message.type) {
        case MESSAGE_TYPE.info:
          this.infoHandler(message);
          break;
        case MESSAGE_TYPE.chat:
          notify(message);
      }

    } else {
      this.logMessageError('Invalid message format by data. data: ' + data);
    }
  }

  private infoHandler(message: Message): void {
    if (message.type === MESSAGE_TYPE.info) {
      const data = JSON.parse(message.data);
      if (data.setPeerUser) {
        this.peerUser.setName(data.name);
        this.peerUser.setRole(data.role);

      } else if (data.muteAudio) {
        this.audio = false;

      } else if (data.unmuteAudio) {
        this.audio = true;

      } else if (data.muteVideo) {
        this.video = false;

      } else if (data.unmuteVideo) {
        this.video = true;
      }
    }
  }

  private logMessage(message: Message): void {
    this.messageLog.push(message);
  }

  private logMessageError(errorMessage: string): void {
    // Generate the Timestamp
    const timeInfo = new Date();
    const timestamp = timeInfo.getHours() + ':' + timeInfo.getMinutes();

    const message: Message = {
      type: MESSAGE_TYPE.error,
      timestamp: timestamp,
      data: errorMessage,
      broadcast: false,
      senderId: Peer.user.getUserID()
    }

    this.logMessage(message);
  }

  private errorHandler(error: Error): void {
    console.log(error);
  }
}
