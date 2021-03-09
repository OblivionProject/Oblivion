import { Component, HostBinding } from '@angular/core';
import {Globals} from './global';
import {OverlayContainer} from '@angular/cdk/overlay';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-root',
  providers: [Globals],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Oblivion';
  globals: Globals;

  constructor(private overlayContainer: OverlayContainer, globals: Globals) {
    this.globals = globals;
  }

  @HostBinding('class') componentCssClass: any;

  setValue($event: MatSlideToggleChange): void {
    this.globals.darkMode = $event.checked;
  }
}
