import {Component} from '@angular/core';
import {Meeting, MEETING_TYPE} from "../../models/meeting.model";
import {WebsocketService} from "../../services/websocket.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-meeting',
  templateUrl: './join-meeting.component.html',
  styleUrls: ['./join-meeting.component.css']
})
export class JoinMeetingComponent {

  public meeting: Meeting;  // Stores the meeting creation information
  public hide: boolean;     // Indicates whether the password fields should be hidden
  private webSocket: WebSocket;  // WebSocket connection to server

  // Initializes the WebSocket from the WebsocketService and joins the meeting
  constructor(websocketService: WebsocketService, private router: Router) {
    this.webSocket = websocketService.getWebSocket();
    this.webSocket.onmessage = (message: MessageEvent) => this.receivedValidationFromServer(message);
    this.meeting = new Meeting(MEETING_TYPE.JOIN);
    this.hide = true;
  }

  // Sends the join meeting info to the server
  public joinMeeting(): void {
    this.meeting.check = true;
    console.log(JSON.stringify(this.meeting));
    this.webSocket.send(JSON.stringify(this.meeting));
  }

  public receivedValidationFromServer(message: MessageEvent) {
    const signal = JSON.parse(message.data);
    console.log(signal);
    if (signal.error){
      this.router.navigate(['welcome']);
    }
    else if(signal.valid){
      this.meeting.check = false;
      this.webSocket.send(JSON.stringify(this.meeting));
      this.router.navigate(['meeting']);
    }
  }

}
  // setValue($event: MatSlideToggleChange): void {this.isDark = $event.checked; }
