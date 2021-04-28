import {User} from "../../../modules/user";

export class MeetingInfo {

  public meeting_id!: number;
  public password: string | undefined;
  public name!: string;
  public user!: User;

  constructor(
    meetingID: number,
    name: string,
    user: User,
    password?: string
  ) {
    this.setData(meetingID, name, user, password);
  }

  public setData(
    meetingID: number,
    name: string,
    user: User,
    password?: string
  ): void {
    this.meeting_id = meetingID;
    this.name = name;
    this.user = user;
    this.password = (password === undefined) ? password : undefined;
  }

  public setPassword(password: string): void {
    this.password = password;
  }
}


