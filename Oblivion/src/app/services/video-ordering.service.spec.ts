import { TestBed } from '@angular/core/testing';

import { VideoOrderingService } from './video-ordering.service';

describe('VideoOrderingService', () => {
  let service: VideoOrderingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoOrderingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
