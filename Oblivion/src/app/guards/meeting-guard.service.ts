import {Injectable} from '@angular/core';
import {CanDeactivate} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {MeetingComponent} from '../components/meeting/meeting.component';
import {ConfirmEndMeetingComponent, END_MEETING_TYPE} from '../components/confirm-end-meeting/confirm-end-meeting.component';

@Injectable({
  providedIn: 'root'
})
export class MeetingGuardService implements CanDeactivate<MeetingComponent> {

  confirmDlg: MatDialogRef<ConfirmEndMeetingComponent> | undefined;
  type: END_MEETING_TYPE | undefined;

  constructor(
    private dialog: MatDialog
  ) {}

  canDeactivate(component: MeetingComponent) {
    const subject = new Subject<boolean>();

    if(component.overrideGuard){
      component.terminate();
      return true;
    }

    this.confirmDlg = this.dialog.open(ConfirmEndMeetingComponent, {
      disableClose: true,
      data: {
        userRole: component.meetingInfo.user.getRole()
      },
      height: '500px',
      width: '450px',
    });
    this.confirmDlg.componentInstance.subject = subject;

    this.confirmDlg.afterClosed()
      .subscribe(async response => {
        if (response) {
          if(this.confirmDlg != undefined){
            this.type = this.confirmDlg.componentInstance.type;
          }
          if(this.type == END_MEETING_TYPE.END){
            await component.endMeetingForAll();
            await component.terminate();
          }
          else if(this.type == END_MEETING_TYPE.LEAVE){
            await component.leaveMeeting();
            await component.terminate();
          }
        } else {
          // when response is NO
          console.log('You decided to stay on Page!');
        }
      });
    return subject.asObservable();
  }
}
