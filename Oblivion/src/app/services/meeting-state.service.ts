import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeetingStateService {
  public meetingID: number | undefined;
  public userName: string;
  public audio: boolean;
  public video: boolean;
  public cancel:boolean;

  constructor() {
    this.userName = 'Guest';
    this.audio = true;
    this.video = true;
    this.cancel = false;
  }
}
