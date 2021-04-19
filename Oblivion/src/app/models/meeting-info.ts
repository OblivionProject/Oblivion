export class MeetingInfo {
  public meeting_id?: number;
  public user_type?: string;
  public password?: string;
  public name?: string;


  public setData(data: { [x: string]: any; userRole?: string; meetingID?: number; password?: string; name?:string;}){
    this.meeting_id = data['meetingID'];
    this.user_type = data['userRole'];
    this.password = data['password'];
    this.name = data['name'];
  }
}


