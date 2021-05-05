import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {MeetingInfo} from "../../models/meeting-info";
import {Clipboard} from "@angular/cdk/clipboard";
import {ThemeHelperService} from "../../services/theme-helper.service";

@Component({
  selector: 'app-meeting-info-dialog',
  templateUrl: './meeting-info-dialog.component.html',
  styleUrls: ['./meeting-info-dialog.component.css'],
  providers: [Clipboard]
})
export class MeetingInfoDialogComponent{

  constructor(@Inject(MAT_DIALOG_DATA) public data: MeetingInfo,
              public themeService: ThemeHelperService) {}

  public ngAfterViewInit():void{
    if(this.themeService.darkmode) {
      // @ts-ignore
      document.getElementById("meeting_info_list").style.color = "#50a3a2";
    }
  }

  public toString(value: number){
    return String(value);
  }
}
