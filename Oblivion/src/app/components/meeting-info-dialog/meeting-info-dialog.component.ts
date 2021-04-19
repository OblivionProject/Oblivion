import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {MeetingInfo} from "../../models/meeting-info";

@Component({
  selector: 'app-meeting-info-dialog',
  templateUrl: './meeting-info-dialog.component.html',
  styleUrls: ['./meeting-info-dialog.component.css']
})
export class MeetingInfoDialogComponent{

  constructor(@Inject(MAT_DIALOG_DATA) public data: MeetingInfo) {}

}
