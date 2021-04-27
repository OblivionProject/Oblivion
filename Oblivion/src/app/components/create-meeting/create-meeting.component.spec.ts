import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import { CreateMeetingComponent } from './create-meeting.component';
import {MEETING_TYPE} from '../../models/meeting.model';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {WebsocketService} from '../../services/websocket.service';
import {RouterTestingModule} from '@angular/router/testing';
import {WelcomeComponent} from '../welcome/welcome.component';
import {MeetingComponent} from '../meeting/meeting.component';

describe('CreateMeetingComponent', () => {
  let component: CreateMeetingComponent;
  let fixture: ComponentFixture<CreateMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          {path: 'welcome', component: WelcomeComponent},
          {path: 'meeting', component: MeetingComponent}])
      ],
      declarations: [ CreateMeetingComponent ],
      providers: [ WebsocketService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a meeting name label and empty input', () => {
    const label = fixture.debugElement.nativeElement.querySelector('#meeting_name_label');
    expect(label.innerHTML).toBe('Enter Meeting Name');

    const input = fixture.debugElement.nativeElement.querySelector('#meeting_name_input');
    expect(input.innerHTML).toBe('');
  });

  it('should contain a meeting password label, empty input and hide button', () => {
    const label = fixture.debugElement.nativeElement.querySelector('#meeting_password1_label');
    expect(label.innerHTML).toBe('Enter Meeting Password');

    const input = fixture.debugElement.nativeElement.querySelector('#meeting_password1_input');
    expect(input.innerHTML).toBe('');

    const button = fixture.debugElement.nativeElement.querySelector('#meeting_password1_hide_button');
    expect(button).toBeTruthy();
  });

  it('should contain a meeting password confirmation label, empty input and hide button', () => {
    const label = fixture.debugElement.nativeElement.querySelector('#meeting_password2_label');
    expect(label.innerHTML).toBe('Confirm Meeting Password');

    const input = fixture.debugElement.nativeElement.querySelector('#meeting_password2_input');
    expect(input.innerHTML).toBe('');

    const button = fixture.debugElement.nativeElement.querySelector('#meeting_password2_hide_button');
    expect(button).toBeTruthy();
  });

  it('should contain an empty Meeting model', () => {
    expect(component.meeting.name).toEqual(undefined);
    expect(component.meeting.password).toEqual(undefined);
    expect(component.meeting.meetingType).toEqual(MEETING_TYPE.CREATE);
  });

  it('should have passwords initially hidden', () => {
    expect(component.hide).toEqual(true);
  });

  it('should show passwords after hide button click (initially for password1)', () => {
    const button = fixture.debugElement.nativeElement.querySelector('#meeting_password1_hide_button');
    button.click();
    expect(component.hide).toEqual(false);
    button.click();
    expect(component.hide).toEqual(true);
  });

  it('should show passwords after hide button click (initially for password2)', () => {
    const button = fixture.debugElement.nativeElement.querySelector('#meeting_password2_hide_button');
    button.click();
    expect(component.hide).toEqual(false);
    button.click();
    expect(component.hide).toEqual(true);
  });

  // TODO: Fix
  it('should contain a create meeting button that calls createMeeting', fakeAsync(() => {
    spyOn(component, 'createMeeting');
    const val = fixture.debugElement.nativeElement.querySelector('#meeting_name_input');
    component.createMeetingForm.controls.meetingName.setValue('123456');
    val.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const button = fixture.debugElement.nativeElement.querySelector('#create_meeting_submit');
    expect(button.innerHTML).toEqual('Create');

    button.click();
    tick();
    expect(component.createMeeting).toHaveBeenCalled();
  }));

  it('should contain a create meeting button that does not call createMeeting', fakeAsync(() => {
    spyOn(component, 'createMeeting');

    const button = fixture.debugElement.nativeElement.querySelector('#create_meeting_submit');
    expect(button.innerHTML).toEqual('Create');

    button.click();
    tick();
    expect(component.createMeeting).not.toHaveBeenCalled();
  }));

  it('should get an error message for meeting Name', fakeAsync ( () => {
    spyOn(component, 'getMeetingNameErrorMessage');
    const val = fixture.debugElement.nativeElement.querySelector('#meeting_name_input');
    // tslint:disable-next-line:no-unused-expression
    component.createMeetingForm.controls.meetingName.invalid;
    val.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.getMeetingNameErrorMessage).toHaveBeenCalled();

  }));

  it('should get an error message for meeting Password', fakeAsync ( () => {
    spyOn(component, 'getPasswordErrorMessage');
    const val = fixture.debugElement.nativeElement.querySelector('#meeting_password1_input');
    // tslint:disable-next-line:no-unused-expression
    component.createMeetingForm.controls.password.invalid;
    val.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.getPasswordErrorMessage).not.toHaveBeenCalled();

  }));

  it('should get an error message for meeting Password2', fakeAsync ( () => {
    spyOn(component, 'getPasswordErrorMessage');
    const val = fixture.debugElement.nativeElement.querySelector('#meeting_password2_input');
    // tslint:disable-next-line:no-unused-expression
    component.createMeetingForm.controls.confirmPassword.invalid;
    val.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.getPasswordErrorMessage).not.toHaveBeenCalled();

  }));

  it('should get an error message for confirm meeting Password2', fakeAsync ( () => {
    spyOn(component, 'getPasswordMatchErrorMessage');
    const val = fixture.debugElement.nativeElement.querySelector('#meeting_password2_input');
    // tslint:disable-next-line:no-unused-expression
    component.createMeetingForm.controls.confirmPassword.invalid;
    val.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.getPasswordMatchErrorMessage).toHaveBeenCalled();

  }));
});
