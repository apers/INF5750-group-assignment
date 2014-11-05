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
    $routeProvider.otherwise({redirectTo: '/'});
}]);

module.config(['$locationProvider', function($locationProvider) {
    // use HTML5 history API for nice urls
    $locationProvider.html5Mode(true);
}]);
