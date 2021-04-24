import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeetingComponent } from './meeting.component';
import {MatDialogModule} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {RouterTestingModule} from "@angular/router/testing";
import {OverlayModule} from "@angular/cdk/overlay";
import {WelcomeComponent} from "../welcome/welcome.component";

describe('MeetingComponent', () => {
  let component: MeetingComponent;
  let fixture: ComponentFixture<MeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        OverlayModule,
        RouterTestingModule.withRoutes([{path: 'welcome', component: WelcomeComponent}])],
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
