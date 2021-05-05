import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ThemeHelperService} from "../../services/theme-helper.service";
import {Peer} from "../../../../modules/peer";

@Component({
  selector: 'app-participants-list-dialog',
  templateUrl: './participants-list-dialog.component.html',
  styleUrls: ['./participants-list-dialog.component.css']
})
export class ParticipantsListDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public peers: Peer[],
              public themeService: ThemeHelperService) {}

  ngOnInit(): void {
  }

  public ngAfterViewInit(): void {
    if(this.themeService.darkmode) {
      // @ts-ignore
      document.getElementById("meeting_info_list").style.color = "#50a3a2";
    }
  }

}
