import { TestBed } from '@angular/core/testing';

import { CreateMeetingService } from './create-meeting.service';

describe('CreateMeetingService', () => {
  let service: CreateMeetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
