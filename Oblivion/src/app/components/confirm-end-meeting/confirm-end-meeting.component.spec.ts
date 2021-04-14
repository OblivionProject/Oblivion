import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEndMeetingComponent } from './confirm-end-meeting.component';

describe('ConfirmEndMeetingComponent', () => {
  let component: ConfirmEndMeetingComponent;
  let fixture: ComponentFixture<ConfirmEndMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmEndMeetingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmEndMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
