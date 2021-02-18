import { Meeting } from './meeting.model';

describe('Meeting', () => {
  it('should create an instance', () => {
    expect(new Meeting()).toBeTruthy();
  });

  it('should have specific types in Meeting model', () => {
    const meeting = new Meeting();
    meeting.title = 'test';
    meeting.password1 = 'test1';
    meeting.password2 = 'test1';

    expect(typeof(meeting.title)).toEqual('string');
    expect(typeof(meeting.password1)).toEqual('string');
    expect(typeof(meeting.password2)).toEqual('string');
  });

  it('should create an instance with data', () => {
    const meeting = new Meeting();
    meeting.title = 'test';
    meeting.password1 = 'test1';
    meeting.password2 = 'test1';

    expect(meeting.title).toEqual('test');
    expect(meeting.password1).toEqual('test1');
    expect(meeting.password2).toEqual('test1');
  });
});
