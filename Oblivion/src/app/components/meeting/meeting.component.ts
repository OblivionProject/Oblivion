
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {TitleModel} from '../../models/title.model';
import {MediaService} from '../../services/media.service';


export interface Tile{
  number: number;
}

export interface Message{
  message: string;
  origin: string;
}


@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})



export class MeetingComponent implements AfterViewInit {

  constructor(private mediaService: MediaService) {
    MeetingComponent.appendWebRTCAdapterScript();
    this.video = false;
    this.audio = false;
  }


  @ViewChild('local_video') localVideo!: ElementRef;
  private remoteStreams: {[key: number]: MediaStream} = {};
  public testTiles: Tile[] = [
    {number: 1},
    {number: 2},
    {number: 3},
    {number: 4},
    {number: 5},
    {number: 6},
    {number: 7},
    // {number: 8},
    // {number: 9}
    ];

  public testMessage: Message[] = [
    {message: 'Test message 1 adsfasdf asdfasdf',
    origin: 'SEND'},
    {message: 'Test message 2',
      origin: 'RECEIVED'},
    // {message: 'Test message 3',
    //   origin: 'SEND'},
    // {message: 'Test message 1',
    //   origin: 'RECEIVED'},
    // {message: 'Test message 1',
    //   origin: 'SEND'},
    // {message: 'Test message 1',
    //   origin: 'RECEIVED'}
  ];
  tile: TitleModel =  {cols: 1, rows: 1, text: 'Test Meeting', video : 'local_video', name: 'Joe'};
  video: boolean;
  audio: boolean;
  pageNumber = 0;
  value = 'Clear me';
  // End development functions
  // -----------------------------------------------------------------------------

  private static appendWebRTCAdapterScript(): void {
    const node = document.createElement('script');
    node.src = 'https://webrtc.github.io/adapter/adapter-latest.js';
    node.type = 'text/javascript';
    node.async = false;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  async getLocalVideo(): Promise<void> {
    await this.mediaService.loadLocalStream();
    this.localVideo.nativeElement.srcObject = await this.mediaService.getLocalStream();
    this.localVideo.nativeElement.muted = true;
  }

  public getTileTest(): Tile[] {
    return this.testTiles.slice(this.pageNumber * 4, this.pageNumber * 4 + 4);
  }

  public nextPage(): void{
    if (!(this.pageNumber >=  this.testTiles.length / 4 - 1 )){this.pageNumber += 1; }
  }
  public prevPage(): void{
    if (this.pageNumber !== 0) {this.pageNumber -= 1; }
  }
  public muteLocalVideo(): void{
    this.mediaService.muteLocalVideo();
  }

  public unmuteLocalVideo(): void {
    this.mediaService.unmuteLocalVideo();
  }
  public testMessageFUNCTION(input: string): void{
    this.testMessage.push({message: input, origin: 'SEND'});

  }

  async ngAfterViewInit(): Promise<any> {
    await this.getLocalVideo();
    this.mediaService.requestMeetingInformation();
    this.remoteStreams = this.mediaService.getRemoteStreams();
  }

  public start(isCaller: boolean): void {
    // this.mediaService.start(isCaller);
    this.mediaService.requestMeetingInformation();
    // this.remoteStreams = this.mediaService.getRemoteStreams();
  }

  public getRemoteStreams1(): void {
    this.remoteStreams = this.mediaService.getRemoteStreams();
    console.log(this.mediaService.getRemoteStreams());
    (Object.values(this.mediaService.getRemoteStreams())[0]as MediaStream).getTracks().forEach((track: MediaStreamTrack) => {
      console.log(track);
    });
    console.log(this.localVideo.nativeElement.srcObject);
  }

  public getRemoteStreams() {
    return Object.values(this.remoteStreams);
  }

  // -----------------------------------------------------------------------------
  // The functions in this section are intended for development use only
  public TEST(): void {
    console.log(Object.keys(this.mediaService.getPeers()).length);
    console.log(this.mediaService.getPeers());
  }

  public clearMeeting(): void {
    this.remoteStreams = [];
    this.mediaService.clearMeeting();
  }
}
