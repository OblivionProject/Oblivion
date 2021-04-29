import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeetingStateService {
  public meetingID!: number;
  public userName: string;
  public audio: boolean;
  public video: boolean;
  public cancel: boolean;
  public mediaStream!: MediaStream;
  public videoFound: boolean;
  public audioFound: boolean;

  constructor() {
    this.userName = 'Guest';
    this.audio = true;
    this.video = true;
    this.cancel = false;
    this.videoFound = false;
    this.audioFound = false;
  }

  public setMediaStream(
    mediaStream: MediaStream,
    videoFound: boolean,
    audioFound: boolean
  ): void {
    this.mediaStream = mediaStream;
    this.videoFound = videoFound;
    this.audioFound = audioFound;
  }
}
