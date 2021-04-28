import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEnterMeetingSettingsComponent } from './user-enter-meeting-settings.component';

describe('UserEnterMeetingSettingsComponent', () => {
  let component: UserEnterMeetingSettingsComponent;
  let fixture: ComponentFixture<UserEnterMeetingSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserEnterMeetingSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEnterMeetingSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
