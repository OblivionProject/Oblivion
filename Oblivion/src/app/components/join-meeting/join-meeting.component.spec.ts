import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import { JoinMeetingComponent } from './join-meeting.component';
import {MEETING_TYPE} from '../../models/meeting.model';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {WelcomeComponent} from '../welcome/welcome.component';
import {MeetingComponent} from '../meeting/meeting.component';
import {WebsocketService} from '../../services/websocket.service';

describe('JoinMeetingComponent', () => {
  let component: JoinMeetingComponent;
  let fixture: ComponentFixture<JoinMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          {path: 'welcome', component: WelcomeComponent},
          {path: 'meeting', component: MeetingComponent}])
      ],
      declarations: [ JoinMeetingComponent ],
      providers: [ WebsocketService ]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain join meeting header', () => {
    const header = fixture.debugElement.nativeElement.querySelector('#join_meeting_header');
    expect(header.innerHTML).toBe('Join Meeting');
  });

  it('should contain a meeting id field with empty input', () => {
    const label = fixture.debugElement.nativeElement.querySelector('#join_meeting_meeting_id_label');
    expect(label.innerHTML).toBe('Enter Meeting ID');

    const input = fixture.debugElement.nativeElement.querySelector('#join_meeting_meeting_id_input');
    expect(input.innerHTML).toBe('');
  });

  it('should contain a meeting id field with empty input', () => {
    const label = fixture.debugElement.nativeElement.querySelector('#join_meeting_meeting_password_label');
    expect(label.innerHTML).toBe('Enter Meeting Password');

    const input = fixture.debugElement.nativeElement.querySelector('#join_meeting_meeting_password_input');
    expect(input.innerHTML).toBe('');

    const button = fixture.debugElement.nativeElement.querySelector('#join_meeting_meeting_password_hide');
    expect(button).toBeTruthy();
  });

  it('should contain an empty join Meeting model', () => {
    expect(component.meeting.meetingID).toEqual(undefined);
    expect(component.meeting.password).toEqual(undefined);
    expect(component.meeting.meetingType).toEqual(MEETING_TYPE.JOIN);
  });

  it('should have passwords initially hidden', () => {
    expect(component.hide).toEqual(true);
  });

  it('should show password after hide button click', () => {
    const button = fixture.debugElement.nativeElement.querySelector('#join_meeting_meeting_password_hide');
    button.click();
    expect(component.hide).toEqual(false);
    button.click();
    expect(component.hide).toEqual(true);
  });

  // TODO: Fix with valid join and invalid join
  it('should contain a join meeting button that does call joinMeeting', fakeAsync(() => {
    spyOn(component, 'joinMeeting');
    const val = fixture.debugElement.nativeElement.querySelector('#join_meeting_meeting_id_input');
    component.joinMeetingForm.controls.meetingID.setValue('123456');
    val.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const button = fixture.debugElement.nativeElement.querySelector('#join_meeting_submit');
    expect(button.innerHTML).toEqual('Join');

    button.click();
    tick();
    expect(component.joinMeeting).toHaveBeenCalled();
  }));

  it('should contain a join meeting button that does not call joinMeeting', fakeAsync(() => {
    spyOn(component, 'joinMeeting');

    const button = fixture.debugElement.nativeElement.querySelector('#join_meeting_submit');
    expect(button.innerHTML).toEqual('Join');

    button.click();
    tick();
    expect(component.joinMeeting).not.toHaveBeenCalled();
  }));

});
