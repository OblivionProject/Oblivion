import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {WelcomeComponent} from './welcome/welcome.component';
import {CreateMeetingComponent} from './create-meeting/create-meeting.component';
import {MeetingComponent} from './meeting/meeting.component';

const routes: Routes = [

  { path: '', redirectTo: 'welcome', pathMatch: 'full'},
  { path: 'welcome', component: WelcomeComponent },
  { path: 'create-meeting', component: CreateMeetingComponent},
  { path: 'meeting', component: MeetingComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
