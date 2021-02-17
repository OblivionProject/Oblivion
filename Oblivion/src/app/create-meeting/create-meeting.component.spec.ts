import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import { CreateMeetingComponent } from './create-meeting.component';

describe('CreateMeetingComponent', () => {
  let component: CreateMeetingComponent;
  let fixture: ComponentFixture<CreateMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMeetingComponent ]
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
    expect(component.meeting.title).toEqual('');
    expect(component.meeting.id).toEqual('');
    expect(component.meeting.password1).toEqual('');
    expect(component.meeting.password2).toEqual('');
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

  it('should contain a create meeting button that calls saveMeeting', fakeAsync(() => {
    spyOn(component, 'saveMeeting');

    const button = fixture.debugElement.nativeElement.querySelector('#create_meeting_submit');
    expect(button.innerHTML).toEqual('Create meeting!');

    button.click();
    tick();
    expect(component.saveMeeting).toHaveBeenCalled();
  }));

  it('should contain an exit meeting button that should redirect to welcome page', () => {
    const button = fixture.debugElement.nativeElement.querySelector('#create_meeting_exit');
    expect(button.innerHTML).toEqual('Cancel');

    const path = button.getAttribute('routerLink');
    expect(path).toEqual('../welcome');
  });
});
