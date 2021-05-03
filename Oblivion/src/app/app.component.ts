import { Component, HostBinding } from '@angular/core';
import {Globals} from './global';
import {OverlayContainer} from '@angular/cdk/overlay';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {ThemeHelperService} from "./services/theme-helper.service";

@Component({
  selector: 'app-root',
  providers: [Globals],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Oblivion';

  constructor(private overlayContainer: OverlayContainer, public themeService: ThemeHelperService) {
  }

  @HostBinding('class') componentCssClass: any;

  setValue($event: MatSlideToggleChange): void {
    this.themeService.darkmode = $event.checked;
  }
}
