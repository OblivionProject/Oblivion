import {AfterViewInit, Component, ElementRef, ViewChild, OnDestroy, OnInit} from '@angular/core';
import {TitleModel} from '../../models/title.model';
import {MediaService} from '../../services/media.service';
import {MatDialog} from '@angular/material/dialog';
import {MeetingInfoDialogComponent} from '../meeting-info-dialog/meeting-info-dialog.component';
import {MeetingInfo} from '../../models/meeting-info';
import {Router} from '@angular/router';
import {WebsocketService} from '../../services/websocket.service';

export interface Message{
  message: string;
  origin: string;
  user: string;
}
@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css'],
  providers: [MediaService, WebsocketService]
})

export class MeetingComponent implements AfterViewInit, OnInit {

  @ViewChild('local_video') localVideo!: ElementRef; // Reference to the local video
  private remoteStreams: {[key: number]: MediaStream};
  public tile: TitleModel;
  public video: boolean; // Flag for if video is on or off
  public audio: boolean; // Flag for if audio is on or off
  public meetingInfo: MeetingInfo;
  public overrideGuard = false;
  public message: string;
  public unReadMessageCount = 0;
  public readMessageCount = 0;
  public chatOpen = false;
  public chat: boolean;  // Flag for if the chat box is open
  public users: string[] = ['everyone', 'test1', 'test2'];

  constructor(private mediaService: MediaService,
              public dialog: MatDialog,
              private router: Router,
              private websocketService: WebsocketService) {
    MeetingComponent.appendWebRTCAdapterScript();
    this.video = true;
    this.audio = true;
    this.chat = false;
    this.remoteStreams = {};
    this.meetingInfo = new MeetingInfo();
    this.message = '';
    this.unReadMessageCount = 0;
    this.readMessageCount = 0;
    this.chatOpen = false;
    this.tile = new TitleModel(2,1);
  }





  private static appendWebRTCAdapterScript(): void {
    const node = document.createElement('script');
    node.src = 'https://webrtc.github.io/adapter/adapter-latest.js';
    node.type = 'text/javascript';
    node.async = false;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  ngOnInit() {
    this.mediaService.mySubject.subscribe((data) => {
      if (data == true){
        this.overrideGuard = true;
        this.endMeeting();
      }
    });
  }

  terminate() {
    this.mediaService.terminate();
  }

  async ngAfterViewInit() {
    await this.mediaService.setUpWebSocket(this.websocketService);
    await this.getLocalVideo();
    this.mediaService.requestMeetingInformation();
    this.remoteStreams = this.mediaService.getRemoteStreams();
  }

  // TODO: Add recipient ID option
  public sendChat(input: string): void {
    // const chatElement = document.getElementById("chatInput");
    if (input != null) {
      this.mediaService.sendChat(input);  // Needs to be casted to a input element for the value method
      this.message = '';
    }
  }
  public getChatLog(): Array<JSON> {
    const MessageLog = this.mediaService.getMessageLog();
    // console.log(MessageLog);
    if (this.chatOpen) {
      console.log('this.chatOpen = true');
      this.readMessageCount = MessageLog.length;
      this.unReadMessageCount = 0;
    }else{
      console.log('this.chatOpen = false');
      this.unReadMessageCount = MessageLog.length - this.readMessageCount;
      // tslint:disable-next-line:only-arrow-functions typedef
      // setTimeout(function(){
      //   console.log(MessageLog.length);
      // }, 1000);
      console.log(MessageLog);
      console.log(MessageLog.length);
      console.log(this.unReadMessageCount);
      console.log(this.readMessageCount);
    }
    return MessageLog;
  }
  public printChat(json: JSON): string{
    // @ts-ignore
    return json.message;
  }
  public getOrigin(json: JSON): string{
    // @ts-ignore
    return json.origin;
  }
  public getTimeStamp(json: JSON): string{
    // @ts-ignore
    return json.timestamp;
  }
  public printSubtitle(json: JSON): string{
    // @ts-ignore
    const timestamp = this.getTimeStamp(json);
    const origin = this.getOrigin(json);
    return origin === 'SEND' ? 'Sent @ ' + timestamp : 'Received @ ' + timestamp;
  }
  public autoGrowTextZone(e: any): void {
    e.target.style.height = '0px';
    e.target.style.height = (e.target.scrollHeight + 5) + 'px';
  }

  public textAreaTrigger(e: any, input: string): void{
    console.log(e);
    if (e.key === 'Enter'){
      console.log('ENTER');
      this.sendChat(input);
    }
  }
  // TODO add input paramenter based on chats
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

  public start(isCaller: boolean): void {
    // this.mediaService.start(isCaller);
    this.mediaService.requestMeetingInformation();
    // this.remoteStreams = this.mediaService.getRemoteStreams();
  }

  public getRemoteStreams1() {
    this.remoteStreams = this.mediaService.getRemoteStreams();
    console.log(this.mediaService.getRemoteStreams());
    (Object.values(this.mediaService.getRemoteStreams())[0]as MediaStream).getTracks().forEach((track: MediaStreamTrack) => {
        console.log(track);
    });
    console.log(this.localVideo.nativeElement.srcObject);
  }

  // Returns an array of the remote MediaStreams
  public getRemoteStreams(): MediaStream[] {
    return Object.values(this.remoteStreams);
  }

  // Returns the meeting ID
  // public getMeetingID(): number {
  //   return this.mediaService.getMeetingID();
  // }

  // The functions in this section are intended for development use only
  public TEST() {
    console.log(Object.keys(this.mediaService.getPeers()).length);
    console.log(this.mediaService.getPeers());
  }

  public setMeetingInfo(){
    this.meetingInfo.setData(this.mediaService.getMeetingInfo());
    return this.meetingInfo;
  }
  public openDialog() {
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

  public endMeeting(){
    this.setMeetingInfo();
    this.router.navigate(['welcome']);
  }

  public endMeetingForAll(){
    this.mediaService.endMeetingForAll();
  }

  public leaveMeeting(){
    this.mediaService.leaveMeeting();
  }
}

