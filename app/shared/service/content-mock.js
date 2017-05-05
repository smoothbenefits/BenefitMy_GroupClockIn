(function() {
    "use strict";
    /**
     * This module is used to simulate backend server for this demo application.
     */
    angular.module("content-mocks",["ngMockE2E"])

        .run(["$httpBackend", function($httpBackend) {

            var authorized = false;
            $httpBackend.whenPOST("user/auth").respond(function(method, url, data) {
                authorized = true;
                return [200];
            });

            //otherwise
            $httpBackend.whenGET(/.*/).passThrough();

        }]);
})();