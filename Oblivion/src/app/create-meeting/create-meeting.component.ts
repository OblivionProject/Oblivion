import { Component, OnInit } from '@angular/core';
import {Meeting} from '../models/meeting.model';
import {CreateMeetingService} from '../services/create-meeting.service';

@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})
export class CreateMeetingComponent implements OnInit {

  meeting: Meeting = {
    id: '',
    password1: '',
    password2: '',
    title: ''
  };
  hide = true;

  submitted = false;

  constructor(private createMeetingService: CreateMeetingService) { }

  ngOnInit(): void {
  }
  // Create meeting
  saveMeeting(): void {
    console.log(this.meeting);
    this.createMeetingService.connect();
    // create a connection to the server using the data service
    this.createMeetingService.sendMessage(this.meeting);



    // send meeting info
  }

}
