'use strict';
var module = angular.module('overdressed', [
    'ngRoute',
    'overdressed.messaging.controllers',
    'overdressed.messaging.directives',
    'overdressed.messaging.filters',
    'overdressed.messaging.services'
]);


module.config(['$routeProvider', function($routeProvider) {
// send to index page if unknown url
    $routeProvider.otherwise({
        redirectTo: '/'
    });
}]);


module.config(['$locationProvider', function($locationProvider) {
// use HTML5 history API for nice urls
// (it seems like the DHIS2-app support don't support other entry URLs
// than there are actually files for, so this is disabled)
//$locationProvider.html5Mode(true);
}]);


//Check if we lost connection to the internet
module.run(function($window, $rootScope) {
//TODO: Change true/false
    console.log("initial offline state", !navigator.onLine);
    $rootScope.offline = !navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function() {
            console.log("offline", true);
            $rootScope.offline = true;
        });
    }, false);
    $window.addEventListener("online", function () {
        $rootScope.$apply(function() {
            console.log("offline", false);
            $rootScope.offline = false;
        });
    }, false);
});


//Change in URL?
module.run(function($rootScope, $location, $window) {
    $rootScope.location = $location.path();
    $window.addEventListener("hashchange", function() {
        $rootScope.$apply(function() {
            $rootScope.location = $location.path();
        });
    }, false);
});