import {Component} from '@angular/core';
import {Meeting, MEETING_TYPE} from "../../models/meeting.model";
import {WebsocketService} from "../../services/websocket.service";
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import {ErrorStateMatcher} from "@angular/material/core";
import {MeetingStateService} from "../../services/meeting-state.service";
import {MatDialog} from "@angular/material/dialog";
import {UserEnterMeetingSettingsComponent} from "../user-enter-meeting-settings/user-enter-meeting-settings.component";

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-join-meeting',
  templateUrl: './join-meeting.component.html',
  styleUrls: ['./join-meeting.component.css'],
  providers: [WebsocketService]
})
export class JoinMeetingComponent {

  public meeting: Meeting;  // Stores the meeting creation information
  public hide: boolean;     // Indicates whether the password fields should be hidden
  private webSocket: WebSocket;  // WebSocket connection to server
  joinMeetingForm: FormGroup;
  timeout: any = null;
  doneTyping = false;
  matcher = new MyErrorStateMatcher();

  // Initializes the WebSocket from the WebsocketService and joins the meeting
  constructor(websocketService: WebsocketService,
              private router: Router,
              private fb: FormBuilder,
              private sharedService: MeetingStateService,
              public dialog: MatDialog) {
    this.webSocket = websocketService.getWebSocket();
    this.webSocket.onmessage = (message: MessageEvent) => this.receivedValidationFromServer(message);
    this.meeting = new Meeting(MEETING_TYPE.JOIN);
    this.hide = true;
    this.joinMeetingForm = this.createJoinForm(fb);
  }

  // Sends the join meeting info to the server
  public joinMeeting(): void {
    this.meeting.check = true;
    console.log(JSON.stringify(this.meeting));
    this.webSocket.send(JSON.stringify(this.meeting));
  }

  createJoinForm(formBuilder: FormBuilder): FormGroup {
    return formBuilder.group({
      meetingID: new FormControl('', [Validators.required]),
      password: new FormControl('', [])});
  }

  getMeetingIDErrorMessage(): string {
    if (this.joinMeetingForm.contains('meetingID') && this.joinMeetingForm.controls.meetingID.hasError('required')){
      return 'You must enter a meeting ID';
    }
    return 'Invalid ID';
  }
  getMeetingPasswordErrorMessage(): string {
    return 'Invalid Password';
  }

  test(event: any): void{
    this.doneTyping = false;
    clearTimeout(this.timeout);
    const $this = this;
    this.timeout = setTimeout( () => {
      if (event.keyCode !== 13) {
        $this.displayIssues(event.target.value);
      }
    }, 1000);
  }

  async receivedValidationFromServer(message: MessageEvent) {
    const signal = JSON.parse(message.data);
    console.log(signal);
    if (signal.error){
      if(signal.message == 'Invalid ID'){
        // @ts-ignore
        this.joinMeetingForm.get('meetingID').setErrors({ invalidID: signal.message});
      }
      else if(signal.message == 'Invalid Password'){
        // @ts-ignore
        this.joinMeetingForm.get('password').setErrors({ password: signal.message});
      }
    }
    else if(signal.valid){
      //this.webSocket.send(JSON.stringify(this.meeting));
      this.sharedService.meetingID = signal.meetingID;
      await this.webSocket.close(); // wait for this to close before routing
      this.openDialog();
    }
  }

  displayIssues(value: string): void {
    this.doneTyping = true;
  }

  public openDialog(): void {
    const dialogRef = this.dialog.open(UserEnterMeetingSettingsComponent, {
      disableClose: true,
      position: {
        top: '4rem'
      },
      data: {
        userName: this.sharedService.userName,
        audio: this.sharedService.audio,
        video: this.sharedService.video,
        cancel: this.sharedService.cancel
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(!result.cancel){
        this.sharedService.userName = result.userName;
        this.sharedService.video = result.video;
        this.sharedService.audio = result.audio;
        this.router.navigate(['meeting']);
      }
    });
  }

}
