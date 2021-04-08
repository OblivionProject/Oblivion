import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {DialogData} from "../meeting/meeting.component";

@Component({
  selector: 'app-meeting-info-dialog',
  templateUrl: './meeting-info-dialog.component.html',
  styleUrls: ['./meeting-info-dialog.component.css']
})
export class MeetingInfoDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {
  }

}
