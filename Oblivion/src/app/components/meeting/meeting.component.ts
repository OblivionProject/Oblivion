import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  HostListener,
  AfterViewChecked, OnDestroy
} from '@angular/core';
import {TitleModel} from '../../models/title.model';
import {MediaService} from '../../services/media.service';
import {MatDialog} from '@angular/material/dialog';
import {MeetingInfoDialogComponent} from '../meeting-info-dialog/meeting-info-dialog.component';
import {MeetingInfo} from '../../models/meeting-info';
import {Router} from '@angular/router';
import {WebsocketService} from '../../services/websocket.service';
import {Message} from "../../../../modules/message";
import {VideoOrderingService} from "../../services/video-ordering.service";
import {Peer} from "../../../../modules/peer";
import {ParticipantsListDialogComponent} from "../participants-list-dialog/participants-list-dialog.component";


@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css'],
  providers: [MediaService, WebsocketService, VideoOrderingService]
})

export class MeetingComponent implements AfterViewInit, OnInit, AfterViewChecked, OnDestroy {

  public localStream: MediaStream | undefined;
  private remoteStreams: {[key: number]: MediaStream};
  public tile: TitleModel;
  public video: boolean; // Flag for if video is on or off
  public audio: boolean; // Flag for if audio is on or off
  public meetingInfo!: MeetingInfo;
  public overrideGuard: boolean;
  public unReadMessageCount: number;
  public readMessageCount: number;
  public chat: boolean;  // Flag for if the chat box is open
  public users: string[] = ['everyone', 'test1', 'test2'];
  public height: any;
  public overall_height: any;
  public video_width: any = undefined;
  public video_height: any;
  public show_right:boolean;
  public show_left: boolean;
  public messageWidth: any;
  public messageHeight: any;
  public meetingUpdates: any[];
  public roleUpdateMessage: any;
  public timer!: any;
  public footer_height: any;

  constructor(public mediaService: MediaService,
              public dialog: MatDialog,
              private router: Router,
              private websocketService: WebsocketService,
              private videoOrderingService: VideoOrderingService,
              private elem: ElementRef,
              private cdref: ChangeDetectorRef
  ) {
    MeetingComponent.appendWebRTCAdapterScript();
    this.video = this.mediaService.getStateService().video;
    this.audio = this.mediaService.getStateService().audio;
    this.chat = false;
    this.remoteStreams = {};
    this.overrideGuard = false;
    this.unReadMessageCount = 0;
    this.readMessageCount = 0;
    this.tile = new TitleModel(2,1);
    this.show_right = false
    this.show_left = false;
    this.meetingUpdates = [];
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
    this.videoOrderingService.isTileChange.subscribe( value => {
      this.tile = value;
      this.video_height = this.videoOrderingService.dynamicHeightSizer(this.height);
      if(this.tile.rows ===2){
        this.video_width = 3*(document.documentElement.clientWidth/2)/5;
      }
      else{
        this.video_width = undefined;
      }
      //this.video_width = this.videoOrderingService.dynamicWidthSizer(this.video_height);
      this.cdref.detectChanges();
    });
    this.videoOrderingService.isRightButtonShown.subscribe( value => {
      this.show_right = value;
      this.cdref.detectChanges();
    });
    this.videoOrderingService.isLeftButtonShown.subscribe( value => {
      this.show_left = value;
      this.cdref.detectChanges();
    });
    this.mediaService.messageSubject.subscribe( value => {
      this.cdref.detectChanges();
    });
    this.mediaService.messageUpdateSubject.subscribe(value => {
      this.meetingUpdates.push(value);
      this.cdref.detectChanges();
    });
    this.mediaService.roleChangeSubject.subscribe(value => {
      this.roleUpdateMessage = value;
      this.cdref.detectChanges();
    });
    this.timer = setInterval(() => { this.clearUpdateMessages(); }, 1000);
  }

  public ngOnDestroy() {
    clearInterval(this.timer);
  }

  public clearUpdateMessages():void{
    const currentTime = Date.now();
    console.log(currentTime);
    this.meetingUpdates = this.meetingUpdates.filter(message => message.timeStamp + 3000 >= currentTime);
    if(this.roleUpdateMessage !== undefined){
      if(currentTime > this.roleUpdateMessage.timeStamp + 4000){
        this.roleUpdateMessage = undefined;
      }
    }
  }

  public ngAfterViewChecked(): void {
    try {
      this.elem.nativeElement.querySelectorAll('.messagebox')[0].scrollTop = this.elem.nativeElement.querySelectorAll('.messagebox')[0].scrollHeight;
    }
    catch(err) { }
  }

  public terminate(): void {
    this.mediaService.terminate();
  }

  public moveRight(): void {
    this.videoOrderingService.moveRight();
  }

  public moveLeft(): void {
    this.videoOrderingService.moveLeft();
  }

  public adjustWindowSizing(): void {
    //Window Sizing
    //const sizing = this.elem.nativeElement.querySelectorAll('.meeting_container')[0].offsetHeight;
    this.height = (8*document.documentElement.clientHeight)/10;
    this.overall_height = (89*document.documentElement.clientHeight)/100;
    this.footer_height = (document.documentElement.clientHeight)/10;
    this.videoOrderingService.setVideosSizing(document.documentElement.clientWidth);
    this.videoOrderingService.setTiles();
    this.video_height = this.videoOrderingService.dynamicHeightSizer(this.height);
    //this.video_width = this.videoOrderingService.dynamicWidthSizer(this.video_height);
    this.messageHeight = this.height - this.elem.nativeElement.querySelectorAll('.chatInput')[0].offsetHeight;
    this.messageWidth = this.videoOrderingService.setMessageWidth(document.documentElement.clientWidth);
  }

