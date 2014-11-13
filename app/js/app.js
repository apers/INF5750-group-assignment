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
    //  than there are actually files for, so this is disabled)
    //$locationProvider.html5Mode(true);
}]);