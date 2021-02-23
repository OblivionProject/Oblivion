import { Injectable } from '@angular/core';

const mediaConstraints = {
  audio: true,
  video: true// {width: 720, height: 540},  // TODO: Make this dynamic
};

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private localstream!: MediaStream;
  private remoteStreams!: Array<MediaStream>;

  constructor() {
    this.remoteStreams = [];
  }

  async loadLocalStream() {
    try {
      this.localstream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      this.localstream.getTracks().forEach(track => {
        track.enabled = true;
      });
      // TODO: Improve error handling
    } catch (e) {
      console.log(e);
    }
  }

  loadRemoteStreams() {
    this.remoteStreams[0] = this.localstream;
    this.remoteStreams[1] = this.remoteStreams[0];
    this.remoteStreams[2] = this.remoteStreams[0];
  }

  getLocalStream(): MediaStream {
    return this.localstream;
  }

  getRemoteStreams(): Array<MediaStream> {
    return this.remoteStreams;
  }

  muteLocalVideo(): void{
    this.localstream.getTracks().forEach(track => {
      track.enabled = false;
    });
  }


}
