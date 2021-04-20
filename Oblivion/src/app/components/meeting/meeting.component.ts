import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';
import {MediaService} from '../../services/media.service';
import {MatDialog} from '@angular/material/dialog';
import {MeetingInfoDialogComponent} from "../meeting-info-dialog/meeting-info-dialog.component";
import {MeetingInfo} from "../../models/meeting-info";
import {Router} from "@angular/router";
import {WebsocketService} from "../../services/websocket.service";
import {VideoOrderingService} from "../../services/video-ordering.service";
import {TitleModel} from "../../models/title.model";

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css'],
  providers: [MediaService, WebsocketService, VideoOrderingService]
})

export class MeetingComponent implements AfterViewInit, OnInit {

  //@ViewChild('local_video') localVideo!: ElementRef; // Reference to the local video
  public localStream: MediaStream | undefined;
  private remoteStreams: {[key: number]: MediaStream};
  public video: boolean; // Flag for if video is on or off
  public audio: boolean; // Flag for if audio is on or off
  public meetingInfo: MeetingInfo;
  public overrideGuard: boolean = false;
  public chat: boolean;  // Flag for if the chat box is open
  public height: any;
  public video_width: any;
  public video_height: any;
  public show_right: boolean;
  public show_left: boolean;
  public tiles: TitleModel;

  constructor(private mediaService: MediaService,
              public dialog: MatDialog,
              private router: Router,
              private websocketService: WebsocketService,
              private elem: ElementRef,
              private cdref: ChangeDetectorRef,
              public videoOrderer: VideoOrderingService) {
    MeetingComponent.appendWebRTCAdapterScript();
    this.video = true;
    this.audio = true;
    this.chat = false;
    this.remoteStreams = {};
    this.meetingInfo = new MeetingInfo();
    this.show_right = false;
    this.show_left = false;
    this.tiles = new TitleModel(4,1);
  }

  ngOnInit() {
    this.mediaService.mySubject.subscribe((data) => {
      if(data==true){
        this.overrideGuard = true;
        this.endMeeting();
      }
    })
    this.videoOrderer.isRightButtonShown.subscribe( value => {
      this.show_right = value;
      console.log("MATHEW THE RIGHT BUTTON IS"+this.show_right);
      this.cdref.detectChanges();
    });

    this.videoOrderer.isLeftButtonShown.subscribe( value => {
      this.show_left = value;
      console.log("MATHEW THE LEFT BUTTON IS"+this.show_left);
      this.cdref.detectChanges();
    });

    this.videoOrderer.isTileChange.subscribe( value => {
      this.tiles = value;
      console.log("MATHEW THE TILE HAS BEEN CHANGED IS"+value);
      const sizing = this.elem.nativeElement.querySelectorAll('.meeting_container')[0].offsetHeight;
      this.video_height = this.videoOrderer.dynamicHeightSizer(window.innerHeight,this.height,sizing);
      this.video_width = this.videoOrderer.dynamicWidthSizer(this.video_height);
      this.cdref.detectChanges();
    });
  }

  public moveRight():void{
    this.videoOrderer.moveRight();
  }
  public moveLeft():void{
    this.videoOrderer.moveLeft();
  }

  @HostListener('window:resize')
  onResize() {
    const sizing = this.elem.nativeElement.querySelectorAll('.meeting_container')[0].offsetHeight;
    this.height = window.innerHeight - sizing*2;

    this.videoOrderer.setVideosSizing(window.innerWidth);
    this.videoOrderer.setTiles();
    this.video_height = this.videoOrderer.dynamicHeightSizer(window.innerHeight,this.height,sizing);
    this.video_width = this.videoOrderer.dynamicWidthSizer(this.video_height);
  }

  terminate() {
    this.mediaService.terminate();
  }

  async ngAfterViewInit() {
    await this.mediaService.setUpWebSocket(this.websocketService);
    await this.getLocalVideo();
    this.mediaService.requestMeetingInformation();
    this.remoteStreams = this.mediaService.getRemoteStreams();

    //Window Sizing
    const sizing = this.elem.nativeElement.querySelectorAll('.meeting_container')[0].offsetHeight;
    this.height = window.innerHeight - sizing*2;
    this.videoOrderer.setVideosSizing(window.innerWidth);//adjust ordering of videos
    this.video_height = this.videoOrderer.dynamicHeightSizer(window.innerHeight,this.height,sizing);
    this.video_width = this.videoOrderer.dynamicWidthSizer(this.video_height);
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  // TODO: Add recipient ID option
  public sendChat(): void {
    const chatElement = document.getElementById("chatInput");
    if (chatElement != null) {
      this.mediaService.sendChat((<HTMLInputElement>chatElement).value);  // Needs to be casted to a input element for the value method
    }
  }

  async getLocalVideo(): Promise<void> {
      await this.mediaService.loadLocalStream();
      this.localStream = await this.mediaService.getLocalStream();
      // this.localVideo.nativeElement.muted = true;
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
    this.mediaService.requestMeetingInformation();
  }

  // Returns an array of the remote MediaStreams
  public getStreams(): MediaStream[] {
    if(this.videoOrderer.videos_count!=Object.values(this.remoteStreams).length+1){
      console.log(Object.values(this.remoteStreams).length+1);
      this.videoOrderer.videos_count = Object.values(this.remoteStreams).length+1;
      this.videoOrderer.setVideosSizing(window.innerWidth);
      this.videoOrderer.setTiles();
    }
    if(this.localStream != undefined){
      return ([this.localStream].concat(Object.values(this.remoteStreams)).slice(this.videoOrderer.video_start_index, this.videoOrderer.video_end_index))
    }
    else{
      return [];
    }
  }

  //-----------------------------------------------------------------------------
  // The functions in this section are intended for development use only
  public TEST() {
    console.log(Object.keys(this.mediaService.getPeers()).length);
    console.log(this.mediaService.getPeers());
  }

  // End development functions
  //-----------------------------------------------------------------------------

  private static appendWebRTCAdapterScript(): void {
    let node = document.createElement('script');
    node.src = "https://webrtc.github.io/adapter/adapter-latest.js";
    node.type = 'text/javascript';
    node.async = false;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);
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

