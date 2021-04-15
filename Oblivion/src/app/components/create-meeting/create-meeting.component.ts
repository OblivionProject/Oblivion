import {Component} from '@angular/core';
import {Meeting, MEETING_TYPE} from '../../models/meeting.model';
import {WebsocketService} from '../../services/websocket.service';
import {FormBuilder, FormControl, FormGroup, Validators, FormGroupDirective, NgForm} from '@angular/forms';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {CustomValidators} from '../../services/custom-validator';
import {ErrorStateMatcher} from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
export interface Email {
  name: string;
}


@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})


export class CreateMeetingComponent {

  public meeting: Meeting;  // Stores the meeting creation information
  public hide: boolean;     // Indicates whether the password fields should be hidden
  //private webSocket: WebSocket;  // WebSocket connection to server
  meetingName = new FormControl('', [Validators.required, Validators.email]);
  meetingEmail = new FormControl('', [Validators.email]);
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  emails: Email[] = [];
  createMeetingForm: FormGroup;
  matcher = new MyErrorStateMatcher();
  timeout: any = null;
  doneTyping = false;
  passwordError = true;

  // Initializes the WebSocket from the WebsocketService and creates the meeting
  constructor(private websocketService: WebsocketService, private fb: FormBuilder) {
    //this.webSocket = websocketService.getWebSocket();
    this.meeting = new Meeting(MEETING_TYPE.CREATE);
    this.hide = true;
    this.createMeetingForm = this.createSignupForm(fb);
  }

  // Sends the create meeting info to the server
  public createMeeting(): void {
    // Add Simple verification step here to block if values not correct or a call back to server
    console.log(JSON.stringify(this.meeting));
    this.websocketService.getWebSocket().send(JSON.stringify(this.meeting));
  }


  /*
   TODO : Ready to Test
  */
  public getEmailErrorMessage(): string {
    return this.createMeetingForm.controls.email.hasError('email') ? 'Not a valid email' : 'valid';
  }

  /*
   TODO : Ready to Test
  */
  getMeetingNameErrorMessage(): string {
    if (this.createMeetingForm.contains('meetingName') && this.createMeetingForm.controls.meetingName.hasError('required')){
      return 'You must enter a meeting name';
    }

    return 'Meeting Name Valid';
  }


  // TODO : Implement code to generate text to inform use about password related issues
  getPasswordErrorMessage(): string {
    // This will be called by Enter Meeting Password INPUT
    // As of right now all that must be entered to be considered valid is a number
    // This function is only called if the input is invalid based on rules defined by formgroup control 'password'
    // DEBUG //console.log(this.createMeetingForm.controls.password.errors);

    const hasNumber = !this.createMeetingForm.controls.password.hasError('hasNumber');
    const hasMin = !this.createMeetingForm.controls.password.hasError('minlength');
    const hasNumberString = 'Password Must Contain a Number';
    const hasMinString = 'Password Not Long enough ' + this.createMeetingForm.controls.password.value.length + '/ 5';
    let errorString = '';
    this.passwordError = hasNumber && hasMin;
    if (!this.doneTyping && !hasNumber){
      return errorString;
    }

    // if (!hasNumber && !hasMin){
    //   errorString = hasNumberString + '\n' + hasMinString;
    //   return errorString;
    // }
    if (!hasNumber){
      errorString = hasNumberString;
      return errorString;
    }
    if (!hasMin){
      errorString = hasMinString;
      return errorString;
    }



    return errorString;

  }
  // TODO : Implement code to generate text to inform use about password related issues
  getPasswordMatchErrorMessage(): string{
   // const passwordMatch = !this.createMeetingForm.controls.confirmPassword.
    //console.log(this.createMeetingForm.controls.confirmPassword.errors?.confirmValidator);
    //return passwordMatch ? 'No' : 'Yes';
    // if (this.createMeetingForm.controls.confirmPassword.errors?.confirmValidator){
    //   console.log(this.createMeetingForm.controls.confirmPassword.errors?.confirmValidator);
    //   return 'Yes';
    // }
    if (this.meeting.password?.length !== 0 && this.meeting.password !== undefined && !this.passwordError){
      if (this.meeting.passwordConfirm?.length !== 0 && this.meeting.passwordConfirm !== undefined){
       // return 'Meeting Password Length = ' + this.meeting.password?.length;
        return 'Value does not match';
      }
    }
    return '';
  }

/// EMAIL STUFF

  addEmail(event: MatChipInputEvent): void{
    const input = event.input;
    const value = event.value;

    const valid = !this.createMeetingForm.controls.email.hasError('email');
    if ((value || '').trim() && valid){
      this.emails.push({name: value.trim()});
    }

    // Reset the input value
    if (input && valid) {
      input.value = '';
    }
  }

  remove(email: Email): void {
    const index = this.emails.indexOf(email);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  test(event: any): void{
    this.doneTyping = false;
    clearTimeout(this.timeout);
    const $this = this;
    this.timeout = setTimeout( () => {
      if (event.keyCode !== 13) {
        $this.displayIssues(event.target.value);
      }
    }, 1000);
  }



  displayIssues(value: string): void  {
    this.doneTyping = true;
}


  /// EMAIL STUFF


  createSignupForm(formBuilder: FormBuilder): FormGroup {
    return formBuilder.group({
      meetingName: new FormControl('', [Validators.required]),
      email: new FormControl('', Validators.compose([Validators.email])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        CustomValidators.patternValidator(/\d/, {hasNumber: true}),
        // check whether the entered password has upper case letter
        // CustomValidators.patternValidator(/[A-Z]/, {hasCapitalCase: true}),
        // check whether the entered password has a lower case letter
        // CustomValidators.patternValidator(/[a-z]/, {hasSmallCase: true}),
        // check whether the entered password has a special character
        // CustomValidators.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {hasSpecialCharacters: true}),
      ])),
      confirmPassword : new FormControl('', [Validators.required]),
      // validator: CustomValidators.passwordMatchValidator
    }, {validator: CustomValidators.valuesMatch('password', 'confirmPassword')});
  }

}
