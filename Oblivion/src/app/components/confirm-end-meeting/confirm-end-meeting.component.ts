import {Component, Inject, OnInit} from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';

export enum END_MEETING_TYPE {
  END = 'END',
  LEAVE = 'LEAVE',
  CANCEL= 'CANCEL'
}

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirm-end-meeting.component.html',
  styleUrls: ['./confirm-end-meeting.component.css']
})
export class ConfirmEndMeetingComponent{

  public subject: Subject<boolean> | undefined;
  public type: END_MEETING_TYPE;

  constructor(private dialogRef: MatDialogRef<ConfirmEndMeetingComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.type = END_MEETING_TYPE.CANCEL;
  }

  public endMeetingResponse() {
    if (this.subject) {
      this.type = END_MEETING_TYPE.END;
      this.subject.next(true);
      this.subject.complete();
    }
    this.dialogRef.close(true);
  }

  public leaveMeetingResponse() {
    if (this.subject) {
      this.type = END_MEETING_TYPE.LEAVE;
      this.subject.next(true);
      this.subject.complete();
    }
    this.dialogRef.close(true);
  }

  public cancelResponse() {
    if (this.subject) {
      this.subject.next(false);
      this.subject.complete();
    }
    this.dialogRef.close(false);
  }

}
