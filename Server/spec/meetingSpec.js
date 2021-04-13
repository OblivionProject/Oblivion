var meeting = require("../meeting");

describe("Meeting Object", function() {


    it("Creates a Meeting", function() {
        expect(new meeting.Meeting("name", 12345)).toBeTruthy();
    });

});
