var meeting = require("../modules/meeting");

describe("Meeting Object", function() {

    beforeEach(function() {
        meetingObject = new meeting.Meeting("name", 12345);
    });

    it("Creates a Meeting", function() {
        expect(meetingObject).toBeTruthy();
    });

    it("Set Password", function() {
        expect(meetingObject.hasPassword).toBe(false);

        meetingObject.setPassword("password");
        expect(meetingObject.password).toBe("password");
        expect(meetingObject.hasPassword).toBe(true);
    });

    it( "Should Generate a user role for admins and guests", function() {
        expect(meetingObject.generateUserRole(1)).toBe('Admin');
        expect(meetingObject.generateUserRole(2)).toBe('Guest');
    });

    it( "Should return the password only for Admins", function() {
        meetingObject.setPassword('password');

        expect(meetingObject.getPassword('Admin')).toBe('password');
        expect(meetingObject.getPassword('Guest')).toBe('');
    });

});
