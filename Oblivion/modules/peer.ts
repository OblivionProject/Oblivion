import {Message, MESSAGE_TYPE, verifyMessageFormat} from "./message";
import {User} from "./user";

export class Peer {

  private static user: User;  // This user shared by all peers
  private peer: RTCPeerConnection;
  private remoteStream: MediaStream;
  private dataChannel!: RTCDataChannel;
  private messageLog: Message[];
  private peerId: number;
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

    this.peerId = peerID;
    this.remoteStream = new MediaStream();
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
      const dataChannelLabel = Peer.user.getUserID() + '-' + this.peerId;
      this.dataChannel = this.peer.createDataChannel(dataChannelLabel);
      this.dataChannel.onopen = (event: Event) => this.handleDataChannelStatusChange(event);
      this.dataChannel.onclose = (event: Event) => this.handleDataChannelStatusChange(event);
      this.dataChannel.onmessage = (event: MessageEvent) => this.receivedChat(event, receivedMessageNotify);

    } else {
      this.peer.ondatachannel = (event: RTCDataChannelEvent) => this.receiveChannelCallback(event, receivedMessageNotify);
    }
  }

  public static setUser(user: User): void {
    this.user = user;
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
        recipientID: this.peerId
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
            recipientID: this.peerId
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
    }
  }

  private receiveChannelCallback(event: RTCDataChannelEvent, receiveMessageNotify: (message: Message) => void): void {
    this.dataChannel = event.channel;
    this.dataChannel.onmessage = (event: MessageEvent) => this.receivedChat(event, receiveMessageNotify);
    this.dataChannel.onopen = (event: Event) => this.handleDataChannelStatusChange(event);
    this.dataChannel.onclose = (event: Event) => this.handleDataChannelStatusChange(event);
  }

  private receivedChat(event: MessageEvent, notify: (message: Message) => void): void {
    const data = JSON.parse(event.data);

    if (verifyMessageFormat(data)) {
      const message = <Message>data;
      notify(message);
      this.logMessage(message);

    } else {
      this.logMessageError('Invalid message format by data. data: ' + data);
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
