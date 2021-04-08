<<<<<<< 3a22e46bb15e3309fb360c9830f582e1b74381d8

import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
=======
import {AfterViewInit, Component, ElementRef, HostListener, ViewChild, Inject} from '@angular/core';
>>>>>>> Create meeting dialog function
import {TitleModel} from '../../models/title.model';
import {MediaService} from '../../services/media.service';
import { Observable, of } from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MeetingInfoDialogComponent} from "../meeting-info-dialog/meeting-info-dialog.component";

//TODO: Move to its own model class
export interface MeetingInfoData {
  meeting_id: string;
  user_type: string;
  password: string;
}


@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})

export class MeetingComponent implements AfterViewInit {


  @ViewChild('local_video') localVideo!: ElementRef; // Reference to the local video
  private remoteStreams: {[key: number]: MediaStream};
  public tile: TitleModel =  {cols: 1, rows: 1, text: 'Test Meeting', video : 'local_video', name: 'Joe'};
  public video: boolean; // Flag for if video is on or off
  public audio: boolean; // Flag for if audio is on or off

<<<<<<< 4d659dc6746522d8a54b42cf21f72c94c4bb6350
  public chat: boolean;  // Flag for if the chat box is open

  constructor(private mediaService: MediaService) {
=======
  constructor(private mediaService: MediaService, public dialog: MatDialog) {
>>>>>>> Create meeting dialog function
    MeetingComponent.appendWebRTCAdapterScript();
    this.video = true;
    this.audio = true;
    this.chat = false;
    this.remoteStreams = {};
  }

  async ngAfterViewInit() {
    await this.getLocalVideo();
    this.mediaService.requestMeetingInformation();
    this.remoteStreams = this.mediaService.getRemoteStreams();
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

  // Returns an array of the remote MediaStreams
  public getRemoteStreams(): MediaStream[] {
    return Object.values(this.remoteStreams);
  }

  // Returns the meeting ID
  public getMeetingID(): number {
    return this.mediaService.getMeetingID();
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

  @HostListener('window:unload', ['$event'])
  unloadHandler(): void {
    this.mediaService.terminate();
  }


  private static appendWebRTCAdapterScript(): void {
    let node = document.createElement('script');
    node.src = "https://webrtc.github.io/adapter/adapter-latest.js";
    node.type = 'text/javascript';
    node.async = false;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  canDeactivate(): Observable<boolean> | boolean {
      const result = window.confirm('Are you sure you would like to leave the meeting?');
      return of(result);
  }

  openDialog() {
    this.dialog.open(MeetingInfoDialogComponent, {
      data: {
        meeting_id: 'panda',
        user_type: 'panda',
        password: ''
      }
    });
  }

}
