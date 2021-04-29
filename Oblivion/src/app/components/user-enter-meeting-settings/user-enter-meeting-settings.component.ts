import {AfterViewInit, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MeetingStateService} from "../../services/meeting-state.service";
import {Globals} from "../../global";

@Component({
  selector: 'app-user-enter-meeting-settings',
  templateUrl: './user-enter-meeting-settings.component.html',
  styleUrls: ['./user-enter-meeting-settings.component.css']
})
export class UserEnterMeetingSettingsComponent implements OnInit, OnDestroy {

  private localstream!: MediaStream;

  constructor(public dialogRef: MatDialogRef<UserEnterMeetingSettingsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: MeetingStateService) { }

  async ngOnInit(): Promise<void> {
    await this.loadLocalStream();
  }

  ngOnDestroy(): void {
    console.log("Destroyed");
    this.localstream.getTracks().forEach(function(track: MediaStreamTrack) {
      track.stop();
    });
  }

  public async loadLocalStream(): Promise<void> {
    // try {
    //   this.localstream = await navigator.mediaDevices.getUserMedia({
    //     audio: true,
    //     video: true
    //   });
    //   this.localstream.getTracks().forEach(track => {
    //     track.enabled = true;
    //   });
    //
    // } catch (e) {
    //   console.log(e);
    //   this.localstream = new MediaStream();  // TODO: Replace this blank MediaStream w/ a static image + name?
    // }
    this.localstream = new MediaStream();

    try {
      const videoStream: MediaStream = await navigator.mediaDevices.getUserMedia({video: true});
      videoStream.getVideoTracks().forEach((videoTrack: MediaStreamTrack) => {
        videoTrack.enabled = true;
        this.localstream.addTrack(videoTrack);
      });

    } catch (error) {
      console.log('Unable to get video device');  // TODO: Add more robust catching
    }

    try {
      const audioStream: MediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
      audioStream.getAudioTracks().forEach((audioTrack: MediaStreamTrack) => {
        audioTrack.enabled = true;
        this.localstream.addTrack(audioTrack);
      });

    } catch (error) {
      console.log('Unable to get audio device');  // TODO: Add more robust catching
    }
  }

  public getLocalStream(): MediaStream{
    return this.localstream
  }

  public changeAudio(): void{
    this.data.audio = !this.data.audio;
  }

  public changeVideo(): void{
    this.data.video = !this.data.video;
    this.localstream.getVideoTracks().forEach(videoTrack => {
      videoTrack.enabled = this.data.video;
    });
  }

  public jsonifyContent(): any{
    return {
      'audio': this.data.audio,
      'video': this.data.video,
      'cancel': this.data.cancel,
      'userName': this.data.userName
    }
  }

  public onNoClick():void{
    this.data.cancel = true;
    this.dialogRef.close(this.jsonifyContent());
  }

  public onYesClick():void{
    this.data.cancel = false;
    this.dialogRef.close(this.jsonifyContent());
  }

}
