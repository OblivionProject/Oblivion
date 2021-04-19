import {ValidationErrors, ValidatorFn, AbstractControl, FormGroup} from '@angular/forms';

//TODO: THIS NEEDS A SPEC FILE AND TESTING
export class CustomValidators {
  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        // @ts-ignore
        return null;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      // @ts-ignore
      return valid ? null : error;
    };
  }

  static passwordMatchValidator(control: AbstractControl): void {
    // @ts-ignore
    const password: string = control.password.value; // get password from our password form control
    console.log('password: ' + password);
    // @ts-ignore
    const confirmPassword: string = control.confirmPassword.value; // get password from our confirmPassword form control
    console.log('password Confirm: ' + confirmPassword);
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      // @ts-ignore
      control.get('confirmPassword').setErrors({ NoPassswordMatch: true });
    }
  }

  static valuesMatch(controlName: string, matchingControlName: string): (formGroup: FormGroup) => any {

    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };


  }
}
