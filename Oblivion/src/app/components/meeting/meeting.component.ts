import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {TitleModel} from '../../models/title.model';
import {MediaService} from '../../services/media.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})

export class MeetingComponent implements AfterViewInit {


  @ViewChild('local_video') localVideo!: ElementRef;
  private remoteStreams: {[key: number]: MediaStream} = {};

  tile: TitleModel =  {cols: 1, rows: 1, text: 'Test Meeting', video : 'local_video', name: 'Joe'};

  constructor(private mediaService: MediaService) {
    MeetingComponent.appendWebRTCAdapterScript();
  }

  async getLocalVideo(): Promise<void> {
    await this.mediaService.loadLocalStream();
    this.localVideo.nativeElement.srcObject = await this.mediaService.getLocalStream();
    this.localVideo.nativeElement.muted = true;
  }

  public muteLocalVideo(): void{
    this.mediaService.muteLocalVideo();
  }

  public unmuteLocalVideo(): void {
    this.mediaService.unmuteLocalVideo();
  }

  async ngAfterViewInit() {
    await this.getLocalVideo();
    this.mediaService.requestMeetingInformation();
    this.remoteStreams = this.mediaService.getRemoteStreams();
  }

  public start(isCaller: boolean): void {
    //this.mediaService.start(isCaller);
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

  public getRemoteStreams() {
    return Object.values(this.remoteStreams);
  }

  //-----------------------------------------------------------------------------
  // The functions in this section are intended for development use only
  public TEST() {
    console.log(Object.keys(this.mediaService.getPeers()).length);
    console.log(this.mediaService.getPeers());
  }

  public clearMeeting() {
    this.remoteStreams = [];
    this.mediaService.clearMeeting();
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
}
