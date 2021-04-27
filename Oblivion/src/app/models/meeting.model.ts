export enum MEETING_TYPE {
  CREATE = 'CREATE',
  JOIN = 'JOIN'
}

export class Meeting {

  public meetingType: MEETING_TYPE;
  public password?: string;
  public passwordConfirm?: string;
  public name?: string;
  public meetingID?: any;
  public check?: boolean;
  public emails?: Array<string>;

  constructor(meetingType: MEETING_TYPE) {
    this.meetingType = meetingType;
  }
}
