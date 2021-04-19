describe( 'Server Unit Testing', function() {
    beforeEach(function() {
        server = require("../server");
    });

    it("Create Server Instance", function() {
        expect(server).toBeTruthy();
    });

    afterEach(function() {
        server.close();
    });

});