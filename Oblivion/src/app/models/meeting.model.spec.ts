import { Meeting,MEETING_TYPE } from './meeting.model';

describe('Meeting', () => {
  it('should create an instance', () => {
    expect(new Meeting(MEETING_TYPE.CREATE)).toBeTruthy();
    expect(new Meeting(MEETING_TYPE.JOIN)).toBeTruthy();
  });

  it('should have specific types in Meeting model', () => {
    const meeting = new Meeting(MEETING_TYPE.CREATE);
    meeting.name = 'test';
    meeting.password = 'test1';
    meeting.meetingID = 'test1';

    expect(typeof(meeting.name)).toEqual('string');
    expect(typeof(meeting.password)).toEqual('string');
    expect(typeof(meeting.meetingID)).toEqual('string');
  });

  it('should create an instance for create meeting models', () => {
    const meeting = new Meeting(MEETING_TYPE.CREATE);
    meeting.name = 'test';
    meeting.password = 'test1';

    expect(meeting.name).toEqual('test');
    expect(meeting.password).toEqual('test1');
  });

  it('should create an instance with data', () => {
    const meeting = new Meeting(MEETING_TYPE.JOIN);
    meeting.meetingID = 'test';
    meeting.password = 'test1';

    expect(meeting.meetingID).toEqual('test');
    expect(meeting.password).toEqual('test1');
  });
});
