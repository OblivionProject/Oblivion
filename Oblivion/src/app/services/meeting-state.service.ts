import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeetingStateService {
  meetingID: number | undefined;

  constructor() { }
}
