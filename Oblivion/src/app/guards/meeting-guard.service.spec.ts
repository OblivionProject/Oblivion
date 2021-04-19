import { TestBed } from '@angular/core/testing';
import {async} from '@angular/core/testing';
import { MeetingGuardService } from './meeting-guard.service';
import {MatDialogModule} from "@angular/material/dialog";

describe('MeetingGuardService', () => {
  let service: MeetingGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [MeetingGuardService]
    });
    service = TestBed.inject(MeetingGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
