import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmEndMeetingComponent } from './confirm-end-meeting.component';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";

describe('ConfirmEndMeetingComponent', () => {
  let component: ConfirmEndMeetingComponent;
  let fixture: ComponentFixture<ConfirmEndMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmEndMeetingComponent ],
      imports: [MatDialogModule],
      providers: [
        {provide: MatDialogRef, useValue: {}},
        { provide: MAT_DIALOG_DATA, useValue: [] }
      ]
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
