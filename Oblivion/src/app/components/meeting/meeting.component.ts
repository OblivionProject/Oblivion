import {AfterViewInit, Component, ElementRef, ViewChild, OnInit, ChangeDetectorRef, HostListener} from '@angular/core';
import {TitleModel} from '../../models/title.model';
import {MediaService} from '../../services/media.service';
import {MatDialog} from '@angular/material/dialog';
import {MeetingInfoDialogComponent} from '../meeting-info-dialog/meeting-info-dialog.component';
import {MeetingInfo} from '../../models/meeting-info';
import {Router} from '@angular/router';
import {WebsocketService} from '../../services/websocket.service';
import {VideoOrderingService} from "../../services/video-ordering.service";


export interface Message{
  message: string;
  origin: string;
  user: string;
}
@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css'],
  providers: [MediaService, WebsocketService, VideoOrderingService]
})

export class MeetingComponent implements AfterViewInit, OnInit {

  public localStream: MediaStream | undefined;
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
  public height: any;
  public video_width: any;
  public video_height: any;
  public show_right:boolean;
  public show_left: boolean;

  constructor(private mediaService: MediaService,
              public dialog: MatDialog,
              private router: Router,
              private websocketService: WebsocketService,
              private videoOrderingService: VideoOrderingService,
              private elem: ElementRef,
              private cdref: ChangeDetectorRef) {
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
    this.show_right = false
    this.show_left = false;
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
    this.videoOrderingService.isTileChange.subscribe( value => {
      this.tile = value;
      console.log("MATHEW THE TILE HAS BEEN CHANGED IS"+value);
      const sizing = this.elem.nativeElement.querySelectorAll('.meeting_container')[0].offsetHeight;
      this.video_height = this.videoOrderingService.dynamicHeightSizer(window.innerHeight,this.height,sizing);
      this.video_width = this.videoOrderingService.dynamicWidthSizer(this.video_height);
      this.cdref.detectChanges();
    });
    this.videoOrderingService.isRightButtonShown.subscribe( value => {
      this.show_right = value;
      console.log("MATHEW THE RIGHT BUTTON IS"+this.show_right);
      this.cdref.detectChanges();
    });
    this.videoOrderingService.isLeftButtonShown.subscribe( value => {
      this.show_left = value;
      console.log("MATHEW THE LEFT BUTTON IS"+this.show_left);
      this.cdref.detectChanges();
    });
  }

  terminate() {
    this.mediaService.terminate();
  }

  public moveRight():void{
    this.videoOrderingService.moveRight();
  }

  public moveLeft():void{
    this.videoOrderingService.moveLeft();
  }

  async ngAfterViewInit() {
    await this.mediaService.setUpWebSocket(this.websocketService);
    await this.getLocalVideo();
    this.mediaService.requestMeetingInformation();
    this.remoteStreams = this.mediaService.getRemoteStreams();

    //Window Sizing
    const sizing = this.elem.nativeElement.querySelectorAll('.meeting_container')[0].offsetHeight;
    this.height = window.innerHeight - sizing*2;
    this.videoOrderingService.setVideosSizing(window.innerWidth);
    this.videoOrderingService.setTiles();
    this.video_height = this.videoOrderingService.dynamicHeightSizer(window.innerHeight,this.height,sizing);
    this.video_width = this.videoOrderingService.dynamicWidthSizer(this.video_height);
  }

  @HostListener('window:resize')
  onResize() {
    const sizing = this.elem.nativeElement.querySelectorAll('.meeting_container')[0].offsetHeight;
    this.height = window.innerHeight - sizing*2;

    // this.videoOrderer.setVideosSizing(window.innerWidth);
    // this.videoOrderer.setTiles();
    // this.video_height = this.videoOrderer.dynamicHeightSizer(window.innerHeight,this.height,sizing);
    // this.video_width = this.videoOrderer.dynamicWidthSizer(this.video_height);
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
    this.localStream = await this.mediaService.getLocalStream();
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

  // Returns an array of the remote MediaStreams
  public getStreams(): MediaStream[] {
    if(this.videoOrderingService.videos_count!=Object.values(this.remoteStreams).length+1){
      console.log(Object.values(this.remoteStreams).length+1);
      this.videoOrderingService.videos_count = Object.values(this.remoteStreams).length+1;
      this.videoOrderingService.setVideosSizing(window.innerWidth);
      this.videoOrderingService.setTiles();
    }
    if(this.localStream != undefined){
      return ([this.localStream].concat(Object.values(this.remoteStreams)).slice(this.videoOrderingService.video_start_index, this.videoOrderingService.video_end_index))
    }
    else{
      return [];
    }
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

