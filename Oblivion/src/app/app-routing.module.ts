import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {WelcomeComponent} from './_Components/welcome/welcome.component';
import {CreateMeetingComponent} from './_Components/create-meeting/create-meeting.component';
import {MeetingComponent} from './_Components/meeting/meeting.component';
import {JoinMeetingComponent} from './_Components/join-meeting/join-meeting.component';

const routes: Routes = [

  { path: '', redirectTo: 'welcome', pathMatch: 'full'},
  { path: 'welcome', component: WelcomeComponent },
  { path: 'create-meeting', component: CreateMeetingComponent},
  { path: 'meeting', component: MeetingComponent},
  { path: 'join-meeting', component: JoinMeetingComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
