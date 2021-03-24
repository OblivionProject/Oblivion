import {Component} from '@angular/core';
import {Meeting, MEETING_TYPE} from '../../models/meeting.model';
import {WebsocketService} from "../../services/websocket.service";

@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})
export class CreateMeetingComponent {

  public meeting: Meeting;  // Stores the meeting creation information
  public hide: Boolean;     // Indicates whether the password fields should be hidden
  private webSocket: WebSocket;  // WebSocket connection to server

  // Initializes the WebSocket from the WebsocketService and creates the meeting
  constructor(websocketService: WebsocketService) {
    this.webSocket = websocketService.getWebSocket();
    this.meeting = new Meeting(MEETING_TYPE.CREATE);
    this.hide = true;
  }

  // Sends the create meeting info to the server
  public createMeeting(): void {
    console.log(JSON.stringify(this.meeting));
    this.webSocket.send(JSON.stringify(this.meeting));
  }
}
