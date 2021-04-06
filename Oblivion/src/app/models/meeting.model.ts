export enum MEETING_TYPE {
  CREATE = 'CREATE',
  JOIN = 'JOIN'
}

export class Meeting {

  // TODO: Do we really need to send both passwords? Or can we just use the guards?
  public meetingType: MEETING_TYPE;
  public password?: string;
  public passwordConfirm?: string;
  public name?: string;
  public meetingID?: any;
  // public password1?: string;
  // public password2?: string;

  constructor(meetingType: MEETING_TYPE) {
    this.meetingType = meetingType;
  }
}