  public async ngAfterViewInit(): Promise<void> {
    await this.mediaService.setUpWebSocket(this.websocketService);
    await this.getLocalVideo();
    while (this.websocketService.getWebSocket().readyState !== 1);  // Ensure that the websocket is open before moving on... TODO: improve
    this.mediaService.requestMeetingInformation();
    this.remoteStreams = this.mediaService.getRemoteStreams();

    //Window Sizing
    //const sizing = this.elem.nativeElement.querySelectorAll('.meeting_container')[0].offsetHeight;
    this.height = (8*document.documentElement.clientHeight)/10;
    this.overall_height = (89*document.documentElement.clientHeight)/100;
    this.footer_height = (document.documentElement.clientHeight)/10;
    this.videoOrderingService.setVideosSizing(document.documentElement.clientWidth);
    this.videoOrderingService.setTiles();
    this.video_height = this.videoOrderingService.dynamicHeightSizer(this.height);
    //this.video_width = this.videoOrderingService.dynamicWidthSizer(this.video_height);
    this.messageHeight = this.height - this.elem.nativeElement.querySelectorAll('.chatInput')[0].offsetHeight;
    this.messageWidth = this.videoOrderingService.setMessageWidth(document.documentElement.clientWidth);
  }

  @HostListener('window:resize')
  public onResize(): void {
    this.adjustWindowSizing();
  }

  @HostListener('window:beforeunload')
  async beforeUnloadHandler(){
    await this.leaveMeeting();
    await this.terminate();
  }

  public toggleDrawer():void{
    this.chat = !this.chat;
    this.videoOrderingService.showChat = this.chat;
    this.adjustWindowSizing();
  }


  // TODO: Add recipient ID option
  public sendChat(input: string): void {
    // TODO: Verify that the chat isn't too long
    if (input != null) {
      this.mediaService.sendChat(input);
      this.elem.nativeElement.querySelectorAll('.mat-input-element')[0].value = '';
    }
  }

  // TODO: Look at this
  public getChatLog(): Array<Message> {
    const MessageLog = <Array<Message>>this.mediaService.getMessageLog();
    if (this.chat) {
      this.readMessageCount = MessageLog.length;
      this.unReadMessageCount = 0;

    } else {
      this.unReadMessageCount = MessageLog.length - this.readMessageCount;
    }
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

  public async getLocalVideo(): Promise<void> {
    await this.mediaService.loadLocalStream();
    this.localStream = await this.mediaService.getLocalStream();
  }

  public getMeetingUpdates(): any[]{
    return this.meetingUpdates;
  }

  public getRoleUpdateMessage(): any{
    return this.roleUpdateMessage;
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
    return Object.values(this.mediaService.getRemoteStreams());
  }

  // Returns an array of the remote MediaStreams
  public getStreams(): MediaStream[] {
    // console.log("STERAM ASDFSADFA SDFASDFASDf");
    if (this.videoOrderingService.videos_count!=this.getRemoteStreams().length+1) {
      this.videoOrderingService.videos_count = this.getRemoteStreams().length+1;
      this.videoOrderingService.setVideosSizing(document.documentElement.clientWidth);
      this.videoOrderingService.setTiles();
    }
    if (this.localStream != undefined) {
      return ([this.localStream].concat(this.getRemoteStreams()).slice(this.videoOrderingService.video_start_index, this.videoOrderingService.video_end_index));
    } else {
      return [];
    }
  }

  private getRemotePeers(): Peer[] {
    return Object.values(this.mediaService.getPeers());
  }

  public getPeers(): Peer[] {
    if (this.videoOrderingService.videos_count!=this.getRemotePeers().length+1) {
      this.videoOrderingService.videos_count = this.getRemotePeers().length+1;
      this.videoOrderingService.setVideosSizing(document.documentElement.clientWidth);
      this.videoOrderingService.setTiles();
    }
    if (this.localStream != undefined) {
      return ([this.mediaService.pseudoPeer].concat(this.getRemotePeers()).slice(this.videoOrderingService.video_start_index, this.videoOrderingService.video_end_index));
    } else {
      return [];
    }
  }

  public getParticipants(): Peer[] {
    return [this.mediaService.pseudoPeer].concat(this.getRemotePeers());
  }

  public getAudioStreams(): MediaStream[] {
    return this.getRemoteStreams().filter((stream: MediaStream) => !this.getStreams().includes(stream));
  }

  public setMeetingInfo(): MeetingInfo {
    this.meetingInfo = this.mediaService.getMeetingInfo();
    return this.meetingInfo;
  }

  public incrementUnreadMessageCount(): void {
    this.unReadMessageCount = this.unReadMessageCount + 1;
  }

  public openDialog(): void {
    this.setMeetingInfo();
    this.dialog.open(MeetingInfoDialogComponent, {
      width: '250px',
      height: '200px',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      position: {
        left: '0px',
        bottom: '2em'
      },
      data: this.meetingInfo
    });
  }

  public openParticipantsList(): void {
    this.dialog.open(ParticipantsListDialogComponent, {
      width: '250px',
      height: '200px',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      position: {
        left: '0px',
        bottom: '2em'
      },
      data: this.getParticipants()
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

