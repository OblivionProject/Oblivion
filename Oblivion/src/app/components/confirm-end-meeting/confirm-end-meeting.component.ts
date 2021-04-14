import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirm-end-meeting.component.html',
  styleUrls: ['./confirm-end-meeting.component.css']
})
export class ConfirmEndMeetingComponent implements OnInit {

  public subject: Subject<boolean> | undefined;

  constructor(private dialogRef: MatDialogRef<ConfirmEndMeetingComponent>) { }

  ngOnInit() {
  }

  public onYesResponse() {
    if (this.subject) {
      this.subject.next(true);
      this.subject.complete();
    }
    this.dialogRef.close(true);
  }

  public onNoResponse() {
    if (this.subject) {
      this.subject.next(false);
      this.subject.complete();
    }
    this.dialogRef.close(false);
  }

}
