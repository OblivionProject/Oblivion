export class MeetingInfo {
  public meeting_id?: number;
  public user_type?: string;
  public password?: string;


  public setData(data: { [x: string]: any; userRole?: string; meetingID?: number; password?: string; }){
    this.meeting_id = data['meetingID'];
    this.user_type = data['userRole'];
    this.password = data['password'];
  }
}


