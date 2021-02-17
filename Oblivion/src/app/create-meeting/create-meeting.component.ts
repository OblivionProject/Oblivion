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
    // create a connection to the server using the data service
    this.createMeetingService.connect();
    // send meeting info to the server using the data service
    if (this.meeting.title === undefined && this.meeting.password1 === undefined && this.meeting.password2 === undefined){
      // values are not defined
    } else{
      console.log(this.meeting.title);
      this.createMeetingService.sendMessage(this.meeting);
    }
    // some way of triggering changing to the meeting component once we get a response back that this was succesfull

  }

}
