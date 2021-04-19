import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {WelcomeComponent} from './components/welcome/welcome.component';
import {CreateMeetingComponent} from './components/create-meeting/create-meeting.component';
import {MeetingComponent} from './components/meeting/meeting.component';
import {JoinMeetingComponent} from './components/join-meeting/join-meeting.component';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {MeetingGuardService} from './guards/meeting-guard.service';

const routes: Routes = [

  { path: '', redirectTo: 'welcome', pathMatch: 'full'},
  { path: 'welcome', component: WelcomeComponent },
  { path: 'create-meeting', component: CreateMeetingComponent},
  { path: 'meeting', component: MeetingComponent, canDeactivate:[MeetingGuardService]},
  { path: 'join-meeting', component: JoinMeetingComponent},
  { path: '**', component: PageNotFoundComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  schemas: [],
  providers: [MeetingGuardService]

})
export class AppRoutingModule { }
