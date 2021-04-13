import { ComponentFixture, TestBed} from '@angular/core/testing';
import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WelcomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  //TODO: Fix Anime issues.
  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
  //
  // it('should contain a create button that hrefs to create-meeting path', () => {
  //   const button = fixture.debugElement.nativeElement.querySelector('#create_meeting');
  //   expect(button.innerHTML).toBe('Create Meeting');
  //
  //   const path = button.getAttribute('routerLink');
  //   expect(path).toEqual('../create-meeting');
  // });
  //
  // it('should contain a join button', () => {
  //   const button = fixture.debugElement.nativeElement.querySelector('#join_meeting');
  //   expect(button.innerHTML).toBe('Join Meeting');
  //
  //   // TODO: Include href testing when JoinComponent is created
  // });
});
