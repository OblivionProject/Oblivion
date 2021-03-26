import {MatGridListModule} from '@angular/material/grid-list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSliderModule} from '@angular/material/slider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent} from './components/welcome/welcome.component';
import { CreateMeetingComponent} from './components/create-meeting/create-meeting.component';
import {FormsModule} from '@angular/forms';
import {MeetingComponent} from './components/meeting/meeting.component';
import { JoinMeetingComponent } from './components/join-meeting/join-meeting.component';
import {MatSlideToggleModule, MatSlideToggleChange} from '@angular/material/slide-toggle';
import {ReactiveFormsModule} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { Globals } from './global';
import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {MatNativeDateModule} from '@angular/material/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatChipsModule} from '@angular/material/chips';


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    CreateMeetingComponent,
    MeetingComponent,
    JoinMeetingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatGridListModule,
    MatSlideToggleModule,
    FormsModule,
    MatCardModule,
    OverlayModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatChipsModule
  ],
  providers: [Globals],
  bootstrap: [AppComponent],
  // schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
