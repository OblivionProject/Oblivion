import {Component} from '@angular/core';
import {Meeting, MEETING_TYPE} from '../../models/meeting.model';
import {WebsocketService} from '../../services/websocket.service';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl, Validators} from "@angular/forms";



export interface Email {
  name: string;
}

@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})
export class CreateMeetingComponent {
  meetingEmail = new FormControl('', [Validators.email]);


  public meeting: Meeting;  // Stores the meeting creation information
  public hide: Boolean;     // Indicates whether the password fields should be hidden
  private webSocket: WebSocket;  // WebSocket connection to server

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    emails: string[] = [];

    isEMail(search: string): boolean{
      let serchfind: boolean;
      const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      serchfind = regexp.test(search);
      console.log(serchfind);
      return serchfind;
    }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      if (this.isEMail(value.trim())) {
        this.emails.push(value.trim());
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(email: string): void {
    const index = this.emails.indexOf(email);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  getEmailErrorMessage(): string {
    // Emails Are not required but still must be somewhat valid
    // if (this.meetinEmail.hasError('required')) {
    //   return 'You must enter a meeting name';
    // }

    return this.meetingEmail.hasError('email') ? 'Not a valid email' : 'valid';
  }

  // Initializes the WebSocket from the WebsocketService and creates the meeting
  constructor(websocketService: WebsocketService) {
    this.webSocket = websocketService.getWebSocket();
    this.meeting = new Meeting(MEETING_TYPE.CREATE);
    this.hide = true;
  }

  // Sends the create meeting info to the server
  public createMeeting(): void {
    this.meeting.emails = this.emails;
    console.log(JSON.stringify(this.meeting.emails));
    this.webSocket.send(JSON.stringify(this.meeting));
  }
}
