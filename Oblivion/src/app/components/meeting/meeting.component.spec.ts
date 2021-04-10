import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingComponent } from './meeting.component';
import {MatDialogModule} from "@angular/material/dialog";

describe('MeetingComponent', () => {
  let component: MeetingComponent;
  let fixture: ComponentFixture<MeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [ MeetingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
