import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { MeetingComponent } from '../components/meeting/meeting.component';
import { ConfirmEndMeetingComponent } from '../components/confirm-end-meeting/confirm-end-meeting.component';

@Injectable({
  providedIn: 'root'
})
export class MeetingGuardService implements CanDeactivate<MeetingComponent> {

  confirmDlg: MatDialogRef<ConfirmEndMeetingComponent> | undefined;

  constructor(
    private dialog: MatDialog
  ) {}

  canDeactivate(component: MeetingComponent) {
    const subject = new Subject<boolean>();


    this.confirmDlg = this.dialog.open(ConfirmEndMeetingComponent, { disableClose: true });
    this.confirmDlg.componentInstance.subject = subject;
    this.confirmDlg.afterClosed()
      .subscribe(async response => {
        // when response is NO
        console.log('You decided to stay on Page!');
      });
    return subject.asObservable();
  }
}
