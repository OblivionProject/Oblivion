import {Component} from '@angular/core';
import {Meeting, MEETING_TYPE} from "../../models/meeting.model";
import {WebsocketService} from "../../services/websocket.service";

@Component({
  selector: 'app-join-meeting',
  templateUrl: './join-meeting.component.html',
  styleUrls: ['./join-meeting.component.css']
})
export class JoinMeetingComponent {

  public meeting: Meeting;  // Stores the meeting creation information
  public hide: Boolean;     // Indicates whether the password fields should be hidden
  private webSocket: WebSocket;  // WebSocket connection to server

  // Initializes the WebSocket from the WebsocketService and joins the meeting
  constructor(websocketService: WebsocketService) {
    this.webSocket = websocketService.getWebSocket();
    this.meeting = new Meeting(MEETING_TYPE.JOIN);
    this.hide = true;
  }

  // Sends the join meeting info to the server
  public joinMeeting(): void {
    console.log(JSON.stringify(this.meeting));
    this.webSocket.send(JSON.stringify(this.meeting));
  }

}
