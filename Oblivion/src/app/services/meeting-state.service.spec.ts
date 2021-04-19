import { TestBed } from '@angular/core/testing';

import { MeetingStateService } from './meeting-state.service';

describe('MeetingStateService', () => {
  let service: MeetingStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeetingStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
