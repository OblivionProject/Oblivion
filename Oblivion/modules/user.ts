export {User as User};
export {USER_ROLE as USER_ROLE};

enum USER_ROLE {
  admin = 'Admin',
  guest = 'Guest'
}

class User {

  private name: string;
  private userID: number;
  private role: USER_ROLE;

  constructor(
    name: string,
    userID: number,
    role: USER_ROLE
  ) {
    this.name = name;
    this.userID = userID;
    this.role = role;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setRole(role: USER_ROLE): void {
    this.role = role;
  }

  public getName(): string {
    return this.name;
  }

  public getUserID(): number {
    return this.userID;
  }

  public getRole(): USER_ROLE {
    return this.role;
  }

  public static ROLE(role: string): USER_ROLE {
    return (role.toLowerCase() === 'admin') ? USER_ROLE.admin : USER_ROLE.guest;
  }
}
