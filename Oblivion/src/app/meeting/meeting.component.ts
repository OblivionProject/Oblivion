import {AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {TitleModel} from '../models/title.model';
import {MediaService} from '../services/media.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})

export class MeetingComponent implements AfterViewInit {


  @ViewChild('local_video') localVideo!: ElementRef;

  tile: TitleModel =  {cols: 1, rows: 1, text: 'Test Meeting', video : 'local_video', name: 'Joe'};

  constructor(private mediaService: MediaService) { }

  // ngOnInit(): void {
  //   this.getLocalVideo();
  // }


  async getLocalVideo(): Promise<void> {
    await this.mediaService.loadLocalStream();
    this.localVideo.nativeElement.srcObject = await this.mediaService.getLocalStream();
    // this.media Service.loadRemoteStreams();
    // this.list.push({video: this.mediaService, text: 'Tile 1', cols: 2, rows: 1, border: '3px double purple', name: 'Joe'});
  }

  muteLocalVideo(): void{
    this.mediaService.muteLocalVideo();
  }


  // ngAfterViewInit(): void {
  //   this.getLocalVideo();
  // }

  // ngOnInit(): void {
  //   this.getLocalVideo();
  // }

  ngAfterViewInit(): void {
    this.getLocalVideo();
  }



}
