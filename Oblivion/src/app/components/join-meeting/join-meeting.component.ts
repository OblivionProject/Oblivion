import { Component, OnInit } from '@angular/core';
import {Meeting} from "../../models/meeting.model";
import {CreateMeetingService} from "../../services/create-meeting.service";

@Component({
  selector: 'app-join-meeting',
  templateUrl: './join-meeting.component.html',
  styleUrls: ['./join-meeting.component.css']
})
export class JoinMeetingComponent implements OnInit {


  meeting: Meeting = {
    id: '',
    password1: '',
    password2: '',
    title: '',
    join: true
  };

  hide = true;



  constructor(private createMeetingService: CreateMeetingService) { }

  ngOnInit(): void {

  }

  joinMeeting(): void {

    console.log(this.meeting);
    this.createMeetingService.connect();
    this.createMeetingService.sendMessage(this.meeting);


  }


}
