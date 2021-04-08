import { TestBed } from '@angular/core/testing';

import { MeetingGuardService } from './meeting-guard.service';

describe('MeetingGuardService', () => {
  let service: MeetingGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeetingGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
