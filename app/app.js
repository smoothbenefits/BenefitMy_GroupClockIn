var timeTrackingApp = window.angular.module("timeTrackingApp",
  ["LocalStorageModule", "webcam", "ngAnimate", "ui.router", "ngMaterial",
   "anim-in-out", "environment"]);

timeTrackingApp.config(["$stateProvider", "$urlRouterProvider",
function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when("", "/pinLogin");
    $urlRouterProvider.when("/", "/pinLogin");
    $urlRouterProvider.otherwise("/pinLogin");

    var login = {
        name: "login",
        url: "/login",
        module: "public",
        controller: "LoginCtrl",
        templateUrl: "app/components/login/login.html"
    };

    var pinLogin = {
        name: "pinLogin",
        url: "/pinLogin",
        module: "private",
        controller: "PinLoginCtrl",
        templateUrl: "app/components/pin/pinLogin.html"
    };

    var capture = {
        name: "capture",
        url: "/capture",
        module: "private",
        controller: "WebcamCtrl",
        templateUrl: "app/components/webcam/webcam.html"
    };

    $stateProvider.state(login);
    $stateProvider.state(pinLogin);
    $stateProvider.state(capture);
}]);

timeTrackingApp.config(["localStorageServiceProvider", function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix("myApp")
        .setStorageType("localStorage");
}]);

timeTrackingApp.run(["$rootScope", "$state", "localStorageService", function ($rootScope, $state, localStorageService) {

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, userModel) {
        var isLogin = localStorageService.get("isLogin");

        if (toState.module === "private" && (isLogin === null || isLogin === false)) {
            event.preventDefault();
            $state.go("login");
            return true;
        }

        var currentUserProfile = localStorageService.get("currentUserProfile");
        if (fromState.name === "pinLogin" && currentUserProfile === null && toState.name !== "login") {
            event.preventDefault();
        }
    });

    $rootScope.$on("$locationChangeStart", function (event, next, current) {
        var isLogin = localStorageService.get("isLogin");
        // check for the user"s token and that we aren"t going to the login view
        if (!isLogin) {
            // go to the login view
            event.preventDefault();
            $state.go("login");
        }
    });
}]);

timeTrackingApp.config(["$httpProvider", function ($httpProvider) {
    $httpProvider.interceptors.push(["$timeout", "$q", "$window", "$injector", "$rootScope", function ($timeout, $q, $window, $injector, $rootScope) {
        var $http;

        $httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};

        $timeout(function () {
            $http = $injector.get("$http");
        });

        return {
            request: function (config) {
                config.headers = config.headers || {};
                // if ($window.sessionStorage.token) {
                //     config.headers.Authorization = "Bearer " + $window.sessionStorage.token;
                // }
                return config;
            },

            // On request failure
            requestError: function (rejection) {
                //  console.log("$httpInterceptor",rejection); // Contains the data about the error on the request.

                // Return the promise rejection.
                return $q.reject(rejection);
            },

            responseError: function (rejection) {
                if (rejection.status === 401) {
                    $rootScope.$emit("unauthorized");
                } else if (rejection.status === 403) {
                } else if (rejection.status === 504) {
                }

                return $q.reject(rejection);
            }
        };
    }]);
}]);

timeTrackingApp.config(['envServiceProvider', function (envServiceProvider) {
  envServiceProvider.config({
    domains: {
      localhost: ['localhost'],
      stage: ['grouptimetrackingstg.herokuapp.com'],
      demo: ['grouptimetrackingdemo.herokuapp.com'],
      production: ['grouptimetracking.herokuapp.com', 'grouptimetracking.workbenefits.me']
    },
    vars: {
      localhost: {
        "WorkBenefitsMeUrl": "https://staging.workbenefits.me/api/v1/",
        "TimeTrackingServiceUrl": "http://stage.timetracking.workbenefits.me/",
        "environment": "stage",
        "AWSAccessKeyId": "AKIAJVLVZOIR5KDYVMTA",
        "AWSSecretAccessKey": "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",
        "ImageS3Bucket": "benefitmy-staging-profile-assets",
        "EnvironmentPrefix": "local_"
      },
      stage: {
        "WorkBenefitsMeUrl": "https://staging.workbenefits.me/api/v1/",
        "TimeTrackingServiceUrl": "http://stage.timetracking.workbenefits.me/",
        "environment": "stage",
        "AWSAccessKeyId": "AKIAJVLVZOIR5KDYVMTA",
        "AWSSecretAccessKey": "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",
        "ImageS3Bucket": "benefitmy-staging-profile-assets",
        "EnvironmentPrefix": "stage_"
      },
      demo: {
        "WorkBenefitsMeUrl": "https://benefitmy-python-demo.herokuapp.com/api/v1/",
        "TimeTrackingServiceUrl": "http://stage.timetracking.workbenefits.me/",
        "environment": "staging",
        "AWSAccessKeyId": "AKIAJVLVZOIR5KDYVMTA",
        "AWSSecretAccessKey": "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",
        "ImageS3Bucket": "benefitmy-staging-profile-assets",
        "EnvironmentPrefix": "demo_"
      },
      production: {
        "WorkBenefitsMeUrl": "https://app.workbenefits.me/api/v1/",
        "TimeTrackingServiceUrl": "https://timetracking.workbenefits.me/api/v1/",
        "environment": "production",
        "AWSAccessKeyId": "AKIAJVLVZOIR5KDYVMTA",
        "AWSSecretAccessKey": "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",
        "ImageS3Bucket": "benefitmy-beta-profile-assets",
        "EnvironmentPrefix": "production_"
      }
    }
  });

  // run the environment check before controllers and services are built
  envServiceProvider.check();
}]);

timeTrackingApp.run(["$rootScope", "$state", "AuthService", function ($rootScope, $state, AuthService) {
    $rootScope.$on("unauthorized", function () {
        if (!$state.is("login")) {
            //trigger re-auth function;
            AuthService.reAuth().then(function (response) {

            }, function (error) {
                $state.go("login");
            });
        }
    });
}]);
