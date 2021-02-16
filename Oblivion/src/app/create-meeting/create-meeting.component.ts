import { Component, OnInit } from '@angular/core';
import {Meeting} from '../models/meeting.model';

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

  constructor() { }

  ngOnInit(): void {
  }
  // Create meeting
  saveMeeting(): void {
    console.log(this.meeting);
  }

}
