import {AfterViewInit, Component, ElementRef, ViewChild, OnDestroy, OnInit} from '@angular/core';
import {TitleModel} from '../../models/title.model';
import {MediaService} from '../../services/media.service';
import {MatDialog} from '@angular/material/dialog';
import {MeetingInfoDialogComponent} from '../meeting-info-dialog/meeting-info-dialog.component';
import {MeetingInfo} from '../../models/meeting-info';
import {Router} from '@angular/router';
import {WebsocketService} from '../../services/websocket.service';
import {Message} from "../../../../modules/message";

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css'],
  providers: [MediaService, WebsocketService]
})

export class MeetingComponent implements AfterViewInit, OnInit {

  @ViewChild('local_video') localVideo!: ElementRef; // Reference to the local video
  private remoteStreams: {[key: number]: MediaStream};
  public tile: TitleModel =  {cols: 1, rows: 1, text: 'Test Meeting', video : 'local_video', name: 'Joe'};
  public video: boolean; // Flag for if video is on or off
  public audio: boolean; // Flag for if audio is on or off
  public meetingInfo: MeetingInfo;
  public overrideGuard: boolean;
  public unReadMessageCount: number;
  public chat: boolean;  // Flag for if the chat box is open

  constructor(
    private mediaService: MediaService,
    public dialog: MatDialog,
    private router: Router,
    private websocketService: WebsocketService
  ) {
    MeetingComponent.appendWebRTCAdapterScript();
    this.video = true;
    this.audio = true;
    this.chat = false;
    this.remoteStreams = {};
    this.meetingInfo = new MeetingInfo();
    this.overrideGuard = false;
    this.unReadMessageCount = 0;
  }

 // TODO: Move this function. needed for the cleanup of message objects
  public getUserId(): number {
    return this.mediaService.getUserId();
  }

  private static appendWebRTCAdapterScript(): void {
    const node = document.createElement('script');
    node.src = 'https://webrtc.github.io/adapter/adapter-latest.js';
    node.type = 'text/javascript';
    node.async = false;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  public ngOnInit(): void {
    this.mediaService.mySubject.subscribe((data: any) => {
      if (data == true) {
        this.overrideGuard = true;
        this.endMeeting();
      }
    });
  }

  public terminate(): void {
    this.mediaService.terminate();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.mediaService.setUpWebSocket(this.websocketService);
    await this.getLocalVideo();
    while (this.websocketService.getWebSocket().readyState !== 1);  // Ensure that the websocket is open before moving on... TODO: improve
    this.mediaService.requestMeetingInformation();
    this.remoteStreams = this.mediaService.getRemoteStreams();
  }

  // TODO: Add recipient ID option
  public sendChat(input: string): void {
    // TODO: Verify that the chat isn't too long
    if (input != null) {
      this.mediaService.sendChat(input);
    }
  }

  public getChatLog(): Array<Message> {
    const MessageLog = <Array<Message>>this.mediaService.getMessageLog();
    // if (this.chat) {
    //   this.unReadMessageCount = 0;
    // } else {
    //   this.unReadMessageCount += 1;
    // }
    return MessageLog;
  }

  // TODO: I think this function can be removed... Instead format in the html
  public printSubtitle(message: Message): string {
    const timestamp = message.timestamp;
    const origin = message.senderId;
    return (origin === this.mediaService.getUserId()) ? 'Sent @ ' + timestamp : 'Received @ ' + timestamp;
  }

  public autoGrowTextZone(e: any): void {
    e.target.style.height = '0px';
    e.target.style.height = (e.target.scrollHeight + 5) + 'px';
  }

  public textAreaTrigger(e: any, input: string): void {
    if (e.key === 'Enter') {
      this.sendChat(input);
    }
  }

  // TODO add input parameter based on chats
  public displayUnReadchat(): boolean {
    return this.unReadMessageCount !== 0;
  }

  async getLocalVideo(): Promise<void> {
    await this.mediaService.loadLocalStream();
    this.localVideo.nativeElement.srcObject = await this.mediaService.getLocalStream();
    this.localVideo.nativeElement.muted = true;
  }

  // Toggles the video between off and on
  public toggleVideo(): void {
    this.video = !this.video;
    if (this.video) {
      this.mediaService.unmuteLocalVideo();
    } else {
      this.mediaService.muteLocalVideo();
    }
  }

  // Toggles the audio between off and on
  public toggleAudio(): void {
    console.log('In audio');
    this.audio = !this.audio;
    if (this.audio) {
      this.mediaService.unmuteLocalAudio();
    } else {
      this.mediaService.muteLocalAudio();
    }
  }

  public start(): void {
    this.mediaService.requestMeetingInformation();
  }

  // Returns an array of the remote MediaStreams
  public getRemoteStreams(): MediaStream[] {
    return Object.values(this.remoteStreams);
  }

  // The functions in this section are intended for development use only
  public TEST() {
    console.log(Object.keys(this.mediaService.getPeers()).length);
    console.log(this.mediaService.getPeers());
  }

  public setMeetingInfo(): MeetingInfo {
    this.meetingInfo = this.mediaService.getMeetingInfo();
    return this.meetingInfo;
  }

  public openDialog(): void {
    this.setMeetingInfo();
    this.dialog.open(MeetingInfoDialogComponent, {
      width: '250px',
      height: '200px',
      position: {
        left: '0px',
        bottom: '15px'
      },
      data: {
        meeting_id: this.meetingInfo.meeting_id,
        user_type: this.meetingInfo.user_type,
        password: this.meetingInfo.password,
        name: this.meetingInfo.name
      }
    });
  }

  public endMeeting(): void {
    this.setMeetingInfo();
    this.router.navigate(['welcome']);
  }

  public endMeetingForAll(): void {
    this.mediaService.endMeetingForAll();
  }

  public leaveMeeting(): void {
    this.mediaService.leaveMeeting();
  }
}

