import {fakeAsync, TestBed} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {By} from "@angular/platform-browser";
import {ReactiveFormsModule} from "@angular/forms";
import { FormsModule } from '@angular/forms'

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Oblivion'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Oblivion');
  });

  it(`should have as toggle for color mode`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const toggle = fixture.debugElement.nativeElement.querySelector('#toggle');
    expect(toggle).toBeTruthy();
    expect(toggle.innerHTML).toEqual(' Dark Mode ');
  });

  it(`toggle should switch modes when clicked`, fakeAsync(() =>  {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(app, 'setValue');

    expect(app.globals.darkMode).toEqual(false);

    const toggle = fixture.debugElement.query(By.css('#toggle'));
    toggle.triggerEventHandler('change', null);

    expect(app.setValue).toHaveBeenCalled();
  }));
});
