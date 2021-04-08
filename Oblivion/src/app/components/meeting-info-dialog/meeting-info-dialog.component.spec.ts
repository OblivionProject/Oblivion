import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingInfoDialogComponent } from './meeting-info-dialog.component';

describe('MeetingInfoDialogComponent', () => {
  let component: MeetingInfoDialogComponent;
  let fixture: ComponentFixture<MeetingInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeetingInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
